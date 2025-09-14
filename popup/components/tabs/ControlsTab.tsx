import React from 'react';
import { GradientSettings, defaultSettings } from '../../types';
import { ControlSlider } from '../ControlSlider';

interface ControlsTabProps {
  settings: GradientSettings;
  onSettingChange: (key: keyof GradientSettings, value: number) => void;
  onResetAll: () => void;
}

export const ControlsTab: React.FC<ControlsTabProps> = ({
  settings,
  onSettingChange,
  onResetAll,
}) => {
  const handleReset = (key: keyof GradientSettings) => {
    onSettingChange(key, defaultSettings[key]);
  };

  return (
    <div className="tab-content">
      <div className="gradient-controls-section">
        <div className="controls-grid">
          {Object.entries(settings).map(([key, value]) => (
            <ControlSlider
              key={key}
              keyName={key}
              value={value}
              onChange={onSettingChange}
              onReset={handleReset}
            />
          ))}
        </div>
        
        <button onClick={onResetAll} className="reset-button">
          Reset to Default
        </button>
      </div>
    </div>
  );
};