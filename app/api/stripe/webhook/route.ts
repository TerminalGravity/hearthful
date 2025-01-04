import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Error verifying webhook signature:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await prisma.user.update({
        where: {
          stripeCustomerId: session.customer,
        },
        data: {
          stripeSubscriptionId: session.id,
        },
      });
      break;

    case "customer.subscription.deleted":
      await prisma.user.update({
        where: {
          stripeCustomerId: session.customer,
        },
        data: {
          stripeSubscriptionId: null,
        },
      });
      break;

    case "customer.updated":
      await prisma.user.update({
        where: {
          stripeCustomerId: session.id,
        },
        data: {
          email: session.email,
        },
      });
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 