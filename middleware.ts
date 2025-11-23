import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // Define allowed origins
  const allowedOrigins = [
    "https://mma.salkhalil.com",
    "http://localhost:3000",
    "https://mma-bay.vercel.app",
  ];

  // Helper to check if origin is allowed
  const isAllowedOrigin =
    origin &&
    (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app"));

  // Handle OPTIONS request
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });
    if (isAllowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return response;
  }

  // Create response object (default to next)
  let response = NextResponse.next();

  // Add CORS headers to response
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  const authToken = request.cookies.get("auth_token");

  // Allow access to login page, auth endpoints, users endpoint, and public assets
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname === "/api/users" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg)$/)
  ) {
    // If user is already authenticated and tries to access login, redirect to home
    if (authToken && pathname === "/login") {
      const redirectResponse = NextResponse.redirect(new URL("/", request.url));
      // Copy CORS headers to redirect response
      if (isAllowedOrigin) {
        redirectResponse.headers.set("Access-Control-Allow-Origin", origin);
        redirectResponse.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        redirectResponse.headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );
        redirectResponse.headers.set(
          "Access-Control-Allow-Credentials",
          "true"
        );
      }
      return redirectResponse;
    }
    return response;
  }

  // Check if user is authenticated
  if (!authToken) {
    // For API routes, return 401 instead of redirect
    if (pathname.startsWith("/api")) {
      const errorResponse = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      if (isAllowedOrigin) {
        errorResponse.headers.set("Access-Control-Allow-Origin", origin);
        errorResponse.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        errorResponse.headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );
        errorResponse.headers.set("Access-Control-Allow-Credentials", "true");
      }
      return errorResponse;
    }

    const redirectResponse = NextResponse.redirect(
      new URL("/login", request.url)
    );
    if (isAllowedOrigin) {
      redirectResponse.headers.set("Access-Control-Allow-Origin", origin);
      redirectResponse.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      redirectResponse.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      redirectResponse.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
