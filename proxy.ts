import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/m/:path*",
    "/dashboard/c/:path*",
    "/dashboard/sa/:path*",
    "/a/:path*",
  ],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const url = request.nextUrl.clone();
  url.pathname = '/';
  const baseUrl = url.href;

  const homeUrl = new URL("/", baseUrl); 

  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(homeUrl);
  }

  const roleCheckUrl = new URL("/api/auth/check-role", baseUrl);
  
  const response = await fetch(roleCheckUrl, {
    headers: {
      "Cookie": `session=${sessionCookie}`
    }
  });

  if (response.status === 401) {
    return NextResponse.redirect(homeUrl);
  }

  const { role } = await response.json();

  if (pathname.startsWith("/a")) {
    return NextResponse.next();
  }
  
  if (role === "super_admin") {
    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard/sa", baseUrl));
    }
    return NextResponse.next();
  }
  
  if (role === "admin") {
    if (pathname.startsWith("/dashboard/sa")) {
      return NextResponse.redirect(new URL("/dashboard/c", baseUrl));
    }
    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard/c", baseUrl));
    }
    return NextResponse.next();
  }
  
  if (role === "member") {
    if (pathname.startsWith("/dashboard/sa") || pathname.startsWith("/dashboard/c")) {
      return NextResponse.redirect(new URL("/dashboard/m", baseUrl));
    }
    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard/m", baseUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.redirect(homeUrl);
}