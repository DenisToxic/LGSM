"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    systemName: "Game Server Management System",
    timezone: "utc",
    maintenanceMode: false,
    autoUpdates: true,
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: true,
    sessionTimeout: 30,
    passwordPolicy: "strong",
    ipRestriction: false,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    serverDown: true,
    highLoad: true,
    updates: true,
    security: true,
    email: "admin@example.com",
  })

  const [backupSettings, setBackupSettings] = useState({
    autoBackups: true,
    frequency: "daily",
    retention: 30,
    location: "local",
  })

  const [apiSettings, setApiSettings] = useState({
    enabled: true,
    apiKey: "sk_live_51NXxXXXXXXXXXXXXXXXXXXXX",
    rateLimit: 60,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const handleSaveSettings = (settingsType: string) => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Settings saved",
        description: `${settingsType} settings have been updated successfully.`,
      })
    }, 1000)
  }

  const handleRegenerateApiKey = () => {
    // Generate a random API key
    const newApiKey = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    setApiSettings({ ...apiSettings, apiKey: newApiKey })

    toast({
      title: "API Key regenerated",
      description: "Your new API key has been generated. Make sure to update your applications.",
    })
  }

  if (isLoading || !user) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-name">System Name</Label>
                <Input
                  id="system-name"
                  value={generalSettings.systemName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, systemName: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  This name will be displayed in the browser title and emails
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="default-timezone">Default Timezone</Label>
                <Select
                  value={generalSettings.timezone}
                  onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                >
                  <SelectTrigger id="default-timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    <SelectItem value="cst">Central Time (CST)</SelectItem>
                    <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                    <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <Switch
                    id="maintenance-mode"
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">When enabled, only administrators can access the system</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-updates">Automatic Updates</Label>
                  <Switch
                    id="auto-updates"
                    checked={generalSettings.autoUpdates}
                    onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, autoUpdates: checked })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically update game servers when new versions are available
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("General")} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <Switch
                    id="two-factor"
                    checked={securitySettings.twoFactor}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactor: checked })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Require two-factor authentication for all administrator accounts
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, sessionTimeout: Number.parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Automatically log out users after this period of inactivity
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="password-policy">Password Policy</Label>
                <Select
                  value={securitySettings.passwordPolicy}
                  onValueChange={(value) => setSecuritySettings({ ...securitySettings, passwordPolicy: value })}
                >
                  <SelectTrigger id="password-policy">
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                    <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                    <SelectItem value="strong">Strong (8+ chars, mixed case, numbers, symbols)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ip-restriction">IP Restriction</Label>
                  <Switch
                    id="ip-restriction"
                    checked={securitySettings.ipRestriction}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, ipRestriction: checked })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Security")} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-server-down" className="text-sm">
                      Server Down Alerts
                    </Label>
                    <Switch
                      id="notify-server-down"
                      checked={notificationSettings.serverDown}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, serverDown: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-high-load" className="text-sm">
                      High Load Alerts
                    </Label>
                    <Switch
                      id="notify-high-load"
                      checked={notificationSettings.highLoad}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, highLoad: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-updates" className="text-sm">
                      Update Notifications
                    </Label>
                    <Switch
                      id="notify-updates"
                      checked={notificationSettings.updates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, updates: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-security" className="text-sm">
                      Security Alerts
                    </Label>
                    <Switch
                      id="notify-security"
                      checked={notificationSettings.security}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, security: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input
                  id="notification-email"
                  type="email"
                  value={notificationSettings.email}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, email: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">Email address to receive system notifications</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Notification")} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup Settings</CardTitle>
              <CardDescription>Configure automated backup settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-backups">Automatic Backups</Label>
                  <Switch
                    id="auto-backups"
                    checked={backupSettings.autoBackups}
                    onCheckedChange={(checked) => setBackupSettings({ ...backupSettings, autoBackups: checked })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Automatically backup server data on a schedule</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Select
                  value={backupSettings.frequency}
                  onValueChange={(value) => setBackupSettings({ ...backupSettings, frequency: value })}
                >
                  <SelectTrigger id="backup-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="backup-retention">Backup Retention (days)</Label>
                <Input
                  id="backup-retention"
                  type="number"
                  value={backupSettings.retention}
                  onChange={(e) =>
                    setBackupSettings({ ...backupSettings, retention: Number.parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Number of days to keep backups before automatic deletion
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="backup-location">Backup Storage Location</Label>
                <Select
                  value={backupSettings.location}
                  onValueChange={(value) => setBackupSettings({ ...backupSettings, location: value })}
                >
                  <SelectTrigger id="backup-location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Storage</SelectItem>
                    <SelectItem value="s3">Amazon S3</SelectItem>
                    <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                    <SelectItem value="azure">Azure Blob Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Backup")} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>Configure API access and keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="api-enabled">Enable API</Label>
                  <Switch
                    id="api-enabled"
                    checked={apiSettings.enabled}
                    onCheckedChange={(checked) => setApiSettings({ ...apiSettings, enabled: checked })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Allow external applications to access the system via API
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="api-key"
                    value={apiSettings.apiKey}
                    type="password"
                    onChange={(e) => setApiSettings({ ...apiSettings, apiKey: e.target.value })}
                  />
                  <Button variant="outline" onClick={handleRegenerateApiKey}>
                    Regenerate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep this key secret. It provides full access to your system.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="rate-limit">Rate Limit (requests per minute)</Label>
                <Input
                  id="rate-limit"
                  type="number"
                  value={apiSettings.rateLimit}
                  onChange={(e) => setApiSettings({ ...apiSettings, rateLimit: Number.parseInt(e.target.value) || 0 })}
                />
                <p className="text-sm text-muted-foreground">Maximum number of API requests allowed per minute</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("API")} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
