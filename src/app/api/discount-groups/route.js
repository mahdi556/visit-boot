// 📂 src/app/api/discount-groups/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/database';

export async function GET() {
  try {
    const groups = await prisma.discountGroup.findMany({
      where: { isActive: true },
      include: {
        groupProducts: {
          include: { product: true }
        },
        groupTiers: {
          orderBy: { minQuantity: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, productCodes, tiers } = body;
    
    const group = await prisma.discountGroup.create({
      data: {
        name,
        description,
        groupProducts: {
          create: productCodes.map(code => ({
            productCode: code
          }))
        },
        groupTiers: {
          create: tiers.map(tier => ({
            minQuantity: parseInt(tier.minQuantity),
            discountRate: parseFloat(tier.discountRate),
            description: tier.description
          }))
        }
      },
      include: {
        groupProducts: { include: { product: true } },
        groupTiers: true
      }
    });
    
    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}