import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/v1.0/trading-journal/admin";

// Refresh the access token by calling the backend /auth/refresh endpoint.
// Returns the new tokens, or null if the refresh failed (user must re-login).
async function refreshAccessToken(
  refreshToken: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
} | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return {
      accessToken: data.token,
      refreshToken: data.refreshToken,
      // `expiresIn` is in seconds; convert to absolute ms timestamp.
      accessTokenExpires: Date.now() + (data.expiresIn ?? 900) * 1000,
    };
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            console.error("Login failed:", res.status, body);
            return null;
          }

          const data = await res.json();
          if (!data?.token || !data?.user?.id) {
            console.error("Login response missing token/user");
            return null;
          }

          const expiresIn =
            typeof data.expiresIn === "number" && data.expiresIn > 0
              ? data.expiresIn
              : 900;

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            token: data.token,
            refreshToken: data.refreshToken ?? "",
            expiresIn,
          } as any;
        } catch (err) {
          console.error("Login request error:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // First sign-in: persist tokens + absolute expiry timestamp.
      if (user) {
        const raw = Number((user as any).expiresIn);
        const expiresIn = Number.isFinite(raw) && raw > 0 ? raw : 900;
        token.accessToken = (user as any).token;
        token.refreshToken = (user as any).refreshToken || undefined;
        token.accessTokenExpires = Date.now() + expiresIn * 1000;
        token.id = (user as any).id;
        return token;
      }

      // Access token still valid (15s leeway) -> return as-is.
      if (Date.now() < (Number(token.accessTokenExpires) || 0) - 15_000) {
        return token;
      }

      // Access token expired -> try to refresh.
      if (!token.refreshToken) {
        return { ...token, accessToken: undefined, error: "RefreshTokenMissing" } as any;
      }

      const refreshed = await refreshAccessToken(token.refreshToken as string);
      if (!refreshed) {
        // Refresh failed: clear tokens so the user is forced to re-login.
        return {
          ...token,
          accessToken: undefined,
          refreshToken: undefined,
          error: "RefreshAccessTokenError",
        } as any;
      }

      token.accessToken = refreshed.accessToken;
      token.refreshToken = refreshed.refreshToken;
      token.accessTokenExpires = refreshed.accessTokenExpires;
      token.error = undefined;
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session.user as any).id = token.id;
      (session as any).error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
