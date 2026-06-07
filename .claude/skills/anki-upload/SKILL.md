---
name: anki-upload
description: Use when uploading Anki flashcards from a <slug>.anki.md file to the Anki desktop app via the AnkiMCP server. Parses Q/A pairs, uploads images, and batch-creates cards in the correct deck.
---

# Anki Upload

## Overview

Given a `<slug>.anki.md` flashcard file (produced by `notes-to-anki`), upload all cards to the Anki desktop app via the AnkiMCP MCP server tools.

**Always dispatch this as a subagent.** The work is fully mechanical (parse → upload images → upload cards), needs no steering, and the MCP responses are verbose. The main thread only needs the final report.

When invoking as a subagent, pass:
- The exact `.anki.md` path
- The instruction to follow the `anki-upload` skill
- The expectation that it returns a short summary: cards created / skipped / failed, deck name, images uploaded

## Input

Path to the `.anki.md` file:
```
<unit>/<video-slug>/<video-slug>.anki.md
```

## Step 1 — Determine target deck and tags

Derive deck and tags from the file path:

| Path component | Maps to |
|----------------|---------|
| repo root deck | `UI/UX::Learn UI Design` (always — never create cards outside this) |
| unit folder (e.g. `01-introduction`) | sub-deck level 1, e.g. `01. Introduction` |
| lesson folder (e.g. `01-begin-here`) | sub-deck level 2, e.g. `01. Begin Here` |

**Deck name to use:** `UI/UX::Learn UI Design::<Unit>::<Lesson>`  
Example: `UI/UX::Learn UI Design::01. Introduction::01. Begin Here`

**Tags to apply to every card:** derived from the path segments, lowercased and hyphenated:
```
learn-ui-design  <unit-folder>  <lesson-folder>
```
Example tags: `learn-ui-design`, `01-introduction`, `01-begin-here`

> **Sub-deck limitation:** `create_deck` only supports 2-level names. Decks 3+ levels deep must be created manually in the Anki GUI first. If `add_notes` returns "Deck not found", tell the user to create the sub-deck in Anki's GUI, then retry. As a fallback, offer to add cards to `UI/UX::Learn UI Design` with the tags above so no cards are lost.

## Step 2 — Upload images

> **NEVER base64-encode images.** Always upload via the `path` parameter (Method 2). Base64 is extremely slow, wastes thousands of tokens, and may timeout. If you find yourself running `base64` or encoding image data, stop immediately and use the UNC path approach below instead.

Parse the `.anki.md` file for ALL image references. Two path patterns appear:

- `![](images/<filename>)` — Mermaid PNGs and SVG illustrations
- `![](screenshots/<filename>)` — lesson screenshots

For each **unique** image file referenced (deduplicate — two cards can reference the same screenshot):

1. Build the **Windows UNC path** based on the subfolder:
   ```
   # For images/ references:
   \\wsl.localhost\Ubuntu\home\lephuthuc\learn-ui-design\<unit>\<lesson>\images\<filename>

   # For screenshots/ references:
   \\wsl.localhost\Ubuntu\home\lephuthuc\learn-ui-design\<unit>\<lesson>\screenshots\<filename>
   ```
2. Call `store_media_file` with that path, using a `filename` prefixed with `_` (e.g. `_02-alignment-room.jpg`). The underscore prefix prevents Anki's unused media cleanup from deleting the file. Save the **returned filename** (Anki may rename the file with a hash suffix if a collision exists).
3. Build a unified map: `original-path → stored-filename` keyed by the full original reference string (e.g. `screenshots/02-alignment-room.jpg`).

Upload all images before creating any cards.

## Step 3 — Parse cards

Read the `.anki.md` file and extract Q/A pairs. The format is:

```
Q: <question text>
A: <answer text>

```mermaid
...optional diagram...
```
![](images/<slug>-card-N.png)
```

**Parsing rules:**
- A card starts with `Q:` on its own line.
- The answer is the `A:` line(s) that follow.
- A ` ```mermaid ` block immediately after an answer belongs to that card (skip the raw Mermaid source — Anki doesn't render it).
- Any `![](images/<filename>)` or `![](screenshots/<filename>)` line that follows an answer (or a mermaid block) belongs to that card. A single card can have multiple image lines — collect them all.
- Blank lines separate cards.
- The `# Title` header line is not a card — skip it.

**Card fields:**
- **Front:** The question text (everything after `Q: `).
- **Back:** The answer text (everything after `A: `), followed by one `<br><img src="...">` tag per image this card references:
  ```html
  <br><img src="<stored-filename-1>">
  <br><img src="<stored-filename-2>">
  ```
  Use `stored-filename` values from the map built in Step 2 (not the original paths).

## Step 4 — Upload cards

Call `add_notes` with all parsed cards in a single batch (up to 100 per call; split into multiple calls if the deck has more):

```json
{
  "deck_name": "<full deck path>",
  "model_name": "Basic",
  "notes": [
    {
      "fields": { "Front": "<question>", "Back": "<answer html>" },
      "tags": ["learn-ui-design", "<unit-folder>", "<lesson-folder>"]
    },
    ...
  ]
}
```

## Step 5 — Report

After uploading, report:
- How many cards were created / skipped (duplicates) / failed
- Which deck they landed in
- Which images were uploaded (and their stored filenames if renamed)
- If any sub-deck was missing: instruct the user to create it in Anki GUI and re-run
