# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

A personal study repo that has grown beyond its original scope. It started as notes for the **Learn UI Design** course hosted on Hotmart (`01-introduction` through `07-communicating-design`), and now also holds:

- **Academic CS study material** — `csapp/`, `ostep/`, `networking/`, `ddia/`: chapter-by-chapter notes and Anki decks built with the `academic-book-anki` skill, not the video pipeline below.
- **Interview prep** — `interview-prep/`.
- **UI design collections** — `ui-collections/`: standalone design-analysis writeups, not tied to the course.
- **YouTube-sourced notes** — `youtube/`, via `process-youtube`.

The video-course workflow below (HLS fetch → VTT → notes → Anki) only applies to the numbered course units (`01-introduction` … `07-communicating-design`). The CS book directories (`csapp`, `ostep`, `networking`, `ddia`) have no video/VTT step — they go straight from source material to notes to `academic-book-anki`.

## Directory Layout

**Course units** (`01-introduction/` … `07-communicating-design/`):

```
<unit>/
└── <video-slug>/
    ├── master.m3u8 / _resMaster.m3u8 / index.m3u8   ← HLS playlist (user-provided)
    ├── _subtitles.m3u8                                ← intermediate subtitle playlist
    ├── <video-slug>.vtt                               ← merged subtitle file
    ├── <video-slug>.md                                ← notes with embedded screenshots
    ├── <video-slug>.anki.md                           ← Anki Q/A flashcards
    ├── screenshots/                                   ← frames extracted from video
    │   ├── 01-<name>.jpg
    │   └── ...
    └── images/                                        ← rendered Mermaid PNGs for Anki
        └── <video-slug>-card-*.png
```

**Academic book material** (`csapp/`, `ostep/`, `networking/`, `ddia/`):

```
<book>/<chapter-or-part>/
├── <book>-<chapter>.anki.md   ← Anki Q/A flashcards (source material comes from the book itself)
└── images/                    ← reference figures/diagrams used as card illustrations
```

## Core Workflow

**Fetch subtitles from a video directory:**

```bash
node fetch.js <video-directory>
# e.g. node fetch.js introduction/building-gut-instinct
```

The shared `fetch.js` at the repo root auto-detects the master playlist, validates the hdntl token expiry, downloads all subtitle segments, and writes `<slug>.vtt`.

**If the token is expired**, tell the user to re-open the video in their browser — this regenerates the master playlist file.

**If fetch succeeds but the `.vtt` is empty (8 bytes, just `WEBVTT`)**, the Akamai CDN rejected the subtitle segments. This is fixed in `fetch.js` by including `Sec-Fetch-Dest`, `Sec-Fetch-Mode`, and `Sec-Fetch-Site` headers — Akamai requires these to allow cross-origin subtitle requests even with a valid `hdntl` token. The fix is already applied; if it recurs, check that those headers are still present in `HEADERS` in `fetch.js`.

**Then convert VTT to notes** using the `vtt-to-notes` skill.

**Or do both steps at once** using the `process-video` skill.

## Skills

Custom skills live in `.claude/skills/`:

| Skill                        | Trigger                                                        |
| ---------------------------- | -------------------------------------------------------------- |
| `fetch-hotmart-vtt`          | Course video directory has a master playlist but no `.vtt`     |
| `vtt-to-notes`               | `.vtt` exists and notes need to be written                     |
| `extract-video-screenshots`  | Notes need screenshots/images extracted from the video stream  |
| `notes-to-anki`              | Course notes `.md` exists and flashcards need to be generated  |
| `academic-book-anki`         | Making flashcards from a CS textbook chapter (csapp/ostep/networking/ddia) |
| `anki-upload`                | Any `.anki.md` is ready and cards need uploading to Anki       |
| `process-video`              | End-to-end for course videos: fetch + notes + screenshots      |
| `process-youtube`            | Notes from a pasted YouTube URL                                |
| `ui-collection-notes`        | Writing a design analysis for `ui-collections/<slug>/`         |
| `publish-note`               | Finished `.md` notes need publishing to the blog               |

**Shared script at repo root:**
```bash
bash extract-screenshots.sh <video-directory> "name:HH:MM:SS" ...
```
Reads the token from `index.m3u8`, downloads segments from `vod-akm.play.hotmart.com`, fetches the AES key, and extracts frames with ffmpeg. Output goes to `<video-directory>/screenshots/`.

## Anki Decks

There are two deck conventions depending on source type — see the `anki-upload` skill for full detail:

- **Course notes** (numbered units): nested under **`UI/UX::Learn UI Design`** (deck ID `1778403436058`), e.g. `UI/UX::Learn UI Design::01. Introduction::01. Begin Here`. Never create cards or decks for course content outside this parent.
- **Academic book notes** (`csapp`, `ostep`, `networking`, `ddia`): separate top-level decks, one per book, e.g. `CSAPP::Ch06 - Memory Hierarchy` — never nested under `UI/UX::Learn UI Design`.

### Sub-deck hierarchy

The `create_deck` MCP tool only supports 2-level names (`Parent::Child`). Course sub-decks are 3+ levels deep (e.g. `UI/UX::Learn UI Design::01. Introduction::01. Begin Here`) and must be **created manually in the Anki GUI first**; academic book decks are always exactly 2 levels and can be created directly.

### Uploading images from WSL

AnkiMCP runs on Windows and cannot read Linux paths. Use the Windows UNC path to the WSL filesystem instead:

```
\\wsl.localhost\Ubuntu\home\lephuthuc\learn-ui-design\<relative-path>
```

Pass this as the `path` argument to `store_media_file`.

## Publishing Notes to the Blog

Finished notes graduate from this repo to the blog at `~/blog`. To publish a note:

1. Copy the `.md` file to `~/blog/src/content/notes/learn-ui-design/`
2. Add frontmatter (title, course, unit, lesson, date, tags, description)
3. Remove the leading `# Title` heading — PostLayout renders it from frontmatter
4. Run `pnpm build` in `~/blog` to verify

See `~/blog/CLAUDE.md` for the full blog workflow.

## Notes Style (from `vtt-to-notes` skill)

- Preserve the instructor's voice — use `>` blockquotes for direct quotes, not paraphrases
- Include all substantive points including asides and digressions
- Use Mermaid diagrams for structural concepts (flows, hierarchies, spectrums)
- **Always use `<br/>` for line breaks inside Mermaid node labels** — `\n` does not render
