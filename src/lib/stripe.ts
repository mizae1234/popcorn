import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
})

export interface PricePlan {
    id: string
    name: string
    price: number // in THB
    coins: number
    description: string
}

export const PRICE_PLANS: PricePlan[] = [
    {
        id: 'mini_20',
        name: 'Mini Pack',
        price: 20,
        coins: 20,
        description: '20 Coins - สร้างวิดีโอได้ 1 ครั้ง',
    },
    {
        id: 'topup_100',
        name: 'Top-up 100 Coins',
        price: 99,
        coins: 100,
        description: '100 Coins - สร้างวิดีโอได้ ~6 ครั้ง',
    },
    {
        id: 'monthly_250',
        name: 'Monthly Plan',
        price: 199,
        coins: 250,
        description: '250 Coins - สร้างวิดีโอได้ ~16 ครั้ง',
    },
    {
        id: 'pro_450',
        name: 'Pro Plan',
        price: 299,
        coins: 450,
        description: '450 Coins - สร้างวิดีโอได้ ~30 ครั้ง',
    },
    {
        id: 'topup_500',
        name: 'Top-up 500 Coins',
        price: 399,
        coins: 500,
        description: '500 Coins - สร้างวิดีโอได้ ~33 ครั้ง',
    },
]

export async function createCheckoutSession({
    planId,
    userId,
    userEmail,
    successUrl,
    cancelUrl,
}: {
    planId: string
    userId: string
    userEmail: string
    successUrl: string
    cancelUrl: string
}): Promise<Stripe.Checkout.Session> {
    const plan = PRICE_PLANS.find(p => p.id === planId)

    if (!plan) {
        throw new Error('Invalid plan ID')
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'promptpay'],
        line_items: [
            {
                price_data: {
                    currency: 'thb',
                    product_data: {
                        name: plan.name,
                        description: plan.description,
                    },
                    unit_amount: plan.price * 100, // Stripe uses smallest currency unit (satang)
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userEmail,
        metadata: {
            userId,
            planId,
            coins: plan.coins.toString(),
        },
    })

    return session
}

export async function constructWebhookEvent(
    payload: string | Buffer,
    signature: string
): Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

export { stripe }
