import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_GRADIENT_SETTINGS,
  GRADIENT_SETTINGS_STORAGE_KEY,
  type GradientSettings,
} from "../../shared/constants/gradientSettings";

const storage = new Storage();

export const useGradientSettings = () => {
  const [storedSettings, setStoredSettings] = useStorage<GradientSettings>(
    {
      key: GRADIENT_SETTINGS_STORAGE_KEY,
      instance: storage,
    },
    DEFAULT_GRADIENT_SETTINGS
  );

  // Local state for immediate UI updates
  const [localSettings, setLocalSettings] = useState<GradientSettings>(storedSettings);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Sync local state when stored settings change (on mount or external changes)
  useEffect(() => {
    setLocalSettings(storedSettings);
  }, [storedSettings]);

  // Update local state immediately, debounce storage write
  const updateGradientSetting = useCallback(
    (key: keyof GradientSettings, value: number) => {
      const newSettings = { ...localSettings, [key]: value };

      // Update UI immediately
      setLocalSettings(newSettings);

      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Debounce storage write for 300ms
      debounceRef.current = setTimeout(async () => {
        await setStoredSettings(newSettings);
      }, 300);

      return newSettings;
    },
    [localSettings, setStoredSettings]
  );

  const resetGradientSettings = async () => {
    // Clear any pending debounced updates
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Update both local and stored settings immediately
    setLocalSettings(DEFAULT_GRADIENT_SETTINGS);
    await setStoredSettings(DEFAULT_GRADIENT_SETTINGS);
    return DEFAULT_GRADIENT_SETTINGS;
  };

  return {
    gradientSettings: localSettings,
    setGradientSettings: setStoredSettings,
    updateGradientSetting,
    resetGradientSettings,
  };
};
