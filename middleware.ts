import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export default authMiddleware({
  publicRoutes: ["/", "/api/stripe/webhook"],
  async afterAuth(auth, req) {
    // Always allow access to public routes
    if (!auth.userId) {
      return;
    }

    // Extract familyId from URL if present
    const familyId = req.nextUrl.pathname
      .match(/\/families\/([^\/]+)/)?.[1];

    // Check if accessing premium features
    const isPremiumRoute = req.nextUrl.pathname.includes("/photos") ||
      req.nextUrl.pathname.includes("/albums");

    if (isPremiumRoute && familyId) {
      try {
        const subscription = await db.subscription.findUnique({
          where: { familyId },
          select: {
            status: true,
            stripeCurrentPeriodEnd: true,
          },
        });

        const isValid =
          subscription?.status === "ACTIVE" &&
          subscription?.stripeCurrentPeriodEnd?.getTime()! > Date.now();

        if (!isValid) {
          return NextResponse.redirect(
            new URL(`/families/${familyId}/settings`, req.url)
          );
        }
      } catch (error) {
        console.error("[SUBSCRIPTION_CHECK]", error);
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 