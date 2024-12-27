import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface SubscriptionButtonProps {
  familyId: string;
  isSubscribed: boolean;
}

export function SubscriptionButton({ familyId, isSubscribed }: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          familyId,
          // This should match your Stripe price ID for the subscription
          priceId: "price_XXXXX",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("[SUBSCRIPTION_ERROR]", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading || isSubscribed}
      variant={isSubscribed ? "outline" : "default"}
    >
      {loading ? (
        "Loading..."
      ) : isSubscribed ? (
        "Subscribed"
      ) : (
        "Upgrade to Pro"
      )}
    </Button>
  );
} 