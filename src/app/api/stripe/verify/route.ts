import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, PRICE_PLANS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { sessionId } = await request.json()

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
        }

        // Retrieve the checkout session from Stripe
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)

        if (!checkoutSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // Verify payment status
        if (checkoutSession.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
        }

        // Verify user matches
        const userId = checkoutSession.metadata?.userId
        if (userId !== session.user.id) {
            return NextResponse.json({ error: 'User mismatch' }, { status: 403 })
        }

        const planId = checkoutSession.metadata?.planId
        const coins = parseInt(checkoutSession.metadata?.coins || '0')

        if (!planId || !coins) {
            return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 })
        }

        // Check if this session was already processed (prevent double credits)
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                userId,
                description: { contains: sessionId },
            },
        })

        if (existingTransaction) {
            // Already processed - return success but don't add coins again
            return NextResponse.json({
                success: true,
                alreadyProcessed: true,
                coins: 0,
                message: 'Payment already processed'
            })
        }

        const plan = PRICE_PLANS.find(p => p.id === planId)

        // Add coins to user
        await prisma.user.update({
            where: { id: userId },
            data: {
                coins: { increment: coins },
            },
        })

        // Record transaction with sessionId to prevent duplicates
        await prisma.transaction.create({
            data: {
                userId,
                type: 'purchase',
                amount: coins,
                description: `ซื้อ ${plan?.name || planId}: +${coins} coins (${sessionId})`,
            },
        })

        console.log(`[Verify] Added ${coins} coins to user ${userId}`)

        return NextResponse.json({
            success: true,
            coins,
            message: `เพิ่ม ${coins} coins สำเร็จ!`
        })
    } catch (error) {
        console.error('Verify payment error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
