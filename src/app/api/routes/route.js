import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      include: {
        stores: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            stores: true,
            deliveries: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(routes)
  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت مسیرها' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    const route = await prisma.route.create({
      data: {
        name: body.name,
        driverName: body.driverName,
        vehicleType: body.vehicleType,
        color: body.color || "#6C63FF",
        coordinates: body.coordinates || null,
        area: body.area || null
      },
      include: {
        _count: {
          select: {
            stores: true
          }
        }
      }
    })

    return NextResponse.json(route)
  } catch (error) {
    console.error('Error creating route:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد مسیر' },
      { status: 500 }
    )
  }
}