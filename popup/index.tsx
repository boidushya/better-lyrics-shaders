import React, { useEffect, useState } from "react";
import "./popup.css";

const hslToHex = (hsl: string): string => {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return "#ffffff";

  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);

  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToHsl = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number = 0,
    s: number;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

const Popup: React.FC = () => {
  const [currentSongColors, setCurrentSongColors] = useState<string[]>([]);
  const [songTitle, setSongTitle] = useState<string>("");

  useEffect(() => {
    const loadCurrentColors = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          const response = await chrome.tabs.sendMessage(tab.id, { action: "getCurrentColors" });
          if (response && response.colors) {
            setCurrentSongColors(response.colors);
          }
          if (response && response.songTitle) {
            setSongTitle(response.songTitle);
          }
        }
      } catch (error) {
        console.error("Error loading current colors:", error);
      }
    };

    loadCurrentColors();
    const interval = setInterval(loadCurrentColors, 2000);
    return () => clearInterval(interval);
  }, []);

  const sendColorsToContent = async (colors: string[]) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          action: "updateColors",
          colors: colors,
        });
      }
    } catch (error) {
      console.error("Error sending colors to content script:", error);
    }
  };

  const updateCurrentColor = async (index: number, color: string) => {
    const newColors = [...currentSongColors];
    newColors[index] = color;
    setCurrentSongColors(newColors);
    await sendColorsToContent(newColors);
  };

  return (
    <div className="popup-container">
      <div className="header">
        <h1>Better Lyrics Shaders</h1>
        {songTitle && <div className="song-title">{songTitle}</div>}
      </div>

      <div className="content">
        {currentSongColors.length > 0 ? (
          <div className="colors-section">
            <h2>Current Song Colors</h2>
            <div className="colors-grid">
              {currentSongColors.map((color, index) => (
                <div key={index} className="color-row">
                  <div className="color-preview">
                    <input
                      type="color"
                      value={hslToHex(color)}
                      onChange={e => updateCurrentColor(index, hexToHsl(e.target.value))}
                      className="color-picker"
                    />
                  </div>
                  <div className="color-details">
                    <label className="color-label">Color {index + 1}</label>
                    <input
                      type="text"
                      value={color}
                      onChange={e => {
                        if (e.target.value.match(/hsl\(\d+,\s*\d+%,\s*\d+%\)/)) {
                          updateCurrentColor(index, e.target.value);
                        }
                      }}
                      placeholder="hsl(hue, sat%, light%)"
                      className="color-input-text"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎵</div>
            <h3>No song detected</h3>
            <p>Please visit YouTube Music and play a song to see the extracted colors</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
