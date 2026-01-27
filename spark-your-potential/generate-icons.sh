#!/bin/bash
# Generate PWA icons from SVG for Vibe Checker

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Installing via Homebrew..."
    brew install imagemagick
fi

# Source SVG
SVG="icons/vibe-icon.svg"

# Generate all icon sizes
SIZES=(72 96 128 144 152 192 384 512)

echo "✨ Generating Vibe Checker PWA icons..."

for size in "${SIZES[@]}"; do
    echo "  Creating vibe-${size}.png..."
    convert -background none -resize ${size}x${size} "$SVG" "icons/vibe-${size}.png"
done

# Create maskable icon (with padding for safe zone)
echo "  Creating vibe-maskable-512.png..."
convert -background "#fef3c7" -gravity center -resize 400x400 -extent 512x512 "$SVG" "icons/vibe-maskable-512.png"

echo ""
echo "✅ All icons generated in icons/ folder!"
echo ""
echo "Files created:"
ls -la icons/*.png 2>/dev/null || echo "  (PNG files will appear after running this script)"
