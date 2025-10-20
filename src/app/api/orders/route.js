import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        store: {
          select: { name: true }
        },
        user: {
          select: { firstName: true, lastName: true }
        },
        items: {
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const order = await prisma.order.create({
      data: {
        storeId: body.storeId,
        userId: body.userId,
        totalAmount: body.totalAmount,
        status: body.status || 'PENDING',
        items: {
          create: body.items
        }
      },
      include: {
        store: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}