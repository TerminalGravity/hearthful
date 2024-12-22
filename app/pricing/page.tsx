"use client";

import { SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for small families",
    features: [
      "Up to 5 family members",
      "Basic event planning",
      "Photo sharing",
      "Recipe library access",
    ],
  },
  {
    name: "Pro",
    price: "9.99",
    description: "For growing families",
    features: [
      "Up to 15 family members",
      "Advanced event planning",
      "Unlimited photo storage",
      "Recipe collections",
      "Family games & activities",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "19.99",
    description: "For large family networks",
    features: [
      "Unlimited family members",
      "Multiple family groups",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "24/7 dedicated support",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/75 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Hearthful Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-display text-xl font-bold">Hearthful</span>
          </Link>
        </div>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center p-4 pt-24 md:p-24">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold tracking-[-0.02em] text-gray-900 md:text-6xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Start bringing your family together with Hearthful
          </p>
        </div>

        <div className="mt-16 grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg"
            >
              <div className="mb-8">
                <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="font-display text-5xl font-bold">${plan.price}</span>
                  <span className="ml-1 text-gray-500">/month</span>
                </div>
                <p className="mt-2 text-gray-600">{plan.description}</p>
              </div>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <SignUpButton mode="modal">
                <button className="w-full rounded-full bg-black py-3 text-sm font-medium text-white transition-colors hover:bg-gray-900">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 