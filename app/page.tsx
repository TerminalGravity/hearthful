import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import Balancer from "react-wrap-balancer";

export default async function Home() {
  const { userId } = auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl space-y-12">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <Image
            src="/logo.svg"
            alt="Hearthful Logo"
            width={120}
            height={120}
            className="h-24 w-24"
          />
          <h1 className="font-display text-4xl font-bold tracking-[-0.02em] text-black/80 md:text-7xl">
            Welcome to Hearthful
          </h1>
          <p className="text-lg text-gray-600 md:text-xl">
            <Balancer>
              Bringing families together, one gathering at a time. Plan events, share meals, and create lasting memories.
            </Balancer>
          </p>
          <div className="mt-8">
            <SignInButton mode="modal">
              <button className="rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80">
                Get Started
              </button>
            </SignInButton>
          </div>
        </div>

        <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-8 md:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-8 shadow-md transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <Icon className="h-8 w-8 text-gray-600" />
                <h3 className="font-display text-xl font-bold">{title}</h3>
              </div>
              <p className="mt-4 text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const features = [
  {
    title: "Family Events",
    description: "Create and manage family gatherings with ease. From reunions to weekly dinners.",
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
    ),
  },
  {
    title: "Recipe Library",
    description: "Share and discover family recipes. Keep traditions alive through generations.",
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
  },
  {
    title: "Photo Gallery",
    description: "Capture and share precious moments. Create a digital family album together.",
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    ),
  },
];
