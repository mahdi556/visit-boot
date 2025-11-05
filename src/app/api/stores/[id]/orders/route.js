// src/app/api/stores/[id]/orders/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET(request, { params }) {
  try {
    const storeId = parseInt(params.id)

    if (isNaN(storeId)) {
      return NextResponse.json(
        { error: 'شناسه فروشگاه نامعتبر است' },
        { status: 400 }
      )
    }

    // اول فروشگاه را پیدا کن تا storeCode را داشته باشیم
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { 
        id: true,
        code: true,
        name: true 
      }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'فروشگاه یافت نشد' },
        { status: 404 }
      )
    }

    console.log(`📦 Fetching orders for store: ${store.name} (${store.code})`)

    // حالا سفارشات این فروشگاه را با storeCode بگیر
    const orders = await prisma.order.findMany({
      where: { 
        storeCode: store.code 
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                code: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${orders.length} orders for store ${store.code}`)

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching store orders:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت سفارشات فروشگاه' },
      { status: 500 }
    )
  }
}