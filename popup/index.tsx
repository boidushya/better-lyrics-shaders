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
          />
        )}
      </div>
    </div>
  );
};

export default Popup;