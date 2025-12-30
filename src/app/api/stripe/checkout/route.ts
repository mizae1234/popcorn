import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession, PRICE_PLANS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id || !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { planId } = body

        if (!planId) {
            return NextResponse.json({ error: 'Missing planId' }, { status: 400 })
        }

        // Validate plan exists
        const plan = PRICE_PLANS.find(p => p.id === planId)
        if (!plan) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

        const checkoutSession = await createCheckoutSession({
            planId,
            userId: session.user.id,
            userEmail: session.user.email,
            successUrl: `${baseUrl}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${baseUrl}/pricing?canceled=true`,
        })

        return NextResponse.json({ url: checkoutSession.url })
    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
