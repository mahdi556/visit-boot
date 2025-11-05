import { NextResponse } from "next/server";
import prisma from "@/lib/database";

export async function GET(request, { params }) {
  try {
    console.log("API called with ID:", params.id);

    // تبدیل id از string به number - این خط اضافه شود
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "شناسه سفارش نامعتبر است" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }, // حالا orderId یک number است
      include: {
        store: {
          select: {
            id: true,
            code: true,
            name: true,
            address: true,
            phone: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                price: true,
                weight: true,
                unit: true,
                category: true,
              },
            },
          },
        },
      },
    });

    console.log("Found order:", order);

    if (!order) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error in order API:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سفارش: " + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    
    // تبدیل id از string به number - این خط اضافه شود
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "شناسه سفارش نامعتبر است" },
        { status: 400 }
      );
    }

    // شروع تراکنش
    const result = await prisma.$transaction(async (prisma) => {
      // حذف آیتم‌های قدیمی
      await prisma.orderItem.deleteMany({
        where: { orderId: orderId }, // حالا orderId یک number است
      });

      // ایجاد آیتم‌های جدید با productCode
      const orderItems = body.items.map((item) => ({
        productCode: item.productCode,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.quantity * item.price
      }));

      // بروزرسانی سفارش
      const order = await prisma.order.update({
        where: { id: orderId }, // حالا orderId یک number است
        data: {
          storeCode: body.storeCode,
          status: body.status,
          totalAmount: body.totalAmount,
          notes: body.notes,
          items: {
            create: orderItems,
          },
        },
        include: {
          store: {
            select: {
              id: true,
              code: true,
              name: true,
              address: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  unit: true,
                  price: true
                }
              },
            },
          },
        },
      });

      return order;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی سفارش: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // تبدیل id از string به number - این خط اضافه شود
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "شناسه سفارش نامعتبر است" },
        { status: 400 }
      );
    }

    // ابتدا آیتم‌های سفارش را حذف می‌کنیم
    await prisma.orderItem.deleteMany({
      where: { orderId: orderId }, // حالا orderId یک number است
    });

    // سپس خود سفارش را حذف می‌کنیم
    await prisma.order.delete({
      where: { id: orderId }, // حالا orderId یک number است
    });

    return NextResponse.json({
      success: true,
      message: "سفارش با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: "خطا در حذف سفارش" }, { status: 500 });
  }
}