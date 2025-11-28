// 📂 src/app/api/stores/[id]/credit/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const storeId = parseInt(id);

    console.log(`💰 Fetching credit data for store ID: ${storeId}`);

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        creditTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        creditPayments: {
          orderBy: { paymentDate: 'desc' },
          take: 10
        }
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'فروشگاه یافت نشد' }, { status: 404 });
    }

    // محاسبه مانده اعتبار
    const totalTransactions = store.creditTransactions
      .filter(t => t.status !== 'CANCELLED')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPayments = store.creditPayments
      .reduce((sum, p) => sum + p.amount, 0);

    const creditBalance = totalTransactions - totalPayments;

    const creditData = {
      ...store,
      creditBalance
    };

    console.log(`✅ Credit data found for store ${store.name}:`, {
      balance: creditBalance,
      limit: store.creditLimit,
      transactions: store.creditTransactions.length
    });

    return NextResponse.json(creditData);
  } catch (error) {
    console.error('❌ Error fetching store credit:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات اعتبار' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log(`🔄 Updating credit settings for store ID: ${id}`, body);

    const store = await prisma.store.update({
      where: { id: parseInt(id) },
      data: {
        creditEnabled: body.creditEnabled,
        creditLimit: body.creditLimit ? parseFloat(body.creditLimit) : null,
        creditDays: body.creditDays ? parseInt(body.creditDays) : null,
        creditType: body.creditType
      },
      include: {
        creditTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    console.log(`✅ Credit settings updated for store: ${store.name}`);

    return NextResponse.json(store);
  } catch (error) {
    console.error('❌ Error updating store credit:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی اعتبار' },
      { status: 500 }
    );
  }
}