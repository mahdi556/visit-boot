import { NextResponse } from 'next/server'
import prisma from '@/lib/database'
import { hashPassword } from '@/lib/auth'

// GET - دریافت یک ویزیتور خاص
export async function GET(request, { params }) {
  try {
    const salesRepId = parseInt(params.id)

    const salesRep = await prisma.salesRep.findUnique({
      where: { id: salesRepId },
      include: {
        _count: {
          select: {
            orders: true,
          }
        }
      }
    })

    if (!salesRep) {
      return NextResponse.json(
        { error: 'ویزیتور یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json(salesRep)
  } catch (error) {
    console.error('Error fetching sales rep:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات ویزیتور' },
      { status: 500 }
    )
  }
}

// PUT - ویرایش ویزیتور
export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const salesRepId = parseInt(params.id)

    // داده‌های بروزرسانی
    const updateData = {
      name: body.name,
      phone: body.phone,
      email: body.email,
      isActive: body.isActive
    }

    // اگر کد تغییر کرده باشد
    if (body.code) {
      updateData.code = body.code
    }

    // بروزرسانی ویزیتور
    const salesRep = await prisma.salesRep.update({
      where: { id: salesRepId },
      data: updateData
    })

    let userCredentials = null

    // اگر رمز عبور ارائه شده، کاربر مربوطه را بروزرسانی کن
    if (body.password) {
      // پیدا کردن کاربر مربوط به این ویزیتور
      const user = await prisma.user.findFirst({
        where: { salesRepId: salesRepId }
      })

      if (user) {
        const hashedPassword = await hashPassword(body.password)
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        })

        userCredentials = {
          username: user.username,
          password: body.password
        }
      } else {
        // اگر کاربر وجود ندارد، ایجاد کن
        const username = `rep${salesRep.code.toLowerCase()}`
        const hashedPassword = await hashPassword(body.password)
        
        await prisma.user.create({
          data: {
            username: username,
            email: body.email || `${username}@company.com`,
            password: hashedPassword,
            firstName: body.name.split(' ')[0] || body.name,
            lastName: body.name.split(' ').slice(1).join(' ') || '',
            phone: body.phone,
            role: 'SALES_REP',
            salesRepId: salesRep.id,
            isActive: true
          }
        })

        userCredentials = {
          username: username,
          password: body.password
        }
      }
    }

    return NextResponse.json({
      salesRep: salesRep,
      userCredentials: userCredentials,
      message: userCredentials 
        ? 'ویزیتور و رمز عبور با موفقیت بروزرسانی شد' 
        : 'ویزیتور با موفقیت بروزرسانی شد'
    })
    
  } catch (error) {
    console.error('Error updating sales rep:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'کد ویزیتور یا ایمیل تکراری است' },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'ویزیتور یافت نشد' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'خطا در بروزرسانی ویزیتور' },
      { status: 500 }
    )
  }
}

// DELETE - حذف ویزیتور
export async function DELETE(request, { params }) {
  try {
    const salesRepId = parseInt(params.id)

    // بررسی اینکه ویزیتور سفارش دارد یا نه
    const salesRep = await prisma.salesRep.findUnique({
      where: { id: salesRepId },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!salesRep) {
      return NextResponse.json(
        { error: 'ویزیتور یافت نشد' },
        { status: 404 }
      )
    }

    if (salesRep._count.orders > 0) {
      return NextResponse.json(
        { error: 'امکان حذف ویزیتور دارای سفارش وجود ندارد' },
        { status: 400 }
      )
    }

    // حذف کاربران مرتبط
    await prisma.user.deleteMany({
      where: { salesRepId: salesRepId }
    })

    // حذف ویزیتور
    await prisma.salesRep.delete({
      where: { id: salesRepId }
    })

    return NextResponse.json({
      success: true,
      message: 'ویزیتور با موفقیت حذف شد'
    })
  } catch (error) {
    console.error('Error deleting sales rep:', error)
    return NextResponse.json(
      { error: 'خطا در حذف ویزیتور' },
      { status: 500 }
    )
  }
}