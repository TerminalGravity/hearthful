import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST() {
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

    if (!membership?.family?.subscription?.stripeCustomerId) {
      return new NextResponse("No subscription found", { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: membership.family.subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[STRIPE_PORTAL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 