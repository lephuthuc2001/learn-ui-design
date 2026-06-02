---
name: process-youtube
description: Use when the user pastes a YouTube URL and wants notes written from it, or says "process this video", "learn from this", "make notes from this YouTube video". Downloads transcript and video via yt-dlp, writes notes, extracts screenshots. Also triggers on youtu.be short URLs.
---

# Process YouTube Video: Transcript + Notes + Screenshots

Workflow: given a YouTube URL, download transcript + video → write `.md` notes → embed screenshots. Stops after notes — Anki is a separate step.

## Workflow

```
YouTube URL
    │
    ▼
node fetch-youtube.js <url>
    ├── youtube/<slug>/<slug>.vtt
    └── youtube/<slug>/<slug>.mp4
                │
                ▼
    [vtt-to-notes subagent]  →  youtube/<slug>/<slug>.md
                                        │
                                        ▼
                          [ffmpeg screenshot extraction]
                          4–8 frames embedded in .md
                                        │
                                        ▼
                                ⏸ STOP — notes done
```

## Step 1 — Download transcript + video

Run from the repo root:
```bash
node fetch-youtube.js <youtube-url>
```

The script prints the `Slug: <slug>` at the end. Note it — you'll use it for every subsequent path.

Output:
- `youtube/<slug>/<slug>.vtt` — English transcript
- `youtube/<slug>/<slug>.mp4` — video file

**If yt-dlp is not installed:** tell the user to run `pip install yt-dlp` and retry.
**If no English captions:** tell the user the video may not have captions; they can try `yt-dlp --list-subs <url>` to see what's available.

## Step 2 — Write the notes (dispatch as subagent)

The `.vtt` is large (often 30k+ tokens) — dispatch to a **general-purpose subagent** to protect main context.

Subagent prompt (fill in `<slug>` before dispatching):

> Read `youtube/<slug>/<slug>.vtt` and write notes to `youtube/<slug>/<slug>.md`. Load and follow the `vtt-to-notes` skill exactly. Preserve the speaker's voice: direct quotes in `>` blockquotes, include asides and digressions, use Mermaid diagrams with `<br/>` for line breaks (never `\n`). Do not summarize — match the density of the source material.

Wait for the subagent to complete. Only the final `.md` enters main context.

## Step 3 — Extract screenshots and embed in notes

Read `youtube/<slug>/<slug>.vtt` to identify 4–8 key visual moments: section transitions, diagrams being drawn, demos, before/after comparisons.

For each moment, find the timestamp in the VTT (take the cue start time, add 1–2 seconds so the visual is fully on screen). Then run:

```bash
mkdir -p youtube/<slug>/screenshots
ffmpeg -i youtube/<slug>/<slug>.mp4 \
  -ss HH:MM:SS -frames:v 1 \
  youtube/<slug>/screenshots/<NN>-<concept>.jpg
```

Name files `01-<concept>.jpg`, `02-<concept>.jpg`, etc.

Embed each screenshot in `youtube/<slug>/<slug>.md` at the relevant section:
```markdown
![Alt text explaining what the screenshot demonstrates](screenshots/<NN>-<concept>.jpg)
```

Alt text should explain *what the image proves or illustrates*, not just describe what's in it.

## Step 4 — Hand off to user

Tell the user:
- Notes are complete at `youtube/<slug>/<slug>.md`
- Run `notes-to-anki` if they want flashcards, then `anki-upload` to push to Anki

## Prerequisites

- `yt-dlp` installed: `pip install yt-dlp`
- `ffmpeg` installed (check: `ffmpeg -version`)
- Internet access to reach YouTube
