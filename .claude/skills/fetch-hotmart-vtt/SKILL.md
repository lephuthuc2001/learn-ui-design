---
name: fetch-hotmart-vtt
description: Use when a video directory in this repo has a master playlist (master.m3u8, _resMaster.m3u8, or index.m3u8) but no .vtt subtitle file, and subtitles need to be downloaded from the Hotmart HLS stream.
---

# Fetch Hotmart VTT Subtitles

## Overview

Hotmart HLS videos store subtitles as many small `.webvtt` segments listed in a subtitle m3u8 playlist. This skill fetches all segments and concatenates them into a single `.vtt` file.

There is a **shared reusable script** at the repo root: `fetch.js`. Do not create per-video scripts — just run:

```bash
node fetch.js <video-directory>
```

The script reads the master playlist from the directory, extracts the video ID and hdntl token automatically, and writes `<slug>.vtt` into the directory.

## Required Artifacts

The video directory must contain one of:
- `master.m3u8`
- `_resMaster.m3u8`
- `index.m3u8`

(The script tries all three in that order.)

This file is saved by the user's existing download workflow and contains everything needed:

- **Video ID** — embedded in segment filenames (e.g. `aZ88JBjNZp`)
- **hdntl token** — the `?hdntl=exp=...~hmac=...` query string (expires ~24–48h after creation)
- **Subtitle m3u8 URI** — on the `#EXT-X-MEDIA:TYPE=SUBTITLES,LANGUAGE="en"` line under `URI=`

**Token expiry:** The script checks `exp=` automatically and errors with a clear message if expired. If expired, the user must re-open the video in the browser to refresh the master playlist file.

## How to Run

```bash
# From the repo root:
node fetch.js introduction/building-gut-instinct
node fetch.js introduction/start-a-project-with-brand-and-goals
```

Output: `<video-directory>/<slug>.vtt`
Side-effect: saves `<video-directory>/_subtitles.m3u8` (the intermediate subtitle playlist)

## What the Script Does

1. Finds the master playlist (`master.m3u8` / `_resMaster.m3u8` / `index.m3u8`)
2. Parses the English subtitle URI and extracts the video ID
3. Validates the hdntl token expiry
4. Fetches the subtitle m3u8 playlist from `https://vod-akm.play.hotmart.com/video/<videoId>/hls/`
5. Downloads all segments with a 30ms polite delay between requests
6. Deduplicates overlapping cue blocks with a `seen` Set
7. Writes the merged result to `<slug>.vtt`

## Output structure

Per the `vtt-to-notes` skill convention:
```
introduction/<video-slug>/
  <video-slug>.vtt     ← the downloaded subtitle file
  <video-slug>.md      ← notes written from the VTT (next step)
```

## Quick Reference

| Step | What to look for |
|------|-----------------|
| Check token valid | Script checks automatically — errors if expired |
| Find video ID | Parsed automatically from subtitle URI |
| Base CDN URL | `https://vod-akm.play.hotmart.com/video/<videoId>/hls/` |
| Headers required | `Origin: https://player.hotmart.com` + `Referer` + `User-Agent` |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Creating a per-video fetch script | Use `node fetch.js <dir>` — the shared script handles everything |
| Using curl — gets "Access Denied" | The script uses Node.js with the correct `Origin` header |
| Token expired | Re-open the video in browser; master playlist file will be refreshed |
| Duplicate cue blocks in output | The `seen` Set deduplication handles this automatically |
