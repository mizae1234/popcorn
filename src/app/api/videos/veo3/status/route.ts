import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkVeo3VideoStatus, parseVeo3ResultJson } from '@/lib/kie'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { videoId } = await request.json()

        if (!videoId) {
            return NextResponse.json({ error: 'Missing videoId' }, { status: 400 })
        }

        // Get the video record
        const video = await prisma.video.findFirst({
            where: {
                id: videoId,
                userId: session.user.id,
                provider: 'veo3',
            },
        })

        if (!video) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        if (video.status === 'completed' || video.status === 'failed') {
            return NextResponse.json({
                status: video.status,
                videoUrl: video.videoUrl,
                progressState: video.progressState,
                failReason: video.failReason,
            })
        }

        // Check status from Veo3 API
        const veo3Status = await checkVeo3VideoStatus(video.jobId)

        console.log('Veo3 status response:', veo3Status)

        let newStatus = video.status
        let videoUrl = video.videoUrl
        let progressState = video.progressState

        // successFlag: 0 = generating, 1 = success, 2 = failed, 3 = generation failed
        if (veo3Status.data.successFlag === 1) {
            const result = parseVeo3ResultJson(veo3Status.data.response)
            newStatus = 'completed'
            videoUrl = result.videoUrl
            progressState = null
        } else if (veo3Status.data.successFlag === 2 || veo3Status.data.successFlag === 3) {
            newStatus = 'failed'
            progressState = null

            // Map error messages to user-friendly Thai messages
            const errorMessage = veo3Status.data.errorMessage || ''
            let failReason = 'การสร้างวิดีโอล้มเหลว กรุณาลองใหม่อีกครั้ง'

            if (errorMessage.includes('minor')) {
                failReason = 'รูปภาพไม่ผ่านนโยบายการใช้งาน: ไม่รองรับรูปภาพที่มีเด็กหรือผลิตภัณฑ์สำหรับเด็ก กรุณาใช้รูปภาพอื่น'
            } else if (errorMessage.includes('unsafe')) {
                failReason = 'รูปภาพไม่ผ่านนโยบายการใช้งาน: รูปภาพไม่เหมาะสม กรุณาใช้รูปภาพอื่น'
            } else if (errorMessage.includes('fetch')) {
                failReason = 'ไม่สามารถโหลดรูปภาพได้ กรุณาตรวจสอบ URL รูปภาพ'
            }

            // Handle Refund if not already failed
            if (video.status !== 'failed') {
                const COINS_PER_VIDEO = 15
                await prisma.user.update({
                    where: { id: session.user.id },
                    data: { coins: { increment: COINS_PER_VIDEO } },
                })

                await prisma.transaction.create({
                    data: {
                        userId: session.user.id,
                        type: 'refund',
                        amount: COINS_PER_VIDEO,
                        description: `Refund: ${failReason}`,
                    },
                })
            }
        } else {
            // Still generating (successFlag = 0)
            progressState = 'generating'
        }

        // Get failReason from the error handling block
        let failReason: string | null = null
        if (newStatus === 'failed' && veo3Status.data.errorMessage) {
            const errorMessage = veo3Status.data.errorMessage
            if (errorMessage.includes('minor')) {
                failReason = 'รูปภาพไม่ผ่านนโยบายการใช้งาน: ไม่รองรับรูปภาพที่มีเด็กหรือผลิตภัณฑ์สำหรับเด็ก กรุณาใช้รูปภาพอื่น'
            } else if (errorMessage.includes('unsafe')) {
                failReason = 'รูปภาพไม่ผ่านนโยบายการใช้งาน: รูปภาพไม่เหมาะสม กรุณาใช้รูปภาพอื่น'
            } else if (errorMessage.includes('fetch')) {
                failReason = 'ไม่สามารถโหลดรูปภาพได้ กรุณาตรวจสอบ URL รูปภาพ'
            } else {
                failReason = 'การสร้างวิดีโอล้มเหลว กรุณาลองใหม่อีกครั้ง'
            }
        }

        // Update the video record
        await prisma.video.update({
            where: { id: video.id },
            data: {
                status: newStatus,
                videoUrl: videoUrl,
                progressState: progressState,
                failReason: failReason,
            },
        })

        return NextResponse.json({
            status: newStatus,
            videoUrl: videoUrl,
            progressState: progressState,
            failReason: failReason,
        })
    } catch (error) {
        console.error('Error checking Veo3 status:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
