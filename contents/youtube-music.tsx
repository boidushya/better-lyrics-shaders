import { MeshGradient } from "@paper-design/shaders-react";
import { Storage } from "@plasmohq/storage";
import ColorThief from "colorthief";
import type { PlasmoCSConfig } from "plasmo";
import React from "react";
import { createRoot } from "react-dom/client";
import {
  DEFAULT_DYNAMIC_MULTIPLIERS,
  DEFAULT_GRADIENT_SETTINGS,
  type DynamicMultipliers,
  GRADIENT_SETTINGS_STORAGE_KEY,
  type GradientSettings,
} from "../shared/constants/gradientSettings";

export const config: PlasmoCSConfig = {
  matches: ["https://music.youtube.com/*"],
  all_frames: true,
};

let currentColors: string[] = [];
let lastImageSrc = "";

// Initialize storage
const storage = new Storage();

let gradientSettings: GradientSettings = { ...DEFAULT_GRADIENT_SETTINGS };
let dynamicMultipliers: DynamicMultipliers = { ...DEFAULT_DYNAMIC_MULTIPLIERS };

// Audio analysis variables
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let audioElement: HTMLAudioElement | null = null;
let audioAnalysisInterval: NodeJS.Timeout | null = null;

let isAudioInitialized = false;

// Load settings from storage on initialization
const loadGradientSettings = async () => {
  try {
    const storedSettings = await storage.get<GradientSettings>(GRADIENT_SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      gradientSettings = { ...DEFAULT_GRADIENT_SETTINGS, ...storedSettings };
    }
  } catch (error) {
    console.error("Error loading gradient settings from storage:", error);
  }
};

// Audio analysis functions
const initializeAudioAnalysis = async () => {
  try {
    // Find the audio/video element
    audioElement = document.querySelector("audio, video") as HTMLAudioElement;
    if (!audioElement) {
      // Retry after a short delay
      setTimeout(initializeAudioAnalysis, 1000);
      return;
    }

    // Create audio context and analyser
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Handle suspended context (user activation required)
    if (audioContext.state === "suspended") {
      // Wait for user interaction to resume context
      const resumeContext = async () => {
        if (audioContext && audioContext.state === "suspended") {
          await audioContext.resume();
        }
        document.removeEventListener("click", resumeContext);
        document.removeEventListener("keydown", resumeContext);
      };

      document.addEventListener("click", resumeContext);
      document.addEventListener("keydown", resumeContext);
    }

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;

    // Connect audio source to analyser
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    isAudioInitialized = true;
    if (gradientSettings.audioResponsive) {
      startAudioAnalysis();
    }

    console.log("Audio analysis initialized successfully");
  } catch (error) {
    console.error("Error initializing audio analysis:", error);
  }
};

const analyzeAudio = () => {
  if (!analyser || !gradientSettings.audioResponsive) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  let peak = 0;
  for (let i = 0; i < bufferLength; i++) {
    const amplitude = Math.abs(dataArray[i] - 128) / 128;
    if (amplitude > peak) peak = amplitude;
  }

  const isBeat = peak > 0.8;

  const speedMultiplier = isBeat ? 4 : 1;
  const scaleMultiplier = isBeat ? 1.01 : 1;

  dynamicMultipliers = {
    speedMultiplier,
    scaleMultiplier,
  };

  updateDynamicGradient();
};

const updateDynamicGradient = () => {
  if ((window as any).updateGradientSettings) {
    (window as any).updateGradientSettings(gradientSettings);
  }
};

const handleAudioResponsiveToggle = () => {
  if (gradientSettings.audioResponsive && isAudioInitialized) {
    startAudioAnalysis();
  } else {
    if (audioAnalysisInterval) {
      clearInterval(audioAnalysisInterval);
      audioAnalysisInterval = null;
    }
    dynamicMultipliers = { ...DEFAULT_DYNAMIC_MULTIPLIERS };
    updateDynamicGradient();
  }
};

const startAudioAnalysis = () => {
  if (audioAnalysisInterval) {
    clearInterval(audioAnalysisInterval);
  }

  audioAnalysisInterval = setInterval(analyzeAudio, 100);
};

