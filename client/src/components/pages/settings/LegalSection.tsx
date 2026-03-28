import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { UserSettings } from "@/models/settings";

type LegalSectionProps = {
  settings: UserSettings;
  isSaving: boolean;
  onAcknowledge: (value: boolean) => Promise<void>;
};

export function LegalSection({
  settings,
  isSaving,
  onAcknowledge,
}: LegalSectionProps) {
  const termsAcknowledged = settings.terms.acknowledged;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legal</CardTitle>
        <CardDescription>
          Review Terms & Conditions and manage your acknowledgement status.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={termsAcknowledged ? "default" : "secondary"}>
            {termsAcknowledged ? "Acknowledged" : "Not Acknowledged"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Terms version: {settings.terms.version}
          </span>
        </div>

        <div className="rounded-lg border p-3 space-y-2">
          <Label htmlFor="terms-ack" className="font-medium">
            Enable acknowledgement gate for sensitive actions
          </Label>
          <p className="text-sm text-muted-foreground">
            Sensitive data actions (export/delete) are enabled only after you
            acknowledge the Terms & Conditions.
          </p>
          <div className="flex items-center gap-3">
            <input
              id="terms-ack"
              type="checkbox"
              checked={termsAcknowledged}
              onChange={(event) => void onAcknowledge(event.target.checked)}
              disabled={isSaving}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm">
              I acknowledge the Terms & Conditions
            </span>
          </div>
          {settings.terms.acknowledgedAt && (
            <p className="text-xs text-muted-foreground">
              Acknowledged on{" "}
              {new Date(settings.terms.acknowledgedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/dashboard/terms">View Terms (Dashboard)</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/terms">View Terms (Public)</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
