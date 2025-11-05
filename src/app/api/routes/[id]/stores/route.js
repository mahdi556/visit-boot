import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

// دریافت فروشگاه‌های یک مسیر
export async function GET(request, { params }) {
  try {
    const stores = await prisma.store.findMany({
      where: {
        routeId: params.id
      },
      include: {
        deliveryZone: true,
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    return NextResponse.json(stores)
  } catch (error) {
    console.error('Error fetching route stores:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت فروشگاه‌های مسیر' },
      { status: 500 }
    )
  }
}

// اضافه کردن فروشگاه به مسیر
export async function POST(request, { params }) {
  try {
    const { storeIds } = await request.json()
    
    // آپدیت فروشگاه‌ها برای اضافه کردن به مسیر
    await prisma.store.updateMany({
      where: {
        id: {
          in: storeIds
        }
      },
      data: {
        routeId: params.id
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'فروشگاه‌ها با موفقیت به مسیر اضافه شدند'
    })
  } catch (error) {
    console.error('Error adding stores to route:', error)
    return NextResponse.json(
      { error: 'خطا در اضافه کردن فروشگاه به مسیر' },
      { status: 500 }
    )
  }
}