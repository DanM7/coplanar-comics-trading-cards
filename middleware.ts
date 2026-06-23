import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDevToolsEnabled } from "@/lib/dev-only";

export function middleware(request: NextRequest) {
  if (!isDevToolsEnabled()) {
    const { pathname } = request.nextUrl;
    if (pathname === "/editor" || pathname.startsWith("/editor/")) {
      return new NextResponse(null, { status: 404 });
    }
    if (pathname.startsWith("/api/dev/")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/editor", "/editor/:path*", "/api/dev", "/api/dev/:path*"],
};
