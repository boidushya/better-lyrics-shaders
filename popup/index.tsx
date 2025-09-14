import React, { useState } from "react";
import "./popup.css";

// Hooks
import { useTabState, useContentScript } from "./hooks";

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
    gradientSettings,
    updateColors,
    updateGradientSettings,
  } = useContentScript();

  const [localGradientSettings, setLocalGradientSettings] = useState<GradientSettings>(gradientSettings);

  // Sync local settings when content script settings change
  React.useEffect(() => {
    setLocalGradientSettings(gradientSettings);
  }, [gradientSettings]);

  const handleColorChange = async (index: number, color: string) => {
    const newColors = [...currentSongColors];
    newColors[index] = color;
    await updateColors(newColors);
  };

  const handleGradientSettingChange = async (key: keyof GradientSettings, value: number) => {
    const newSettings = { ...localGradientSettings, [key]: value };
    setLocalGradientSettings(newSettings);
    await updateGradientSettings(newSettings);
  };

  const handleResetAllGradientSettings = async () => {
    setLocalGradientSettings(defaultSettings);
    await updateGradientSettings(defaultSettings);
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
            settings={localGradientSettings}
            onSettingChange={handleGradientSettingChange}
            onResetAll={handleResetAllGradientSettings}
          />
        )}
      </div>
    </div>
  );
};

export default Popup;