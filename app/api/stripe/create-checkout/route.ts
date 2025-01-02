import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { userId } = session;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { familyId, priceId } = body;

    if (!familyId || !priceId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user is admin of the family
    const membership = await db.familyMember.findFirst({
      where: {
        userId,
        familyId,
        role: "ADMIN",
      },
    });

    if (!membership) {
      return new NextResponse("Forbidden - Only admins can manage subscriptions", { status: 403 });
    }

    // Get or create the subscription record
    let subscription = await db.subscription.findUnique({
      where: { familyId },
    });

    if (!subscription) {
      subscription = await db.subscription.create({
        data: { familyId },
      });
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/families/${familyId}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/families/${familyId}/settings?canceled=true`,
      metadata: {
        familyId,
        userId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 