// 📂 lib/api-auth.js
import { verifyToken } from './auth';

export async function authenticateAPI(request) {
  try {
    // روش ۱: بررسی هدرها (اولویت)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const salesRepId = request.headers.get('x-sales-rep-id');

    if (userId && userRole) {
      return {
        user: {
          id: parseInt(userId),
          role: userRole,
          salesRepId: salesRepId && salesRepId !== 'null' ? parseInt(salesRepId) : null
        },
        method: 'headers'
      };
    }

    // روش ۲: بررسی توکن از cookies (رزرو)
    const cookieHeader = request.headers.get('cookie');
    const token = cookieHeader?.match(/token=([^;]+)/)?.[1];
    
    if (!token) {
      return { error: "توکن یافت نشد", status: 401 };
    }

    const user = await verifyToken(token);
    return { 
      user,
      method: 'cookies'
    };
  } catch (error) {
    console.error('🔐 Authentication error:', error);
    return { error: "احراز هویت ناموفق", status: 401 };
  }
}