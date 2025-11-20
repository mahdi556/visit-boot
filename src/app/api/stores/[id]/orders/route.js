// 📂 src/app/api/stores/[id]/orders/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET(request, { params }) {
  try {
    // استفاده از await برای params
    const { id } = await params;
    const storeId = parseInt(id);

    if (isNaN(storeId)) {
      return NextResponse.json(
        { error: 'شناسه فروشگاه نامعتبر است' },
        { status: 400 }
      )
    }

    console.log(`📦 Fetching orders for store ID: ${storeId}`);

    // ابتدا فروشگاه را پیدا کنید
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { code: true, name: true }
    });

    if (!store) {
      return NextResponse.json(
        { error: 'فروشگاه یافت نشد' },
        { status: 404 }
      )
    }

    console.log(`🏪 Store found: ${store.name} (${store.code})`);

    // روش ایمن: فقط اطلاعات پایه را بگیرید بدون روابط مشکل‌ساز
    const orders = await prisma.order.findMany({
      where: { 
        storeCode: store.code // استفاده از storeCode به جای رابطه
      },
      select: {
        id: true,
        totalAmount: true,
        totalDiscount: true,
        finalAmount: true,
        status: true,
        orderDate: true,
        createdAt: true,
        notes: true,
        userId: true,
        salesRepId: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            totalPrice: true,
            product: {
              select: {
                name: true,
                code: true,
                unit: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Found ${orders.length} orders for store ${store.code}`);

    // اگر سفارشی وجود دارد، اطلاعات کاربران را جداگانه بگیرید
    let userMap = new Map();
    let salesRepMap = new Map();

    if (orders.length > 0) {
      // گرفتن اطلاعات کاربران
      const userIds = orders.map(order => order.userId).filter(id => id);
      if (userIds.length > 0) {
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, firstName: true, lastName: true, username: true }
        });
        userMap = new Map(users.map(user => [user.id, user]));
      }

      // گرفتن اطلاعات فروشندگان
      const salesRepIds = orders.map(order => order.salesRepId).filter(id => id);
      if (salesRepIds.length > 0) {
        const salesReps = await prisma.salesRep.findMany({
          where: { id: { in: salesRepIds } },
          select: { id: true, name: true, code: true }
        });
        salesRepMap = new Map(salesReps.map(rep => [rep.id, rep]));
      }
    }

    // ساخت ساختار نهایی
    const formattedOrders = orders.map(order => {
      const user = userMap.get(order.userId);
      const salesRep = order.salesRepId ? salesRepMap.get(order.salesRepId) : null;
      const totalItems = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const finalAmount = order.finalAmount || (order.totalAmount - (order.totalDiscount || 0));

      return {
        id: order.id,
        totalAmount: order.totalAmount,
        totalDiscount: order.totalDiscount || 0,
        finalAmount: finalAmount,
        status: order.status,
        orderDate: order.orderDate,
        createdAt: order.createdAt,
        notes: order.notes,
        user: user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username
        } : {
          firstName: 'کاربر',
          lastName: `#${order.userId}`,
          username: 'unknown'
        },
        salesRep: salesRep,
        items: order.items,
        totalItems: totalItems,
        store: {
          name: store.name,
          code: store.code
        }
      };
    });

    return NextResponse.json(formattedOrders);

  } catch (error) {
    console.error('❌ Error fetching store orders:', error);
    
    return NextResponse.json(
      { 
        error: 'خطا در دریافت سفارشات فروشگاه',
        details: error.message 
      },
      { status: 500 }
    );
  }
}