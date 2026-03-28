import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { UserSettings, UserSettingsPatch } from "@/models/settings";

type DataPrivacySectionProps = {
  settings: UserSettings;
  isSaving: boolean;
  onSave: (patch: UserSettingsPatch) => Promise<void>;
  onOpenDataExport: () => void;
  onOpenDeleteRequest: () => void;
};

export function DataPrivacySection({
  settings,
  isSaving,
  onSave,
  onOpenDataExport,
  onOpenDeleteRequest,
}: DataPrivacySectionProps) {
  const termsAcknowledged = settings.terms.acknowledged;

  const handlePrivacyToggle = async (
    key: keyof UserSettings["privacy"],
    value: boolean,
  ) => {
    await onSave({
      privacy: {
        [key]: value,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data & Privacy</CardTitle>
        <CardDescription>
          Control data collection, recommendations, and sensitive data actions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
            <div className="space-y-1">
              <Label htmlFor="privacy-analytics" className="font-medium">
                Analytics tracking
              </Label>
              <p className="text-sm text-muted-foreground">
                Help improve product quality through anonymous usage analytics.
              </p>
            </div>
            <input
              id="privacy-analytics"
              type="checkbox"
              checked={settings.privacy.analyticsOptIn}
              disabled={isSaving}
              onChange={(event) =>
                void handlePrivacyToggle("analyticsOptIn", event.target.checked)
              }
              className="mt-1 h-4 w-4 rounded border-border"
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
            <div className="space-y-1">
              <Label htmlFor="privacy-recommendations" className="font-medium">
                Personalized recommendations
              </Label>
              <p className="text-sm text-muted-foreground">
                Use your activity data to suggest relevant jobs and templates.
              </p>
            </div>
            <input
              id="privacy-recommendations"
              type="checkbox"
              checked={settings.privacy.personalizedRecommendations}
              disabled={isSaving}
              onChange={(event) =>
                void handlePrivacyToggle(
                  "personalizedRecommendations",
                  event.target.checked,
                )
              }
              className="mt-1 h-4 w-4 rounded border-border"
            />
          </div>
        </div>

        {!termsAcknowledged && (
          <Alert>
            <AlertTitle>Acknowledgement required</AlertTitle>
            <AlertDescription>
              You need to acknowledge the Terms & Conditions in the Legal
              section before exporting or deleting account data.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!termsAcknowledged}
            onClick={onOpenDataExport}
          >
            Export My Data
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!termsAcknowledged}
            onClick={onOpenDeleteRequest}
          >
            Request Account Deletion
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
