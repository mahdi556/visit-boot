// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('شروع اضافه کردن داده‌های اولیه...')

  // پاک کردن داده‌های موجود (اختیاری)
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.store.deleteMany()
  await prisma.user.deleteMany()

  // ایجاد کاربران
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@distribution.com',
      password: 'password123',
      firstName: 'مدیر',
      lastName: 'سیستم',
      role: 'ADMIN'
    }
  })

  const user1 = await prisma.user.create({
    data: {
      username: 'user1',
      email: 'user1@distribution.com',
      password: 'password123',
      firstName: 'کاربر',
      lastName: 'نمونه',
      role: 'USER'
    }
  })

  // ایجاد محصولات
  const products = await prisma.product.createMany({
    data: [
      {
        name: 'شیر پرچرب',
        price: 45000,
        category: 'لبنیات'
      },
      {
        name: 'ماست کم چرب', 
        price: 35000,
        category: 'لبنیات'
      },
      {
        name: 'پنیر پیتزا',
        price: 85000,
        category: 'لبنیات'
      },
      {
        name: 'کره گیاهی',
        price: 32000,
        category: 'لبنیات'
      },
      {
        name: 'خامه صبحانه',
        price: 28000,
        category: 'لبنیات'
      }
    ]
  })

  // ایجاد فروشگاه‌ها
  const stores = await prisma.store.createMany({
    data: [
      {
        name: 'سوپرمارکت نگین',
        ownerName: 'احمد محمدی',
        phone: '021-22334455',
        address: 'خیابان ولیعصر، نرسیده به میدان ولیعصر'
      },
      {
        name: 'بقالی امید',
        ownerName: 'رضا کریمی', 
        phone: '021-66778899',
        address: 'میدان انقلاب، خیابان کارگر شمالی'
      },
      {
        name: 'مینی‌مارکت بهروز',
        ownerName: 'مریم حسینی',
        phone: '021-88776655',
        address: 'میدان ونک، خیابان ملاصدرا'
      }
    ]
  })

  // ایجاد سفارشات نمونه
  const storesList = await prisma.store.findMany()
  const productsList = await prisma.product.findMany()

  const order = await prisma.order.create({
    data: {
      storeId: storesList[0].id,
      userId: user1.id,
      totalAmount: 150000,
      status: 'DELIVERED',
      items: {
        create: [
          {
            productId: productsList[0].id,
            quantity: 2,
            price: 45000
          },
          {
            productId: productsList[1].id,
            quantity: 3,
            price: 35000
          }
        ]
      }
    }
  })

  const order2 = await prisma.order.create({
    data: {
      storeId: storesList[1].id,
      userId: user1.id,
      totalAmount: 85000,
      status: 'PENDING',
      items: {
        create: [
          {
            productId: productsList[2].id,
            quantity: 1,
            price: 85000
          }
        ]
      }
    }
  })

  console.log('✅ داده‌های اولیه با موفقیت اضافه شدند')
  console.log(`📊 ${(await prisma.user.findMany()).length} کاربر ایجاد شد`)
  console.log(`📦 ${(await prisma.product.findMany()).length} محصول ایجاد شد`)
  console.log(`🏪 ${(await prisma.store.findMany()).length} فروشگاه ایجاد شد`)
  console.log(`📝 ${(await prisma.order.findMany()).length} سفارش ایجاد شد`)
}

main()
  .catch(e => {
    console.error('❌ خطا در اضافه کردن داده‌ها:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })