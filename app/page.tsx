"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Balancer from "react-wrap-balancer";

export default function Home() {
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
            <SignInButton mode="modal" redirectUrl="/dashboard">
              <button className="text-sm font-medium text-gray-500 hover:text-gray-900">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal" redirectUrl="/dashboard">
              <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center p-4 pt-24 md:p-24">
        <div className="z-10 w-full max-w-5xl space-y-16">
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
              Welcome to{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Hearthful
              </span>
            </h1>
            <p className="max-w-xl text-lg text-gray-600 md:text-xl">
              <Balancer>
                Bringing families together, one gathering at a time. Plan events, share meals, and create lasting memories.
              </Balancer>
            </p>
            <div className="mt-8">
              <SignUpButton mode="modal" redirectUrl="/dashboard">
                <button className="rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-900">
                  Get Started
                </button>
              </SignUpButton>
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
        </div>
      </main>
    </div>
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
