import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const paymentType = searchParams.get('type')
    const isPaid = searchParams.get('isPaid')

    const skip = (page - 1) * limit

    const where = {}

    if (paymentType) {
      where.paymentType = paymentType
    }

    if (isPaid !== null) {
      where.isPaid = isPaid === 'true'
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            include: {
              store: true
            }
          }
        },
        orderBy: { paymentDate: 'desc' }
      }),
      prisma.payment.count({ where })
    ])

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت پرداخت‌ها' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    const payment = await prisma.payment.create({
      data: {
        orderId: parseInt(body.orderId),
        paymentType: body.paymentType,
        amount: parseFloat(body.amount),
        reference: body.reference,
        bankName: body.bankName,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        isPaid: body.isPaid || false,
        notes: body.notes
      },
      include: {
        order: {
          include: {
            store: true
          }
        }
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد پرداخت' },
      { status: 500 }
    )
  }
}