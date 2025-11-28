import { NextResponse } from "next/server";
import prisma from "@/lib/database";

import { verifyToken } from "@/lib/auth";

// تابع کمکی برای احراز هویت
async function authenticateRequest(request) {
  try {
    // روش ۱: بررسی هدرها (اولویت)
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");
    const salesRepId = request.headers.get("x-sales-rep-id");

    console.log("🔐 Auth headers:", { userId, userRole, salesRepId });

    if (userId && userRole) {
      return {
        user: {
          id: parseInt(userId),
          role: userRole,
          salesRepId:
            salesRepId && salesRepId !== "null" && salesRepId !== "undefined"
              ? parseInt(salesRepId)
              : null,
        },
        method: "headers",
      };
    }

    // روش ۲: بررسی توکن از cookies (رزرو)
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader?.match(/token=([^;]+)/)?.[1];

    if (!token) {
      console.log("🔐 No token found in cookies");
      // برای تست، یک کاربر پیش‌فرض برگردانید
      return {
        user: {
          id: 1,
          role: "SALES_REP",
          salesRepId: 1,
          firstName: "تست",
          lastName: "کاربر",
          username: "testuser",
        },
        method: "default",
      };
    }

    const user = await verifyToken(token);
    return {
      user,
      method: "cookies",
    };
  } catch (error) {
    console.error("🔐 Authentication error:", error);
    // برای تست، یک کاربر پیش‌فرض برگردانید
    return {
      user: {
        id: 1,
        role: "SALES_REP",
        salesRepId: 1,
        firstName: "تست",
        lastName: "کاربر",
        username: "testuser",
      },
      method: "fallback",
    };
  }
}

