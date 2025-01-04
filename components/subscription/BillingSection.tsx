import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface BillingInfo {
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELED';
  currentPeriodEnd: string | null;
  priceId: string | null;
  familyId: string | null;
}

const SUBSCRIPTION_STATUS = {
  ACTIVE: {
    label: 'Active',
    color: 'bg-green-500',
    icon: CheckCircle2,
  },
  INACTIVE: {
    label: 'Inactive',
    color: 'bg-gray-500',
    icon: Clock,
  },
  PAST_DUE: {
    label: 'Past Due',
    color: 'bg-yellow-500',
    icon: AlertCircle,
  },
  CANCELED: {
    label: 'Canceled',
    color: 'bg-red-500',
    icon: AlertCircle,
  },
} as const;

export function BillingSection() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [managing, setManaging] = useState(false);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    subscriptionStatus: 'INACTIVE',
    currentPeriodEnd: null,
    priceId: null,
    familyId: null,
  });

  useEffect(() => {
    const loadBillingInfo = async () => {
      try {
        const response = await fetch('/api/user/billing');
        if (!response.ok) throw new Error('Failed to load billing info');
        const data = await response.json();
        setBillingInfo(data);
      } catch (error) {
        console.error('Error loading billing info:', error);
        toast.error('Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadBillingInfo();
    }
  }, [user]);

  const handleManageBilling = async () => {
    try {
      setManaging(true);
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to create portal session');
      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setManaging(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const status = SUBSCRIPTION_STATUS[billingInfo.subscriptionStatus];
  const StatusIcon = status.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing & Subscription</CardTitle>
        <CardDescription>
          Manage your subscription and billing preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`rounded-full p-2 ${status.color} bg-opacity-10`}>
              <StatusIcon className={`h-6 w-6 ${status.color} text-opacity-100`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">Subscription Status</h3>
                <Badge variant={billingInfo.subscriptionStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                  {status.label}
                </Badge>
              </div>
              {billingInfo.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  Next billing date: {new Date(billingInfo.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleManageBilling}
            variant="outline"
            disabled={managing}
          >
            {managing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Manage Billing'
            )}
          </Button>
        </div>

        {billingInfo.subscriptionStatus === 'INACTIVE' && (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <h4 className="font-semibold">Upgrade to Pro</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Get access to premium features like unlimited photo storage and family games
            </p>
            <Button
              onClick={() => window.location.href = '/pricing'}
              className="mt-4"
            >
              View Plans
            </Button>
          </div>
        )}

        {billingInfo.subscriptionStatus === 'PAST_DUE' && (
          <div className="rounded-lg bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Payment Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Your last payment was unsuccessful. Please update your payment method to continue accessing premium features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 