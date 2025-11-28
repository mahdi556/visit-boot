// src/app/api/products/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    let where = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = category
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        Inventory: true // شامل اطلاعات موجودی
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // ساختاردهی داده‌ها برای نمایش
    const formattedProducts = products.map(product => ({
      ...product,
      currentStock: product.Inventory?.quantity || 0 // اضافه کردن موجودی به محصول
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت محصولات' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    // ایجاد محصول
    const product = await prisma.product.create({
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

    // ایجاد موجودی برای محصول جدید
    if (body.currentStock !== undefined) {
      await prisma.inventory.create({
        data: {
          productCode: product.code,
          quantity: parseInt(body.currentStock),
          minStock: 10
        }
      })
    }

    // دریافت محصول با اطلاعات کامل
    const newProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        Inventory: true
      }
    })

    return NextResponse.json({
      ...newProduct,
      currentStock: newProduct.Inventory?.quantity || 0
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد محصول' },
      { status: 500 }
    )
  }
}