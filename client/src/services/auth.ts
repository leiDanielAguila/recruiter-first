import { API_ENDPOINTS } from "@/config/api";
import type {
  AuthResponse,
  FastApiErrorResponse,
  SignInRequest,
  SignUpRequest,
  User,
} from "@/models/auth";

export class AuthApiError extends Error {
  statusCode?: number;
  originalError?: unknown;

  constructor(message: string, statusCode?: number, originalError?: unknown) {
    super(message);
    this.name = "AuthApiError";
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

type AuthTokenHeaderBuilder = (token: string) => string;

const defaultAuthTokenHeaderBuilder: AuthTokenHeaderBuilder = (token: string) =>
  `Bearer ${token}`;

async function parseErrorMessage(response: Response): Promise<string> {
  const fallbackMessage = `Request failed with status ${response.status}`;

  const errorPayload = (await response
    .json()
    .catch(() => null)) as FastApiErrorResponse | null;

  if (!errorPayload?.detail) {
    return fallbackMessage;
  }

  if (typeof errorPayload.detail === "string") {
    return errorPayload.detail;
  }

  if (Array.isArray(errorPayload.detail) && errorPayload.detail.length > 0) {
    return errorPayload.detail
      .map((item) => {
        const location = item.loc?.join(".") || "field";
        return `${location}: ${item.msg}`;
      })
      .join(" | ");
  }

  return fallbackMessage;
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, init);

    if (!response.ok) {
      const message = await parseErrorMessage(response);
      throw new AuthApiError(message, response.status);
    }

    const data = (await response.json()) as T;
    return data;
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }

    throw new AuthApiError(
      "Unable to reach the server. Please check your connection and try again.",
      0,
      error,
    );
  }
}

function normalizeSignUpPayload(payload: SignUpRequest): SignUpRequest {
  return {
    first_name: payload.first_name.trim(),
    last_name: payload.last_name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    confirm_password: payload.confirm_password,
  };
}

function normalizeSignInPayload(payload: SignInRequest): SignInRequest {
  return {
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  };
}

export async function signUp(payload: SignUpRequest): Promise<AuthResponse> {
  return requestJson<AuthResponse>(API_ENDPOINTS.auth.signup, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(normalizeSignUpPayload(payload)),
  });
}

export async function signIn(payload: SignInRequest): Promise<AuthResponse> {
  return requestJson<AuthResponse>(API_ENDPOINTS.auth.signin, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(normalizeSignInPayload(payload)),
  });
}

export async function getMe(
  token: string,
  authTokenHeaderBuilder: AuthTokenHeaderBuilder = defaultAuthTokenHeaderBuilder,
): Promise<User> {
  return requestJson<User>(API_ENDPOINTS.auth.me, {
    method: "GET",
    headers: {
      Authorization: authTokenHeaderBuilder(token),
    },
  });
}