const stopAudioAnalysis = () => {
  if (audioAnalysisInterval) {
    clearInterval(audioAnalysisInterval);
    audioAnalysisInterval = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  analyser = null;
  audioElement = null;

  // Reset audio state
  isAudioInitialized = false;

  // Reset multipliers
  dynamicMultipliers = { ...DEFAULT_DYNAMIC_MULTIPLIERS };
  updateDynamicGradient();
};

const rgbToHsl = (red: number, green: number, blue: number) => {
  red /= 255;
  green /= 255;
  blue /= 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let h = 0,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case red:
        h = (green - blue) / d + (green < blue ? 6 : 0);
        break;
      case green:
        h = (blue - red) / d + 2;
        break;
      case blue:
        h = (red - green) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    hue: Math.round(h * 360),
    saturation: Math.round(s * 100),
    lightness: Math.round(l * 100),
  };
};

const extractColorsFromImage = async (img: HTMLImageElement): Promise<string[]> => {
  try {
    const response = await fetch(img.src);
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    const proxyImg = new Image();

    return new Promise(resolve => {
      proxyImg.onload = () => {
        try {
          const colorThief = new ColorThief();
          const colors = colorThief.getPalette(proxyImg, 5);
          const primaryColor = colorThief.getColor(proxyImg);

          const colorsWithPrimary = [primaryColor, ...colors];
          const colorsHsl = colorsWithPrimary.map(color => {
            const [r, g, b] = color;
            const { hue, saturation, lightness } = rgbToHsl(r, g, b);
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          });

          URL.revokeObjectURL(imageUrl);
          resolve(colorsHsl);
        } catch (error) {
          console.error("ColorThief error:", error);
          URL.revokeObjectURL(imageUrl);
          resolve([]);
        }
      };

      proxyImg.onerror = () => {
        console.error("Error loading proxy image");
        URL.revokeObjectURL(imageUrl);
        resolve([]);
      };

      proxyImg.src = imageUrl;
    });
  } catch (error) {
    console.error("Error extracting colors:", error);
    return [];
  }
};

interface GradientOverlayProps {
  colors: string[];
  settings: GradientSettings;
  multipliers: DynamicMultipliers;
}

const GradientOverlay: React.FC<GradientOverlayProps> = ({ colors, settings, multipliers }) => {
  const dynamicSpeed = settings.speed * multipliers.speedMultiplier;
  const dynamicScale = settings.scale * multipliers.scaleMultiplier;

  return (
    <div
      style={{
        position: "absolute",
        top: "-64px",
        left: "-72px",
        width: "calc(100% + 72px)",
        height: "calc(100% + 128px)",
        pointerEvents: "none",
        zIndex: 0,
        opacity: settings.opacity,
      }}
      data-colors={JSON.stringify(colors)}
    >
      <MeshGradient
        style={{
          height: "100%",
          width: "100%",
        }}
        distortion={settings.distortion}
        swirl={settings.swirl}
        offsetX={settings.offsetX}
        offsetY={settings.offsetY}
        scale={dynamicScale}
        rotation={settings.rotation}
        speed={dynamicSpeed}
        colors={colors}
      />
    </div>
  );
};

