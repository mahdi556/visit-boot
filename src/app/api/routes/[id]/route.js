import { NextResponse } from "next/server";
import prisma from "@/lib/database";

// GET - دریافت یک مسیر خاص
export async function GET(request, { params }) {
  try {
    const route = await prisma.route.findUnique({
      where: { id: params.id },
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - بروزرسانی مسیر (اضافه کردن coordinates و area)
export async function PUT(request, { params }) {
  try {
    const body = await request.json();

    const route = await prisma.route.update({
      where: { id: params.id },
      data: {
        name: body.name,
        driverName: body.driverName,
        vehicleType: body.vehicleType,
        color: body.color,
        isActive: body.isActive,
        coordinates: body.coordinates, // اضافه شده
        area: body.area, // اضافه شده
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
    // بررسی اینکه مسیر دارای فروشگاه هست یا نه
    const routeWithStores = await prisma.route.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            stores: true,
          },
        },
      },
    });

    if (!routeWithStores) {
      return NextResponse.json({ error: "مسیر یافت نشد" }, { status: 404 });
    }

    if (routeWithStores._count.stores > 0) {
      return NextResponse.json(
        {
          error: "امکان حذف مسیر دارای فروشگاه وجود ندارد",
          storeCount: routeWithStores._count.stores,
        },
        { status: 400 }
      );
    }

    await prisma.route.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "مسیر با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting route:", error);
    return NextResponse.json({ error: "خطا در حذف مسیر" }, { status: 500 });
  }
}
