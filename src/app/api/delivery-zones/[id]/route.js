// src/app/api/delivery-zones/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/database";

export async function GET(request, { params }) {
  try {
    const zone = await prisma.deliveryZone.findUnique({
      where: { id: params.id },
    });

    if (!zone) {
      return NextResponse.json({ error: "منطقه یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(zone);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();

    const zone = await prisma.deliveryZone.update({
      where: { id: params.id },
      data: {
        name: body.name,
        coordinates: body.coordinates,
        deliveryCost: parseFloat(body.deliveryCost),
        deliveryTime: parseInt(body.deliveryTime),
        color: body.color,
        area: parseFloat(body.area),
      },
    });

    return NextResponse.json(zone);
  } catch (error) {
    console.error("Error updating delivery zone:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی منطقه" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // ابتدا بررسی کنیم منطقه دارای فروشگاه هست یا نه
    const zoneWithStores = await prisma.deliveryZone.findUnique({
      where: { id: params.id },
      include: {
        stores: {
          select: { id: true },
        },
      },
    });

    if (!zoneWithStores) {
      return NextResponse.json({ error: "منطقه یافت نشد" }, { status: 404 });
    }

    // اگر منطقه دارای فروشگاه باشد، اجازه حذف ندهیم
    if (zoneWithStores.stores.length > 0) {
      return NextResponse.json(
        {
          error: "امکان حذف منطقه دارای فروشگاه وجود ندارد",
          storeCount: zoneWithStores.stores.length,
        },
        { status: 400 }
      );
    }

    await prisma.deliveryZone.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "منطقه با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting delivery zone:", error);
    return NextResponse.json({ error: "خطا در حذف منطقه" }, { status: 500 });
  }
}
