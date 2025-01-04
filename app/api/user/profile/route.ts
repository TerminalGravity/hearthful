import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, email } = body

    // Update user profile in Clerk
    await fetch(`https://api.clerk.dev/v1/users/${user.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: name.split(" ")[0],
        last_name: name.split(" ").slice(1).join(" ") || undefined,
        email_addresses: [{
          email_address: email,
          primary: true,
        }],
      }),
    })

    // Update user profile in our database
    const profile = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
        email,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[PROFILE_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 