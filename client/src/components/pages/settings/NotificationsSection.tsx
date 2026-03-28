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
import type { UserSettings, UserSettingsPatch } from "@/models/settings";

type NotificationsSectionProps = {
  settings: UserSettings;
  isSaving: boolean;
  onSave: (patch: UserSettingsPatch) => Promise<void>;
};

type NotificationOption = {
  key: keyof UserSettings["notifications"];
  label: string;
  description: string;
};

const options: NotificationOption[] = [
  {
    key: "emailDigest",
    label: "Weekly email digest",
    description: "Receive a summary of your activity each week.",
  },
  {
    key: "productUpdates",
    label: "Product updates",
    description: "Get notified when new features are released.",
  },
  {
    key: "jobReminders",
    label: "Job reminders",
    description: "Receive reminders to follow up on pending applications.",
  },
  {
    key: "securityAlerts",
    label: "Security alerts",
    description: "Receive alerts for suspicious account activity.",
  },
];

export function NotificationsSection({
  settings,
  isSaving,
  onSave,
}: NotificationsSectionProps) {
  const [notifications, setNotifications] = useState(settings.notifications);

  useEffect(() => {
    setNotifications(settings.notifications);
  }, [settings]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await onSave({
      notifications,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose which updates you receive from Recruiter First.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {options.map((option) => {
              const id = `notification-${option.key}`;

              return (
                <div
                  key={option.key}
                  className="flex items-start justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <Label htmlFor={id} className="font-medium">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                  <input
                    id={id}
                    type="checkbox"
                    checked={notifications[option.key]}
                    onChange={(event) =>
                      setNotifications((current) => ({
                        ...current,
                        [option.key]: event.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 rounded border-border"
                  />
                </div>
              );
            })}
          </div>

          <Button type="submit" disabled={isSaving}>
            Save Notification Preferences
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
