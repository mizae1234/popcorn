import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const COINS_PER_VIDEO = 15

export async function POST(request: NextRequest) {
    try {
        // Get raw text first to debug
        const rawText = await request.text()
        console.log('Veo3 callback raw text:', rawText)

        // Parse JSON manually
        const payload = JSON.parse(rawText)

        console.log('Veo3 callback parsed:', JSON.stringify(payload, null, 2))

        // Get taskId from either root level or data level
        const taskId = payload.taskId || payload.data?.taskId

        if (!taskId) {
            console.error('Invalid callback payload: missing taskId')
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
        }

        // Find the video record by taskId
        const video = await prisma.video.findFirst({
            where: {
                OR: [
                    { jobId: taskId },
                    { taskId: taskId },
                ],
                provider: 'veo3',
            },
        })

        if (!video) {
            console.error(`Video not found for taskId: ${taskId}`)
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        // Get data object
        const data = payload.data || {}

        // Debug all keys at different levels
        console.log('Debug - payload keys:', Object.keys(payload))
        console.log('Debug - data keys:', Object.keys(data))
        console.log('Debug - data.resultUrls:', data.resultUrls)
        console.log('Debug - data.result_urls:', data.result_urls)
        console.log('Debug - data.response:', data.response)

        // Try to find video URL from various locations
        let videoUrl: string | null = null

        // Method 1: data.response.resultUrls (official format)
        if (data.response && Array.isArray(data.response.resultUrls) && data.response.resultUrls.length > 0) {
            videoUrl = data.response.resultUrls[0]
            console.log('Found videoUrl in data.response.resultUrls:', videoUrl)
        }
        // Method 2: data.result_urls (callback format)
        else if (Array.isArray(data.result_urls) && data.result_urls.length > 0) {
            videoUrl = data.result_urls[0]
            console.log('Found videoUrl in data.result_urls:', videoUrl)
        }
        // Method 3: data.resultUrls (alternative callback format)
        else if (Array.isArray(data.resultUrls) && data.resultUrls.length > 0) {
            videoUrl = data.resultUrls[0]
            console.log('Found videoUrl in data.resultUrls:', videoUrl)
        }
        // Method 4: Try to extract from raw text using regex as last resort
        else {
            console.log('Trying regex extraction from raw text...')
            const urlMatch = rawText.match(/"result_urls":\s*\[\s*"([^"]+)"/);
            if (urlMatch && urlMatch[1]) {
                videoUrl = urlMatch[1]
                console.log('Found videoUrl via regex:', videoUrl)
            } else {
                const urlMatch2 = rawText.match(/"resultUrls":\s*\[\s*"([^"]+)"/);
                if (urlMatch2 && urlMatch2[1]) {
                    videoUrl = urlMatch2[1]
                    console.log('Found videoUrl via regex (resultUrls):', videoUrl)
                } else {
                    console.log('No videoUrl found anywhere')
                }
            }
        }

        // Check success
        const successFlag = data.successFlag
        const isSuccess = (successFlag === 1) || (payload.code === 200 && videoUrl)

        console.log(`Processing video ${video.id}: successFlag=${successFlag}, code=${payload.code}, hasVideoUrl=${!!videoUrl}, videoUrl=${videoUrl}`)

        // Update video based on result
        if (isSuccess && videoUrl) {
            await prisma.video.update({
                where: { id: video.id },
                data: {
                    status: 'completed',
                    videoUrl: videoUrl,
                },
            })

            console.log(`Video ${video.id} completed with URL: ${videoUrl}`)
        } else {
            // Handle Refund if not already failed
            if (video.status !== 'failed') {
                await prisma.user.update({
                    where: { id: video.userId },
                    data: { coins: { increment: COINS_PER_VIDEO } },
                })

                await prisma.transaction.create({
                    data: {
                        userId: video.userId,
                        type: 'refund',
                        amount: COINS_PER_VIDEO,
                        description: `Refund: Video generation failed (Veo3)`,
                    },
                })
            }

            await prisma.video.update({
                where: { id: video.id },
                data: {
                    status: 'failed',
                },
            })

            const errorMsg = data.errorMessage || payload.msg || 'Unknown error'
            console.error(`Video ${video.id} failed: ${errorMsg}`)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error processing Veo3 callback:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
