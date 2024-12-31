import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/webhooks/(.*)",
    "/pricing",
    "/about",
    "/contact",
    "/privacy",
    "/terms"
  ],
  ignoredRoutes: [
    "/api/families/public/(.*)",
    "/api/events/public/(.*)"
  ]
});

// Export config to match middleware requirements
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", // match all paths except static files
    "/", // match root
    "/(api|trpc)/(.*)" // match API routes
  ]
}; 