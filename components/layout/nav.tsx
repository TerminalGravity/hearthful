"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function Nav() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
    },
    {
      href: "/families",
      label: "Families",
    },
    {
      href: "/events",
      label: "Events",
    },
    {
      href: "/meals",
      label: "Meals",
    },
    {
      href: "/games",
      label: "Games",
    },
    {
      href: "/photos",
      label: "Photos",
    },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/dashboard" className="font-display text-xl font-bold">
                Hearthful
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    pathname === link.href
                      ? "border-black text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <div className="relative ml-3">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase()}
                  </span>
                </div>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Settings
                  </Link>
                  <SignOutButton>
                    <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 