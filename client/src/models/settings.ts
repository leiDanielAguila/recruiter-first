export type ThemePreference = "system" | "light" | "dark";

export type DensityPreference = "comfortable" | "compact";

export type LanguagePreference = "en";

export type SettingsProfile = {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  timezone: string;
  language: LanguagePreference;
};

export type NotificationPreferences = {
  emailDigest: boolean;
  productUpdates: boolean;
  jobReminders: boolean;
  securityAlerts: boolean;
};

export type AppearancePreferences = {
  theme: ThemePreference;
  density: DensityPreference;
};

export type SecurityPreferences = {
  twoFactorEnabled: boolean;
  sessionTimeoutMinutes: 30 | 60 | 120;
};

export type PrivacyPreferences = {
  analyticsOptIn: boolean;
  personalizedRecommendations: boolean;
};

export type TermsAcknowledgement = {
  acknowledged: boolean;
  acknowledgedAt: string | null;
  version: string;
};

export type UserSettings = {
  profile: SettingsProfile;
  notifications: NotificationPreferences;
  appearance: AppearancePreferences;
  security: SecurityPreferences;
  privacy: PrivacyPreferences;
  terms: TermsAcknowledgement;
};

export type UserSettingsPatch = Partial<{
  profile: Partial<SettingsProfile>;
  notifications: Partial<NotificationPreferences>;
  appearance: Partial<AppearancePreferences>;
  security: Partial<SecurityPreferences>;
  privacy: Partial<PrivacyPreferences>;
  terms: Partial<TermsAcknowledgement>;
}>;

export type AckTermsPayload = {
  version: string;
  acknowledged: boolean;
};

export const SETTINGS_TERMS_VERSION = "2026-03-29";

export const DEFAULT_USER_SETTINGS: UserSettings = {
  profile: {
    firstName: "",
    lastName: "",
    email: "",
    headline: "",
    timezone: "UTC",
    language: "en",
  },
  notifications: {
    emailDigest: true,
    productUpdates: true,
    jobReminders: true,
    securityAlerts: true,
  },
  appearance: {
    theme: "system",
    density: "comfortable",
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeoutMinutes: 60,
  },
  privacy: {
    analyticsOptIn: true,
    personalizedRecommendations: true,
  },
  terms: {
    acknowledged: false,
    acknowledgedAt: null,
    version: SETTINGS_TERMS_VERSION,
  },
};
