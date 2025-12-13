"use client";

import { createContext, ReactNode, useContext, useState, useEffect } from "react";

const SETTINGS_STORAGE_KEY = "screen-vision-settings";

export interface ApiSettings {
  apiBaseUrl: string;
  apiKey: string;
  model: string;
}

const DEFAULT_SETTINGS: ApiSettings = {
  apiBaseUrl: "",
  apiKey: "",
  model: "gpt-4o",
};

export interface SettingsContextType {
  settings: ApiSettings;
  updateSettings: (newSettings: Partial<ApiSettings>) => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  isUsingCustomApi: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ApiSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isInitialized]);

  const updateSettings = (newSettings: Partial<ApiSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const isUsingCustomApi = Boolean(settings.apiBaseUrl && settings.apiKey);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        isSettingsOpen,
        openSettings,
        closeSettings,
        isUsingCustomApi,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
