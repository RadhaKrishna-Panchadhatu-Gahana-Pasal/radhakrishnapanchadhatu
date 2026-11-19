import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route protection
  // TODO: Replace with real auth session check using Auth.js middleware
  if (pathname.startsWith("/admin")) {
    // For now, allow through — real auth check is added in Phase 2
    // const session = await auth(); // from @/lib/auth
    // if (!session || session.user.role === "CUSTOMER") {
    //   return NextResponse.redirect(new URL("/login", request.url));
    // }
  }

  // Add security headers
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|icons|images).*)",
  ],
};
