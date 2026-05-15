# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

A personal note-taking repo for a **Learn UI Design** course hosted on Hotmart. Each video has its own directory under a unit folder containing a master HLS playlist, a downloaded `.vtt` subtitle file, and a `.md` notes file.

## Directory Layout

```
introduction/
└── <video-slug>/
    ├── master.m3u8 / _resMaster.m3u8 / index.m3u8   ← HLS playlist (user-provided)
    ├── _subtitles.m3u8                                ← intermediate subtitle playlist
    ├── <video-slug>.vtt                               ← merged subtitle file
    └── <video-slug>.md                                ← notes written from VTT
```

## Core Workflow

**Fetch subtitles from a video directory:**

```bash
node fetch.js <video-directory>
# e.g. node fetch.js introduction/building-gut-instinct
```

The shared `fetch.js` at the repo root auto-detects the master playlist, validates the hdntl token expiry, downloads all subtitle segments, and writes `<slug>.vtt`.

**If the token is expired**, tell the user to re-open the video in their browser — this regenerates the master playlist file.

**Then convert VTT to notes** using the `vtt-to-notes` skill.

**Or do both steps at once** using the `process-video` skill.

## Skills

Three custom skills live in `.claude/skills/`:

| Skill               | Trigger                                       |
| ------------------- | --------------------------------------------- |
| `fetch-hotmart-vtt` | Directory has a master playlist but no `.vtt` |
| `vtt-to-notes`      | `.vtt` exists and notes need to be written    |
| `process-video`     | End-to-end: fetch + write notes in one go     |

## Anki Deck

All Anki cards and sub-decks for this repo must be created inside **`UI/UX::Learn UI Design`** (deck ID `1778403436058`). Never create cards or decks at the top level or under any other parent.

### Sub-deck hierarchy

The `create_deck` MCP tool only supports 2-level names (`Parent::Child`), so decks deeper than 2 levels (e.g. `UI/UX::Learn UI Design::01. Introduction::01. Begin Here`) must be **created manually in the Anki GUI first**. Once the deck exists, `add_notes` will work with the full path.

### Uploading images from WSL

AnkiMCP runs on Windows and cannot read Linux paths. Use the Windows UNC path to the WSL filesystem instead:

```
\\wsl.localhost\Ubuntu\home\lephuthuc\learn-ui-design\<relative-path>
```

Pass this as the `path` argument to `store_media_file`.

## Notes Style (from `vtt-to-notes` skill)

- Preserve the instructor's voice — use `>` blockquotes for direct quotes, not paraphrases
- Include all substantive points including asides and digressions
- Use Mermaid diagrams for structural concepts (flows, hierarchies, spectrums)
- **Always use `<br/>` for line breaks inside Mermaid node labels** — `\n` does not render
