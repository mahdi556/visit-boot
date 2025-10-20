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
        image: body.image,
        barcode: body.barcode,
        category: body.category,
        isActive: body.isActive
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
    await prisma.product.update({
      where: { id: parseInt(params.id) },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'محصول حذف شد' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'خطا در حذف محصول' },
      { status: 500 }
    )
  }
}