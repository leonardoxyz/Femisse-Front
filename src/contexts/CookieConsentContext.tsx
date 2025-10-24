import React, { createContext, useContext, useEffect, useState } from "react";
import { logger } from "@/utils/logger-unified";

export type OptionalCookieCategory = "preferences" | "analytics" | "marketing";

export interface CookieConsentState {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string | null;
}

interface CookieConsentContextValue {
  consent: CookieConsentState | null;
  isBannerVisible: boolean;
  isPreferencesOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  openPreferences: () => void;
  closePreferences: () => void;
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

const STORAGE_KEY = "feminisse-cookie-consent";

const defaultState: CookieConsentState = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
  updatedAt: null,
};

const loadFromStorage = (): CookieConsentState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentState;
    return {
      ...defaultState,
      ...parsed,
      necessary: true,
      updatedAt: parsed?.updatedAt ?? new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Erro ao carregar consentimento de cookies:", error);
    return null;
  }
};

const saveToStorage = (state: CookieConsentState | null) => {
  try {
    if (!state) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    logger.error("Erro ao salvar consentimento de cookies:", error);
  }
};

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consent, setConsent] = React.useState<CookieConsentState | null>(() => {
    if (typeof window === "undefined") return null;
    return loadFromStorage();
  });
  const [isPreferencesOpen, setIsPreferencesOpen] = React.useState(false);

  const isBannerVisible = !consent;

  const persist = React.useCallback((next: CookieConsentState | null) => {
    setConsent(next);
    saveToStorage(next);
  }, []);

  const acceptAll = React.useCallback(() => {
    const next: CookieConsentState = {
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
      updatedAt: new Date().toISOString(),
    };
    persist(next);
    setIsPreferencesOpen(false);
  }, [persist]);

  const rejectAll = React.useCallback(() => {
    const next: CookieConsentState = {
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false,
      updatedAt: new Date().toISOString(),
    };
    persist(next);
    setIsPreferencesOpen(false);
  }, [persist]);

  const savePreferences = React.useCallback((partial: Pick<CookieConsentState, OptionalCookieCategory>) => {
    const next: CookieConsentState = {
      necessary: true,
      preferences: partial.preferences,
      analytics: partial.analytics,
      marketing: partial.marketing,
      updatedAt: new Date().toISOString(),
    };
    persist(next);
    setIsPreferencesOpen(false);
  }, [persist]);

  const openPreferences = React.useCallback(() => {
    setIsPreferencesOpen(true);
  }, []);

  const closePreferences = React.useCallback(() => {
    setIsPreferencesOpen(false);
  }, []);

  const resetConsent = React.useCallback(() => {
    persist(null);
    setIsPreferencesOpen(false);
  }, [persist]);

  const value = React.useMemo<CookieConsentContextValue>(() => ({
    consent,
    isBannerVisible,
    isPreferencesOpen,
    acceptAll,
    rejectAll,
    savePreferences,
    openPreferences,
    closePreferences,
    resetConsent,
  }), [consent, isBannerVisible, isPreferencesOpen, acceptAll, rejectAll, savePreferences, openPreferences, closePreferences, resetConsent]);

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = React.useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent deve ser usado dentro de CookieConsentProvider");
  }
  return context;
};
