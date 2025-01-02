import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";

interface BillingInfo {
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  priceId: string | null;
  familyId: string | null;
}

export function BillingSection() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
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
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading billing information...</div>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="font-display text-xl font-semibold">Billing & Subscription</h2>
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Status: {billingInfo.subscriptionStatus.toLowerCase()}
            </p>
            {billingInfo.currentPeriodEnd && (
              <p className="text-sm text-gray-500">
                Next billing date: {new Date(billingInfo.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          <Button
            onClick={handleManageBilling}
            variant="outline"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Manage Billing'}
          </Button>
        </div>
        
        {billingInfo.subscriptionStatus === 'INACTIVE' && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Upgrade to Pro to access premium features like unlimited photo storage and family games.
            </p>
            <Button
              onClick={() => window.location.href = '/pricing'}
              className="mt-2"
            >
              View Plans
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 