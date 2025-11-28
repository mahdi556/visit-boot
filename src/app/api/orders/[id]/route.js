// 📂 src/app/api/orders/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/database";

export async function GET(request, { params }) {
  try {
    // await کردن params
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "شناسه سفارش نامعتبر است" }, { status: 400 });
    }

    // کوئری کامل با تمام فیلدهای مورد نیاز
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        orderDate: true,
        deliveryDate: true, // اضافه شده
        createdAt: true,
        storeCode: true,
        salesRepId: true,
        userId: true,
        notes: true,
        totalDiscount: true,
        finalAmount: true,
        paymentMethod: true, // اضافه شده
        creditDays: true, // اضافه شده
        paymentStatus: true, // اضافه شده
        store: {
          select: {
            id: true,
            code: true,
            name: true,
            address: true,
            phone: true,
            ownerName: true,
            storeType: true,
            creditEnabled: true,
            creditLimit: true,
            creditType: true,
          },
        },
        salesRep: {
          select: {
            id: true,
            code: true,
            name: true,
            phone: true,
            email: true,
            isActive: true,
          },
        },
        items: {
          select: {
            id: true,
            productCode: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                price: true,
                unit: true,
                category: true,
              },
            },
          },
        },
        creditTransactions: {
          select: {
            id: true,
            amount: true,
            type: true,
            status: true,
            chequeNumber: true,
            dueDate: true,
            description: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    // ساخت پاسخ کامل
    const response = {
      ...order,
      user: {
        id: order.userId || 0,
        firstName: "سیستم",
        lastName: "اتوماسیون",
        username: "system",
        role: "SYSTEM"
      },
      // محاسبه وضعیت پرداخت اگر وجود نداشت
      paymentStatus: order.paymentStatus || 'UNPAID'
    };

    console.log("✅ Order detail fetched:", {
      id: order.id,
      paymentMethod: order.paymentMethod,
      creditDays: order.creditDays,
      paymentStatus: order.paymentStatus
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error in order detail API:", error);
    return NextResponse.json({ error: "خطا در دریافت اطلاعات سفارش" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // await کردن params
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "شناسه سفارش نامعتبر است" }, { status: 400 });
    }

    const body = await request.json();
    console.log("📝 Updating order:", { orderId, body });

    // بررسی وجود سفارش
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { 
        id: true, 
        salesRepId: true,
        paymentMethod: true,
        creditDays: true,
        paymentStatus: true
      }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    // آماده سازی داده‌ها برای آپدیت
    const updateData = {
      status: body.status,
      notes: body.notes || '',
      totalAmount: parseFloat(body.totalAmount) || 0,
      finalAmount: parseFloat(body.finalAmount) || parseFloat(body.totalAmount) || 0,
      totalDiscount: parseFloat(body.totalDiscount) || 0,
      // اضافه کردن فیلدهای پرداخت
      paymentMethod: body.paymentMethod || existingOrder.paymentMethod || 'CASH',
      creditDays: body.creditDays !== undefined ? body.creditDays : existingOrder.creditDays,
      paymentStatus: body.paymentStatus || existingOrder.paymentStatus || 'UNPAID',
    };

    // اگر salesRepId ارسال شده، آن را اضافه کن
    if (body.salesRepId !== undefined) {
      updateData.salesRepId = body.salesRepId;
    }

    // اگر storeCode ارسال شده، آن را اضافه کن
    if (body.storeCode) {
      updateData.storeCode = body.storeCode;
    }

    // شروع تراکنش برای آپدیت ایمن
    const result = await prisma.$transaction(async (tx) => {
      // حذف آیتم‌های قدیمی
      await tx.orderItem.deleteMany({
        where: { orderId }
      });

      // ایجاد آیتم‌های جدید
      if (body.items && body.items.length > 0) {
        await tx.orderItem.createMany({
          data: body.items.map(item => ({
            orderId: orderId,
            productCode: item.productCode,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || 0,
            totalPrice: (parseInt(item.quantity) || 1) * (parseFloat(item.price) || 0),
          }))
        });
      }

      // آپدیت سفارش
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: updateData,
      });

      // دریافت اطلاعات کامل سفارش به صورت جداگانه
      const fullOrder = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          orderDate: true,
          createdAt: true,
          storeCode: true,
          salesRepId: true,
          userId: true,
          notes: true,
          totalDiscount: true,
          finalAmount: true,
          paymentMethod: true, // اضافه شده
          creditDays: true, // اضافه شده
          paymentStatus: true, // اضافه شده
          store: {
            select: {
              id: true,
              code: true,
              name: true,
              address: true,
              phone: true,
              ownerName: true,
              storeType: true,
              creditEnabled: true,
              creditLimit: true,
              creditType: true,
            },
          },
          salesRep: {
            select: {
              id: true,
              code: true,
              name: true,
              phone: true,
              email: true,
              isActive: true,
            },
          },
          items: {
            select: {
              id: true,
              productCode: true,
              quantity: true,
              price: true,
              product: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  price: true,
                  unit: true,
                  category: true,
                },
              },
            },
          },
          creditTransactions: {
            select: {
              id: true,
              amount: true,
              type: true,
              status: true,
              chequeNumber: true,
              dueDate: true,
              description: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          },
        },
      });

      return fullOrder;
    });

    // ساخت پاسخ نهایی
    const response = {
      ...result,
      user: {
        id: result.userId || 0,
        firstName: "سیستم",
        lastName: "اتوماسیون",
        username: "system",
        role: "SYSTEM"
      }
    };

    console.log("✅ Order updated successfully:", {
      id: orderId,
      paymentMethod: result.paymentMethod,
      creditDays: result.creditDays,
      paymentStatus: result.paymentStatus
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error updating order:", error);
    
    // مدیریت خطاهای خاص Prisma
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "فروشگاه یا ویزیتور نامعتبر است" }, { status: 400 });
    }

    return NextResponse.json({ error: "خطا در بروزرسانی سفارش" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // await کردن params
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "شناسه سفارش نامعتبر است" }, { status: 400 });
    }

    // استفاده از تراکنش برای حذف ایمن
    await prisma.$transaction(async (tx) => {
      // حذف آیتم‌های سفارش
      await tx.orderItem.deleteMany({
        where: { orderId }
      });

      // حذف تراکنش‌های اعتباری مرتبط
      await tx.creditTransaction.deleteMany({
        where: { orderId }
      });

      // حذف سفارش
      await tx.order.delete({
        where: { id: orderId }
      });
    });

    console.log("✅ Order deleted successfully:", orderId);
    return NextResponse.json({ message: "سفارش با موفقیت حذف شد" });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ error: "خطا در حذف سفارش" }, { status: 500 });
  }
}