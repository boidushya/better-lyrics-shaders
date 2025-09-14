export interface GradientSettings {
  distortion: number;
  swirl: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
  speed: number;
  opacity: number;
}

export const defaultSettings: GradientSettings = {
  distortion: 0.95,
  swirl: 0.95,
  offsetX: 0,
  offsetY: 0,
  scale: 1.25,
  rotation: 0,
  speed: 0.5,
  opacity: 0.33,
};

export type TabType = 'colors' | 'controls';