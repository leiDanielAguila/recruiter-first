import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserSettings, UserSettingsPatch } from "@/models/settings";

type SecuritySectionProps = {
  settings: UserSettings;
  isSaving: boolean;
  onSave: (patch: UserSettingsPatch) => Promise<void>;
};

export function SecuritySection({
  settings,
  isSaving,
  onSave,
}: SecuritySectionProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    settings.security.twoFactorEnabled,
  );
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState<
    30 | 60 | 120
  >(settings.security.sessionTimeoutMinutes);

  useEffect(() => {
    setTwoFactorEnabled(settings.security.twoFactorEnabled);
    setSessionTimeoutMinutes(settings.security.sessionTimeoutMinutes);
  }, [settings]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await onSave({
      security: {
        twoFactorEnabled,
        sessionTimeoutMinutes,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          Update account protections and session controls.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
            <div className="space-y-1">
              <Label htmlFor="settings-2fa" className="font-medium">
                Two-factor authentication
              </Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of account security.
              </p>
            </div>
            <input
              id="settings-2fa"
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={(event) => setTwoFactorEnabled(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-session-timeout">Session timeout</Label>
            <Select
              value={String(sessionTimeoutMinutes)}
              onValueChange={(value: "30" | "60" | "120") =>
                setSessionTimeoutMinutes(Number(value) as 30 | 60 | 120)
              }
            >
              <SelectTrigger id="settings-session-timeout">
                <SelectValue placeholder="Select timeout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="120">120 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isSaving}>
            Save Security Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
