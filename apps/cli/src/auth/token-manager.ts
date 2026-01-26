import Conf from "conf";

interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

interface ConfigSchema {
  tokens?: Tokens;
}

class TokenManager {
  private config: Conf<ConfigSchema>;

  constructor() {
    this.config = new Conf<ConfigSchema>({
      projectName: "codemeant",
      schema: {
        tokens: {
          type: "object",
          properties: {
            access_token: { type: "string" },
            refresh_token: { type: "string" },
            expires_at: { type: "number" },
          },
        },
      },
    });
  }

  saveTokens(tokens: { access_token: string; refresh_token: string; expires_in?: number }): void {
    const expires_at = tokens.expires_in
      ? Date.now() + tokens.expires_in * 1000
      : undefined;

    this.config.set("tokens", {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at,
    });
  }

  getTokens(): Tokens | undefined {
    return this.config.get("tokens");
  }

  clearTokens(): void {
    this.config.delete("tokens");
  }

  isLoggedIn(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return false;

    // 만료 확인
    if (tokens.expires_at && Date.now() > tokens.expires_at) {
      return false;
    }

    return true;
  }
}

let tokenManager: TokenManager | null = null;

export function getTokenManager(): TokenManager {
  if (!tokenManager) {
    tokenManager = new TokenManager();
  }
  return tokenManager;
}
