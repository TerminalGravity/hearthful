import { useState, useEffect } from "react";
import { Card, Text, Line, Bar, Pie } from "@nextui-org/react";
import { toast } from "sonner";

interface AnalyticsData {
  memberEngagement: { name: string; eventsParticipated: number }[];
  eventTypes: { type: string; count: number }[];
  mealPreferences: { cuisine: string; count: number }[];
  gamePreferences: { genre: string; count: number }[];
}

export default function AnalyticsInsights({ familyId }: { familyId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/families/${familyId}/analytics`);
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [familyId]);

  if (isLoading || !analytics) {
    return <Text>Loading analytics...</Text>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Text h4>Member Engagement</Text>
        </Card.Header>
        <Card.Body>
          <Line data={{
            labels: analytics.memberEngagement.map(m => m.name),
            datasets: [{
              label: 'Events Participated',
              data: analytics.memberEngagement.map(m => m.eventsParticipated),
              borderColor: '#4f46e5',
              backgroundColor: '#4f46e550',
            }]
          }} />
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <Text h4>Event Types</Text>
        </Card.Header>
        <Card.Body>
          <Pie data={{
            labels: analytics.eventTypes.map(e => e.type),
            datasets: [{
              data: analytics.eventTypes.map(e => e.count),
              backgroundColor: ['#f87171', '#fbbf24', '#34d399', '#60a5fa'],
            }]
          }} />
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <Text h4>Meal Preferences</Text>
        </Card.Header>
        <Card.Body>
          <Bar data={{
            labels: analytics.mealPreferences.map(m => m.cuisine),
            datasets: [{
              label: 'Preferred Cuisines',
              data: analytics.mealPreferences.map(m => m.count),
              backgroundColor: '#f472b6',
            }]
          }} />
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <Text h4>Game Preferences</Text>
        </Card.Header>
        <Card.Body>
          <Bar data={{
            labels: analytics.gamePreferences.map(g => g.genre),
            datasets: [{
              label: 'Preferred Game Genres',
              data: analytics.gamePreferences.map(g => g.count),
              backgroundColor: '#60a5fa',
            }]
          }} />
        </Card.Body>
      </Card>
    </div>
  );
} 