import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const product = await prisma.product.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        })

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error fetching product:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { name, imageUrl, features, concept, targetAudience, caption } = body

        const existingProduct = await prisma.product.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        })

        if (!existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                imageUrl,
                features,
                concept,
                targetAudience,
                caption,
            },
        })

        return NextResponse.json({ product })
    } catch (error) {
        console.error('Error updating product:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const existingProduct = await prisma.product.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        })

        if (!existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        await prisma.product.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
