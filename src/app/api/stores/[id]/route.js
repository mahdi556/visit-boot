import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET(request, { params }) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        orders: {
          include: {
            payments: true,
            orderItems: {
              include: {
                product: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'فروشگاه یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json(store)
  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت فروشگاه' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    
    const store = await prisma.store.update({
      where: { id: parseInt(params.id) },
      data: {
        name: body.name,
        ownerName: body.ownerName,
        phone: body.phone,
        address: body.address,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        storeType: body.storeType,
        isActive: body.isActive
      }
    })

    return NextResponse.json(store)
  } catch (error) {
    console.error('Error updating store:', error)
    return NextResponse.json(
      { error: 'خطا در بروزرسانی فروشگاه' },
      { status: 500 }
    )
  }
}