/** Pemba Sherpa — the guide account used by Guide Dashboard */
export const DASHBOARD_GUIDE_ID = 1;

export const GUIDE_AVATAR_STORAGE_KEY = "guide-dashboard-avatar";

export function getGuideAvatarUrl(): string | null {
  try {
    return localStorage.getItem(GUIDE_AVATAR_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setGuideAvatarUrl(url: string | null): void {
  try {
    if (url) localStorage.setItem(GUIDE_AVATAR_STORAGE_KEY, url);
    else localStorage.removeItem(GUIDE_AVATAR_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

export function getAvatarForGuideId(guideId: number): string | null {
  if (guideId !== DASHBOARD_GUIDE_ID) return null;
  return getGuideAvatarUrl();
}
