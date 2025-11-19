const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createUsersForSalesReps() {
  try {
    console.log('👥 Creating users for sales reps...')
    
    // پیدا کردن همه ویزیتورهایی که کاربر ندارند
    const salesRepsWithoutUsers = await prisma.salesRep.findMany({
      where: {
        users: {
          none: {}
        },
        isActive: true
      }
    })

    console.log(`📋 Found ${salesRepsWithoutUsers.length} sales reps without users`)

    for (const salesRep of salesRepsWithoutUsers) {
      const username = `rep${salesRep.code.toLowerCase()}`
      const defaultPassword = await bcrypt.hash('123456', 12)
      
      try {
        const user = await prisma.user.create({
          data: {
            username: username,
            email: salesRep.email || `${username}@company.com`,
            password: defaultPassword,
            firstName: salesRep.name.split(' ')[0] || salesRep.name,
            lastName: salesRep.name.split(' ').slice(1).join(' ') || '',
            phone: salesRep.phone,
            role: 'SALES_REP',
            salesRepId: salesRep.id,
            isActive: true
          }
        })
        
        console.log(`✅ Created user for ${salesRep.name}: ${username} / 123456`)
      } catch (userError) {
        if (userError.code === 'P2002') {
          // اگر کاربر از قبل وجود دارد
          console.log(`⚠️ User already exists for ${salesRep.name}`)
        } else {
          console.error(`❌ Error creating user for ${salesRep.name}:`, userError)
        }
      }
    }

    console.log('🎉 Finished creating users for sales reps!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUsersForSalesReps()