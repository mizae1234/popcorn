import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const limit = parseInt(searchParams.get('limit') || '50')

        const products = await prisma.product.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
        })

        return NextResponse.json({ products })
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, imageUrl, features, concept, targetAudience } = body

        if (!name || !imageUrl || !features || !concept || !targetAudience) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const product = await prisma.product.create({
            data: {
                name,
                imageUrl,
                features,
                concept,
                targetAudience,
                userId: session.user.id,
            },
        })

        return NextResponse.json({ product }, { status: 201 })
    } catch (error) {
        console.error('Error creating product:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
