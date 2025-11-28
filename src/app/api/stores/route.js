import { NextResponse } from "next/server";
import prisma from "@/lib/database";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 25;
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    console.log("🔍 API Called with:", { page, limit, search });

    // ساختار where برای جستجو
    let whereCondition = {};

    if (search) {
      // استفاده از فیلتر ساده بدون mode (برای نسخه‌های قدیمی Prisma)
      whereCondition.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { ownerName: { contains: search } },
        { phone: { contains: search } },
        { address: { contains: search } },
      ];
    }

    // گرفتن تعداد کل فروشگاه‌ها
    const totalStores = await prisma.store.count({
      where: whereCondition,
    });

    const totalPages = Math.ceil(totalStores / limit);

    console.log("📊 Count result:", totalStores);

    // گرفتن فروشگاه‌ها با صفحه‌بندی
    const stores = await prisma.store.findMany({
      where: whereCondition,
      select: {
        id: true,
        code: true,
        name: true,
        ownerName: true,
        phone: true,
        address: true,
        storeType: true,
        latitude: true,
        longitude: true,
        // فیلدهای اعتباری
        creditEnabled: true,
        creditLimit: true,
        creditDays: true, // این خط باید وجود داشته باشد
        creditType: true,
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
          },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    console.log("✅ Stores found:", stores.length, "out of", totalStores);

    const response = {
      stores,
      pagination: {
        currentPage: page,
        totalPages,
        totalStores,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error in stores API:", error);

    return NextResponse.json(
      {
        error: "خطا در دریافت اطلاعات فروشگاه‌ها",
        details: error.message,
        type: error.constructor.name,
      },
      { status: 500 }
    );
  }
}

// POST بدون تغییر
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
        creditType: true,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 });
    }

    // اعتبارسنجی روش پرداخت
    const paymentMethod = body.paymentMethod || "CASH";

    // تبدیل به مقدار enum صحیح
    let paymentMethodEnum;
    switch (paymentMethod) {
      case "CASH":
        paymentMethodEnum = "CASH";
        break;
      case "CREDIT":
        paymentMethodEnum = "CREDIT";
        break;
      case "CHEQUE":
        paymentMethodEnum = "CHEQUE";
        break;
      default:
        paymentMethodEnum = "CASH";
    }

    if (paymentMethodEnum === "CREDIT" && !store.creditEnabled) {
      return NextResponse.json(
        { error: "این فروشگاه مجوز خرید اعتباری ندارد" },
        { status: 400 }
      );
    }

    if (paymentMethodEnum === "CHEQUE" && store.creditType !== "CHEQUE") {
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
    if (paymentMethodEnum === "CREDIT" && store.creditLimit) {
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

    // ایجاد تراکنش داده‌ها
    const orderData = {
      storeCode: body.storeCode,
      userId: user.id,
      salesRepId: user.role === "SALES_REP" ? user.salesRepId : body.salesRepId,
      totalAmount: totalAmount,
      finalAmount: finalAmount,
      totalDiscount: body.discountAmount || 0,
      status: body.status || "PENDING",
      notes: body.notes,
      paymentMethod: paymentMethodEnum, // استفاده از مقدار enum صحیح
      items: {
        create: orderItems,
      },
    };

    // اگر روش پرداخت چک یا اعتباری است، تراکنش اعتباری ایجاد کن
    if (paymentMethodEnum === "CHEQUE" || paymentMethodEnum === "CREDIT") {
      const transactionType =
        paymentMethodEnum === "CHEQUE" ? "CHEQUE" : "INVOICE";
      const transactionDescription =
        paymentMethodEnum === "CHEQUE"
          ? `چک شماره ${body.chequeDetails?.chequeNumber || "نامشخص"} - بانک ${
              body.chequeDetails?.bankName || "نامشخص"
            }`
          : "فاکتور اعتباری";

      orderData.creditTransactions = {
        create: {
          storeId: store.id,
          amount: finalAmount,
          type: transactionType,
          description: transactionDescription,
          status: "PENDING",
          ...(paymentMethodEnum === "CHEQUE" &&
            body.chequeDetails && {
              chequeNumber: body.chequeDetails.chequeNumber,
              dueDate: new Date(body.chequeDetails.dueDate),
            }),
        },
      };
    }

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

    return NextResponse.json(orderWithUser, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد سفارش: " + error.message },
      { status: 500 }
    );
  }
}

function generateStoreCode() {
  const prefix = "ST";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}
