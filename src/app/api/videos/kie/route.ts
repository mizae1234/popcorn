import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateVideoWithKie } from '@/lib/kie'
import { createVideoPrompt } from '@/lib/phaya'
import { generateCaptionSimple } from '@/lib/openrouter'

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
        const prompt = await createVideoPrompt({ name, features, concept, targetAudience, imageUrls: [imageUrl] })

        // Get the callback URL (use the deployed URL or localhost for development)
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const callbackUrl = `${baseUrl}/api/videos/kie/callback`

        console.log('Calling Kie AI with:', { prompt: prompt.substring(0, 50), imageUrls: [imageUrl], callbackUrl })

        // Call Kie AI API
        const kieResponse = await generateVideoWithKie({
            prompt,
            imageUrls: [imageUrl],
            aspectRatio: 'portrait', // 9:16 for TikTok
            nFrames: '15', // 15 seconds
            removeWatermark: true,
            callbackUrl,
        })

        console.log('Kie AI response:', kieResponse)



        // Create video record
        const video = await prisma.video.create({
            data: {
                jobId: kieResponse.data.taskId,
                taskId: kieResponse.data.taskId,
                status: 'processing',
                prompt,
                aspectRatio: 'portrait',
                provider: 'kie',
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
                description: `สร้างวิดีโอ (Kie): ${name}`,
            },
        })

        return NextResponse.json({ video }, { status: 201 })
    } catch (error) {
        console.error('Error creating Kie video:', error)
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        })
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
