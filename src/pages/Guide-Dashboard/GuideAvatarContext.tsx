<<<<<<< HEAD
import { createContext, useContext, useState, type ReactNode } from "react";
import {
  getGuideAvatarUrl,
  setGuideAvatarUrl as persistGuideAvatarUrl,
} from "../../utils/guideAvatar";
=======
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import {
  getGuideAvatarUrl,
  setGuideAvatarUrl as persistGuideAvatarUrl,
} from '../../utils/guideAvatar';
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb

interface GuideAvatarContextValue {
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
}

const GuideAvatarContext = createContext<GuideAvatarContextValue | null>(null);

export function GuideAvatarProvider({ children }: { children: ReactNode }) {
  const [avatarUrl, setAvatarUrlState] = useState<string | null>(() =>
    getGuideAvatarUrl(),
  );

  const setAvatarUrl = (url: string | null) => {
    setAvatarUrlState(url);
    persistGuideAvatarUrl(url);
  };

  return (
    <GuideAvatarContext.Provider value={{ avatarUrl, setAvatarUrl }}>
      {children}
    </GuideAvatarContext.Provider>
  );
}

export function useGuideAvatar() {
  const ctx = useContext(GuideAvatarContext);
  if (!ctx) {
<<<<<<< HEAD
    throw new Error("useGuideAvatar must be used within GuideAvatarProvider");
=======
    throw new Error('useGuideAvatar must be used within GuideAvatarProvider');
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
  }
  return ctx;
}

/** Safe for public pages — returns null if provider is missing */
export function useGuideAvatarOptional() {
  return useContext(GuideAvatarContext);
}
