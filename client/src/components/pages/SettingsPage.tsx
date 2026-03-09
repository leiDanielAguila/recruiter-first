import { Settings } from 'lucide-react'

export function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8">
      <Settings className="w-16 h-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-semibold text-foreground mb-2">Settings</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Configure your account and application preferences. Coming soon.
      </p>
    </div>
  )
}
