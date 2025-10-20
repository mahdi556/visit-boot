// app/api/dashboard/stats/route.js
import prisma from '@/lib/database'

export async function GET() {
  try {
    // محاسبه آمار از دیتابیس
    const [
      totalSales,
      totalOrders,
      totalStores,
      totalProducts,
      lastMonthSales,
      lastMonthOrders
    ] = await Promise.all([
      // مجموع فروش
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          status: 'DELIVERED'
        }
      }),

      // تعداد سفارشات
      prisma.order.count({
        where: {
          status: 'DELIVERED'
        }
      }),

      // تعداد فروشگاه‌ها
      prisma.store.count(),

      // تعداد محصولات
      prisma.product.count(),

      // فروش ماه قبل
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          status: 'DELIVERED',
          createdAt: {
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
          }
        }
      }),

      // سفارشات ماه قبل
      prisma.order.count({
        where: {
          status: 'DELIVERED',
          createdAt: {
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
          }
        }
      })
    ])

    // محاسبه رشد
    const currentSales = totalSales._sum.totalAmount || 0
    const previousSales = lastMonthSales._sum.totalAmount || 0
    const salesGrowth = previousSales > 0 ? 
      Math.round(((currentSales - previousSales) / previousSales) * 100) : 100

    const currentOrders = totalOrders
    const previousOrders = lastMonthOrders
    const ordersGrowth = previousOrders > 0 ? 
      Math.round(((currentOrders - previousOrders) / previousOrders) * 100) : 100

    const stats = {
      totalSales: currentSales,
      totalOrders: currentOrders,
      totalStores: totalStores,
      totalProducts: totalProducts,
      salesGrowth: salesGrowth,
      ordersGrowth: ordersGrowth,
      storesGrowth: 15, // نمونه
      productsGrowth: 8  // نمونه
    }

    return Response.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return Response.json(
      { error: 'خطا در دریافت آمار' },
      { status: 500 }
    )
  }
}