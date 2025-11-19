// 📂 src/app/api/sales-reps/stats/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET() {
  try {
    const salesRepsStats = await prisma.salesRep.findMany({
      include: {
        _count: {
          select: {
            orders: true
          }
        },
        orders: {
          select: {
            totalAmount: true,
            createdAt: true
          }
        }
      }
    })

    // محاسبه آمار پیشرفته
    const stats = salesRepsStats.map(rep => {
      const totalSales = rep.orders.reduce((sum, order) => sum + order.totalAmount, 0)
      const thisMonthSales = rep.orders
        .filter(order => {
          const orderDate = new Date(order.createdAt)
          const now = new Date()
          return orderDate.getMonth() === now.getMonth() && 
                 orderDate.getFullYear() === now.getFullYear()
        })
        .reduce((sum, order) => sum + order.totalAmount, 0)

      return {
        id: rep.id,
        code: rep.code,
        name: rep.name,
        totalOrders: rep._count.orders,
        totalSales,
        thisMonthSales,
        isActive: rep.isActive
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching sales reps stats:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت آمار ویزیتورها' },
      { status: 500 }
    )
  }
}