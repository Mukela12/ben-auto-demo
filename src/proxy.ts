import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSessionFromNextRequest, isAdminAuthConfigured } from "@/lib/admin-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!isAdminAuthConfigured()) {
      return NextResponse.redirect(new URL("/login?error=unconfigured", request.url));
    }

    const adminSession = await getAdminSessionFromNextRequest(request);
    if (!adminSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
