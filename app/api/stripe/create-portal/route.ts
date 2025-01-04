import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST() {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        stripeCustomerId: true,
      },
    })

    if (!dbUser?.stripeCustomerId) {
      return new NextResponse("No billing information found", { status: 404 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("[STRIPE_PORTAL_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 