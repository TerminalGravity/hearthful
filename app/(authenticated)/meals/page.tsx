import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function MealsPage() {
  const session = await auth();
  const { userId } = session;

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>Meals</h1>
    </div>
  );
} 