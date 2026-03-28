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
import type {
  DensityPreference,
  ThemePreference,
  UserSettings,
  UserSettingsPatch,
} from "@/models/settings";

type AppearanceSectionProps = {
  settings: UserSettings;
  isSaving: boolean;
  onSave: (patch: UserSettingsPatch) => Promise<void>;
};

export function AppearanceSection({
  settings,
  isSaving,
  onSave,
}: AppearanceSectionProps) {
  const [theme, setTheme] = useState<ThemePreference>(
    settings.appearance.theme,
  );
  const [density, setDensity] = useState<DensityPreference>(
    settings.appearance.density,
  );

  useEffect(() => {
    setTheme(settings.appearance.theme);
    setDensity(settings.appearance.density);
  }, [settings]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await onSave({
      appearance: {
        theme,
        density,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Control how your workspace looks and feels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-theme">Theme</Label>
              <Select
                value={theme}
                onValueChange={(value: ThemePreference) => setTheme(value)}
              >
                <SelectTrigger id="settings-theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-density">Density</Label>
              <Select
                value={density}
                onValueChange={(value: DensityPreference) => setDensity(value)}
              >
                <SelectTrigger id="settings-density">
                  <SelectValue placeholder="Select density" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={isSaving}>
            Save Appearance
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
