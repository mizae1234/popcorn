import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkVideoStatus as checkPhayaStatus } from '@/lib/phaya'
import { checkKieVideoStatus, parseKieResultJson } from '@/lib/kie'

const COINS_PER_VIDEO = 15

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const videoId = searchParams.get('videoId')

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
        }

        // Get video from database
        const video = await prisma.video.findFirst({
            where: {
                id: videoId,
                userId: session.user.id,
            },
        })

        if (!video) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        // If already completed or failed, return current status
        if (video.status !== 'processing') {
            return NextResponse.json({
                status: video.status,
                videoUrl: video.videoUrl,
            })
        }

        // Check status based on provider
        try {
            if (video.provider === 'kie') {
                // Check status from Kie.ai
                if (!video.taskId) {
                    throw new Error('Task ID not found for Kie video')
                }
                const kieStatus = await checkKieVideoStatus(video.taskId)

                let status = video.status
                let videoUrl: string | null = null

                // Map Kie states to our statuses
                if (kieStatus.data.state === 'success') {
                    status = 'completed'
                    const parsed = parseKieResultJson(kieStatus.data.resultJson)
                    videoUrl = parsed.videoUrl
                } else if (kieStatus.data.state === 'fail') {
                    status = 'failed'
                } else {
                    status = 'processing' // waiting, queuing, generating
                }

                // Update video in database if status changed
                if (status !== video.status || videoUrl !== video.videoUrl) {
                    // Handle Refund if failed
                    if (status === 'failed') {
                        await prisma.user.update({
                            where: { id: session.user.id },
                            data: { coins: { increment: COINS_PER_VIDEO } },
                        })

                        await prisma.transaction.create({
                            data: {
                                userId: session.user.id,
                                type: 'refund',
                                amount: COINS_PER_VIDEO,
                                description: `Refund: Video generation failed (Kie)`,
                            },
                        })
                    }

                    await prisma.video.update({
                        where: { id: videoId },
                        data: {
                            status,
                            videoUrl,
                        },
                    })
                }

                return NextResponse.json({
                    status,
                    videoUrl,
                    kieState: kieStatus.data.state,
                })
            } else {
                // Default to Phaya.io
                const phayaStatus = await checkPhayaStatus(video.jobId)

                // Update video in database if status changed
                if (phayaStatus.status !== video.status) {
                    const isFailure = phayaStatus.status === 'failed'

                    // Handle Refund if failed
                    if (isFailure) {
                        await prisma.user.update({
                            where: { id: session.user.id },
                            data: { coins: { increment: COINS_PER_VIDEO } },
                        })

                        await prisma.transaction.create({
                            data: {
                                userId: session.user.id,
                                type: 'refund',
                                amount: COINS_PER_VIDEO,
                                description: `Refund: Video generation failed`,
                            },
                        })
                    }

                    await prisma.video.update({
                        where: { id: videoId },
                        data: {
                            status: phayaStatus.status,
                            videoUrl: phayaStatus.video_url || null,
                        },
                    })
                }

                return NextResponse.json({
                    status: phayaStatus.status,
                    videoUrl: phayaStatus.video_url,
                })
            }
        } catch (apiError) {
            console.error('Error checking video status:', apiError)
            // Return current database status if API fails
            return NextResponse.json({
                status: video.status,
                videoUrl: video.videoUrl,
            })
        }
    } catch (error) {
        console.error('Error checking video status:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
