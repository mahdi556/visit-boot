// 📂 src/app/api/products/[id]/history/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/database';

export async function GET(request, { params }) {
  try {
    const { id } = await params; // ✅ اضافه کردن await
    const productId = parseInt(id);

    // دریافت اطلاعات محصول
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        orderItems: {
          include: {
            order: {
              include: {
                store: {
                  select: {
                    id: true,
                    name: true,
                    ownerName: true
                  }
                },
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          where: {
            order: {
              status: {
                in: ['DELIVERED', 'CONFIRMED'] // ✅ استفاده از statusهای معتبر
              }
            }
          },
          orderBy: {
            order: {
              orderDate: 'desc'
            }
          }
        },
        Inventory: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'محصول یافت نشد' },
        { status: 404 }
      );
    }

    // ساختاردهی داده‌های تاریخچه
    const salesHistory = product.orderItems.map(item => ({
      id: item.id,
      orderId: item.order.id,
      orderDate: item.order.orderDate,
      quantity: item.quantity,
      price: item.price,
      totalAmount: item.price * item.quantity,
      store: item.order.store,
      customer: item.order.user,
      orderStatus: item.order.status
    }));

    return NextResponse.json({
      product,
      salesHistory,
      totalSales: salesHistory.reduce((sum, item) => sum + item.quantity, 0),
      totalRevenue: salesHistory.reduce((sum, item) => sum + item.totalAmount, 0),
      currentStock: product.Inventory?.quantity || 0
    });

  } catch (error) {
    console.error('Error fetching product history:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تاریخچه محصول' },
      { status: 500 }
    );
  }
}