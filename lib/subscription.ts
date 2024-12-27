import { db } from "@/lib/db";

export const checkSubscription = async (familyId: string) => {
  if (!familyId) {
    return false;
  }

  const subscription = await db.subscription.findUnique({
    where: {
      familyId,
    },
    select: {
      status: true,
      stripeCurrentPeriodEnd: true,
    },
  });

  if (!subscription) {
    return false;
  }

  // Check if subscription is active and not expired
  const isValid =
    subscription.status === "ACTIVE" &&
    subscription.stripeCurrentPeriodEnd?.getTime()! > Date.now();

  return !!isValid;
};

export const getSubscription = async (familyId: string) => {
  if (!familyId) {
    return null;
  }

  const subscription = await db.subscription.findUnique({
    where: {
      familyId,
    },
  });

  return subscription;
}; 