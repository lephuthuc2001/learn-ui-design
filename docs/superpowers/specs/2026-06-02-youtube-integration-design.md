# YouTube Integration Design

**Date:** 2026-06-02
**Status:** Approved

## Goal

Allow YouTube videos to be processed with the same workflow as Hotmart course lessons: paste a URL → get a `.vtt` transcript and `.mp4` video downloaded automatically → produce `.md` notes with embedded screenshots → optionally generate Anki cards.

## Approach

Option A: new `fetch-youtube.js` script + new `process-youtube` skill. Existing skills (`vtt-to-notes`, `notes-to-anki`, `anki-upload`) are reused unchanged.

## Directory Structure

```
youtube/
└── <slug>/
    ├── <slug>.vtt          ← English transcript from yt-dlp
    ├── <slug>.mp4          ← video from yt-dlp (for screenshot extraction)
    ├── <slug>.md           ← notes (same format as course lessons)
    ├── <slug>.anki.md      ← Anki cards (optional, separate step)
    └── screenshots/
        └── *.jpg
```

### Slug Derivation

1. Call `yt-dlp --print title <url>` to get the video title.
2. Sanitize: lowercase, replace non-alphanumeric runs with hyphens, trim leading/trailing hyphens.
3. Fallback to the YouTube video ID (the `v=` parameter) if the sanitized title is empty or invalid.

## `fetch-youtube.js` Script

Lives at repo root alongside `fetch.js`. Single argument: a YouTube URL.

```bash
node fetch-youtube.js https://www.youtube.com/watch?v=7xTGNNLPyMI
```

**Steps:**
1. Derive slug from video title (see above).
2. Create `youtube/<slug>/` if it doesn't exist.
3. Download English `.vtt` transcript:
   ```bash
   yt-dlp --write-auto-sub --sub-lang en --skip-download --sub-format vtt \
     -o "youtube/<slug>/<slug>" <url>
   ```
   yt-dlp appends `.en.vtt` — rename to `<slug>.vtt` after download.
4. Download video (best mp4):
   ```bash
   yt-dlp -f "bv[ext=mp4]+ba[ext=m4a]/best[ext=mp4]" \
     -o "youtube/<slug>/<slug>.mp4" <url>
   ```
5. Print the output directory path on success.

**Error handling:**
- `yt-dlp` not found in PATH → clear install instructions.
- No English subtitles available → error with suggestion to try `--sub-lang en-US` or auto-generated captions.
- Invalid/unreachable URL → surface yt-dlp's error directly.

## `process-youtube` Skill

New skill at `.claude/skills/process-youtube/SKILL.md`.

**Trigger:** User pastes a YouTube URL and wants notes, or says "process this video", "learn from this", etc.

### Workflow

```
YouTube URL
    │
    ▼
node fetch-youtube.js <url>
    │
    ├── youtube/<slug>/<slug>.vtt
    └── youtube/<slug>/<slug>.mp4
                │
                ▼
    [vtt-to-notes subagent]
    (dispatched to protect main context from large VTT)
                │
                ▼
    youtube/<slug>/<slug>.md
                │
                ▼
    [ffmpeg screenshot extraction]
    Read notes to identify key visual moments.
    For each moment:
      ffmpeg -i youtube/<slug>/<slug>.mp4 -ss <HH:MM:SS> \
        -frames:v 1 youtube/<slug>/screenshots/<name>.jpg
    Embed screenshots in .md at relevant sections.
                │
                ▼
    ⏸ STOP — notes complete
```

### Screenshot Extraction

Uses `ffmpeg` directly on the local `.mp4` — no HLS/Akamai token needed. This differs from the Hotmart workflow (`extract-screenshots.sh`) which downloads encrypted HLS segments from a CDN.

Command per frame:
```bash
ffmpeg -i youtube/<slug>/<slug>.mp4 \
  -ss HH:MM:SS -frames:v 1 \
  youtube/<slug>/screenshots/<name>.jpg
```

The skill reads the completed `.md` and the `.vtt` to identify meaningful timestamps (section transitions, key diagrams, demonstrations). It picks 4–8 screenshots per video, same density as Hotmart notes.

### Anki

Not part of this workflow. User runs `notes-to-anki` + `anki-upload` separately after reviewing the notes.

## What Is NOT Changed

- `fetch.js` — unchanged
- `extract-screenshots.sh` — unchanged (Hotmart only)
- `vtt-to-notes` skill — reused as-is
- `notes-to-anki` skill — reused as-is
- `anki-upload` skill — reused as-is
- All existing unit/lesson directory structures — untouched

## Prerequisites

- `yt-dlp` installed and on PATH (`pip install yt-dlp` or `brew install yt-dlp`)
- `ffmpeg` installed and on PATH (already required by Hotmart screenshot workflow)
