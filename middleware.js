// 📂 middleware.js
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  console.log("🔐 Middleware started for:", pathname);
  console.log("📋 Token exists:", !!token);

  // صفحاتی که نیاز به احراز هویت ندارند
  const publicPaths = ["/auth/login", "/api/auth/login"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublicPath) {
    if (token) {
      try {
        await verifyToken(token);
        // اگر کاربر لاگین کرده باشد، به داشبورد هدایت شود
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch (error) {
        console.log("⚠️ Invalid token on public path, allowing access");
        // توکن نامعتبر است، اجازه دسترسی به صفحه لاگین
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // صفحاتی که نیاز به احراز هویت دارند
  if (!token) {
    console.log("❌ No token, redirecting to login");
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    console.log("🔍 Verifying token...");
    const user = await verifyToken(token);
    console.log("✅ User verified:", {
      id: user.id,
      role: user.role,
      salesRepId: user.salesRepId,
    });

    // بررسی دسترسی بر اساس نقش کاربر
    if (pathname.startsWith("/dashboard/admin") && user.role !== "ADMIN") {
      console.log("🚫 Access denied to admin area");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // برای مسیرهای API، هدرها را اضافه کنید
    if (pathname.startsWith("/api/")) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", user.id.toString());
      requestHeaders.set("x-user-role", user.role);
      requestHeaders.set("x-sales-rep-id", user.salesRepId?.toString() || "0"); // تغییر به '0' به جای خالی

      console.log("📤 Setting headers for API:", {
        userId: user.id,
        userRole: user.role,
        salesRepId: user.salesRepId || "not set",
      });

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      return response;
    }
    // برای صفحات عادی
    return NextResponse.next();
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/auth/:path*"],
};
