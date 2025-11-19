import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from './database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      salesRepId: user.salesRepId 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

export async function authenticateUser(username, password) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        salesRep: {
          select: {
            id: true,
            code: true,
            name: true,
            isActive: true
          }
        }
      }
    })

    if (!user || !user.isActive) {
      throw new Error('کاربر یافت نشد')
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      throw new Error('رمز عبور نامعتبر است')
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    throw new Error('خطا در احراز هویت: ' + error.message)
  }
}