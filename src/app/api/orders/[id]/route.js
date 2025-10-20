import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET(request, { params }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        store: true,
        orderItems: {
          include: {
            product: true
          }
        },
        payments: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'سفارش یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت سفارش' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    
    const order = await prisma.order.update({
      where: { id: parseInt(params.id) },
      data: {
        status: body.status,
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
        notes: body.notes
      },
      include: {
        store: true,
        orderItems: {
          include: {
            product: true
          }
        },
        payments: true
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'خطا در بروزرسانی سفارش' },
      { status: 500 }
    )
  }
}