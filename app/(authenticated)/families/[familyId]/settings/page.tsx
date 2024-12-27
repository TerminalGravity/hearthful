import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkSubscription } from "@/lib/subscription";
import { SubscriptionButton } from "@/components/subscription/SubscriptionButton";

export default async function FamilySettingsPage({
  params
}: {
  params: { familyId: string }
}) {
  const session = await auth();
  const { userId } = session;

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user is admin of the family
  const membership = await db.familyMember.findFirst({
    where: {
      userId,
      familyId: params.familyId,
      role: "ADMIN",
    },
  });

  if (!membership) {
    redirect("/families");
  }

  const isSubscribed = await checkSubscription(params.familyId);

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Family Settings</h1>
          <p className="text-muted-foreground">
            Manage your family's subscription and settings
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription</h2>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {isSubscribed
                ? "Your family has an active subscription."
                : "Upgrade to access premium features like photo albums and more."}
            </p>
            <SubscriptionButton
              familyId={params.familyId}
              isSubscribed={isSubscribed}
            />
          </div>
        </div>

        {/* Add more settings sections here */}
      </div>
    </div>
  );
} 