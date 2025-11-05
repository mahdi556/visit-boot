// 📂 src/app/api/pricing-plans/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/database';

export async function GET() {
  try {
    console.log('Fetching pricing plans...');
    
    const plans = await prisma.pricingPlan.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('Found plans:', plans);
    
    // فیلتر کردن طرح‌های معتبر
    const validPlans = plans.filter(plan => 
      plan && 
      typeof plan === 'object' && 
      plan.id && 
      plan.name
    );
    
    return NextResponse.json(validPlans);
    
  } catch (error) {
    console.error('Error in pricing-plans API:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, startDate, endDate } = body;
    
    // اعتبارسنجی داده‌های ورودی
    if (!name || !startDate) {
      return NextResponse.json(
        { error: 'نام و تاریخ شروع الزامی هستند' }, 
        { status: 400 }
      );
    }
    
    const plan = await prisma.pricingPlan.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: true
      }
    });
    
    console.log('Created plan:', plan);
    
    return NextResponse.json(plan);
    
  } catch (error) {
    console.error('Error creating pricing plan:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در ایجاد طرح' }, 
      { status: 500 }
    );
  }
}