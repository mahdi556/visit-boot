import { NextResponse } from "next/server";
import prisma from "@/lib/database";

export async function GET(request, { params }) {
  try {
    console.log("🔍 API called with ID:", params.id);

    // تبدیل id از string به number
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "شناسه سفارش نامعتبر است" },
        { status: 400 }
      );
    }

    // استفاده از select به جای include برای مدیریت null ها
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        storeCode: true,
        userId: true,
        salesRepId: true,
        totalAmount: true,
        status: true,
        notes: true,
        orderDate: true,
        createdAt: true,
        updatedAt: true,
        totalDiscount: true,
        finalAmount: true,
        pricingPlanId: true,
        store: {
          select: {
            id: true,
            code: true,
            name: true,
            address: true,
            phone: true,
            ownerName: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            username: true
          }
        },
        salesRep: {
          select: {
            id: true,
            code: true,
            name: true,
            phone: true,
            email: true
          }
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
        pricingPlan: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
    });

    console.log("✅ Found order:", {
      id: order?.id,
      hasUser: !!order?.user,
      hasSalesRep: !!order?.salesRep
    });

    if (!order) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    // پردازش داده‌ها برای مدیریت مقادیر null
    const processedOrder = {
      ...order,
      user: order.user || { 
        firstName: 'کاربر', 
        lastName: 'حذف شده',
        email: 'ثبت نشده',
        username: 'ثبت نشده'
      }
    };

    return NextResponse.json(processedOrder);
  } catch (error) {
    console.error("❌ Error in order API:", error);
    
    // راه حل جایگزین
    try {
      console.log("🔄 Trying alternative query...");
      
      const orderId = parseInt(params.id);
      
      // کوئری ساده‌تر
      const simpleOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          storeCode: true,
          userId: true,
          salesRepId: true,
          totalAmount: true,
          status: true,
          notes: true,
          orderDate: true,
          createdAt: true,
          store: {
            select: {
              id: true,
              code: true,
              name: true,
              address: true,
              phone: true
            }
          },
          salesRep: {
            select: {
              id: true,
              code: true,
              name: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  price: true,
                  unit: true
                }
              }
            }
          }
        }
      });

      if (!simpleOrder) {
        return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
      }

      // پیدا کردن اطلاعات user جداگانه
      let user = null;
      if (simpleOrder.userId) {
        user = await prisma.user.findUnique({
          where: { id: simpleOrder.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            username: true
          }
        });
      }

      const processedOrder = {
        ...simpleOrder,
        user: user || { 
          firstName: 'کاربر', 
          lastName: 'سیستم',
          email: 'ثبت نشده',
          username: 'ثبت نشده'
        }
      };

      console.log("✅ Alternative query successful");
      return NextResponse.json(processedOrder);

    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError);
      
      return NextResponse.json(
        { error: "خطا در دریافت سفارش: " + fallbackError.message },
        { status: 500 }
      );
    }
  }
}

// 📂 بخش PUT
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "شناسه سفارش نامعتبر است" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (prisma) => {
      await prisma.orderItem.deleteMany({
        where: { orderId: orderId },
      });

      const orderItems = body.items.map((item) => ({
        productCode: item.productCode,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.quantity * item.price
      }));

      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          storeCode: body.storeCode,
          salesRepId: body.salesRepId,
          status: body.status,
          totalAmount: body.totalAmount,
          totalDiscount: body.discountAmount || 0,
          finalAmount: body.finalAmount || body.totalAmount,
          notes: body.notes,
          items: {
            create: orderItems,
          },
        },
        select: {
          id: true,
          storeCode: true,
          userId: true,
          salesRepId: true,
          totalAmount: true,
          status: true,
          notes: true,
          orderDate: true,
          createdAt: true,
          totalDiscount: true,
          finalAmount: true,
          store: {
            select: {
              id: true,
              code: true,
              name: true,
              address: true
            }
          },
          salesRep: {
            select: {
              id: true,
              code: true,
              name: true
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
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "شناسه سفارش نامعتبر است" },
        { status: 400 }
      );
    }

    // ابتدا آیتم‌های سفارش را حذف می‌کنیم
    await prisma.orderItem.deleteMany({
      where: { orderId: orderId },
    });

    // سپس خود سفارش را حذف می‌کنیم
    await prisma.order.delete({
      where: { id: orderId },
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