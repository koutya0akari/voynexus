const STORAGE_KEY = "voynex_membership_token";
const publicFallback = process.env.NEXT_PUBLIC_MEMBERSHIP_TOKEN ?? null;

export function getMembershipTokenFromStorage(): string | null {
  if (typeof window === "undefined") {
    return publicFallback;
  }
  return localStorage.getItem(STORAGE_KEY) ?? publicFallback;
}

export function saveMembershipToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, token);
  fetch("/api/membership/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  }).catch((error) => console.error("Failed to sync membership cookie", error));
}

export function clearMembershipToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
