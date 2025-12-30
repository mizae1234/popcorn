import Omise from 'omise'

const omise = Omise({
    publicKey: process.env.OMISE_PUBLIC_KEY!,
    secretKey: process.env.OMISE_SECRET_KEY!,
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
        id: 'topup_100',
        name: 'Top-up 100 Coins',
        price: 99,
        coins: 100,
        description: '100 Coins - สร้างวิดีโอได้ ~6 ครั้ง',
    },
    {
        id: 'topup_500',
        name: 'Top-up 500 Coins',
        price: 399,
        coins: 500,
        description: '500 Coins - สร้างวิดีโอได้ ~33 ครั้ง',
    },
    {
        id: 'mini_20',
        name: 'Mini Pack',
        price: 20,
        coins: 20,
        description: '20 Coins - สร้างวิดีโอได้ 1 ครั้ง',
    },
]

export interface CreateChargeParams {
    planId: string
    userId: string
    token: string // Omise token from frontend
    returnUri: string
}

export async function createCharge({
    planId,
    userId,
    token,
    returnUri,
}: CreateChargeParams): Promise<Omise.Charges.ICharge> {
    const plan = PRICE_PLANS.find(p => p.id === planId)

    if (!plan) {
        throw new Error('Invalid plan ID')
    }

    const charge = await omise.charges.create({
        amount: plan.price * 100, // Omise uses smallest currency unit (satang)
        currency: 'thb',
        card: token,
        return_uri: returnUri,
        metadata: {
            userId,
            planId,
            coins: plan.coins,
        },
    })

    return charge
}

export async function retrieveCharge(chargeId: string): Promise<Omise.Charges.ICharge> {
    return omise.charges.retrieve(chargeId)
}

export { omise }
