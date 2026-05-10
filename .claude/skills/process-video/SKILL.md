---
name: process-video
description: Use when the user points at a video directory containing a master playlist (master.m3u8, _resMaster.m3u8, or index.m3u8) and wants subtitles fetched and notes written. Combines fetch-hotmart-vtt and vtt-to-notes into one end-to-end workflow.
---

# Process Video: VTT + Notes

End-to-end workflow: given a video directory with a master playlist, produce a `.vtt` subtitle file and a `.md` notes file.

## Workflow

```
master.m3u8 / _resMaster.m3u8 / index.m3u8
      │
      ▼
[fetch-hotmart-vtt]  →  node fetch.js <dir>  →  <slug>.vtt
                                                      │
                                                      ▼
                                              [vtt-to-notes]  →  <slug>.md
```

**Step 1 — Fetch the VTT**
Run the shared script from the repo root:
```bash
node fetch.js <video-directory>
```
The script auto-detects `master.m3u8`, `_resMaster.m3u8`, or `index.m3u8` — whichever exists.
Output: `<video-directory>/<slug>.vtt`

**Step 2 — Write the notes**
Invoke the `vtt-to-notes` skill on the `.vtt` file just created.
Output: `<video-directory>/<slug>.md`

## Usage

User provides one of:
- A directory path: `introduction/start-a-project-with-brand-and-goals`
- A file path pointing to the master playlist

Derive the slug from the directory name (lowercase, hyphenated). Use that slug for both output files.

## Output Structure

```
<unit>/
└── <slug>/
    ├── <slug>.vtt    ← fetched subtitles
    └── <slug>.md     ← notes written from VTT
```

## Prerequisites

- One of `master.m3u8`, `_resMaster.m3u8`, or `index.m3u8` must exist in the directory
- `hdntl` token must not be expired — the script checks this automatically and errors clearly if expired
- If token is expired: tell the user to re-open the video in their browser, which regenerates the master playlist file
