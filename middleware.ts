import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/pricing",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/logo.svg",
    "/opengraph-image(.*)",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml"
  ],
  ignoredRoutes: [
    "/api/families/public(.*)",
    "/api/events/public(.*)",
    "/_next(.*)",
    "/static(.*)"
  ]
});

// Export config to match middleware requirements
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api/public routes (public API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/public).*)",
    "/api/(.*)"
  ]
};
