# ZERO POINT — Mobile (Capacitor)

Dedicated standalone mobile application build for **Zero Point: Quantum Math Cascade**, powered by **Capacitor 7**.

---

## 📱 Mobile Architecture & Features
- **Standalone Mobile Shell**: Detached from the web arcade portal into its own dedicated repository and build pipeline.
- **Native Haptics**: Integrated with `@capacitor/haptics` for crisp tactile impact on drop, fusion blast, and combos.
- **Fixed Portrait Lock**: Enforced by `@capacitor/screen-orientation` (`orientation: portrait`).
- **Dark Status Bar Integration**: Styled via `@capacitor/status-bar` to match the dark sci-fi aesthetic.
- **Smooth Touch Controls**: Native drag-to-aim and release-to-drop with column tracking and haptic guidance.
- **Constellation Adventure Map**: Procedurally generated nodes via `nodeGenerator.js`.

---

## 📁 Project Structure

```
ZeroPoint-Mobile/
├── android/                 # Native Android Studio project (Gradle)
├── ios/                     # Native Xcode workspace (Swift / SPM / Pods)
├── www/                     # Web game assets deployed into native WebViews
│   ├── index.html           # Mobile-optimized entry point
│   ├── style.css           # Mobile touch styling & responsive layout
│   ├── game.js             # Core physics, math fusions, and game loop
│   ├── audio.js            # Web Audio API procedural sound synthesizer
│   └── nodeGenerator.js    # Deterministic procedural level graph generator
├── capacitor.config.json    # Capacitor app metadata & plugin configuration
└── package.json             # Mobile scripts and dependencies
```

---

## 🚀 Quick Commands

### Syncing Web Changes
Whenever you update code in `www/`:
```bash
npm run cap:sync
```

### Opening in Android Studio
```bash
npm run cap:open:android
```

### Opening in Xcode
```bash
npm run cap:open:ios
```

### Checking Capacitor Health
```bash
npm run cap:doctor
```

---

## ⚙️ Configuration
- **App Name**: `Zero Point`
- **Bundle ID / App ID**: `com.pixelated.zeropoint`
- **Platform Targets**: Android 14+ (API 34/35), iOS 17+
