import { useState, useEffect } from "react";
import { Card, Text, Button, Input, Dropdown } from "@nextui-org/react";
import { toast } from "sonner";

interface Subscription {
  plan: string;
  status: string;
  renewalDate: string;
}

export default function SubscriptionManagement({ familyId }: { familyId: string }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubscription = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/families/${familyId}/subscription`);
      const data = await res.json();
      setSubscription(data);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      toast.error("Failed to load subscription details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [familyId]);

  const handleUpgrade = async (selectedPlan: string) => {
    try {
      const res = await fetch(`/api/families/${familyId}/subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      if (!res.ok) {
        throw new Error("Failed to upgrade subscription.");
      }

      const updatedSubscription = await res.json();
      setSubscription(updatedSubscription);
      toast.success("Subscription upgraded successfully.");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while upgrading the subscription.");
    }
  };

  return (
    <Card>
      <Card.Header>
        <Text h4>Subscription Management</Text>
      </Card.Header>
      <Card.Body>
        {subscription ? (
          <div className="space-y-2">
            <Text>
              <strong>Plan:</strong> {subscription.plan}
            </Text>
            <Text>
              <strong>Status:</strong> {subscription.status}
            </Text>
            <Text>
              <strong>Renewal Date:</strong> {subscription.renewalDate}
            </Text>
            <Dropdown>
              <Dropdown.Button flat color="secondary" css={{ tt: "capitalize" }}>
                Upgrade Plan
              </Dropdown.Button>
              <Dropdown.Menu aria-label="Upgrade Plan" onAction={handleUpgrade}>
                <Dropdown.Item key="Premium">Premium</Dropdown.Item>
                <Dropdown.Item key="Pro">Pro</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        ) : (
          <Text>Loading subscription details...</Text>
        )}
      </Card.Body>
    </Card>
  );
} 