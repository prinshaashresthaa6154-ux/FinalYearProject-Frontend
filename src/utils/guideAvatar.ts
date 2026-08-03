/** Pemba Sherpa — the guide account used by Guide Dashboard */
export const DASHBOARD_GUIDE_ID = 1;

<<<<<<< HEAD
export const GUIDE_AVATAR_STORAGE_KEY = "guide-dashboard-avatar";
=======
export const GUIDE_AVATAR_STORAGE_KEY = 'guide-dashboard-avatar';
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb

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
