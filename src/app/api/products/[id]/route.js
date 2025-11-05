// src/app/api/products/[id]/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET(request, { params }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) }
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
    const body = await request.json()
    
    const product = await prisma.product.update({
      where: { id: parseInt(params.id) },
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        weight: body.weight ? parseFloat(body.weight) : null,
        unit: body.unit,
        code: body.code,
        category: body.category,
        currentStock: body.currentStock ? parseInt(body.currentStock) : 0
      }
    })

    return NextResponse.json(product)
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
    // بررسی وجود سفارشات مرتبط
    const relatedOrders = await prisma.orderItem.findMany({
      where: { productId: parseInt(params.id) }
    })

    if (relatedOrders.length > 0) {
      return NextResponse.json(
        { error: 'امکان حذف محصول به دلیل وجود سفارشات مرتبط وجود ندارد' },
        { status: 400 }
      )
    }

    await prisma.product.delete({
      where: { id: parseInt(params.id) }
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