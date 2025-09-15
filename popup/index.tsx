import React, { useState } from "react";
import "./popup.css";

// Hooks
import { useTabState, useContentScript, useGradientSettings } from "./hooks";

// Components
import { 
  Header, 
  TabBar, 
  ColorsTab, 
  ControlsTab 
} from "./components";

// Types
import { GradientSettings, defaultSettings } from "./types";

const Popup: React.FC = () => {
  const { activeTab, setActiveTab } = useTabState();
  const {
    colors: currentSongColors,
    songTitle,
    songAuthor,
    updateColors,
    updateGradientSettings,
  } = useContentScript();

  const {
    gradientSettings,
    updateGradientSetting,
    resetGradientSettings,
    exportSettings,
    importSettings,
  } = useGradientSettings();

  const handleColorChange = async (index: number, color: string) => {
    const newColors = [...currentSongColors];
    newColors[index] = color;
    await updateColors(newColors);
  };

  const handleGradientSettingChange = async (key: keyof GradientSettings, value: number) => {
    const newSettings = updateGradientSetting(key, value);
    await updateGradientSettings(newSettings);
  };

  const handleResetAllGradientSettings = async () => {
    const newSettings = await resetGradientSettings();
    await updateGradientSettings(newSettings);
  };

  const handleExportSettings = () => {
    exportSettings();
  };

  const handleImportSettings = async () => {
    const importedSettings = await importSettings();
    if (importedSettings) {
      // Update content script with imported settings
      await updateGradientSettings(importedSettings);
    }
  };

  return (
    <div className="popup-container">
      <Header songTitle={songTitle} songAuthor={songAuthor} />
      
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="content">
        {activeTab === 'colors' && (
          <ColorsTab
            colors={currentSongColors}
            onColorChange={handleColorChange}
          />
        )}

        {activeTab === 'controls' && (
          <ControlsTab
            settings={gradientSettings}
            onSettingChange={handleGradientSettingChange}
            onResetAll={handleResetAllGradientSettings}
            onExport={handleExportSettings}
            onImport={handleImportSettings}
          />
        )}
      </div>
    </div>
  );
};

export default Popup;