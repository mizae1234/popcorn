import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseVeo3ResultJson, Veo3VideoStatusResponse } from '@/lib/kie'

interface Veo3CallbackPayload {
    code: number
    msg: string
    data: {
        taskId: string
        paramJson: string
        completeTime: string
        response: {
            taskId: string
            resultUrls: string[]
            originUrls: string[]
            resolution: string
        }
        successFlag: number
        errorCode: string | null
        errorMessage: string
        createTime: string
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload: Veo3CallbackPayload = await request.json()

        console.log('Veo3 callback received:', JSON.stringify(payload, null, 2))

        const { data } = payload

        if (!data?.taskId) {
            console.error('Invalid callback payload: missing taskId')
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
        }

        // Find the video record by taskId (stored as jobId)
        const video = await prisma.video.findFirst({
            where: {
                jobId: data.taskId,
                provider: 'veo3',
            },
        })

        if (!video) {
            console.error(`Video not found for taskId: ${data.taskId}`)
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        // Status based on successFlag: 1 = success, other values = fail
        const isSuccess = data.successFlag === 1

        // Update video based on result
        if (isSuccess) {
            const { videoUrl } = parseVeo3ResultJson(data.response)

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
                const COINS_PER_VIDEO = 15
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

            console.error(`Video ${video.id} failed: ${data.errorMessage}`)
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
