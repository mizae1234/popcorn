import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { constructWebhookEvent, PRICE_PLANS } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
    try {
        const payload = await request.text()
        const signature = request.headers.get('stripe-signature')

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
        }

        let event: Stripe.Event

        try {
            event = await constructWebhookEvent(payload, signature)
        } catch (err) {
            console.error('Webhook signature verification failed:', err)
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session

                const userId = session.metadata?.userId
                const planId = session.metadata?.planId
                const coins = parseInt(session.metadata?.coins || '0')

                if (!userId || !planId || !coins) {
                    console.error('Missing metadata in checkout session:', session.metadata)
                    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
                }

                // Check for existing transaction (idempotency)
                const existingTransaction = await prisma.transaction.findFirst({
                    where: {
                        userId,
                        description: { contains: session.id },
                    },
                })

                if (existingTransaction) {
                    console.log(`Session ${session.id} already processed.`)
                    break
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
                        description: `ซื้อ ${plan?.name || planId}: +${coins} coins (${session.id})`,
                    },
                })

                console.log(`Added ${coins} coins to user ${userId}`)
                break
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent
                console.error('Payment failed:', paymentIntent.id)
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
