"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface NotificationPreferences {
  eventsUpdates: boolean
  photosUpdates: boolean
  mealsUpdates: boolean
  gamesUpdates: boolean
}

export default function NotificationsPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    eventsUpdates: true,
    photosUpdates: true,
    mealsUpdates: true,
    gamesUpdates: true,
  })

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch("/api/user/preferences")
        if (!response.ok) throw new Error("Failed to load preferences")
        const data = await response.json()
        setPreferences({
          eventsUpdates: data.eventsUpdates ?? true,
          photosUpdates: data.photosUpdates ?? true,
          mealsUpdates: data.mealsUpdates ?? true,
          gamesUpdates: data.gamesUpdates ?? true,
        })
      } catch (error) {
        console.error("Error loading preferences:", error)
        toast.error("Failed to load notification preferences")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadPreferences()
    }
  }, [user])

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })
      
      if (!response.ok) throw new Error("Failed to save preferences")
      toast.success("Notification preferences updated")
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast.error("Failed to save notification preferences")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose what updates you want to receive and how
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Events Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about family events and activities
              </p>
            </div>
            <Switch
              checked={preferences.eventsUpdates}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, eventsUpdates: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Photos Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new photos are shared
              </p>
            </div>
            <Switch
              checked={preferences.photosUpdates}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, photosUpdates: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Meals Updates</Label>
              <p className="text-sm text-muted-foreground">
                Stay updated on meal plans and recipes
              </p>
            </div>
            <Switch
              checked={preferences.mealsUpdates}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, mealsUpdates: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Games Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notifications about family games and activities
              </p>
            </div>
            <Switch
              checked={preferences.gamesUpdates}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, gamesUpdates: checked })
              }
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 