import { hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/database";

// GET - دریافت لیست ویزیتورها
export async function GET() {
  try {
    const salesReps = await prisma.salesRep.findMany({
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(salesReps);
  } catch (error) {
    console.error("Error fetching sales reps:", error);
    return NextResponse.json(
      { error: "خطا در دریافت لیست ویزیتورها" },
      { status: 500 }
    );
  }
}

// POST - ایجاد ویزیتور جدید
export async function POST(request) {
  try {
    const body = await request.json();

    // ابتدا ویزیتور را ایجاد کن
    const salesRep = await prisma.salesRep.create({
      data: {
        code: body.code,
        name: body.name,
        phone: body.phone,
        email: body.email,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });

    // سپس کاربر را ایجاد کن - حالا salesRep ایجاد شده و code دارد
    const username = `rep${salesRep.code.toLowerCase()}`;
    const defaultPassword = await hashPassword("123456");

    try {
      const user = await prisma.user.create({
        data: {
          username: username,
          email: body.email || `${username}@company.com`,
          password: defaultPassword,
          firstName: body.name.split(" ")[0] || body.name,
          lastName: body.name.split(" ").slice(1).join(" ") || "",
          phone: body.phone,
          role: "SALES_REP",
          salesRepId: salesRep.id,
          isActive: true,
        },
      });

      return NextResponse.json(
        {
          ...salesRep,
          userCredentials: {
            username: username,
            defaultPassword: "123456", // فقط برای نمایش
          },
        },
        { status: 201 }
      );

    } catch (userError) {
      // اگر ایجاد کاربر با خطا مواجه شد، فقط ویزیتور را برگردان
      console.error("Error creating user for sales rep:", userError);
      
      return NextResponse.json(
        {
          ...salesRep,
          warning: "ویزیتور ایجاد شد اما کاربر مرتبط ایجاد نشد",
        },
        { status: 201 }
      );
    }

  } catch (error) {
    console.error("Error creating sales rep:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "کد ویزیتور یا ایمیل تکراری است" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطا در ایجاد ویزیتور" },
      { status: 500 }
    );
  }
}