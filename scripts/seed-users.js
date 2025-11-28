const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('👑 Creating admin user...')
    
    const defaultPassword = await bcrypt.hash('123456', 12)
    
    // ایجاد کاربر ادمین
    const adminUser = await prisma.user.upsert({
      where: {
        username: 'admin'
      },
      update: {
        // اگر کاربر وجود دارد، پسورد را آپدیت کن
        password: defaultPassword,
        isActive: true
      },
      create: {
        username: 'admin',
        email: 'admin@company.com',
        password: defaultPassword,
        firstName: 'مدیر',
        lastName: 'سیستم',
        phone: '021-12345678',
        role: 'ADMIN',
        isActive: true
      }
    })
    
    console.log('✅ Admin user created/updated successfully!')
    console.log('📋 Login details:')
    console.log('   👤 Username: admin')
    console.log('   🔑 Password: 123456')
    console.log('   📧 Email: admin@company.com')
    console.log('   🎯 Role: ADMIN')
    
    // همچنین یک کاربر فروشنده نمونه هم ایجاد می‌کنیم
    console.log('\n👥 Creating sample sales rep user...')
    
    const salesRepUser = await prisma.user.upsert({
      where: {
        username: 'sales'
      },
      update: {
        password: defaultPassword,
        isActive: true
      },
      create: {
        username: 'sales',
        email: 'sales@company.com',
        password: defaultPassword,
        firstName: 'فروشنده',
        lastName: 'نمونه',
        phone: '021-87654321',
        role: 'SALES_REP',
        isActive: true
      }
    })
    
    console.log('✅ Sample sales rep user created/updated successfully!')
    console.log('📋 Login details:')
    console.log('   👤 Username: sales')
    console.log('   🔑 Password: 123456')
    console.log('   📧 Email: sales@company.com')
    console.log('   🎯 Role: SALES_REP')
    
    console.log('\n🎉 All users created successfully!')
    console.log('\n⚠️  Remember to change the default passwords after first login!')
    
  } catch (error) {
    console.error('❌ Error creating users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()