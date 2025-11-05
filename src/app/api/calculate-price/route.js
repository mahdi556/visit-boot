// 📂 src/app/api/calculate-price/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/database";

export async function POST(request) {
  try {
    const { cartItems } = await request.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({
        subtotal: 0,
        discount: 0,
        finalAmount: 0,
        appliedPlan: null,
        appliedTier: null,
        itemPrices: [],
      });
    }

    // استخراج کدهای محصولات از سبد خرید
    const productCodes = cartItems.map((item) => item.product.code);

    // دریافت طرح‌های قیمت‌گذاری برای محصولات سبد خرید
    const pricingPlans = await prisma.pricingPlanProduct.findMany({
      where: {
        productCode: {
          in: productCodes,
        },
        pricingPlan: {
          isActive: true,
          startDate: { lte: new Date() },
          OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
        },
      },
      include: {
        pricingPlan: true,
        product: true,
      },
      orderBy: [{ productCode: "asc" }, { minQuantity: "desc" }],
    });

    // محاسبه قیمت برای هر محصول
    const itemPrices = cartItems.map((item) => {
      const consumerPrice = item.product.price;
      const storeBasePrice = Math.round(consumerPrice * (1 - 0.123)); // 12.3% تخفیف پایه

      // پیدا کردن طرح‌های قیمت‌گذاری برای این محصول
      const productPricingPlans = pricingPlans.filter(
        (plan) => plan.productCode === item.product.code
      );

      // پیدا کردن مناسب‌ترین طرح بر اساس تعداد
      const applicablePlan = productPricingPlans.find(
        (plan) => item.quantity >= plan.minQuantity
      );

      let finalUnitPrice = storeBasePrice;
      let appliedDiscountRate = 0;
      let appliedPlan = null;

      if (applicablePlan) {
        appliedDiscountRate = applicablePlan.discountRate; // استفاده از discountRate
        finalUnitPrice = Math.round(
          storeBasePrice * (1 - applicablePlan.discountRate)
        );
        appliedPlan = {
          id: applicablePlan.id,
          name: applicablePlan.pricingPlan.name,
          description:
            applicablePlan.description ||
            `تخفیف ${Math.round(
              applicablePlan.discountRate * 100
            )}% برای خرید ${applicablePlan.minQuantity}+ عدد`,
        };
      }
      const discountAmount = Math.round(
        (storeBasePrice - finalUnitPrice) * item.quantity
      );

      return {
        productCode: item.product.code,
        productName: item.product.name,
        quantity: item.quantity,
        consumerPrice: consumerPrice,
        storeBasePrice: storeBasePrice,
        appliedDiscountRate: appliedDiscountRate,
        unitPrice: finalUnitPrice,
        totalPrice: finalUnitPrice * item.quantity,
        discountAmount: discountAmount,
        appliedPlan: appliedPlan,
      };
    });

    // محاسبه جمع کل
    const subtotal = itemPrices.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalDiscount = itemPrices.reduce(
      (sum, item) => sum + item.discountAmount,
      0
    );

    // پیدا کردن محصول با بیشترین تخفیف
    const maxDiscountItem = itemPrices.reduce(
      (max, item) =>
        item.appliedDiscountRate > max.appliedDiscountRate ? item : max,
      { appliedDiscountRate: 0 }
    );

    const overallAppliedPlan = maxDiscountItem.appliedPlan
      ? {
          id: maxDiscountItem.appliedPlan.id,
          name: "طرح‌های تخفیف پلکانی",
          description: maxDiscountItem.appliedPlan.description,
        }
      : null;

    return NextResponse.json({
      subtotal: Math.round(subtotal),
      discount: Math.round(totalDiscount),
      finalAmount: Math.round(subtotal),
      appliedPlan: overallAppliedPlan,
      itemPrices: itemPrices,
    });
  } catch (error) {
    console.error("Error calculating pricing:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
