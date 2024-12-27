import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const familyId = session?.metadata?.familyId;
  const userId = session?.metadata?.userId;

  if (!familyId || !userId) {
    return new NextResponse("Missing metadata", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        // Update subscription status
        await db.subscription.upsert({
          where: { familyId },
          create: {
            familyId,
            stripeSubscriptionId: session.subscription as string,
            stripeCustomerId: session.customer as string,
            stripePriceId: session.metadata.priceId,
            stripeCurrentPeriodEnd: new Date(
              (session.subscription_data?.trial_end || session.expires_at) * 1000
            ),
            status: "ACTIVE",
          },
          update: {
            stripeSubscriptionId: session.subscription as string,
            stripeCustomerId: session.customer as string,
            stripePriceId: session.metadata.priceId,
            stripeCurrentPeriodEnd: new Date(
              (session.subscription_data?.trial_end || session.expires_at) * 1000
            ),
            status: "ACTIVE",
          },
        });
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice;
        // Update subscription period
        await db.subscription.update({
          where: {
            stripeSubscriptionId: invoice.subscription as string,
          },
          data: {
            stripeCurrentPeriodEnd: new Date(invoice.period_end * 1000),
            status: "ACTIVE",
          },
        });
        break;

      case "invoice.payment_failed":
        // Update subscription status to past due
        await db.subscription.update({
          where: {
            stripeSubscriptionId: session.subscription as string,
          },
          data: {
            status: "PAST_DUE",
          },
        });
        break;

      case "customer.subscription.deleted":
        // Update subscription status to canceled
        await db.subscription.update({
          where: {
            stripeSubscriptionId: session.subscription as string,
          },
          data: {
            status: "CANCELED",
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        });
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error);
    return new NextResponse("Webhook Error", { status: 500 });
  }
} 