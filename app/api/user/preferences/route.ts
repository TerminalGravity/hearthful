import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: {
        userId: user.id,
      },
    })

    if (!preferences) {
      // Return default preferences if none exist
      return NextResponse.json({
        theme: "system",
        language: "en",
        eventsUpdates: true,
        photosUpdates: true,
        mealsUpdates: true,
        gamesUpdates: true,
        autoplayMedia: true,
        showFamilyStatus: true,
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("[PREFERENCES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const {
      theme,
      language,
      eventsUpdates,
      photosUpdates,
      mealsUpdates,
      gamesUpdates,
      autoplayMedia,
      showFamilyStatus,
    } = body

    const preferences = await prisma.userPreferences.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        theme,
        language,
        eventsUpdates,
        photosUpdates,
        mealsUpdates,
        gamesUpdates,
        autoplayMedia,
        showFamilyStatus,
      },
      update: {
        theme,
        language,
        eventsUpdates,
        photosUpdates,
        mealsUpdates,
        gamesUpdates,
        autoplayMedia,
        showFamilyStatus,
      },
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("[PREFERENCES_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 