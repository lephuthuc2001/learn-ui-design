#!/usr/bin/env bash
# Usage: bash extract-screenshots.sh <video-directory> [name:HH:MM:SS ...]
#
# Extracts screenshots from a Hotmart HLS video at given timestamps.
# Reads the token from index.m3u8, fetches the AES key, downloads each
# target segment, and extracts a frame with ffmpeg.
#
# Example:
#   bash extract-screenshots.sh 02-fundamentals/01-intro \
#     "01-bachelor-pad:00:08:52" \
#     "02-alignment:00:09:38"
#
# Output: <video-directory>/screenshots/<name>.jpg

set -euo pipefail

DIR="${1:?Usage: extract-screenshots.sh <video-directory> [name:HH:MM:SS ...]}"
shift
SHOTS=("$@")

SLUG=$(basename "$DIR")
MASTER=""
for f in index.m3u8 master.m3u8 _resMaster.m3u8; do
  [[ -f "$DIR/$f" ]] && MASTER="$DIR/$f" && break
done
[[ -z "$MASTER" ]] && { echo "ERROR: No master playlist found in $DIR"; exit 1; }

# Extract token and video ID from the playlist
TOKEN=$(grep -o 'hdntl=[^&"]*' "$MASTER" | head -1)
[[ -z "$TOKEN" ]] && { echo "ERROR: No hdntl token found in $MASTER"; exit 1; }

EXP=$(echo "$TOKEN" | grep -o 'exp=[0-9]*' | cut -d= -f2)
NOW=$(date +%s)
if [[ "$EXP" -lt "$NOW" ]]; then
  echo "ERROR: hdntl token expired $(date -d @"$EXP"). Re-open the video in the browser to refresh $MASTER."
  exit 1
fi
echo "Token valid until $(date -d @"$EXP")"

VIDEO_ID=$(grep -o 'video/[^/]*/hls/' "$MASTER" | head -1 | cut -d/ -f2 ||
           grep -o '/video/[^/]*/' "$MASTER" | head -1 | cut -d/ -f3 ||
           grep -oP '(?<=video/)[^/]+' "$MASTER" | head -1)

# Fallback: parse video ID from segment filename pattern (e.g. Yq27y1z6La-1730475163000-...)
if [[ -z "$VIDEO_ID" ]]; then
  SEGMENT_LINE=$(grep '\.ts?' "$MASTER" | head -1 || grep '\.m3u8?' "$MASTER" | grep -v '^#' | head -1)
  VIDEO_ID=$(echo "$SEGMENT_LINE" | grep -oP '^[A-Za-z0-9]+(?=-\d+-)' || true)
fi
[[ -z "$VIDEO_ID" ]] && { echo "ERROR: Could not determine video ID from $MASTER"; exit 1; }
echo "Video ID: $VIDEO_ID"

# Get the timestamp epoch used in filenames (e.g. 1730475163000)
TS_EPOCH=$(grep -oP "${VIDEO_ID}-\K\d+(?=-)" "$MASTER" | head -1)
[[ -z "$TS_EPOCH" ]] && { echo "ERROR: Could not parse timestamp epoch from $MASTER"; exit 1; }

BASE_URL="https://vod-akm.play.hotmart.com/video/${VIDEO_ID}/hls/${VIDEO_ID}-${TS_EPOCH}"
KEY_URL="https://contentplayer.hotmart.com/video/${VIDEO_ID}/mp4/key/${VIDEO_ID}-${TS_EPOCH}.key?${TOKEN}"

HDRS=(
  -H "Origin: https://player.hotmart.com"
  -H "Referer: https://player.hotmart.com/"
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0"
  -H "Accept: */*"
)

# Fetch AES key once
KEY_FILE=$(mktemp /tmp/hotmart-key.XXXXXX)
trap 'rm -f "$KEY_FILE" /tmp/hotmart-seg.ts /tmp/hotmart-mini.m3u8' EXIT

echo "Fetching AES key..."
HTTP_CODE=$(curl -sf "${HDRS[@]}" -o "$KEY_FILE" -w "%{http_code}" "$KEY_URL")
[[ "$HTTP_CODE" != "200" ]] && { echo "ERROR: Could not fetch AES key (HTTP $HTTP_CODE)"; exit 1; }
KEY_SIZE=$(wc -c < "$KEY_FILE")
[[ "$KEY_SIZE" -ne 16 ]] && { echo "ERROR: AES key wrong size ($KEY_SIZE bytes, expected 16)"; exit 1; }
echo "AES key OK (16 bytes)"

OUTDIR="$DIR/screenshots"
mkdir -p "$OUTDIR"

SEGMENT_DURATION=6  # seconds per HLS segment (from #EXT-X-TARGETDURATION)

for shot in "${SHOTS[@]}"; do
  NAME="${shot%%:*}"
  TIMESTAMP="${shot#*:}"

  # Convert HH:MM:SS to seconds
  IFS=: read -r H M S <<< "$TIMESTAMP"
  TOTAL_S=$(( 10#$H * 3600 + 10#$M * 60 + 10#$S ))

  SEG=$(( TOTAL_S / SEGMENT_DURATION + 1 ))
  OFFSET=$(( TOTAL_S % SEGMENT_DURATION ))
  # Pick middle of remainder if short
  [[ "$OFFSET" -lt 2 ]] && OFFSET=2

  echo -n "[$NAME] ts=$TIMESTAMP seg=$SEG offset=${OFFSET}s ... "

  # Find video+audio stream segment filename prefix
  # Pattern: <videoId>-<epoch>-audio=<N>-video=<M>-<seg>.ts
  SEG_PREFIX=$(grep -oP "${VIDEO_ID}-${TS_EPOCH}-audio=\d+-video=\d+" "$MASTER" | head -1)
  [[ -z "$SEG_PREFIX" ]] && SEG_PREFIX="${VIDEO_ID}-${TS_EPOCH}-audio=73892-video=207845"

  SEG_URL="https://vod-akm.play.hotmart.com/video/${VIDEO_ID}/hls/${SEG_PREFIX}-${SEG}.ts?${TOKEN}"

  curl -sf "${HDRS[@]}" -o /tmp/hotmart-seg.ts "$SEG_URL" || { echo "DOWNLOAD FAILED"; continue; }

  IV=$(printf "%032x" "$SEG")
  cat > /tmp/hotmart-mini.m3u8 << M3U
#EXTM3U
#EXT-X-VERSION:4
#EXT-X-TARGETDURATION:${SEGMENT_DURATION}
#EXT-X-KEY:METHOD=AES-128,URI="file://${KEY_FILE}",IV=0x${IV}
#EXTINF:${SEGMENT_DURATION},
/tmp/hotmart-seg.ts
#EXT-X-ENDLIST
M3U

  ffmpeg -allowed_extensions ALL -i /tmp/hotmart-mini.m3u8 \
    -ss "$OFFSET" -frames:v 1 -q:v 2 \
    "$OUTDIR/${NAME}.jpg" -y 2>/dev/null \
    && echo "OK → screenshots/${NAME}.jpg" \
    || echo "EXTRACT FAILED"
done

echo ""
echo "Done. Screenshots saved to: $OUTDIR/"
ls -1 "$OUTDIR/"
