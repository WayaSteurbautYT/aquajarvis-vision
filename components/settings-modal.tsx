"use client";

import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "@geist-ui/icons";
import { useSettings } from "@/app/providers/SettingsProvider";
import { Button } from "./ui/button";

export function SettingsModal() {
  const { settings, updateSettings, isSettingsOpen, closeSettings, isUsingCustomApi } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (isSettingsOpen) {
      setLocalSettings(settings);
    }
  }, [isSettingsOpen, settings]);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    updateSettings(localSettings);
    closeSettings();
  };

  const handleClear = () => {
    setLocalSettings({ apiBaseUrl: "", apiKey: "", model: "gpt-4o" });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeSettings();
    }
  };

  const willUseCustomApi = Boolean(localSettings.apiBaseUrl && localSettings.apiKey);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">API Settings</h2>
          <button
            onClick={closeSettings}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className={`p-3 rounded-xl text-sm ${willUseCustomApi ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"}`}>
            {willUseCustomApi ? (
              <>
                <strong>Custom API mode:</strong> Requests will be sent directly to your API endpoint from your browser.
              </>
            ) : (
              <>
                <strong>Default mode:</strong> Requests are routed through our backend with rate limiting.
              </>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              API Base URL
            </label>
            <input
              type="url"
              value={localSettings.apiBaseUrl}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, apiBaseUrl: e.target.value })
              }
              placeholder="Leave empty to use default backend"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
            />
            <p className="text-xs text-gray-500">
              e.g., https://api.openai.com/v1 or https://openrouter.ai/api/v1
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={localSettings.apiKey}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, apiKey: e.target.value })
                }
                placeholder="sk-..."
                className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Required when using a custom API endpoint
            </p>
          </div>

          {willUseCustomApi && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <input
                type="text"
                value={localSettings.model}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, model: e.target.value })
                }
                placeholder="gpt-4o"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
              />
              <p className="text-xs text-gray-500">
                Model to use for all requests (e.g., gpt-4o, claude-3-5-sonnet)
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
          <Button
            variant="ghost"
            onClick={handleClear}
            className="px-4 py-2 rounded-xl text-gray-500 hover:text-gray-700"
          >
            Clear Settings
          </Button>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={closeSettings}
              className="px-4 py-2 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
