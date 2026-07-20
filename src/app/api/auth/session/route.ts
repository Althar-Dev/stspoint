
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * API: Set Wildcard Session Cookie for .stspoint.id
 * This allows single login across all subdomains.
 */
export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, message: "Token is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    
    // Set cookie for the entire root domain
    cookieStore.set("sts_session", token, {
      domain: ".stspoint.id", 
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 Days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: "sts_session",
    domain: ".stspoint.id",
    path: "/",
  });
  return NextResponse.json({ success: true });
}
