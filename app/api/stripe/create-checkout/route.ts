import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { priceId } = await req.json()

    // Get or create the customer
    let dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        stripeCustomerId: true,
      },
    })

    if (!dbUser?.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName || undefined,
        metadata: {
          userId: user.id,
        },
      })

      dbUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          stripeCustomerId: customer.id,
        },
        select: {
          stripeCustomerId: true,
        },
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: dbUser.stripeCustomerId!,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/billing?canceled=true`,
      metadata: {
        userId: user.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 