#!/usr/bin/env bash
# Compresses the /favretto/ hero clip (favretto-src/video-hero.mp4, git-ignored: 1080p, 60 fps, ~38 s, no sound) into public/favretto/video/.
# Usage: bash scripts/favretto-video.sh   (needs ffmpeg with libsvtav1, libx265 and libx264; the poster goes through sharp)
#
# The page offers them in this order and the browser takes the first it can play (src/pages/favretto/index.astro):
#   hero-1080.av1.mp4 / hero-1080.hevc.mp4   desktop (≥ 900 px): Chrome, Firefox, Edge → AV1; Safari → HEVC
#   hero-720.av1.mp4  / hero-720.hevc.mp4    phones and tablets: Android → AV1; every iPhone → HEVC
#   hero-720.mp4                            H.264, anything else
#   hero.webp                               poster (the first frame), shown until the clip plays, and under reduced motion
# All at 30 fps, no audio track, capped bitrate (a hero loop, not a film), moov atom first so they start while downloading.
set -euo pipefail
cd "$(dirname "$0")/.."

IN=favretto-src/video-hero.mp4
OUT=public/favretto/video
[ -f "$IN" ] || { echo "No $IN" >&2; exit 1; }
mkdir -p "$OUT"
common=(-v error -y -i "$IN" -an -pix_fmt yuv420p -movflags +faststart)

for h in 1080 720; do
  w=$(( h * 16 / 9 ))
  [ "$h" = 1080 ] && av1=1400 hevc=1600 || av1=700 hevc=800
  ffmpeg "${common[@]}" -vf "fps=30,scale=$w:$h" -c:v libsvtav1 -preset 6 -crf 38 -g 120 -svtav1-params "mbr=$av1" "$OUT/hero-$h.av1.mp4"
  ffmpeg "${common[@]}" -vf "fps=30,scale=$w:$h" -c:v libx265 -preset slow -crf 28 -g 120 -tag:v hvc1 \
    -x265-params "log-level=error:vbv-maxrate=$hevc:vbv-bufsize=$(( hevc * 2 ))" "$OUT/hero-$h.hevc.mp4"
done
ffmpeg "${common[@]}" -vf "fps=30,scale=1280:720" -c:v libx264 -preset slow -crf 28 -maxrate 1.1M -bufsize 2.2M -profile:v high -g 60 "$OUT/hero-720.mp4"
ffmpeg -v error -y -i "$IN" -frames:v 1 -vf "scale=1280:720" -f image2pipe -c:v png - |
  node -e "require('sharp')(require('fs').readFileSync(0)).webp({ quality: 72 }).toFile('$OUT/hero.webp')"

ls -la "$OUT"
