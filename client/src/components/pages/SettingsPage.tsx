import { useEffect, useState } from "react";
import { AlertCircle, CircleCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/services/settingsStore";
import {
  AppearanceSection,
  DataPrivacySection,
  GeneralSettingsSection,
  LegalSection,
  NotificationsSection,
  SecuritySection,
} from "@/components/pages/settings";

export function SettingsPage() {
  const settings = useSettingsStore((state) => state.settings);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const isSaving = useSettingsStore((state) => state.isSaving);
  const errorMessage = useSettingsStore((state) => state.errorMessage);
  const successMessage = useSettingsStore((state) => state.successMessage);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const saveSettings = useSettingsStore((state) => state.saveSettings);
  const setTermsAcknowledgement = useSettingsStore(
    (state) => state.setTermsAcknowledgement,
  );
  const clearMessages = useSettingsStore((state) => state.clearMessages);

  const [isExportDialogOpen, setExportDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!settings) {
      void loadSettings();
    }
  }, [settings, loadSettings]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      clearMessages();
    }, 2500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [successMessage, clearMessages]);

  if (isLoading && !settings) {
    return (
      <div className="flex min-h-full items-center justify-center p-8 text-muted-foreground">
        Loading your settings...
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-3 p-8">
        <p className="text-muted-foreground text-center max-w-md">
          We couldn't load your settings right now. Please refresh and try
          again.
        </p>
        <Button onClick={() => void loadSettings()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your workspace preferences and account controls.
          </p>
        </div>
        <Badge variant="outline">API-ready scaffolding enabled</Badge>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <CircleCheck className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <GeneralSettingsSection
        settings={settings}
        isSaving={isSaving}
        onSave={saveSettings}
      />

      <NotificationsSection
        settings={settings}
        isSaving={isSaving}
        onSave={saveSettings}
      />

      <AppearanceSection
        settings={settings}
        isSaving={isSaving}
        onSave={saveSettings}
      />

      <SecuritySection
        settings={settings}
        isSaving={isSaving}
        onSave={saveSettings}
      />

      <DataPrivacySection
        settings={settings}
        isSaving={isSaving}
        onSave={saveSettings}
        onOpenDataExport={() => setExportDialogOpen(true)}
        onOpenDeleteRequest={() => setDeleteDialogOpen(true)}
      />

      <LegalSection
        settings={settings}
        isSaving={isSaving}
        onAcknowledge={setTermsAcknowledgement}
      />

      <Dialog open={isExportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export account data</DialogTitle>
            <DialogDescription>
              Backend API integration for data export will be connected in the
              next server implementation phase.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request account deletion</DialogTitle>
            <DialogDescription>
              Deletion workflows are gated and API-ready. Final submission will
              be enabled once backend endpoints are live.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
