import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function GamesPage() {
  const session = await auth();
  const { userId } = session;

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>Games</h1>
    </div>
  );
} 