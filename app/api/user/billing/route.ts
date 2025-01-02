import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the user's family where they are an admin
    const membership = await db.familyMember.findFirst({
      where: {
        userId: user.id,
        role: "ADMIN",
      },
      include: {
        family: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!membership?.family?.subscription) {
      return NextResponse.json({
        subscriptionStatus: "INACTIVE",
        currentPeriodEnd: null,
        priceId: null,
        familyId: membership?.familyId || null,
      });
    }

    return NextResponse.json({
      subscriptionStatus: membership.family.subscription.status,
      currentPeriodEnd: membership.family.subscription.stripeCurrentPeriodEnd,
      priceId: membership.family.subscription.stripePriceId,
      familyId: membership.familyId,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("[BILLING_GET]", error.message);
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
} 