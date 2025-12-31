import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const COINS_PER_VIDEO = 15

export async function POST(request: NextRequest) {
    try {
        // Use 'any' to avoid TypeScript type issues with dynamic JSON
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = await request.json()

        console.log('Veo3 callback received:', JSON.stringify(payload, null, 2))

        // Get taskId from either root level or data level
        const taskId = payload.taskId || payload.data?.taskId

        if (!taskId) {
            console.error('Invalid callback payload: missing taskId')
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
        }

        // Find the video record by taskId (stored as jobId or taskId)
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

        // Get video URL - access data as raw object without TypeScript interference
        const data = payload.data || {}

        // Debug: log the full data object to see actual structure
        console.log('Debug - Full data object:', JSON.stringify(data))

        let videoUrl: string | null = null

        // Try all possible locations for video URL
        if (data.response && data.response.resultUrls && data.response.resultUrls[0]) {
            videoUrl = data.response.resultUrls[0]
            console.log('Found videoUrl in data.response.resultUrls:', videoUrl)
        }
        else if (data.result_urls && data.result_urls[0]) {
            videoUrl = data.result_urls[0]
            console.log('Found videoUrl in data.result_urls:', videoUrl)
        }
        else if (data.resultUrls && data.resultUrls[0]) {
            videoUrl = data.resultUrls[0]
            console.log('Found videoUrl in data.resultUrls:', videoUrl)
        }
        else {
            console.log('No videoUrl found - data keys:', Object.keys(data))
        }

        // Determine success
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
