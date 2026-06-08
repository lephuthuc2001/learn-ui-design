---
name: extract-video-screenshots
description: Use when the user wants to add screenshots or images from a Hotmart HLS video lesson to their notes, blog posts, or Anki cards. Requires ffmpeg installed and a fresh index.m3u8 in the video directory.
---

# Extract Video Screenshots

## Overview

Pulls frames from Hotmart HLS video streams at specific timestamps and saves them as JPGs. Uses the AES-128 key served by Hotmart's CDN — no browser, no screen recording needed.

**Shared reusable script at repo root:**
```bash
bash extract-screenshots.sh <video-directory> [name:HH:MM:SS ...]
```

## Required Artifacts

- `ffmpeg` installed (`ffmpeg -version` to check)
- A **fresh** `index.m3u8` (or `master.m3u8` / `_resMaster.m3u8`) in the video directory with a valid `hdntl` token (expires ~24h). If expired, user must re-open the video in the browser.
- The video directory's `index.m3u8` must have been obtained from Hotmart (it contains the video ID, epoch, and token in segment URLs)

## Finding Good Timestamps

Read the `.vtt` subtitle file and grep for keywords that correspond to the visual moment you want:

```bash
grep -B2 "bachelor pad\|fireplace\|gallery" lesson.vtt | grep "^00:"
```

Take the timestamp and add a second or two — the VTT cue start is when the instructor *starts talking*, not when the slide is centered on screen.

## Running the Script

```bash
# Single shot
bash extract-screenshots.sh 02-fundamentals/01-intro \
  "01-bachelor-pad:00:08:52"

# Multiple shots
bash extract-screenshots.sh 02-fundamentals/01-intro \
  "01-bachelor-pad:00:08:52" \
  "02-alignment-room:00:09:38" \
  "03-messy-desk:00:10:28" \
  "04-dashboard:00:11:22"
```

Output: `<video-directory>/screenshots/<name>.jpg`

## Verify Before Keeping

After extracting, **view every screenshot** with the Read tool and ask: does this image actually show what the notes are talking about?

Reject and re-extract if the image:
- Shows a title/intro slide (just the lesson title + instructor face — no design content)
- Is zoomed in so close the context is lost (e.g. 1839% zoom showing two letters)
- Shows an intermediate/unfinished state when the notes describe the finished design
- Captures a scene transition where the instructor hasn't settled on the right frame yet

For each rejected image: pick a better timestamp (1–3 seconds earlier or later, or search the VTT for a more specific keyword), re-extract, and check again. Repeat until the image is meaningful.

**Only keep a screenshot if you can write a useful alt text for it.** If you're struggling to describe what it teaches, it's the wrong frame.

## Embedding in Notes

Use relative paths from the notes `.md` file:

```markdown
![Alignment in the bachelor pad — rug and furniture all at right angles](screenshots/02-alignment-room.jpg)
```

Write descriptive alt text that explains *what the screenshot proves*, not just what's in it.

## How It Works

1. Reads video ID and hdntl token from the master playlist
2. Fetches the AES-128 decryption key from `contentplayer.hotmart.com` (uses player.hotmart.com Origin header)
3. Calculates segment number: `floor(timestamp_seconds / 6) + 1` (6s/segment)
4. Downloads the target `.ts` segment from `vod-akm.play.hotmart.com` (requires Origin/Referer headers)
5. Builds a mini local m3u8 with `URI="file:///path/to/key"` pointing to the saved key
6. Runs `ffmpeg -allowed_extensions ALL` to decrypt and extract the frame

## CDN Architecture (Key Insight)

Hotmart uses **two separate CDN domains** — mixing them up causes 403:

| Purpose | Domain |
|---------|--------|
| Video/audio `.ts` segments | `vod-akm.play.hotmart.com` |
| AES decryption key | `contentplayer.hotmart.com` |
| Required headers | `Origin: https://player.hotmart.com` + matching `Referer` |

The `index.m3u8` file (from the user's browser) lists segments under `contentplayer.hotmart.com` but the *actual segments* are on `vod-akm.play.hotmart.com`. Always use `vod-akm` for segment downloads.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `contentplayer.hotmart.com` for segments | Use `vod-akm.play.hotmart.com` — the m3u8 URL is wrong |
| `ffmpeg` 403 on the m3u8 URL | Segments must be downloaded manually then fed to ffmpeg via local mini m3u8 |
| `ffmpeg` can't read the key file | Use `-allowed_extensions ALL` flag |
| Frame is black or wrong scene | Offset within segment defaults to 2s; adjust manually if needed |
| Token expired | Re-open video in browser; save the refreshed `index.m3u8` |
| Video ID not found | Script parses from segment filename pattern `<ID>-<epoch>-audio=N-video=M` |
