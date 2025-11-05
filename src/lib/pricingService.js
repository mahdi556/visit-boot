import prisma from './database';

export class PricingService {
  // محاسبه بهترین قیمت برای سبد خرید
  static async calculateBestPricing(cartItems, pricingPlanId = null) {
    let plans = [];
    
    if (pricingPlanId) {
      // استفاده از طرح مشخص
      const plan = await prisma.pricingPlan.findUnique({
        where: { id: pricingPlanId, isActive: true },
        include: {
          planProducts: true,
          tiers: {
            orderBy: { totalMinQuantity: 'asc' }
          }
        }
      });
      plans = plan ? [plan] : [];
    } else {
      // پیدا کردن تمام طرح‌های فعال
      plans = await prisma.pricingPlan.findMany({
        where: { 
          isActive: true,
          startDate: { lte: new Date() },
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } }
          ]
        },
        include: {
          planProducts: true,
          tiers: {
            orderBy: { totalMinQuantity: 'asc' }
          }
        }
      });
    }
    
    let bestPrice = {
      total: 0,
      discount: 0,
      finalAmount: 0,
      appliedPlan: null,
      itemPrices: []
    };
    
    // محاسبه قیمت پایه (بدون طرح)
    const basePrice = this.calculateBasePrice(cartItems);
    bestPrice = { ...basePrice };
    
    // بررسی هر طرح برای پیدا کردن بهترین قیمت
    for (const plan of plans) {
      const planPrice = await this.calculatePlanPrice(cartItems, plan);
      if (planPrice.finalAmount < bestPrice.finalAmount) {
        bestPrice = { ...planPrice, appliedPlan: plan };
      }
    }
    
    return bestPrice;
  }
  
  // محاسبه قیمت پایه
  static calculateBasePrice(cartItems) {
    let total = 0;
    const itemPrices = [];
    
    for (const item of cartItems) {
      const itemTotal = item.quantity * item.product.price;
      total += itemTotal;
      itemPrices.push({
        productCode: item.product.code,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: itemTotal,
        discount: 0
      });
    }
    
    return {
      total,
      discount: 0,
      finalAmount: total,
      itemPrices
    };
  }
  
  // محاسبه قیمت بر اساس طرح
  static async calculatePlanPrice(cartItems, plan) {
    let total = 0;
    const itemPrices = [];
    
    // محاسبه قیمت هر محصول بر اساس طرح
    for (const item of cartItems) {
      const planProduct = plan.planProducts
        .filter(pp => pp.productCode === item.product.code)
        .sort((a, b) => b.minQuantity - a.minQuantity)
        .find(pp => item.quantity >= pp.minQuantity);
      
      const unitPrice = planProduct ? planProduct.unitPrice : item.product.price;
      const itemTotal = item.quantity * unitPrice;
      const discount = item.quantity * (item.product.price - unitPrice);
      
      total += itemTotal;
      itemPrices.push({
        productCode: item.product.code,
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemTotal,
        discount
      });
    }
    
    // اعمال تخفیف بر اساس تعداد کل
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const applicableTier = plan.tiers
      .sort((a, b) => b.totalMinQuantity - a.totalMinQuantity)
      .find(tier => totalQuantity >= tier.totalMinQuantity);
    
    let discount = itemPrices.reduce((sum, item) => sum + item.discount, 0);
    let finalAmount = total;
    
    if (applicableTier) {
      if (applicableTier.discountAmount) {
        discount += applicableTier.discountAmount;
      } else if (applicableTier.discountRate) {
        const tierDiscount = total * (applicableTier.discountRate / 100);
        discount += tierDiscount;
      }
      finalAmount = total - discount;
    }
    
    return {
      total,
      discount,
      finalAmount,
      itemPrices,
      appliedTier: applicableTier
    };
  }
}