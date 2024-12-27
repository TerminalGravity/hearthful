"use client";

import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Balancer from "react-wrap-balancer";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/75 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Hearthful Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-display text-xl font-bold">Hearthful</span>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal" redirectUrl="/dashboard" afterSignInUrl="/dashboard">
                <button className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  Sign In
                </button>
              </SignInButton>
              <Link href="/pricing">
                <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900">
                  Sign Up
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  Dashboard
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center p-4 pt-24 md:p-24">
        <div className="z-10 w-full max-w-5xl space-y-24">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="rounded-full bg-white p-3 shadow-lg">
              <Image
                src="/logo.svg"
                alt="Hearthful Logo"
                width={120}
                height={120}
                className="h-24 w-24"
              />
            </div>
            <h1 className="font-display text-4xl font-bold tracking-[-0.02em] text-gray-900 md:text-7xl">
              <Balancer>
                Plan Your Next Gathering{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Effortlessly
                </span>{" "}
                with AI
              </Balancer>
            </h1>
            <p className="max-w-xl text-lg text-gray-600 md:text-xl">
              <Balancer>
                Hearthful suggests menus and games tailored to each group member's needs, making every gathering perfect for everyone.
              </Balancer>
            </p>
            <div className="mt-8">
              <Link href="/pricing">
                <button className="rounded-full bg-black px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-gray-900">
                  Join Free Now
                </button>
              </Link>
            </div>
          </div>

          <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-8 md:grid-cols-3">
            {features.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-gray-50 p-3 group-hover:bg-gray-100">
                    <Icon className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold">{title}</h3>
                </div>
                <p className="mt-4 text-gray-600">{description}</p>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">How It Works</h2>
              <p className="mt-4 text-lg text-gray-600">Four simple steps to perfect gatherings</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              {steps.map(({ title, description, icon: Icon }, index) => (
                <div key={title} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <span className="font-display text-xl font-bold">{index + 1}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-8 md:p-12">
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="text-center">
                <h2 className="font-display text-3xl font-bold md:text-4xl">Why Choose Hearthful</h2>
                <p className="mt-4 text-lg text-gray-600">Smart features that make planning effortless</p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {benefits.map(({ title, description }) => (
                  <div key={title} className="rounded-xl bg-white p-6 shadow-sm">
                    <h3 className="font-display text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-gray-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">Frequently Asked Questions</h2>
            </div>
            <div className="mx-auto max-w-3xl divide-y divide-gray-200">
              {faqs.map(({ question, answer }) => (
                <div key={question} className="py-6">
                  <h3 className="font-display text-lg font-bold">{question}</h3>
                  <p className="mt-2 text-gray-600">{answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-black p-8 text-center text-white md:p-12">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Ready to let AI take the stress out of planning?
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Join thousands of families already using Hearthful to create perfect gatherings.
            </p>
            <div className="mt-8">
              <Link href="/pricing">
                <button className="rounded-full bg-white px-8 py-3 text-lg font-medium text-black transition-colors hover:bg-gray-100">
                  Start Planning Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const features = [
  {
    title: "Smart Group Creation",
    description: "Create groups and save everyone's dietary restrictions and game preferences in one place.",
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
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
  },
  {
    title: "AI Menu Planning",
    description: "Get personalized recipe suggestions that accommodate everyone's dietary needs and preferences.",
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
          d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z"
        />
      </svg>
    ),
  },
  {
    title: "Game Suggestions",
    description: "Discover perfect activities and games that everyone in your group will enjoy.",
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
          d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"
        />
      </svg>
    ),
  },
];

const steps = [
  {
    title: "Create a Group",
    description: "Add members and their preferences for food and activities.",
  },
  {
    title: "Tell the AI Your Occasion",
    description: "Specify the type of gathering you're planning.",
  },
  {
    title: "Get Suggestions",
    description: "Receive AI-curated meal recipes and game ideas.",
  },
  {
    title: "Confirm & Share",
    description: "Finalize the plan and share event details instantly.",
  },
];

const benefits = [
  {
    title: "Saves Time",
    description: "Spend less time planning, more time enjoying with your loved ones.",
  },
  {
    title: "Personalized Experience",
    description: "No more guesswork—everyone's dietary and gaming preferences are covered.",
  },
  {
    title: "AI-Powered",
    description: "Smart suggestions that get better with each event you plan.",
  },
  {
    title: "Easy Sharing",
    description: "Share plans instantly and keep everyone in the loop.",
  },
];

const faqs = [
  {
    question: "How does the AI handle different diets?",
    answer: "Our AI considers all dietary restrictions and preferences when suggesting meals, ensuring everyone can enjoy the gathering safely and comfortably.",
  },
  {
    question: "Do I need any special equipment for game recommendations?",
    answer: "No! Our AI suggests games and activities that can be played with common household items or no equipment at all.",
  },
  {
    question: "Can I edit suggestions manually?",
    answer: "Absolutely! While our AI provides smart suggestions, you have full control to modify any recommendations to perfectly match your needs.",
  },
];
