import { getSession } from "next-auth/react";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/v1.0/trading-journal/admin";

async function resolveToken(token?: string): Promise<string | undefined> {
  if (token) return token;
  if (typeof window !== "undefined") {
    const session = await getSession();
    return (session as any)?.accessToken;
  }
  return undefined;
}

export async function adminFetch<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const token = await resolveToken(options?.token);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) return null as T;
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

/**
 * Like adminFetch but does NOT force a Content-Type header, so the browser can
 * set the correct multipart boundary for FormData uploads.
 */
export async function adminUpload<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const token = await resolveToken(options?.token);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) return null as T;
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}
