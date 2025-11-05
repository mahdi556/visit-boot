// src/app/api/products/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        price: parseFloat(body.price),
        category: body.category,
        currentStock: body.currentStock ? parseInt(body.currentStock) : 0,
        weight: body.weight ? parseFloat(body.weight) : null,
        unit: body.unit,
        code: body.code,
        description: body.description
      }
    })
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد محصول' },
      { status: 500 }
    )
  }
}