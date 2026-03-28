import { create } from "zustand";
import type {
  AuthResponse,
  SignInRequest,
  SignUpRequest,
  StoredAuthSession,
  User,
} from "@/models/auth";
import { signIn, signUp, getMe } from "@/services/auth";

const AUTH_SESSION_STORAGE_KEY = "rf_auth_session_v1";
const SESSION_TTL_MINUTES = Number(
  import.meta.env.VITE_AUTH_SESSION_TTL_MINUTES || "30",
);
const SESSION_TTL_MS = SESSION_TTL_MINUTES * 60 * 1000;

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthStore = {
  status: AuthStatus;
  initialized: boolean;
  isSubmitting: boolean;
  user: User | null;
  accessToken: string | null;
  tokenType: string | null;
  errorMessage: string | null;
  initializeAuth: () => Promise<void>;
  signInUser: (payload: SignInRequest) => Promise<void>;
  signUpUser: (payload: SignUpRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

function hasStorage(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function persistSession(session: StoredAuthSession): void {
  if (!hasStorage()) {
    return;
  }

  localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function readSession(): StoredAuthSession | null {
  if (!hasStorage()) {
    return null;
  }

  const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredAuthSession;
    if (!parsed.accessToken || !parsed.tokenType || !parsed.expiresAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function clearPersistedSession(): void {
  if (!hasStorage()) {
    return;
  }

  localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

function isSessionExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

function createStoredSession(response: AuthResponse): StoredAuthSession {
  return {
    accessToken: response.access_token,
    tokenType: response.token_type,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
}

export const useAuthStore = create<AuthStore>((set) => ({
  status: "loading",
  initialized: false,
  isSubmitting: false,
  user: null,
  accessToken: null,
  tokenType: null,
  errorMessage: null,

  initializeAuth: async () => {
    const existingSession = readSession();

    if (!existingSession || isSessionExpired(existingSession.expiresAt)) {
      clearPersistedSession();
      set({
        status: "unauthenticated",
        initialized: true,
        user: null,
        accessToken: null,
        tokenType: null,
      });
      return;
    }

    set({ status: "loading" });

    try {
      const user = await getMe(existingSession.accessToken);
      set({
        status: "authenticated",
        initialized: true,
        user,
        accessToken: existingSession.accessToken,
        tokenType: existingSession.tokenType,
      });
    } catch {
      clearPersistedSession();
      set({
        status: "unauthenticated",
        initialized: true,
        user: null,
        accessToken: null,
        tokenType: null,
      });
    }
  },

  signInUser: async (payload) => {
    set({ isSubmitting: true, errorMessage: null });

    try {
      const response = await signIn(payload);
      const session = createStoredSession(response);
      persistSession(session);

      set({
        status: "authenticated",
        initialized: true,
        isSubmitting: false,
        user: response.user,
        accessToken: response.access_token,
        tokenType: response.token_type,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to sign in right now. Please try again.";

      set({
        isSubmitting: false,
        errorMessage: message,
      });

      throw error;
    }
  },

  signUpUser: async (payload) => {
    set({ isSubmitting: true, errorMessage: null });

    try {
      const response = await signUp(payload);
      const session = createStoredSession(response);
      persistSession(session);

      set({
        status: "authenticated",
        initialized: true,
        isSubmitting: false,
        user: response.user,
        accessToken: response.access_token,
        tokenType: response.token_type,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create your account right now. Please try again.";

      set({
        isSubmitting: false,
        errorMessage: message,
      });

      throw error;
    }
  },

  logout: () => {
    clearPersistedSession();
    set({
      status: "unauthenticated",
      initialized: true,
      user: null,
      accessToken: null,
      tokenType: null,
      errorMessage: null,
    });
  },

  clearError: () => set({ errorMessage: null }),
}));
