import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes protection
    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Shopkeeper routes protection
    if (path.startsWith("/shopkeeper") && token?.role !== "shopkeeper") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Customer routes protection
    if (path.startsWith("/customer") && token?.role !== "customer") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/shopkeeper/:path*",
    "/customer/:path*",
  ],
};
