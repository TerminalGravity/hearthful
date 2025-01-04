"use client"

import Link from "next/link"
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
  }[]
  pathname: string
}

export function SidebarNav({ className, items, pathname, ...props }: SidebarNavProps) {
  const getIcon = (title: string) => {
    switch (title) {
      case "Profile":
        return <UserCircle className="h-4 w-4" />
      case "Billing":
        return <CreditCard className="h-4 w-4" />
      case "Notifications":
        return <Bell className="h-4 w-4" />
      case "Preferences":
        return <Settings className="h-4 w-4" />
      default:
        return null
    }
  }

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
          {getIcon(item.title)}
          {item.title}
        </Link>
      ))}
    </nav>
  )
} 