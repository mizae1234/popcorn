import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateVideo } from '@/lib/phaya'

const COINS_PER_VIDEO = 15

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check user coins
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { coins: true },
        })

        if (!user || user.coins < COINS_PER_VIDEO) {
            return NextResponse.json(
                { error: 'Coins ไม่เพียงพอ กรุณาเติม coins เพื่อสร้างวิดีโอ' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { videoId } = body

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
        }

        // Get original video
        const originalVideo = await prisma.video.findFirst({
            where: {
                id: videoId,
                userId: session.user.id,
            },
            include: {
                product: true,
            },
        })

        if (!originalVideo) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        // Get image URL from product or use a placeholder
        const imageUrl = originalVideo.product?.imageUrl || ''

        if (!imageUrl) {
            return NextResponse.json(
                { error: 'ไม่พบ URL รูปภาพ กรุณาสร้างวิดีโอใหม่' },
                { status: 400 }
            )
        }

        // Call Phaya.io API
        const phayaResponse = await generateVideo({
            prompt: originalVideo.prompt,
            imageUrls: [imageUrl],
            aspectRatio: 'portrait',
            nFrames: '10',
            removeWatermark: true,
        })

        // Create new video record
        const newVideo = await prisma.video.create({
            data: {
                jobId: phayaResponse.job_id,
                taskId: phayaResponse.task_id,
                status: 'processing',
                prompt: originalVideo.prompt,
                caption: originalVideo.caption,
                aspectRatio: originalVideo.aspectRatio,
                productId: originalVideo.productId,
                userId: session.user.id,
            },
        })

        // Deduct coins
        await prisma.user.update({
            where: { id: session.user.id },
            data: { coins: { decrement: COINS_PER_VIDEO } },
        })

        // Record transaction
        await prisma.transaction.create({
            data: {
                userId: session.user.id,
                type: 'generation',
                amount: -COINS_PER_VIDEO,
                description: `Regenerate วิดีโอ`,
            },
        })

        return NextResponse.json({ video: newVideo }, { status: 201 })
    } catch (error) {
        console.error('Error regenerating video:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
