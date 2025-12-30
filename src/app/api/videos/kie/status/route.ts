import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkKieVideoStatus, parseKieResultJson } from '@/lib/kie'

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
                provider: 'kie',
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
            })
        }

        // Check status from Kie API
        const kieStatus = await checkKieVideoStatus(video.jobId)

        console.log('Kie status response:', kieStatus)

        let newStatus = video.status
        let videoUrl = video.videoUrl
        let progressState = video.progressState

        if (kieStatus.data.state === 'success') {
            const result = parseKieResultJson(kieStatus.data.resultJson)
            newStatus = 'completed'
            videoUrl = result.videoUrl
            progressState = null
        } else if (kieStatus.data.state === 'fail') {
            newStatus = 'failed'
            progressState = null

            // Handle Refund
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
                    description: `Refund: Video generation failed (Kie status check)`,
                },
            })
        } else {
            // Update progress state
            progressState = kieStatus.data.state as string
        }

        // Update the video record
        await prisma.video.update({
            where: { id: video.id },
            data: {
                status: newStatus,
                videoUrl: videoUrl,
                progressState: progressState,
            },
        })

        return NextResponse.json({
            status: newStatus,
            videoUrl: videoUrl,
            progressState: progressState,
        })
    } catch (error) {
        console.error('Error checking Kie status:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
