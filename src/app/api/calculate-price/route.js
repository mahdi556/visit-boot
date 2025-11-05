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
        groupDiscounts: [],
      });
    }

    const productCodes = cartItems.map((item) => item.product.code);

    // 1. دریافت طرح‌های قیمت‌گذاری جداگانه
    const individualPricingPlans = await prisma.pricingPlanProduct.findMany({
      where: {
        productCode: { in: productCodes },
        pricingPlan: { isActive: true },
      },
      include: { pricingPlan: true, product: true },
    });

    // 2. دریافت گروه‌های تخفیف فعال
    const discountGroups = await prisma.discountGroup.findMany({
      where: { isActive: true },
      include: {
        groupProducts: {
          include: { product: true },
        },
        groupTiers: {
          orderBy: { minQuantity: "desc" },
        },
      },
    });

    // محاسبه قیمت پایه
    const itemPrices = cartItems.map((item) => {
      const consumerPrice = item.product.price;
      const storeBasePrice = Math.round(consumerPrice * (1 - 0.123));

      const productPlans = individualPricingPlans.filter(
        (plan) => plan.productCode === item.product.code
      );

      const applicablePlan = productPlans.find(
        (plan) => item.quantity >= plan.minQuantity
      );

      let finalUnitPrice = storeBasePrice;
      let appliedDiscountRate = 0;

      if (applicablePlan) {
        appliedDiscountRate = applicablePlan.discountRate;
        finalUnitPrice = Math.round(
          storeBasePrice * (1 - applicablePlan.discountRate)
        );
      }

      return {
        productCode: item.product.code,
        productName: item.product.name,
        quantity: item.quantity,
        consumerPrice: consumerPrice,
        storeBasePrice: storeBasePrice,
        unitPrice: finalUnitPrice,
        totalPrice: finalUnitPrice * item.quantity,
        appliedDiscountRate: appliedDiscountRate,
        discountGroups: [], // برای ذخیره گروه‌هایی که این محصول در آن است
      };
    });

    // 3. محاسبه تخفیف‌های گروهی
    const groupDiscounts = [];
    let totalGroupDiscount = 0;

    discountGroups.forEach((group) => {
      const groupProductCodes = group.groupProducts.map((gp) => gp.productCode);
      const groupCartItems = cartItems.filter((item) =>
        groupProductCodes.includes(item.product.code)
      );

      if (groupCartItems.length > 0) {
        const totalGroupQuantity = groupCartItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        // پیدا کردن بهترین تخفیف قابل اعمال (بیشترین تعداد)
        const applicableTiers = group.groupTiers
          .filter((tier) => totalGroupQuantity >= tier.minQuantity)
          .sort((a, b) => b.minQuantity - a.minQuantity); // بیشترین تعداد اول

        const bestTier = applicableTiers[0]; // بهترین تخفیف

        if (bestTier) {
          const groupSubtotal = groupCartItems.reduce((sum, item) => {
            const itemPrice = itemPrices.find(
              (ip) => ip.productCode === item.product.code
            );
            return sum + (itemPrice ? itemPrice.totalPrice : 0);
          }, 0);

          const groupDiscountAmount = groupSubtotal * bestTier.discountRate;
          totalGroupDiscount += groupDiscountAmount;

          groupDiscounts.push({
            groupId: group.id,
            groupName: group.name,
            totalQuantity: totalGroupQuantity,
            appliedTier: bestTier,
            discountRate: bestTier.discountRate,
            discountAmount: groupDiscountAmount,
            description: `تخفیف ${Math.round(
              bestTier.discountRate * 100
            )}% برای خرید ${totalGroupQuantity} عدد از گروه ${
              group.name
            } (حداقل ${bestTier.minQuantity} عدد)`,
            products: groupCartItems.map((item) => ({
              productCode: item.product.code,
              productName: item.product.name,
              quantity: item.quantity,
            })),
          });

          // توزیع تخفیف گروهی بین محصولات به نسبت قیمت
          const totalGroupBasePrice = groupCartItems.reduce((sum, item) => {
            const itemPrice = itemPrices.find(
              (ip) => ip.productCode === item.product.code
            );
            return (
              sum + (itemPrice ? itemPrice.storeBasePrice * item.quantity : 0)
            );
          }, 0);

          groupCartItems.forEach((cartItem) => {
            const itemPrice = itemPrices.find(
              (ip) => ip.productCode === cartItem.product.code
            );
            if (itemPrice) {
              const itemShare =
                (itemPrice.storeBasePrice * cartItem.quantity) /
                totalGroupBasePrice;
              const itemDiscount = groupDiscountAmount * itemShare;

              itemPrice.totalPrice -= itemDiscount;
              itemPrice.unitPrice = itemPrice.totalPrice / cartItem.quantity;
              itemPrice.discountGroups.push({
                groupId: group.id,
                groupName: group.name,
                discountAmount: itemDiscount,
                discountRate: bestTier.discountRate,
              });
            }
          });
        }
      }
    });

    // محاسبه نهایی
    const subtotal = itemPrices.reduce(
      (sum, item) => sum + item.storeBasePrice * item.quantity,
      0
    );
    const finalAmount = itemPrices.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    const totalDiscount = subtotal - finalAmount;

    return NextResponse.json({
      subtotal: Math.round(subtotal),
      discount: Math.round(totalDiscount),
      finalAmount: Math.round(finalAmount),
      appliedPlan: null, // در این نسخه تمرکز روی گروه‌هاست
      itemPrices: itemPrices,
      groupDiscounts: groupDiscounts,
      totalGroupDiscount: Math.round(totalGroupDiscount),
    });
  } catch (error) {
    console.error("Error calculating pricing:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
