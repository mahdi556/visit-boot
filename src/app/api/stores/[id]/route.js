import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

// GET - دریافت اطلاعات یک فروشگاه
export async function GET(request, { params }) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        deliveryZone: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        route: {
          select: {
            id: true,
            name: true,
            color: true,
            driverName: true,
            vehicleType: true
          }
        },
        _count: {
          select: { orders: true }
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
      { error: 'خطا در دریافت اطلاعات فروشگاه' },
      { status: 500 }
    )
  }
}

// PUT - ویرایش فروشگاه
export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    
    // چک کردن وجود فروشگاه
    const existingStore = await prisma.store.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!existingStore) {
      return NextResponse.json(
        { error: 'فروشگاه یافت نشد' },
        { status: 404 }
      )
    }

    // اعتبارسنجی فیلدهای ضروری
    if (!body.name || !body.ownerName || !body.phone || !body.address) {
      return NextResponse.json(
        { error: 'تمامی فیلدهای ضروری را پر کنید' },
        { status: 400 }
      )
    }

    const storeData = {
      name: body.name,
      ownerName: body.ownerName,
      phone: body.phone,
      address: body.address,
      storeType: body.storeType || 'SUPERMARKET',
      deliveryZoneId: body.deliveryZoneId || null, // اضافه شده
      routeId: body.routeId || null, // اضافه شده
    }

    // اضافه کردن موقعیت اگر وجود دارد
    if (body.latitude && body.longitude) {
      storeData.latitude = parseFloat(body.latitude)
      storeData.longitude = parseFloat(body.longitude)
    }

    const store = await prisma.store.update({
      where: { id: parseInt(params.id) },
      data: storeData,
      include: {
        deliveryZone: true,
        route: true
      }
    })

    return NextResponse.json(store)
  } catch (error) {
    console.error('Error updating store:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'فروشگاه با این نام یا شماره تلفن قبلاً وجود دارد' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'خطا در ویرایش فروشگاه' },
      { status: 500 }
    )
  }
}

// DELETE - حذف فروشگاه
export async function DELETE(request, { params }) {
  try {
    // چک کردن وجود فروشگاه
    const existingStore = await prisma.store.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    })

    if (!existingStore) {
      return NextResponse.json(
        { error: 'فروشگاه یافت نشد' },
        { status: 404 }
      )
    }

    // چک کردن وجود سفارشات
    if (existingStore._count.orders > 0) {
      return NextResponse.json(
        { error: 'امکان حذف فروشگاه با سفارشات فعال وجود ندارد' },
        { status: 400 }
      )
    }

    await prisma.store.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json(
      { message: 'فروشگاه با موفقیت حذف شد' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting store:', error)
    return NextResponse.json(
      { error: 'خطا در حذف فروشگاه' },
      { status: 500 }
    )
  }
}