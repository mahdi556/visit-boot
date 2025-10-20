// app/api/dashboard/orders/recent/route.js
import prisma from '@/lib/database'

export async function GET() {
  try {
    const recentOrders = await prisma.order.findMany({
      take: 6,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        store: {
          select: {
            name: true
          }
        }
      }
    })

    return Response.json(recentOrders)
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return Response.json(
      { error: 'خطا در دریافت سفارشات' },
      { status: 500 }
    )
  }
}