const injectGradientIntoPlayerPage = () => {
  let gradientContainer: HTMLDivElement | null = null;
  let root: any = null;

  const waitForPlayerPageReady = async (): Promise<boolean> => {
    return new Promise(resolve => {
      const checkReady = () => {
        const playerPage = document.getElementById("player-page");
        const hasContent = playerPage && playerPage.children.length > 0;

        if (hasContent) {
          setTimeout(() => resolve(true), 1000);
        } else {
          setTimeout(checkReady, 500);
        }
      };
      checkReady();
    });
  };

  const createGradientElement = async () => {
    if (currentColors.length === 0) return;

    removeGradientElement();

    const isReady = await waitForPlayerPageReady();
    if (!isReady) return;

    const playerPage = document.getElementById("player-page");
    if (!playerPage) return;

    const existingGradient = document.getElementById("better-lyrics-gradient");
    if (existingGradient) {
      existingGradient.remove();
    }

    gradientContainer = document.createElement("div");
    gradientContainer.id = "better-lyrics-gradient";
    gradientContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      opacity: 0;
    `;

    playerPage.insertBefore(gradientContainer, playerPage.firstChild);

    root = createRoot(gradientContainer);
    root.render(
      <GradientOverlay colors={currentColors} settings={gradientSettings} multipliers={dynamicMultipliers} />
    );

    setTimeout(() => {
      if (gradientContainer) {
        gradientContainer.style.opacity = "1";
      }
    }, 100);
  };

  const removeGradientElement = () => {
    if (root) {
      root.unmount();
      root = null;
    }
    if (gradientContainer) {
      gradientContainer.remove();
      gradientContainer = null;
    }
  };

  const updateGradientColors = (colors: string[]) => {
    currentColors = colors;

    if (colors.length === 0) {
      removeGradientElement();
      return;
    }

    if (root && gradientContainer) {
      setTimeout(() => {
        root.render(<GradientOverlay colors={colors} settings={gradientSettings} multipliers={dynamicMultipliers} />);
        if (gradientContainer) {
          gradientContainer.style.opacity = "1";
        }
      }, 150);
    } else {
      createGradientElement();
    }
  };

  const updateGradientSettings = (settings: GradientSettings) => {
    const wasAudioResponsive = gradientSettings.audioResponsive;
    gradientSettings = settings;

    if (wasAudioResponsive !== settings.audioResponsive) {
      handleAudioResponsiveToggle();
    }

    if (root && gradientContainer && currentColors.length > 0) {
      root.render(
        <GradientOverlay colors={currentColors} settings={gradientSettings} multipliers={dynamicMultipliers} />
      );
    }
  };

  (window as any).updateGradientColors = updateGradientColors;
  (window as any).updateGradientSettings = updateGradientSettings;

  const checkAndUpdateGradient = async () => {
    const playerPage = document.getElementById("player-page");
    const exists = document.getElementById("better-lyrics-gradient");

    if (playerPage) {
      if (!exists) {
        await createGradientElement();
      }
      await extractAndUpdateColors();
    } else if (exists) {
      removeGradientElement();
    }
  };

  const extractAndUpdateColors = async () => {
    const songImageDiv = document.getElementById("song-image");
    const coverImage = songImageDiv?.querySelector("img") as HTMLImageElement;

    if (!coverImage || !coverImage.complete || coverImage.naturalHeight === 0) {
      return;
    }

    if (coverImage.src === lastImageSrc) {
      return;
    }

    console.log("Extracting colors from new image:", coverImage.src);
    lastImageSrc = coverImage.src;

    try {
      const colors = await extractColorsFromImage(coverImage);
      console.log("Extracted colors:", colors);

      if (colors.length > 0) {
        updateGradientColors(colors);
      }
    } catch (error) {
      console.error("Error in color extraction:", error);
    }
  };

  setTimeout(async () => {
    checkAndUpdateGradient();

    setTimeout(() => {
      initializeAudioAnalysis();
    }, 2000);

    let timeoutId: NodeJS.Timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => checkAndUpdateGradient(), 0);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }, 0);
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "getCurrentData" || message.action === "getCurrentColors") {
    const songTitleElement = document.querySelector(".title.style-scope.ytmusic-player-bar");
    const songTitle = songTitleElement ? songTitleElement.textContent : "";

    const songAuthorElement = document.querySelector(".subtitle.style-scope.ytmusic-player-bar");
    const songAuthor = songAuthorElement ? songAuthorElement.textContent.split("•")[0] : "";

    console.log;

    sendResponse({
      colors: currentColors,
      songTitle: songTitle,
      songAuthor: songAuthor,
      gradientSettings: gradientSettings,
    });
    return true;
  } else if (message.action === "updateColors") {
    if ((window as any).updateGradientColors) {
      (window as any).updateGradientColors(message.colors);
    } else {
      currentColors = message.colors;
    }
    sendResponse({ success: true });
    return true;
  } else if (message.action === "updateGradientSettings") {
    if ((window as any).updateGradientSettings) {
      (window as any).updateGradientSettings(message.settings);
    } else {
      gradientSettings = message.settings;
    }
    sendResponse({ success: true });
    return true;
  }
});

const cleanupOrphanedGradients = () => {
  const existingGradients = document.querySelectorAll("#better-lyrics-gradient");
  existingGradients.forEach(gradient => gradient.remove());
};

// Cleanup when page unloads
window.addEventListener("beforeunload", () => {
  stopAudioAnalysis();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", async () => {
    await loadGradientSettings();
    cleanupOrphanedGradients();
    injectGradientIntoPlayerPage();
  });
} else {
  loadGradientSettings().then(() => {
    cleanupOrphanedGradients();
    injectGradientIntoPlayerPage();
  });
}

export default <></>;
