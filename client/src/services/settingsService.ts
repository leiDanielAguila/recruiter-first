import { API_ENDPOINTS } from "@/config/api";
import {
  DEFAULT_USER_SETTINGS,
  SETTINGS_TERMS_VERSION,
  type AckTermsPayload,
  type UserSettings,
  type UserSettingsPatch,
} from "@/models/settings";

const AUTH_SESSION_STORAGE_KEY = "rf_auth_session_v1";
const SETTINGS_STORAGE_KEY = "rf_user_settings_v1";
const USE_LOCAL_SETTINGS_ADAPTER =
  import.meta.env.VITE_SETTINGS_USE_LOCAL_ADAPTER !== "false";

export class SettingsApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "SettingsApiError";
    this.statusCode = statusCode;
  }
}

type SettingsAdapter = {
  getSettings: () => Promise<UserSettings>;
  updateSettings: (patch: UserSettingsPatch) => Promise<UserSettings>;
  acknowledgeTerms: (payload: AckTermsPayload) => Promise<UserSettings>;
};

function mergeSettings(
  currentSettings: UserSettings,
  patch: UserSettingsPatch,
): UserSettings {
  return {
    profile: {
      ...currentSettings.profile,
      ...patch.profile,
    },
    notifications: {
      ...currentSettings.notifications,
      ...patch.notifications,
    },
    appearance: {
      ...currentSettings.appearance,
      ...patch.appearance,
    },
    security: {
      ...currentSettings.security,
      ...patch.security,
    },
    privacy: {
      ...currentSettings.privacy,
      ...patch.privacy,
    },
    terms: {
      ...currentSettings.terms,
      ...patch.terms,
      version: patch.terms?.version || currentSettings.terms.version,
    },
  };
}

function readStoredSettings(): UserSettings {
  const persisted = localStorage.getItem(SETTINGS_STORAGE_KEY);

  if (!persisted) {
    return {
      ...DEFAULT_USER_SETTINGS,
      terms: {
        ...DEFAULT_USER_SETTINGS.terms,
        version: SETTINGS_TERMS_VERSION,
      },
    };
  }

  try {
    const parsed = JSON.parse(persisted) as UserSettings;
    return mergeSettings(DEFAULT_USER_SETTINGS, parsed);
  } catch {
    return {
      ...DEFAULT_USER_SETTINGS,
      terms: {
        ...DEFAULT_USER_SETTINGS.terms,
        version: SETTINGS_TERMS_VERSION,
      },
    };
  }
}

function writeStoredSettings(settings: UserSettings): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function getAccessToken(): string {
  const storedSession = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!storedSession) {
    throw new SettingsApiError("Please sign in to continue.", 401);
  }

  try {
    const parsed = JSON.parse(storedSession) as { accessToken?: string };

    if (!parsed.accessToken) {
      throw new SettingsApiError("Please sign in to continue.", 401);
    }

    return parsed.accessToken;
  } catch {
    throw new SettingsApiError("Please sign in to continue.", 401);
  }
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const accessToken = getAccessToken();

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new SettingsApiError(
      payload?.detail || "Unable to update settings right now.",
      response.status,
    );
  }

  return (await response.json()) as T;
}

const localStorageAdapter: SettingsAdapter = {
  async getSettings() {
    return readStoredSettings();
  },

  async updateSettings(patch) {
    const next = mergeSettings(readStoredSettings(), patch);
    writeStoredSettings(next);
    return next;
  },

  async acknowledgeTerms(payload) {
    const current = readStoredSettings();
    const next = mergeSettings(current, {
      terms: {
        acknowledged: payload.acknowledged,
        acknowledgedAt: payload.acknowledged ? new Date().toISOString() : null,
        version: payload.version,
      },
    });

    writeStoredSettings(next);
    return next;
  },
};

const apiAdapter: SettingsAdapter = {
  async getSettings() {
    return requestJson<UserSettings>(API_ENDPOINTS.settings.get, {
      method: "GET",
    });
  },

  async updateSettings(patch) {
    return requestJson<UserSettings>(API_ENDPOINTS.settings.update, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  async acknowledgeTerms(payload) {
    return requestJson<UserSettings>(API_ENDPOINTS.settings.acknowledgeTerms, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

function resolveAdapter(): SettingsAdapter {
  return USE_LOCAL_SETTINGS_ADAPTER ? localStorageAdapter : apiAdapter;
}

export async function getSettings(): Promise<UserSettings> {
  return resolveAdapter().getSettings();
}

export async function updateSettings(
  patch: UserSettingsPatch,
): Promise<UserSettings> {
  return resolveAdapter().updateSettings(patch);
}

export async function acknowledgeTerms(
  payload: AckTermsPayload,
): Promise<UserSettings> {
  return resolveAdapter().acknowledgeTerms(payload);
}
