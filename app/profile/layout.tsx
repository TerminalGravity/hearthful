"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarNav } from "@/components/profile/sidebar-nav"
import Nav from "@/components/layout/nav"

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/profile",
  },
  {
    title: "Billing",
    href: "/profile/billing",
  },
  {
    title: "Notifications",
    href: "/profile/notifications",
  },
  {
    title: "Preferences",
    href: "/profile/preferences",
  },
]

interface ProfileLayoutProps {
  children: React.ReactNode
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12 xl:space-x-16">
          <aside className="lg:w-1/4 xl:w-1/5">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
              <p className="text-muted-foreground">
                Manage your account settings and preferences.
              </p>
            </div>
            <Separator className="my-4" />
            <SidebarNav items={sidebarNavItems} pathname={pathname} />
          </aside>
          <main className="flex-1 lg:max-w-3xl">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 