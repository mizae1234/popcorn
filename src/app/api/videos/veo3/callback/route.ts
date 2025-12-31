import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const COINS_PER_VIDEO = 15

// Veo3 callback payload structure - supporting both callback and record-info formats
interface Veo3CallbackPayload {
    code: number
    msg: string
    data: {
        taskId?: string
        paramJson?: string
        completeTime?: string
        response?: {
            taskId?: string
            resultUrls?: string[]
            originUrls?: string[]
            resolution?: string
        }
        successFlag?: number  // 0=Generating, 1=Success, 2=Failed, 3=Generation Failed
        errorCode?: number | null
        errorMessage?: string | null
        createTime?: string
        fallbackFlag?: boolean
        // Alternative callback format fields
        info?: {
            has_audio_list?: boolean[]
        }
        media_ids?: string[]
        resolution?: string
        resultUrls?: string[]
        result_urls?: string[]
        seeds?: number[]
    }
    // Some callbacks have taskId at root level
    taskId?: string
}

export async function POST(request: NextRequest) {
    try {
        const payload: Veo3CallbackPayload = await request.json()

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

        // Get video URL - try multiple possible locations with detailed logging
        let videoUrl: string | null = null

        // Debug: log the actual data structure
        console.log('Debug - payload.data keys:', payload.data ? Object.keys(payload.data) : 'data is null/undefined')
        console.log('Debug - payload.data.resultUrls:', payload.data?.resultUrls)
        console.log('Debug - payload.data.result_urls:', payload.data?.result_urls)
        console.log('Debug - payload.data.response:', payload.data?.response)

        // Try official record-info format first (data.response.resultUrls)
        if (payload.data?.response?.resultUrls && payload.data.response.resultUrls.length > 0) {
            videoUrl = payload.data.response.resultUrls[0]
            console.log('Found videoUrl in data.response.resultUrls:', videoUrl)
        }
        // Fallback to alternative callback format (data.result_urls or data.resultUrls)
        else if (payload.data?.result_urls && payload.data.result_urls.length > 0) {
            videoUrl = payload.data.result_urls[0]
            console.log('Found videoUrl in data.result_urls:', videoUrl)
        }
        else if (payload.data?.resultUrls && payload.data.resultUrls.length > 0) {
            videoUrl = payload.data.resultUrls[0]
            console.log('Found videoUrl in data.resultUrls:', videoUrl)
        }
        else {
            console.log('No videoUrl found in any expected location')
        }

        // Determine success based on successFlag or code
        // successFlag: 0=Generating, 1=Success, 2=Failed, 3=Generation Failed
        const successFlag = payload.data?.successFlag
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

            const errorMsg = payload.data?.errorMessage || payload.msg || 'Unknown error'
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


