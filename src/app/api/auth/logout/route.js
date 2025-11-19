import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'خروج موفقیت‌آمیز' })
  response.cookies.delete('token')
  return response
}