export async function GET(request) {
  try {
    console.log("🔍 Starting orders API GET...");

    // احراز هویت درخواست
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const user = authResult.user;
    const { searchParams } = new URL(request.url);

    // پارامترهای صفحه‌بندی و فیلتر
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 40;
    const status = searchParams.get("status");
    const salesRepFilter = searchParams.get("salesRepId");
    const search = searchParams.get("search");
    const paymentMethod = searchParams.get("paymentMethod");
    const deliveryDateFilter = searchParams.get("deliveryDateFilter"); // اضافه شده

    const skip = (page - 1) * limit;

    console.log("📊 Request params:", {
      page,
      limit,
      skip,
      status,
      salesRepFilter,
      search,
      paymentMethod,
      deliveryDateFilter, // اضافه شده
      user: { id: user.id, role: user.role, salesRepId: user.salesRepId },
    });

    let where = {};

    // فیلتر بر اساس نقش کاربر
    if (user.role === "SALES_REP") {
      if (user.salesRepId) {
        where.salesRepId = user.salesRepId;
        console.log("👤 Filtering for sales rep:", user.salesRepId);
      } else {
        console.log("⚠️ Sales rep has no salesRepId, returning empty");
        return NextResponse.json({
          orders: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalOrders: 0,
            hasNext: false,
            hasPrev: false,
          },
        });
      }
    }

    // فیلتر وضعیت
    if (status && status !== "all") {
      where.status = status;
    }

    // فیلتر ویزیتور (فقط برای ادمین/مدیر)
    if (
      salesRepFilter &&
      salesRepFilter !== "all" &&
      user.role !== "SALES_REP"
    ) {
      const repId = parseInt(salesRepFilter);
      if (repId === 0) {
        where.salesRepId = null;
      } else {
        where.salesRepId = repId;
      }
    }

    // فیلتر روش پرداخت
    if (paymentMethod && paymentMethod !== "all") {
      where.paymentMethod = paymentMethod;
    }

    // فیلتر جستجو
    if (search) {
      where.OR = [
        { store: { name: { contains: search } } },
        { store: { code: { contains: search } } },
        { id: { equals: parseInt(search) || 0 } },
      ].filter(Boolean);
    }

    // فیلتر تاریخ تحویل - جدید
    if (deliveryDateFilter && deliveryDateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (deliveryDateFilter) {
        case "today":
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          where.deliveryDate = {
            gte: today,
            lt: tomorrow,
          };
          break;

        case "this_week":
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 7);
          where.deliveryDate = {
            gte: startOfWeek,
            lt: endOfWeek,
          };
          break;

        case "overdue":
          where.deliveryDate = {
            lt: today,
          };
          where.status = {
            not: "DELIVERED",
          };
          break;

        case "delivered":
          where.status = "DELIVERED";
          where.deliveryDate = {
            not: null,
          };
          break;

        case "not_delivered":
          where.status = {
            not: "DELIVERED",
          };
          where.deliveryDate = {
            not: null,
          };
          break;
      }
    }

    console.log("📦 Final query conditions:", JSON.stringify(where, null, 2));

    // گرفتن تعداد کل سفارشات برای صفحه‌بندی
    const totalOrders = await prisma.order.count({ where });
    const totalPages = Math.ceil(totalOrders / limit);

    console.log("📊 Count result:", { totalOrders, totalPages });

    // اگر تعداد کل صفر است، خالی برگردان
    if (totalOrders === 0) {
      console.log("📭 No orders found with current filters");
      return NextResponse.json({
        orders: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalOrders: 0,
          hasNext: false,
          hasPrev: false,
          limit,
        },
      });
    }

    // گرفتن سفارشات با صفحه‌بندی
    const orders = await prisma.order.findMany({
      where,
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
        paymentMethod: true,
        creditDays: true,
        paymentStatus: true,
        store: {
          select: {
            id: true,
            code: true,
            name: true,
            address: true,
            phone: true,
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
                unit: true,
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
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    console.log("✅ Orders found:", orders.length, "out of", totalOrders);

    // پیدا کردن اطلاعات کاربران
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        let userData = null;
        if (order.userId) {
          try {
            userData = await prisma.user.findUnique({
              where: { id: order.userId },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
              },
            });
          } catch (userError) {
            console.warn(`⚠️ Could not fetch user ${order.userId}:`, userError);
          }
        }

        return {
          ...order,
          user: userData || {
            id: 0,
            firstName: "کاربر",
            lastName: "سیستم",
            username: "system",
          },
          orderNumber: `ORD-${order.id.toString().padStart(6, "0")}`,
        };
      })
    );

    const response = {
      orders: ordersWithUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit,
      },
    };

    console.log("📤 Sending response with", ordersWithUsers.length, "orders");

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error in orders API:", error);

    // پاسخ خطای دقیق‌تر
    return NextResponse.json(
      {
        error: "خطا در دریافت سفارشات",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log("📝 Creating new order...");

    // احراز هویت درخواست
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const user = authResult.user;
    const body = await request.json();

    console.log("📦 Order data:", {
      storeCode: body.storeCode,
      itemsCount: body.items?.length,
      totalAmount: body.totalAmount,
      paymentMethod: body.paymentMethod,
      creditDays: body.creditDays,
      user: user.id,
    });

    // بررسی داده‌های ورودی
    if (!body.storeCode || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "داده‌های سفارش ناقص است" },
        { status: 400 }
      );
    }

    // بررسی فروشگاه
    const store = await prisma.store.findUnique({
      where: { code: body.storeCode },
      select: {
        id: true,
        code: true,
        name: true,
        creditEnabled: true,
        creditLimit: true,
        creditDays: true,
        creditType: true,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 });
    }

    // اعتبارسنجی روش پرداخت
    const paymentMethod = body.paymentMethod || "CASH";

    // تعیین مدت اعتبار
    let creditDays = null;
    if (paymentMethod === "CREDIT") {
      // اولویت با مقدار ارسالی از کلاینت، سپس تنظیمات فروشگاه
      creditDays = body.creditDays || store.creditDays;

      // اعتبارسنجی مدت اعتبار
      if (!creditDays || creditDays < 1) {
        return NextResponse.json(
          { error: "مدت اعتبار برای سفارش اعتباری باید مشخص باشد" },
          { status: 400 }
        );
      }
    }

    if (paymentMethod === "CREDIT" && !store.creditEnabled) {
      return NextResponse.json(
        { error: "این فروشگاه مجوز خرید اعتباری ندارد" },
        { status: 400 }
      );
    }

    if (paymentMethod === "CHEQUE" && store.creditType !== "CHEQUE") {
      return NextResponse.json(
        { error: "این فروشگاه مجوز دریافت چک ندارد" },
        { status: 400 }
      );
    }

    // آماده کردن آیتم‌های سفارش
    const orderItems = body.items.map((item) => ({
      productCode: item.productCode,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.quantity * item.price,
    }));

    // محاسبه مبلغ کل
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    const finalAmount = body.finalAmount || totalAmount;

    // بررسی سقف اعتبار برای خرید اعتباری
    if (paymentMethod === "CREDIT" && store.creditLimit) {
      const storeCreditBalance = await calculateStoreCreditBalance(store.id);
      const availableCredit = store.creditLimit - storeCreditBalance;

      if (finalAmount > availableCredit) {
        return NextResponse.json(
          {
            error: `مبلغ سفارش بیش از سقف اعتبار مجاز است. سقف اعتبار: ${store.creditLimit.toLocaleString(
              "fa-IR"
            )} تومان، اعتبار available: ${availableCredit.toLocaleString(
              "fa-IR"
            )} تومان`,
          },
          { status: 400 }
        );
      }
    }

    // اعتبارسنجی اطلاعات چک
    if (paymentMethod === "CHEQUE" && body.chequeDetails) {
      if (
        !body.chequeDetails.chequeNumber ||
        !body.chequeDetails.dueDate ||
        !body.chequeDetails.bankName
      ) {
        return NextResponse.json(
          { error: "مشخصات چک ناقص است" },
          { status: 400 }
        );
      }

      // بررسی تاریخ سررسید چک
      const dueDate = new Date(body.chequeDetails.dueDate);
      const today = new Date();
      if (dueDate <= today) {
        return NextResponse.json(
          { error: "تاریخ سررسید چک باید در آینده باشد" },
          { status: 400 }
        );
      }
    }

    // ایجاد تراکنش داده‌ها
    const orderData = {
      storeCode: body.storeCode,
      userId: user.id,
      salesRepId: user.role === "SALES_REP" ? user.salesRepId : body.salesRepId,
      totalAmount: totalAmount,
      finalAmount: finalAmount,
      totalDiscount: body.discountAmount || 0,
      status: body.status || "PENDING", // استفاده از وضعیت تحویل
      notes: body.notes || "",
      paymentMethod: paymentMethod,
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
      creditDays: creditDays,
      // اضافه کردن جزئیات پرداخت نقدی
      ...(body.cashPaymentDetails && {
        cashPaymentDetails: body.cashPaymentDetails,
      }),
      items: {
        create: orderItems,
      },
    };
    // اگر روش پرداخت چک یا اعتباری است، تراکنش اعتباری ایجاد کن
    if (paymentMethod === "CHEQUE" || paymentMethod === "CREDIT") {
      const transactionType = paymentMethod === "CHEQUE" ? "CHEQUE" : "INVOICE";

      let transactionDescription = "";
      if (paymentMethod === "CHEQUE") {
        transactionDescription = `چک شماره ${
          body.chequeDetails?.chequeNumber || "نامشخص"
        } - بانک ${body.chequeDetails?.bankName || "نامشخص"}`;
      } else {
        transactionDescription = `فاکتور اعتباری ${
          creditDays ? `(${creditDays} روزه)` : ""
        }`;
      }

      const transactionData = {
        storeId: store.id,
        amount: finalAmount,
        type: transactionType,
        description: transactionDescription,
        status: "PENDING",
      };

      // اضافه کردن اطلاعات چک اگر پرداخت با چک است
      if (paymentMethod === "CHEQUE" && body.chequeDetails) {
        transactionData.chequeNumber = body.chequeDetails.chequeNumber;
        transactionData.dueDate = new Date(body.chequeDetails.dueDate);
      }

      // اضافه کردن تاریخ سررسید برای فاکتورهای اعتباری
      if (paymentMethod === "CREDIT" && creditDays) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + creditDays);
        transactionData.dueDate = dueDate;
      }

      orderData.creditTransactions = {
        create: transactionData,
      };
    }

    console.log("📦 Creating order with data:", {
      storeCode: body.storeCode,
      paymentMethod: paymentMethod,
      creditDays: creditDays,
      itemsCount: orderItems.length,
      totalAmount: totalAmount,
    });

    // ایجاد سفارش جدید
    const order = await prisma.order.create({
      data: orderData,
      include: {
        store: {
          select: {
            id: true,
            code: true,
            name: true,
            address: true,
            phone: true,
            creditEnabled: true,
            creditLimit: true,
            creditDays: true,
            creditType: true,
          },
        },
        salesRep: {
          select: {
            id: true,
            code: true,
            name: true,
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
                price: true,
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
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    console.log("✅ Order created successfully:", order.id);

    // اضافه کردن اطلاعات کاربر به پاسخ
    const orderWithUser = {
      ...order,
      user: {
        id: user.id,
        firstName: user.firstName || "کاربر",
        lastName: user.lastName || "سیستم",
        username: user.username || "user",
      },
      orderNumber: `ORD-${order.id.toString().padStart(6, "0")}`,
    };

    // لاگ فعالیت
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "CREATE_ORDER",
          entityType: "ORDER",
          entityId: order.id,
          description: `سفارش جدید با شماره ${
            orderWithUser.orderNumber
          } ایجاد شد - روش پرداخت: ${paymentMethod}${
            creditDays ? ` - مدت اعتبار: ${creditDays} روز` : ""
          }`,
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("remote-addr"),
          userAgent: request.headers.get("user-agent"),
        },
      });
    } catch (logError) {
      console.warn("⚠️ Could not create activity log:", logError);
    }

    return NextResponse.json(orderWithUser, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating order:", error);

    // لاگ خطا
    try {
      await prisma.activityLog.create({
        data: {
          userId: 1, // کاربر سیستم
          action: "ORDER_CREATION_ERROR",
          entityType: "ORDER",
          description: `خطا در ایجاد سفارش: ${error.message}`,
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("remote-addr"),
          userAgent: request.headers.get("user-agent"),
        },
      });
    } catch (logError) {
      console.warn("⚠️ Could not create error log:", logError);
    }

    return NextResponse.json(
      {
        error: "خطا در ایجاد سفارش",
        details: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
      { status: 500 }
    );
  }
}

// تابع کمکی برای محاسبه مانده اعتبار فروشگاه
async function calculateStoreCreditBalance(storeId) {
  try {
    const result = await prisma.creditTransaction.aggregate({
      where: {
        storeId: storeId,
        status: {
          in: ["PENDING", "OVERDUE"],
        },
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  } catch (error) {
    console.error("Error calculating store credit balance:", error);
    return 0;
  }
}
// برای CORS - این باید قبل از سایر متدها باشد
export async function OPTIONS(request) {
  console.log("🔧 Handling OPTIONS request for CORS");
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, x-user-id, x-user-role, x-sales-rep-id",
    },
  });
}
