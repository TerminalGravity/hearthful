import { PrismaClient, Family, FamilyMember, Event } from "@prisma/client";

const db = new PrismaClient();

type TestFamily = Family & {
  members: FamilyMember[];
};

async function testEventCreation() {
  try {
    console.log("\n🔍 Starting event creation test...\n");

    // 1. Get a test family with members
    console.log("1️⃣ Finding test family...");
    const testFamily = await db.family.findFirst({
      include: {
        members: true
      },
    });

    if (!testFamily) {
      throw new Error("❌ No test family found");
    }
    console.log("✅ Test family found:", {
      name: testFamily.name,
      id: testFamily.id,
      memberCount: testFamily.members.length
    });

    // 2. Get test participants
    console.log("\n2️⃣ Getting test participants...");
    const testParticipants = testFamily.members.filter(member => member.userId);
    if (testParticipants.length < 1) {
      throw new Error("❌ Not enough family members with valid user IDs for test");
    }
    console.log("✅ Test participants:", testParticipants.map((p: FamilyMember) => ({
      name: p.name,
      id: p.id,
      email: p.email,
      userId: p.userId
    })));

    // 3. Verify or create test user
    console.log("\n3️⃣ Verifying test user...");
    const hostUserId = testParticipants[0].userId;
    let hostUser = await db.user.findUnique({
      where: { id: hostUserId }
    });

    if (!hostUser) {
      console.log("Creating test user...");
      hostUser = await db.user.create({
        data: {
          id: hostUserId,
          email: testParticipants[0].email,
          displayName: testParticipants[0].name,
        }
      });
      console.log("✅ Test user created");
    } else {
      console.log("✅ Test user found");
    }

    // 4. Create test event data
    console.log("\n4️⃣ Creating test event data...");
    const testEvent = {
      name: "Test Event " + new Date().toISOString(),
      description: "Test event description",
      date: new Date(),
      type: "meal" as const,
      familyId: testFamily.id,
      hostId: hostUser.id,
      participants: testParticipants.map((p: FamilyMember) => p.id),
      details: {
        mealType: "dinner",
        cuisine: "Test Cuisine",
        dietaryNotes: "Test dietary notes",
      },
    };
    console.log("✅ Test event data prepared:", testEvent);

    // 5. Create the event
    console.log("\n5️⃣ Creating event in database...");
    const createdEvent = await db.event.create({
      data: {
        name: testEvent.name,
        description: testEvent.description,
        date: testEvent.date,
        type: testEvent.type,
        details: testEvent.details,
        familyId: testEvent.familyId,
        hostId: testEvent.hostId,
        participants: {
          connect: testEvent.participants.map((id: string) => ({ id })),
        },
      },
      include: {
        family: true,
        participants: true,
        host: true,
      },
    });

    console.log("✅ Event created successfully:", {
      id: createdEvent.id,
      name: createdEvent.name,
      familyName: createdEvent.family.name,
      hostName: createdEvent.host.displayName || createdEvent.host.email,
      participantCount: createdEvent.participants.length,
      date: createdEvent.date,
      type: createdEvent.type
    });

    // 6. Verify the event
    console.log("\n6️⃣ Verifying event...");
    const verifiedEvent = await db.event.findUnique({
      where: { id: createdEvent.id },
      include: {
        family: true,
        participants: true,
        host: true,
      },
    });

    if (!verifiedEvent) {
      throw new Error("❌ Failed to verify created event");
    }

    console.log("✅ Event verification successful");
    console.log("\n✨ Test completed successfully ✨\n");

    // 7. Clean up (optional)
    console.log("7️⃣ Cleaning up test data...");
    await db.event.delete({
      where: { id: createdEvent.id }
    });
    console.log("✅ Test event cleaned up");

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run the test
console.log("🚀 Starting test script...");
testEventCreation()
  .then(() => {
    console.log("🏁 Test script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test script failed:", error);
    process.exit(1);
  }); 