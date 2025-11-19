// 📂 src/app/api/sales-reps/[id]/orders/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let where = {
      salesRepId: parseInt(id)
    }

    // فیلتر بر اساس تاریخ
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching sales rep orders:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت سفارشات ویزیتور' },
      { status: 500 }
    )
  }
}