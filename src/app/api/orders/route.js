import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeCode = searchParams.get('storeCode'); // تغییر از storeId به storeCode
    
    // ساخت شرط where بر اساس storeCode
    let where = {};
    if (storeCode) {
      where.storeCode = storeCode; // حذف parseInt چون storeCode رشته است
    }

    const orders = await prisma.order.findMany({
      where, // اضافه کردن شرط فیلتر
      include: {
        store: {
          select: { 
            id: true,
            code: true, // اضافه شده
            name: true 
          }
        },
        user: {
          select: { firstName: true, lastName: true }
        },
        items: {
          include: {
            product: {
              select: { 
                id: true,
                code: true, // اضافه شده
                name: true 
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    // تبدیل items برای استفاده از productCode
    const orderItems = body.items.map(item => ({
      productCode: item.productCode, // تغییر از productId به productCode
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.quantity * item.price
    }));

    const order = await prisma.order.create({
      data: {
        storeCode: body.storeCode, // تغییر از storeId به storeCode
        userId: body.userId,
        totalAmount: body.totalAmount,
        status: body.status || 'PENDING',
        notes: body.notes,
        items: {
          create: orderItems
        }
      },
      include: {
        store: {
          select: {
            id: true,
            code: true,
            name: true,
            address: true,
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
                unit: true,
                price: true
              }
            }
          }
        }
      }
    })
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}