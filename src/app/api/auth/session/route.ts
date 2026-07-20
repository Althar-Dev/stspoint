
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * API: Set Wildcard Session Cookie for .stspoint.id
 */
export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, message: "Token is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const host = request.headers.get('host') || '';
    const isProd = host.includes('stspoint.id') && !host.includes('localhost');
    
    cookieStore.set("sts_session", token, {
      domain: isProd ? ".stspoint.id" : undefined, 
      path: "/",
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 Days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const host = request.headers.get('host') || '';
  const isProd = host.includes('stspoint.id') && !host.includes('localhost');

  cookieStore.delete({
    name: "sts_session",
    domain: isProd ? ".stspoint.id" : undefined,
    path: "/",
  });
  
  return NextResponse.json({ success: true });
}
