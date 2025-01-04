"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { 
  UserCircle, 
  CreditCard, 
  Bell, 
  Settings,
} from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start gap-2"
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}

export const profileNavItems = [
  {
    title: "Profile",
    href: "/profile",
    icon: <UserCircle className="h-4 w-4" />,
  },
  {
    title: "Billing",
    href: "/profile/billing",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    title: "Notifications",
    href: "/profile/notifications",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    title: "Preferences",
    href: "/profile/preferences",
    icon: <Settings className="h-4 w-4" />,
  },
] 