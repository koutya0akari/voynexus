const STORAGE_KEY = "voynezus_membership_token";
const DEBUG_ENABLED = process.env.NEXT_PUBLIC_MEMBERSHIP_DEBUG === "1";

export function getMembershipTokenFromStorage(): string | null {
  if (!DEBUG_ENABLED || typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(STORAGE_KEY);
}

export function saveMembershipToken(token: string) {
  if (!DEBUG_ENABLED || typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, token);
  fetch("/api/membership/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  }).catch((error) => console.error("Failed to sync membership cookie", error));
}

export function clearMembershipToken() {
  if (!DEBUG_ENABLED || typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
