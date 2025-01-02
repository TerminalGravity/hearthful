import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function PhotosPage() {
  const session = await auth();
  const { userId } = session;

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>Photos</h1>
    </div>
  );
} 