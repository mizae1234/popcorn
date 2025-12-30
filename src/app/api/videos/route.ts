import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateVideo, createVideoPrompt } from '@/lib/phaya'
import { generateCaptionSimple } from '@/lib/openrouter'

const COINS_PER_VIDEO = 15

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const limit = parseInt(searchParams.get('limit') || '50')

        const videos = await prisma.video.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                product: {
                    select: {
                        name: true,
                        imageUrl: true,
                        caption: true,
                    },
                },
            },
        })

        return NextResponse.json({ videos })
    } catch (error) {
        console.error('Error fetching videos:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

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
        const { name, imageUrl, features, concept, targetAudience, caption, saveProduct, productId } = body

        if (!name || !imageUrl || !features || !concept || !targetAudience) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Generate caption if not provided
        let finalCaption = caption
        if (!caption) {
            try {
                finalCaption = await generateCaptionSimple(name, features)
            } catch (error) {
                console.error('Error generating caption:', error)
                finalCaption = `✨ ${name} - ${features.slice(0, 50)}...\n#TikTok #สินค้าดี`
            }
        }

        // Create product if saveProduct is true
        let finalProductId = productId
        if (saveProduct) {
            if (!productId) {
                console.log('Creating new product with caption:', finalCaption)
                const newProduct = await prisma.product.create({
                    data: {
                        name,
                        imageUrl,
                        features,
                        concept,
                        targetAudience,
                        caption: finalCaption,
                        userId: session.user.id,
                    },
                })
                finalProductId = newProduct.id
            } else {
                console.log('Updating existing product with caption:', finalCaption)
                await prisma.product.update({
                    where: { id: productId },
                    data: {
                        name,
                        imageUrl,
                        features,
                        concept,
                        targetAudience,
                        caption: finalCaption,
                    },
                })
            }
        }

        // Generate video prompt
        console.log('Calling createVideoPrompt with:', { name, features, concept, targetAudience, imageUrls: [imageUrl] })
        const prompt = await createVideoPrompt({ name, features, concept, targetAudience, imageUrls: [imageUrl] })
        console.log('createVideoPrompt returned:', prompt)

        // Call Phaya.io API
        const phayaResponse = await generateVideo({
            prompt,
            imageUrls: [imageUrl],
            aspectRatio: 'portrait', // 9:16 for TikTok
            nFrames: '10',
            removeWatermark: true,
        })



        // Create video record
        console.log('Creating video with caption:', finalCaption)
        const video = await prisma.video.create({
            data: {
                jobId: phayaResponse.job_id,
                taskId: phayaResponse.task_id,
                status: 'processing',
                prompt,
                aspectRatio: 'portrait',
                caption: finalCaption,
                productId: finalProductId || null,
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
                description: `สร้างวิดีโอ: ${name}`,
            },
        })

        return NextResponse.json({ video }, { status: 201 })
    } catch (error) {
        console.error('Error creating video:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
