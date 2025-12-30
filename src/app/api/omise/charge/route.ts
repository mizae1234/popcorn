import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCharge, PRICE_PLANS } from '@/lib/omise'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { planId, token } = body

        if (!planId || !token) {
            return NextResponse.json({ error: 'Missing planId or token' }, { status: 400 })
        }

        // Validate plan exists
        const plan = PRICE_PLANS.find(p => p.id === planId)
        if (!plan) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const returnUri = `${baseUrl}/pricing?omise_callback=true`

        const charge = await createCharge({
            planId,
            userId: session.user.id,
            token,
            returnUri,
        })

        // If charge is successful immediately (no 3DS required)
        if (charge.status === 'successful') {
            // Add coins to user
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    coins: { increment: plan.coins },
                },
            })

            // Record transaction
            await prisma.transaction.create({
                data: {
                    userId: session.user.id,
                    type: 'purchase',
                    amount: plan.coins,
                    description: `ซื้อ ${plan.name}: +${plan.coins} coins (${charge.id})`,
                },
            })

            return NextResponse.json({
                success: true,
                chargeId: charge.id,
                status: charge.status,
            })
        }

        // If 3DS is required, redirect to authorize_uri
        if (charge.status === 'pending' && charge.authorize_uri) {
            return NextResponse.json({
                success: true,
                chargeId: charge.id,
                status: charge.status,
                authorizeUri: charge.authorize_uri,
            })
        }

        return NextResponse.json({
            success: false,
            chargeId: charge.id,
            status: charge.status,
            failureCode: charge.failure_code,
            failureMessage: charge.failure_message,
        }, { status: 400 })

    } catch (error) {
        console.error('Omise charge error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
