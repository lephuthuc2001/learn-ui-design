---
name: process-video
description: Use when the user points at a video directory containing a master playlist (master.m3u8, _resMaster.m3u8, or index.m3u8) and wants subtitles fetched, notes written, and screenshots extracted. Combines fetch-hotmart-vtt, vtt-to-notes, and extract-video-screenshots. Stops after the notes .md is complete with screenshots embedded.
---

# Process Video: VTT + Notes + Screenshots

Workflow: given a video directory with a master playlist, produce a `.vtt` subtitle file and a `.md` notes file with screenshots embedded. **Stops here** — Anki cards are a separate decision; run `notes-to-anki` manually if needed.

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
                                             [extract-video-screenshots]  →  screenshots/*.jpg
                                                                                (embedded in <slug>.md)
                                                                                    │
                                                                                    ▼
                                                                            ⏸ STOP — notes are done
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

**Step 3 — Extract screenshots and embed in notes**
Read the `.vtt` to identify key visual moments (grep for concepts discussed in the notes). Use the `extract-video-screenshots` skill:
```bash
bash extract-screenshots.sh <video-directory> "name:HH:MM:SS" ...
```
Then embed each screenshot into the `.md` at the relevant section:
```markdown
![Descriptive alt text explaining what the image proves](screenshots/<name>.jpg)
```
Alt text should explain *what the screenshot demonstrates*, not just describe what's in it.
Output: `<video-directory>/screenshots/*.jpg` + images embedded in `<slug>.md`

**Step 4 — Hand off to user**
Tell the user the notes are ready and where the `.md` file is. Mention that `notes-to-anki` and `anki-upload` are available separately if they want flashcards.

## Usage

User provides one of:
- A directory path: `introduction/start-a-project-with-brand-and-goals`
- A file path pointing to the master playlist

Derive the slug from the directory name (lowercase, hyphenated). Use that slug for all output files.

## Output Structure

```
<unit>/
└── <slug>/
    ├── <slug>.vtt           ← fetched subtitles
    ├── <slug>.md            ← notes with embedded screenshots
    ├── <slug>.anki.md       ← Anki Q/A cards with Mermaid blocks
    ├── screenshots/
    │   ├── 01-<name>.jpg
    │   ├── 02-<name>.jpg
    │   └── ...
    └── images/
        ├── <slug>-card-1.png
        └── ...
```

## Prerequisites

- One of `master.m3u8`, `_resMaster.m3u8`, or `index.m3u8` must exist in the directory
- `hdntl` token must not be expired — the script checks this automatically and errors clearly if expired
- If token is expired: tell the user to re-open the video in their browser, which regenerates the master playlist file
- `mmdc` (`@mermaid-js/mermaid-cli`) must be installed globally for Step 3 to render diagrams
