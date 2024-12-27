import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    const { userId } = session;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the user's family where they are an admin
    const membership = await db.familyMember.findFirst({
      where: {
        userId,
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
    console.error("[BILLING_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 