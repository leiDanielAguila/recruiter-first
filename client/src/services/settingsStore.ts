import { create } from "zustand";
import {
  SETTINGS_TERMS_VERSION,
  type UserSettings,
  type UserSettingsPatch,
} from "@/models/settings";
import {
  acknowledgeTerms,
  getSettings,
  SettingsApiError,
  updateSettings,
} from "@/services/settingsService";

type SettingsStore = {
  settings: UserSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  loadSettings: () => Promise<void>;
  saveSettings: (patch: UserSettingsPatch) => Promise<void>;
  setTermsAcknowledgement: (acknowledged: boolean) => Promise<void>;
  clearMessages: () => void;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof SettingsApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while saving your settings.";
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  isLoading: false,
  isSaving: false,
  errorMessage: null,
  successMessage: null,

  loadSettings: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const settings = await getSettings();
      set({ settings, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        errorMessage: getErrorMessage(error),
      });
    }
  },

  saveSettings: async (patch) => {
    set({ isSaving: true, errorMessage: null, successMessage: null });

    try {
      const settings = await updateSettings(patch);
      set({
        settings,
        isSaving: false,
        successMessage: "Settings updated.",
      });
    } catch (error) {
      set({
        isSaving: false,
        errorMessage: getErrorMessage(error),
      });
    }
  },

  setTermsAcknowledgement: async (acknowledged) => {
    set({ isSaving: true, errorMessage: null, successMessage: null });

    try {
      const settings = await acknowledgeTerms({
        version: SETTINGS_TERMS_VERSION,
        acknowledged,
      });

      set({
        settings,
        isSaving: false,
        successMessage: acknowledged
          ? "Terms acknowledged. Sensitive actions are now enabled."
          : "Terms acknowledgement removed.",
      });
    } catch (error) {
      set({
        isSaving: false,
        errorMessage: getErrorMessage(error),
      });
    }
  },

  clearMessages: () => {
    set({ errorMessage: null, successMessage: null });
  },
}));
