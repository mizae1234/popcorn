import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseKieResultJson } from '@/lib/kie'

interface KieCallbackPayload {
    code: number
    data: {
        taskId: string
        state: 'success' | 'fail'
        resultJson: string | null
        failCode: string | null
        failMsg: string | null
    }
    msg: string
}

export async function POST(request: NextRequest) {
    try {
        const payload: KieCallbackPayload = await request.json()

        console.log('Kie callback received:', JSON.stringify(payload, null, 2))

        const { data } = payload

        if (!data?.taskId) {
            console.error('Invalid callback payload: missing taskId')
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
        }

        // Find the video record by taskId (stored as jobId)
        const video = await prisma.video.findFirst({
            where: {
                jobId: data.taskId,
                provider: 'kie',
            },
        })

        if (!video) {
            console.error(`Video not found for taskId: ${data.taskId}`)
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        // Update video based on result
        if (data.state === 'success') {
            const { videoUrl } = parseKieResultJson(data.resultJson)

            await prisma.video.update({
                where: { id: video.id },
                data: {
                    status: 'completed',
                    videoUrl: videoUrl,
                },
            })

            console.log(`Video ${video.id} completed with URL: ${videoUrl}`)
        } else if (data.state === 'fail') {
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
                        description: `Refund: Video generation failed (Kie)`,
                    },
                })
            }

            await prisma.video.update({
                where: { id: video.id },
                data: {
                    status: 'failed',
                },
            })

            console.error(`Video ${video.id} failed: ${data.failMsg}`)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error processing Kie callback:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
