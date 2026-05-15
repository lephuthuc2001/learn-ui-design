---
name: process-video
description: Use when the user points at a video directory containing a master playlist (master.m3u8, _resMaster.m3u8, or index.m3u8) and wants subtitles fetched, notes written, and Anki flashcards generated. Combines fetch-hotmart-vtt, vtt-to-notes, and notes-to-anki. Stops after generating the .anki.md so the user can review cards before uploading.
---

# Process Video: VTT + Notes + Anki Cards

Workflow: given a video directory with a master playlist, produce a `.vtt` subtitle file, a `.md` notes file, and an `.anki.md` flashcard file with rendered diagram PNGs. **Stops here** — the user reviews cards before uploading. Upload separately with the `anki-upload` skill.

## Workflow

```
master.m3u8 / _resMaster.m3u8 / index.m3u8
      │
      ▼
[fetch-hotmart-vtt]  →  node fetch.js <dir>  →  <slug>.vtt
                                                      │
                                                      ▼
                                              [vtt-to-notes]  →  <slug>.md
                                                                    │
                                                                    ▼
                                                          [notes-to-anki]  →  <slug>.anki.md
                                                                              + images/<slug>-card-*.png
                                                                                    │
                                                                                    ▼
                                                                            ⏸ STOP — user reviews cards
                                                                            then runs anki-upload manually
```

**Step 1 — Fetch the VTT**
Run the shared script from the repo root:
```bash
node fetch.js <video-directory>
```
The script auto-detects `master.m3u8`, `_resMaster.m3u8`, or `index.m3u8` — whichever exists.
Output: `<video-directory>/<slug>.vtt`

**Step 2 — Write the notes (dispatch as subagent)**
The `.vtt` file is large (often 30k+ tokens) and would permanently bloat main context. Dispatch this step to a **general-purpose subagent** with a self-contained prompt that:
- Names the exact `.vtt` path and the expected output `.md` path
- Tells the agent to load the `vtt-to-notes` skill and follow it
- Reminds it to preserve the instructor's voice (direct quotes in `>` blockquotes), include asides, and use Mermaid with `<br/>` for line breaks

The agent reads the VTT, writes the `.md`, and reports back. Only the final `.md` enters main context.
Output: `<video-directory>/<slug>.md`

**Step 3 — Generate Anki flashcards (inline, in main thread)**
Run inline so you can eyeball the cards and steer phrasing. Invoke the `notes-to-anki` skill on the `.md` notes file. The skill writes the card file and renders Mermaid diagrams to PNGs with `mmdc`.
Output: `<video-directory>/<slug>.anki.md` + `<video-directory>/images/<slug>-card-*.png`

**Step 4 — Hand off to user**
Tell the user:
- Where the `.anki.md` file is
- How many cards were generated
- To review and edit the file, then run the `anki-upload` skill when ready

## Usage

User provides one of:
- A directory path: `introduction/start-a-project-with-brand-and-goals`
- A file path pointing to the master playlist

Derive the slug from the directory name (lowercase, hyphenated). Use that slug for all output files.

## Output Structure

```
<unit>/
└── <slug>/
    ├── <slug>.vtt        ← fetched subtitles
    ├── <slug>.md         ← notes written from VTT
    ├── <slug>.anki.md    ← Anki Q/A cards with Mermaid blocks
    └── images/
        ├── <slug>-card-1.png
        ├── <slug>-card-2.png
        └── ...
```

## Prerequisites

- One of `master.m3u8`, `_resMaster.m3u8`, or `index.m3u8` must exist in the directory
- `hdntl` token must not be expired — the script checks this automatically and errors clearly if expired
- If token is expired: tell the user to re-open the video in their browser, which regenerates the master playlist file
- `mmdc` (`@mermaid-js/mermaid-cli`) must be installed globally for Step 3 to render diagrams
