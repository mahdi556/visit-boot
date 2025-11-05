import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET() {
  try {
    const zones = await prisma.deliveryZone.findMany({
      include: {
        stores: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // اضافه کردن تعداد فروشگاه‌ها به هر منطقه
    const zonesWithStoreCount = zones.map(zone => ({
      ...zone,
      storeCount: zone.stores.length
    }))

    return NextResponse.json(zonesWithStoreCount)
  } catch (error) {
    console.error('Error fetching delivery zones:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت مناطق' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    const zone = await prisma.deliveryZone.create({
      data: {
        name: body.name,
        coordinates: body.coordinates,
        deliveryCost: parseFloat(body.deliveryCost),
        deliveryTime: parseInt(body.deliveryTime),
        color: body.color,
        area: parseFloat(body.area)
      }
    })

    return NextResponse.json(zone)
  } catch (error) {
    console.error('Error creating delivery zone:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد منطقه' },
      { status: 500 }
    )
  }
}