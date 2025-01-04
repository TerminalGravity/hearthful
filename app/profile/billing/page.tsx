"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, CheckCircle2, AlertCircle, XCircle } from "lucide-react"

interface BillingInfo {
  status: "active" | "inactive" | "past_due" | "canceled"
  plan: string
  nextBillingDate?: string
  amount?: number
}

const SUBSCRIPTION_STATUS = {
  active: {
    label: "Active",
    color: "bg-green-500/10 text-green-500 hover:bg-green-500/10",
    icon: CheckCircle2,
  },
  inactive: {
    label: "Inactive",
    color: "bg-slate-500/10 text-slate-500 hover:bg-slate-500/10",
    icon: XCircle,
  },
  past_due: {
    label: "Past Due",
    color: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10",
    icon: AlertCircle,
  },
  canceled: {
    label: "Canceled",
    color: "bg-red-500/10 text-red-500 hover:bg-red-500/10",
    icon: XCircle,
  },
}

export default function BillingPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    status: "inactive",
    plan: "Free",
  })

  useEffect(() => {
    const loadBillingInfo = async () => {
      try {
        const response = await fetch("/api/user/billing")
        if (!response.ok) throw new Error("Failed to load billing info")
        const data = await response.json()
        setBillingInfo(data)
      } catch (error) {
        console.error("Error loading billing info:", error)
        toast.error("Failed to load billing information")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadBillingInfo()
    }
  }, [user])

  const handleManageBilling = async () => {
    try {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
      })
      
      if (!response.ok) throw new Error("Failed to create billing portal session")
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Error creating billing portal session:", error)
      toast.error("Failed to open billing portal")
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const statusConfig = SUBSCRIPTION_STATUS[billingInfo.status]
  const StatusIcon = statusConfig.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>
          Manage your subscription and billing preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">Subscription Status</h3>
                <Badge variant="outline" className={statusConfig.color}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {billingInfo.plan} Plan
              </p>
            </div>
            <Button onClick={handleManageBilling} variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
          </div>

          {billingInfo.nextBillingDate && (
            <div className="rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Next billing date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(billingInfo.nextBillingDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {billingInfo.status === "past_due" && (
            <div className="rounded-lg bg-yellow-500/10 p-4">
              <div className="flex items-center space-x-2 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">
                  Your payment is past due. Please update your payment method to continue using premium features.
                </p>
              </div>
            </div>
          )}

          {billingInfo.status === "inactive" && (
            <div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Upgrade to Premium
                </p>
                <p className="text-sm text-muted-foreground">
                  Get access to all premium features and support the development of Hearthful.
                </p>
                <Button onClick={handleManageBilling}>
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 