"use client";

export async function authedFetch(
  input: string,
  init: RequestInit = {},
  idToken?: string,
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const token = idToken ?? (await currentIdToken());
  if (token) headers.set("authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers, cache: "no-store" });
}

async function currentIdToken(): Promise<string | undefined> {
  const { getFirebaseAuth } = await import("@/lib/firebase/client");
  const auth = getFirebaseAuth();
  return auth?.currentUser ? auth.currentUser.getIdToken() : undefined;
}

export async function postJson<T>(url: string, body: unknown, idToken?: string): Promise<T> {
  const response = await authedFetch(url, { method: "POST", body: JSON.stringify(body) }, idToken);
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Request failed.");
  return payload;
}

export async function patchJson<T>(url: string, body: unknown, idToken?: string): Promise<T> {
  const response = await authedFetch(url, { method: "PATCH", body: JSON.stringify(body) }, idToken);
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Request failed.");
  return payload;
}
