// 📂 src/app/api/routes/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/database";

// GET - دریافت یک مسیر خاص
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const route = await prisma.route.findUnique({
      where: { id: parseInt(id) },
      include: {
        stores: {
          include: {
            deliveryZone: true,
          },
        },
        deliveries: {
          include: {
            store: true,
          },
          orderBy: {
            deliveryDate: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            stores: true,
            deliveries: true,
          },
        },
      },
    });

    if (!route) {
      return NextResponse.json({ error: "مسیر یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(route);
  } catch (error) {
    console.error("Error fetching route:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات مسیر" },
      { status: 500 }
    );
  }
}

// PUT - بروزرسانی مسیر
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const route = await prisma.route.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        driverName: body.driverName,
        vehicleType: body.vehicleType,
        color: body.color,
        isActive: body.isActive,
        coordinates: body.coordinates,
        area: body.area,
      },
      include: {
        _count: {
          select: {
            stores: true,
          },
        },
      },
    });

    return NextResponse.json(route);
  } catch (error) {
    console.error("Error updating route:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی مسیر" },
      { status: 500 }
    );
  }
}

// DELETE - حذف مسیر
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const routeId = parseInt(id);

    // بررسی وجود مسیر
    const existingRoute = await prisma.route.findUnique({
      where: { id: routeId },
      include: {
        _count: {
          select: {
            stores: true,
            deliveries: true,
          },
        },
      },
    });

    if (!existingRoute) {
      return NextResponse.json({ error: "مسیر یافت نشد" }, { status: 404 });
    }

    // بررسی وابستگی‌ها
    if (existingRoute._count.stores > 0) {
      return NextResponse.json(
        {
          error: "امکان حذف مسیر دارای فروشگاه وجود ندارد",
          storeCount: existingRoute._count.stores,
        },
        { status: 400 }
      );
    }

    if (existingRoute._count.deliveries > 0) {
      return NextResponse.json(
        {
          error: "امکان حذف مسیر دارای سابقه تحویل وجود ندارد",
          deliveryCount: existingRoute._count.deliveries,
        },
        { status: 400 }
      );
    }

    // حذف مسیر
    await prisma.route.delete({
      where: { id: routeId },
    });

    return NextResponse.json({
      success: true,
      message: "مسیر با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting route:", error);
    
    // مدیریت خطاهای مختلف
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "مسیر مورد نظر یافت نشد" },
        { status: 404 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "این مسیر دارای وابستگی‌هایی است که امکان حذف آن وجود ندارد" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطا در حذف مسیر: " + error.message },
      { status: 500 }
    );
  }
}