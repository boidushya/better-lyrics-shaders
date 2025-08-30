import { MeshGradient } from "@paper-design/shaders-react";
import ColorThief from "colorthief";
import type { PlasmoCSConfig } from "plasmo";
import React from "react";
import { createRoot } from "react-dom/client";

export const config: PlasmoCSConfig = {
  matches: ["https://music.youtube.com/*"],
  all_frames: true,
};

let currentColors: string[] = [];
let lastImageSrc = "";

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
}

const GradientOverlay: React.FC<GradientOverlayProps> = ({ colors }) => {
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
        opacity: 1,
      }}
      data-colors={JSON.stringify(colors)}
    >
      <MeshGradient
        style={{
          height: "100%",
          width: "100%",
        }}
        distortion={0.95}
        swirl={0.95}
        offsetX={0}
        offsetY={0}
        scale={1.25}
        rotation={0}
        speed={0.5}
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
    root.render(<GradientOverlay colors={currentColors} />);

    setTimeout(() => {
      if (gradientContainer) {
        gradientContainer.style.opacity = "0.33";
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
        root.render(<GradientOverlay colors={colors} />);
        if (gradientContainer) {
          gradientContainer.style.opacity = "0.33";
        }
      }, 150);
    } else {
      createGradientElement();
    }
  };

  (window as any).updateGradientColors = updateGradientColors;

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

  setTimeout(() => {
    checkAndUpdateGradient();

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
  if (message.action === "getCurrentColors") {
    const songTitleElement = document.querySelector(".title.style-scope.ytmusic-player-bar");
    const songTitle = songTitleElement ? songTitleElement.textContent : "";

    sendResponse({ colors: currentColors, songTitle: songTitle });
    return true;
  } else if (message.action === "updateColors") {
    if ((window as any).updateGradientColors) {
      (window as any).updateGradientColors(message.colors);
    } else {
      currentColors = message.colors;
    }
    sendResponse({ success: true });
    return true;
  }
});

const cleanupOrphanedGradients = () => {
  const existingGradients = document.querySelectorAll("#better-lyrics-gradient");
  existingGradients.forEach(gradient => gradient.remove());
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    cleanupOrphanedGradients();
    injectGradientIntoPlayerPage();
  });
} else {
  cleanupOrphanedGradients();
  injectGradientIntoPlayerPage();
}

export default <></>;
