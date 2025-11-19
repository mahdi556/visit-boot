import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import prisma from '@/lib/database'

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        salesRepId: true,
        isActive: true,
        salesRep: {
          select: {
            id: true,
            code: true,
            name: true,
            phone: true,
            email: true,
            isActive: true
          }
        }
      }
    })

    if (!user || !user.isActive) {
      const response = NextResponse.json({ error: 'User not found' }, { status: 404 })
      response.cookies.delete('token')
      return response
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    response.cookies.delete('token')
    return response
  }
}