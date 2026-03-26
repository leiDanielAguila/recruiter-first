export type SignUpRequest = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type FastApiValidationError = {
  loc: Array<string | number>;
  msg: string;
  type: string;
};

export type FastApiErrorResponse = {
  detail?: string | FastApiValidationError[];
};

export type AuthProvider = "local" | "auth0";

export type StoredAuthSession = {
  accessToken: string;
  tokenType: string;
  expiresAt: number;
};
