# Better Lyrics Shaders Extension (Plasmo + React)

A modern Chrome extension built with Plasmo and React that adds beautiful, customizable grain gradient effects to YouTube Music lyrics using the Paper Shaders library.

## ✨ Features

- 🎨 **Beautiful Grain Gradients**: Professional shader-based effects using Paper Shaders
- ⚡ **React-powered**: Modern React components with TypeScript
- 🔧 **Real-time Configuration**: Live preview while adjusting settings
- 💾 **Persistent Settings**: Configuration saved automatically
- 🎵 **Lyrics Integration**: Automatically detects YouTube Music lyrics and player page
- 🚀 **Modern Architecture**: Built with Plasmo framework for optimal performance

## 🛠️ Installation & Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Chrome browser

### Setup

1. **Clone/Create the project directory**
   ```bash
   mkdir better-lyrics-shader
   cd better-lyrics-shader
   ```

2. **Create all the project files**
   Save each file from the artifacts in the appropriate location:
   ```
   better-lyrics-shader/
   ├── package.json
   ├── tsconfig.json
   ├── popup.tsx
   ├── popup.css
   └── contents/
       └── youtube-music.tsx
   ```

3. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Build the extension**
   ```bash
   npm run build
   # or
   yarn build
   ```

5. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build/chrome-mv3-prod` folder
   - The extension will appear in your extensions list

### Development Mode

For development with hot reload:

```bash
npm run dev
# or
yarn dev
```

Then load the `build/chrome-mv3-dev` folder in Chrome.

## 🎮 Usage

1. **Navigate to YouTube Music** (https://music.youtube.com)
2. **Go to any song's player page** (the extension activates on lyrics and player pages)
3. **Click the Better Lyrics Shaders icon** in Chrome toolbar to open settings
4. **Customize your gradient** using the controls:
   - Toggle effect on/off
   - Adjust colors (5 customizable gradient colors)
   - Control intensity, softness, and noise
   - Change shape (wave, circle, square, diamond)
   - Modify scale, rotation, and animation speed
   - Position with offset controls

## ⚙️ Configuration Options

### Basic Controls
- **Enable/Disable**: Master toggle for the effect
- **Background Color**: Base color behind the gradient
- **Softness**: How smooth color transitions are (0-1)
- **Intensity**: Overall effect strength (0-1)
- **Noise**: Amount of grain texture (0-1)

### Visual Controls
- **Shape**: Gradient pattern (wave, circle, square, diamond)
- **Scale**: Size of the gradient pattern (0.1-3x)
- **Rotation**: Rotate the pattern (0-360°)
- **Offset X/Y**: Move the gradient position (-1 to 1)
- **Speed**: Animation speed (0-3x)

### Colors
- **5 Gradient Colors**: Full HSL color control
- Use color pickers or enter HSL values directly
- Real-time preview of color changes

## 📁 Project Structure

```
better-lyrics-shader/
├── package.json              # Dependencies and Plasmo config
├── tsconfig.json             # TypeScript configuration
├── popup.tsx                 # Settings popup React component
├── popup.css                 # Popup styling
└── contents/
    └── youtube-music.tsx     # Content script with GrainGradient
```

## 🔧 Technical Details

### Architecture
- **Plasmo Framework**: Modern extension development with hot reload
- **React + TypeScript**: Type-safe component development
- **Paper Shaders**: Professional WebGL shader library
- **Content Script**: React component injected into YouTube Music
- **Storage API**: Persistent configuration management

### Paper Shaders Integration
The extension uses the official `@paper-design/shaders-react` package, providing:
- High-performance WebGL shaders
- Smooth 60fps animations
- Multiple gradient shapes and effects
- Professional visual quality

### Default Configuration
```typescript
{
  isEnabled: true,
  colorBack: "hsl(200, 100%, 3%)",    // Deep blue background
  softness: 0.7,                      // Medium smoothness
  intensity: 0.15,                    // Subtle effect
  noise: 0,                           // No grain initially
  shape: "wave",                      // Wave pattern
  offsetX: 0,                         // Centered horizontally
  offsetY: 0,                         // Centered vertically
  scale: 1,                           // Normal size
  rotation: 0,                        // No rotation
  speed: 1,                           // Normal animation speed
  colors: [                           // Your specified gradient
    "hsl(34, 89%, 41%)",             // Orange
    "hsl(50, 42%, 56%)",             // Yellow
    "hsl(18, 18%, 81%)",             // Light gray
    "hsl(9, 60%, 50%)",              // Red
    "hsl(160, 60%, 50%)"             // Teal
  ]
}
```

## 🚀 Building for Production

```bash
# Build production version
npm run build

# Package for distribution
npm run package
```

The packaged extension will be in the `build` directory.

## 🛠️ Troubleshooting

### Extension Not Loading
- Ensure all dependencies are installed: `npm install`
- Build the project: `npm run build`
- Load the correct build folder (`build/chrome-mv3-prod`)

### Effect Not Showing
- Navigate to a YouTube Music player page (not just the homepage)
- Check that the effect is enabled in the popup
- Try refreshing the page after changing settings

### Development Issues
- Use `npm run dev` for hot reload during development
- Check the browser console for any error messages
- Ensure you're loading the dev build folder (`build/chrome-mv3-dev`)

## 📜 License

This project uses:
- Paper Shaders library (with proper attribution)
- Plasmo framework (MIT license)
- React (MIT license)

## 🙏 Attribution

Built with [Paper Shaders](https://github.com/paper-design/shaders) by paper-design. 
Powered by [Plasmo](https://www.plasmo.com/) framework.

---

**Enjoy your enhanced YouTube Music lyrics experience!** 🎵✨