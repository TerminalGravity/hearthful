import { authMiddleware } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in*",
    "/sign-up*",
    "/api/webhooks*",
    "/pricing",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/families", // Added "/families" to publicRoutes
  ],
  ignoredRoutes: [
    "/api/families/public*",
    "/api/events/public*",
  ],
});

// Export config to match middleware requirements
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
