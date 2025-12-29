# Vibe Checker - PWA Mobile App Setup

## Overview

The **Vibe Checker** (spark-ignition-standalone.html) is now a Progressive Web App (PWA) that can be installed on mobile devices and desktops for offline use.

## Features

- ✅ **Installable** - Add to home screen on iOS, Android, and desktop
- ✅ **Offline Support** - Works without internet connection
- ✅ **Fast Loading** - Cached assets for instant access
- ✅ **Native Feel** - Full-screen mode, no browser UI
- ✅ **Auto Updates** - New versions install automatically

## Installation Instructions

### iOS (iPhone/iPad)

1. Open **Safari** and navigate to the Vibe Checker URL
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Name it "Vibe Check" and tap **Add**
5. The app icon will appear on your home screen

### Android

1. Open **Chrome** and navigate to the Vibe Checker URL
2. Tap the **three-dot menu** (⋮)
3. Tap **"Install app"** or **"Add to Home Screen"**
4. Confirm the installation
5. The app icon will appear on your home screen

### Desktop (Chrome/Edge)

1. Navigate to the Vibe Checker URL
2. Click the **install icon** (⊕) in the address bar
3. Click **"Install"**
4. The app opens in its own window

## Files Created

```
spark-your-potential/
├── spark-ignition-standalone.html  # Main app (PWA-enabled)
├── manifest.json                   # PWA manifest
├── sw.js                           # Service worker
├── generate-icons.sh               # Icon generation script
├── PWA_SETUP.md                    # This file
└── icons/
    ├── vibe-icon.svg               # Source SVG
    ├── vibe-72.png                 # Android icon
    ├── vibe-96.png                 # Android icon
    ├── vibe-128.png                # Android icon
    ├── vibe-144.png                # Android icon
    ├── vibe-152.png                # iOS icon
    ├── vibe-192.png                # Android/iOS icon
    ├── vibe-384.png                # High-res icon
    ├── vibe-512.png                # Splash screen icon
    └── vibe-maskable-512.png       # Android adaptive icon
```

## Testing the PWA

### Local Testing

1. Start a local server:
   ```bash
   cd spark-your-potential
   python -m http.server 8080
   ```

2. Open http://localhost:8080/spark-ignition-standalone.html

3. Open Chrome DevTools → Application tab:
   - Check **Manifest** section shows correctly
   - Check **Service Workers** shows "Activated and running"

### Lighthouse Audit

1. Open Chrome DevTools
2. Go to **Lighthouse** tab
3. Select **Progressive Web App**
4. Click **Analyze page load**
5. Target score: 90+

## Offline Behaviour

When offline, the app:
- ✅ Opens from home screen
- ✅ Shows all UI elements
- ✅ Saves data to localStorage
- ✅ Loads cached Google Fonts

## Technical Details

### Manifest Configuration

| Property | Value |
|----------|-------|
| Name | Vibe Checker |
| Short Name | Vibe Check |
| Theme Colour | #f97316 (Orange) |
| Background | #fef3c7 (Cream) |
| Display | Standalone |
| Orientation | Portrait |

### Service Worker Strategy

- **Static Assets**: Cache-first (HTML, CSS, JS)
- **External Resources**: Network-first with cache fallback (fonts)
- **API Calls**: Network-only (not cached)

### Cached Resources

1. `/spark-ignition-standalone.html`
2. `/manifest.json`
3. `/icons/vibe-192.png`
4. `/icons/vibe-512.png`
5. Google Fonts (Inter, Patrick Hand)

## Updating the App

When you make changes:

1. Update the `CACHE_NAME` version in `sw.js`:
   ```javascript
   const CACHE_NAME = 'vibe-checker-v2';  // Increment version
   ```

2. Deploy the changes

3. Users will automatically get the new version on next visit

## Troubleshooting

### App won't install

- Check HTTPS is enabled (required for PWA)
- Verify manifest.json is accessible
- Check for console errors in DevTools

### Service worker not registering

- Service workers require HTTPS (or localhost)
- Check sw.js is in the root directory
- Look for errors in Console tab

### Icons not showing

- Run `./generate-icons.sh` to regenerate
- Verify icons/ folder exists with PNG files
- Check paths in manifest.json match actual files

### Cache not updating

- Clear site data: DevTools → Application → Clear storage
- Unregister service worker: Application → Service Workers → Unregister
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

## Production Deployment

1. Deploy all files to your web server
2. Ensure HTTPS is configured
3. Verify manifest.json is accessible
4. Test installation on real devices

## Version History

- **v1.0.0** (29 Dec 2025) - Initial PWA release
  - Full offline support
  - iOS and Android installation
  - Service worker caching
  - Custom sparkle icons

---

**Made with ✨ for Harness the Spark**
