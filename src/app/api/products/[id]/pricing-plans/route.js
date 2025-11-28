// 📂 src/app/api/products/[id]/pricing-plans/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/database';

export async function GET(request, { params }) {
  try {
    const { id } = await params; // ✅ اضافه کردن await
    const productId = parseInt(id);
    
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 });
    }
    
    const pricingPlans = await prisma.pricingPlanProduct.findMany({
      where: {
        productCode: product.code
      },
      include: {
        pricingPlan: true,
        product: true
      },
      orderBy: {
        minQuantity: 'asc'
      }
    });
    
    return NextResponse.json(pricingPlans);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params; // ✅ اضافه کردن await
    const productId = parseInt(id);
    const body = await request.json();
    
    // تبدیل مقادیر
    const pricingPlanId = parseInt(body.pricingPlanId);
    const minQuantity = parseInt(body.minQuantity);
    const discountRate = parseFloat(body.discountRate);
    
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 });
    }

    // بررسی وجود طرح تکراری
    const existingPlan = await prisma.pricingPlanProduct.findFirst({
      where: {
        productCode: product.code,
        minQuantity: minQuantity,
        pricingPlanId: pricingPlanId
      }
    });

    if (existingPlan) {
      return NextResponse.json({ 
        error: `برای این محصول، طرح با حداقل تعداد ${minQuantity} از قبل وجود دارد` 
      }, { status: 400 });
    }
    
    const pricingPlanProduct = await prisma.pricingPlanProduct.create({
      data: {
        pricingPlanId: pricingPlanId,
        productCode: product.code,
        minQuantity: minQuantity,
        discountRate: discountRate,
        description: body.description || null
      },
      include: {
        pricingPlan: true,
        product: true
      }
    });
    
    return NextResponse.json(pricingPlanProduct);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}