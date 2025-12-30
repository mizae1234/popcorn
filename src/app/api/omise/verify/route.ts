import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { retrieveCharge, PRICE_PLANS } from '@/lib/omise'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { chargeId } = await request.json()

        if (!chargeId) {
            return NextResponse.json({ error: 'Missing chargeId' }, { status: 400 })
        }

        // Retrieve charge from Omise
        const charge = await retrieveCharge(chargeId)

        if (!charge) {
            return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
        }

        // Verify user matches
        const userId = charge.metadata?.userId as string
        if (userId !== session.user.id) {
            return NextResponse.json({ error: 'User mismatch' }, { status: 403 })
        }

        if (charge.status !== 'successful') {
            return NextResponse.json({
                success: false,
                status: charge.status,
                failureCode: charge.failure_code,
                failureMessage: charge.failure_message,
            }, { status: 400 })
        }

        const planId = charge.metadata?.planId as string
        const coins = charge.metadata?.coins as number

        if (!planId || !coins) {
            return NextResponse.json({ error: 'Invalid charge metadata' }, { status: 400 })
        }

        // Check if this charge was already processed
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                userId,
                description: { contains: chargeId },
            },
        })

        if (existingTransaction) {
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

        // Record transaction
        await prisma.transaction.create({
            data: {
                userId,
                type: 'purchase',
                amount: coins,
                description: `ซื้อ ${plan?.name || planId}: +${coins} coins (${chargeId})`,
            },
        })

        console.log(`[Omise] Added ${coins} coins to user ${userId}`)

        return NextResponse.json({
            success: true,
            coins,
            message: `เพิ่ม ${coins} coins สำเร็จ!`
        })
    } catch (error) {
        console.error('Omise verify error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
