import { NextResponse } from "next/server";
import prisma from "@/lib/database";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const withoutRoute = searchParams.get('withoutRoute');
    
    let where = {};
    if (withoutRoute === 'true') {
      where.routeId = null;
    }

    const stores = await prisma.store.findMany({
      where,
      select: { // تغییر از include به select برای کنترل بهتر فیلدها
        id: true,
        code: true, // اضافه شده
        name: true,
        ownerName: true,
        phone: true,
        address: true,
        storeType: true,
        latitude: true,
        longitude: true,
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
            color: true
          }
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(stores);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST بدون تغییر باقی می‌ماند چون از قبل code را مدیریت می‌کند
export async function POST(request) {
  try {
    const body = await request.json();
    
    // تولید کد خودکار اگر ارسال نشده
    const storeCode = body.code || generateStoreCode();
    
    const store = await prisma.store.create({
      data: {
        code: storeCode,
        name: body.name,
        ownerName: body.ownerName,
        phone: body.phone,
        address: body.address,
        storeType: body.storeType,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        deliveryZoneId: body.deliveryZoneId || null,
        routeId: body.routeId || null,
      },
    });
    console.log(body);

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "خطا در ایجاد فروشگاه: " + error.message },
      { status: 500 }
    );
  }
}

// تابع تولید کد خودکار برای فروشگاه
function generateStoreCode() {
  const prefix = "ST";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}