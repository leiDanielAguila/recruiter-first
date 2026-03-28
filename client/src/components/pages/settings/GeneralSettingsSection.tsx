import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserSettings, UserSettingsPatch } from "@/models/settings";

type GeneralSettingsSectionProps = {
  settings: UserSettings;
  isSaving: boolean;
  onSave: (patch: UserSettingsPatch) => Promise<void>;
};

type GeneralForm = {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  timezone: string;
  language: "en";
};

function toForm(settings: UserSettings): GeneralForm {
  return {
    firstName: settings.profile.firstName,
    lastName: settings.profile.lastName,
    email: settings.profile.email,
    headline: settings.profile.headline,
    timezone: settings.profile.timezone,
    language: settings.profile.language,
  };
}

export function GeneralSettingsSection({
  settings,
  isSaving,
  onSave,
}: GeneralSettingsSectionProps) {
  const [form, setForm] = useState<GeneralForm>(() => toForm(settings));

  useEffect(() => {
    setForm(toForm(settings));
  }, [settings]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await onSave({
      profile: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        headline: form.headline.trim(),
        timezone: form.timezone,
        language: form.language,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>
          Manage your profile identity and basic defaults.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-first-name">First Name</Label>
              <Input
                id="settings-first-name"
                value={form.firstName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
                placeholder="Jane"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-last-name">Last Name</Label>
              <Input
                id="settings-last-name"
                value={form.lastName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
                placeholder="Smith"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input
              id="settings-email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-headline">Professional Headline</Label>
            <Input
              id="settings-headline"
              value={form.headline}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  headline: event.target.value,
                }))
              }
              placeholder="Senior Frontend Engineer"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-timezone">Timezone</Label>
              <Select
                value={form.timezone}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, timezone: value }))
                }
              >
                <SelectTrigger id="settings-timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">
                    America/New_York
                  </SelectItem>
                  <SelectItem value="America/Los_Angeles">
                    America/Los_Angeles
                  </SelectItem>
                  <SelectItem value="Asia/Manila">Asia/Manila</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-language">Language</Label>
              <Select
                value={form.language}
                onValueChange={(value: "en") =>
                  setForm((current) => ({ ...current, language: value }))
                }
              >
                <SelectTrigger id="settings-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={isSaving}>
            Save General Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
