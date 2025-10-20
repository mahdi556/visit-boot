import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(stores)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    const store = await prisma.store.create({
      data: {
        name: body.name,
        ownerName: body.ownerName,
        phone: body.phone,
        address: body.address,
        storeType: body.storeType,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null
      }
    })
    
    return NextResponse.json(store, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}