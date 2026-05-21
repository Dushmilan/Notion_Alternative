export interface GoogleToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

let currentToken: GoogleToken | null = null;

export function setToken(token: GoogleToken): void {
  currentToken = token;
}

export function getToken(): GoogleToken | null {
  return currentToken;
}

export function clearToken(): void {
  currentToken = null;
}
