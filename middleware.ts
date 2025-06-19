import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "@/lib/auth";

// Routes that don't require authentication
const publicRoutes = ["/", "/sign-in", "/sign-up", "/api/auth"];

// Routes that require authentication
const protectedRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If it's a public route, continue
  if (isPublicRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  // Get session for protected routes
  try {
    const { data: session, error } = await betterFetch<Session>(
      "/api/auth/get-session",
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    // If no session and trying to access protected route, redirect to sign-in
    if ((!session || error) && isProtectedRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // If has session and trying to access auth pages, redirect to dashboard
    if (session && (pathname === "/sign-in" || pathname === "/sign-up")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If there's an error fetching the session and route is protected, redirect to sign-in
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
