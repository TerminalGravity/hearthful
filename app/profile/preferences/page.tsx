"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface UserPreferences {
  theme: string
  language: string
  autoplayMedia: boolean
  showFamilyStatus: boolean
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
]

export default function PreferencesPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "system",
    language: "en",
    autoplayMedia: true,
    showFamilyStatus: true,
  })

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch("/api/user/preferences")
        if (!response.ok) throw new Error("Failed to load preferences")
        const data = await response.json()
        setPreferences({
          theme: data.theme ?? "system",
          language: data.language ?? "en",
          autoplayMedia: data.autoplayMedia ?? true,
          showFamilyStatus: data.showFamilyStatus ?? true,
        })
      } catch (error) {
        console.error("Error loading preferences:", error)
        toast.error("Failed to load preferences")
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
      toast.success("Preferences updated")
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast.error("Failed to save preferences")
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
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize your experience with these settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value) =>
                setPreferences({ ...preferences, theme: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={preferences.language}
              onValueChange={(value) =>
                setPreferences({ ...preferences, language: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Autoplay Media</Label>
              <p className="text-sm text-muted-foreground">
                Automatically play videos and animations
              </p>
            </div>
            <Switch
              checked={preferences.autoplayMedia}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, autoplayMedia: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Family Status</Label>
              <p className="text-sm text-muted-foreground">
                Display your online status to family members
              </p>
            </div>
            <Switch
              checked={preferences.showFamilyStatus}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, showFamilyStatus: checked })
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