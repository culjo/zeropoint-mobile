#!/usr/bin/env bash
# Renders the Nullfall app icon sources in resources/icon/*.html with headless Chrome,
# then writes every iOS and Android launcher size with macOS `sips`.
# Usage: scripts/generate-icons.sh   (macOS with Google Chrome; Lato Black is embedded in each source as a data URI)
set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
SRC=resources/icon
OUT="$SRC/png"
RES=android/app/src/main/res
mkdir -p "$OUT"

render() { # name size
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --default-background-color=00000000 --virtual-time-budget=8000 \
    --window-size="$2,$2" --screenshot="$PWD/$OUT/$1.png" "file://$PWD/$SRC/$1.html" >/dev/null 2>&1
}

render icon-master 1024
render icon-foreground 432
render icon-background 432
render icon-monochrome 432
render icon-legacy 512
render icon-round 512

# iOS: single 1024 universal icon, opaque (App Store rejects alpha)
IOS_ICON=ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png
sips -s format jpeg "$OUT/icon-master.png" --out "$OUT/icon-master.jpg" >/dev/null
sips -s format png "$OUT/icon-master.jpg" --out "$IOS_ICON" >/dev/null
rm "$OUT/icon-master.jpg"

# Google Play listing icon: 512 x 512
sips -z 512 512 "$IOS_ICON" --out "$OUT/play-store-512.png" >/dev/null

# Android launcher densities: legacy 48dp, adaptive layers 108dp
for pair in mdpi:1 hdpi:1.5 xhdpi:2 xxhdpi:3 xxxhdpi:4; do
  d="${pair%%:*}"; m="${pair##*:}"
  legacy=$(python3 -c "print(round(48*$m))")
  layer=$(python3 -c "print(round(108*$m))")
  dir="$RES/mipmap-$d"
  sips -z "$legacy" "$legacy" "$OUT/icon-legacy.png" --out "$dir/ic_launcher.png" >/dev/null
  sips -z "$legacy" "$legacy" "$OUT/icon-round.png" --out "$dir/ic_launcher_round.png" >/dev/null
  sips -z "$layer" "$layer" "$OUT/icon-foreground.png" --out "$dir/ic_launcher_foreground.png" >/dev/null
  sips -z "$layer" "$layer" "$OUT/icon-background.png" --out "$dir/ic_launcher_background.png" >/dev/null
  sips -z "$layer" "$layer" "$OUT/icon-monochrome.png" --out "$dir/ic_launcher_monochrome.png" >/dev/null
done

echo "Icons written: $IOS_ICON, $OUT/play-store-512.png, $RES/mipmap-*/"
