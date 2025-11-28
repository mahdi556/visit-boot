// 📂 src/app/api/stores/[id]/credit/transactions/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

// GET - دریافت تراکنش‌های اعتباری
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    const transactions = await prisma.creditTransaction.findMany({
      where: { storeId: parseInt(id) },
      include: {
        order: {
          select: {
            id: true,
            totalAmount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.creditTransaction.count({
      where: { storeId: parseInt(id) }
    });

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching credit transactions:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تراکنش‌ها' },
      { status: 500 }
    );
  }
}

// POST - ایجاد تراکنش جدید
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const transaction = await prisma.creditTransaction.create({
      data: {
        storeId: parseInt(id),
        orderId: body.orderId,
        amount: parseFloat(body.amount),
        type: body.type,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        chequeNumber: body.chequeNumber,
        status: body.status || 'PENDING'
      },
      include: {
        order: {
          select: {
            id: true,
            totalAmount: true
          }
        }
      }
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating credit transaction:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد تراکنش' },
      { status: 500 }
    );
  }
}