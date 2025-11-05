// src/app/api/dashboard/orders/recent/route.js
import prisma from '@/lib/database'

export async function GET() {
  try {
    console.log('📦 Fetching recent orders...')
    
    const recentOrders = await prisma.order.findMany({
      take: 6,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true, // اینجا BigInt است اما Response.json خودش مدیریت می‌کند
        totalAmount: true,
        status: true,
        orderDate: true,
        createdAt: true,
        store: {
          select: {
            code: true, // فقط code که string است
            name: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    console.log('✅ Orders found:', recentOrders.length)
    
    // تبدیل مستقیم - Node.js جدیدتر از BigInt پشتیبانی می‌کند
    return Response.json(recentOrders)
  } catch (error) {
    console.error('❌ Database error:', error)
    return Response.json(
      { error: 'خطا در دریافت سفارشات' },
      { status: 500 }
    )
  }
}