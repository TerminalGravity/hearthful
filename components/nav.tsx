"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import clsx from "clsx";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Families", href: "/families" },
  { name: "Events", href: "/events" },
  { name: "Meals", href: "/meals" },
  { name: "Games", href: "/games" },
  { name: "Photos", href: "/photos" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
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
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                    pathname === item.href
                      ? "border-black text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className={clsx(
                "inline-flex items-center px-1 pt-1 text-sm font-medium",
                pathname === "/profile"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Profile
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
} 