import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/webhooks(.*)",
    "/pricing",
  ],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: [
    "/api/stripe/webhook",
  ],
});

export const config = {
  // Match all routes except static files and api/stripe/webhook
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
}; 