// 📂 src/app/api/stores/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/database";

// GET - دریافت اطلاعات یک فروشگاه
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const storeId = parseInt(id);

    if (isNaN(storeId)) {
      return NextResponse.json(
        { error: "شناسه فروشگاه نامعتبر است" },
        { status: 400 }
      );
    }

    console.log(`🏪 Fetching store with ID: ${storeId}`);

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        deliveryZone: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        route: {
          select: {
            id: true,
            name: true,
            color: true,
            driverName: true,
            vehicleType: true,
          },
        },
        _count: {
          select: {
            orders: true,
            deliveries: true,
          },
        },
      },
    });

    if (!store) {
      console.log(`❌ Store with ID ${storeId} not found`);
      return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 });
    }

    console.log(`✅ Store found: ${store.name}`);
    return NextResponse.json(store);
  } catch (error) {
    console.error("❌ Error fetching store:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات فروشگاه" },
      { status: 500 }
    );
  }
}
// PUT - ویرایش فروشگاه
export async function PUT(request, { params }) {
  try {
    // استفاده از await برای params
    const { id } = await params;
    const body = await request.json();

    // چک کردن وجود فروشگاه
    const existingStore = await prisma.store.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingStore) {
      return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 });
    }

    // اعتبارسنجی فیلدهای ضروری
    if (!body.name || !body.ownerName || !body.phone || !body.address) {
      return NextResponse.json(
        { error: "تمامی فیلدهای ضروری را پر کنید" },
        { status: 400 }
      );
    }

    const storeData = {
      name: body.name,
      ownerName: body.ownerName,
      phone: body.phone,
      address: body.address,
      storeType: body.storeType || "SUPERMARKET",
      deliveryZoneId: body.deliveryZoneId || null,
      routeId: body.routeId || null,
    };

    // اضافه کردن موقعیت اگر وجود دارد
    if (body.latitude && body.longitude) {
      storeData.latitude = parseFloat(body.latitude);
      storeData.longitude = parseFloat(body.longitude);
    }

    const store = await prisma.store.update({
      where: { id: parseInt(id) },
      data: storeData,
      include: {
        deliveryZone: true,
        route: true,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error("Error updating store:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "فروشگاه با این نام یا شماره تلفن قبلاً وجود دارد" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطا در ویرایش فروشگاه" },
      { status: 500 }
    );
  }
}

// DELETE - حذف فروشگاه
export async function DELETE(request, { params }) {
  try {
    // استفاده از await برای params
    const { id } = await params;

    // چک کردن وجود فروشگاه
    const existingStore = await prisma.store.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            orders: true,
            deliveries: true,
          },
        },
      },
    });

    if (!existingStore) {
      return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 });
    }

    // چک کردن وجود سفارشات یا تحویل‌ها
    if (
      existingStore._count.orders > 0 ||
      existingStore._count.deliveries > 0
    ) {
      return NextResponse.json(
        { error: "امکان حذف فروشگاه با سفارشات یا تحویل‌های فعال وجود ندارد" },
        { status: 400 }
      );
    }

    await prisma.store.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "فروشگاه با موفقیت حذف شد" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting store:", error);
    return NextResponse.json({ error: "خطا در حذف فروشگاه" }, { status: 500 });
  }
}
