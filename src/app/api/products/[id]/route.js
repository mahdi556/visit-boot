// src/app/api/products/[id]/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET(request, { params }) {
  try {
    const { id } = await params; // اضافه کردن await
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        Inventory: true // شامل اطلاعات موجودی
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'محصول یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت محصول' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params; // اضافه کردن await
    const body = await request.json()
    
    // بروزرسانی محصول
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        weight: body.weight ? parseFloat(body.weight) : null,
        unit: body.unit,
        code: body.code,
        category: body.category,
        image: body.image || null
      }
    })

    // بروزرسانی یا ایجاد موجودی
    if (body.currentStock !== undefined) {
      await prisma.inventory.upsert({
        where: {
          productCode: product.code
        },
        update: {
          quantity: parseInt(body.currentStock)
        },
        create: {
          productCode: product.code,
          quantity: parseInt(body.currentStock),
          minStock: 10
        }
      })
    }

    // دریافت محصول با اطلاعات کامل
    const updatedProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        Inventory: true
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'خطا در بروزرسانی محصول' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // اضافه کردن await
    
    // بررسی وجود سفارشات مرتبط
    const relatedOrders = await prisma.orderItem.findMany({
      where: { productId: parseInt(id) }
    })

    if (relatedOrders.length > 0) {
      return NextResponse.json(
        { error: 'امکان حذف محصول به دلیل وجود سفارشات مرتبط وجود ندارد' },
        { status: 400 }
      )
    }

    // حذف موجودی مرتبط
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    })

    if (product) {
      await prisma.inventory.deleteMany({
        where: { productCode: product.code }
      })
    }

    await prisma.product.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ 
      success: true,
      message: 'محصول با موفقیت حذف شد' 
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'خطا در حذف محصول' },
      { status: 500 }
    )
  }
}