import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!dbUser?.stripeCustomerId) {
      return NextResponse.json({
        status: "inactive",
        plan: "Free",
      });
    }

    const customer = await stripe.customers.retrieve(dbUser.stripeCustomerId);
    
    if (!dbUser.stripeSubscriptionId) {
      return NextResponse.json({
        status: "inactive",
        plan: "Free",
      });
    }

    const subscription = await stripe.subscriptions.retrieve(dbUser.stripeSubscriptionId);
    const product = await stripe.products.retrieve(subscription.items.data[0].price.product as string);

    return NextResponse.json({
      status: subscription.status,
      plan: product.name,
      nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
      amount: subscription.items.data[0].price.unit_amount,
    });
  } catch (error) {
    console.error("[BILLING_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 