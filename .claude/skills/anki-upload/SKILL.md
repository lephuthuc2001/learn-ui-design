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

There are two source types in this repo, each with its own deck convention. Check which one the input file belongs to before deriving anything.

### 1a. UI Design course lessons (`notes-to-anki` output)

Path shape: `<unit>/<video-slug>/<video-slug>.anki.md`

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

### 1b. Academic book decks (`academic-book-anki` output)

Path shape: `<book>/<chapter-or-part>/<book>-<chapter-or-part>.anki.md` (e.g. `csapp/ch06/csapp-ch06.anki.md`, `ostep/part1/ostep-part1.anki.md`)

These are **separate top-level decks**, one per book — never nested under `UI/UX::Learn UI Design`. Check `listDecks` first: if a deck for this book already exists (e.g. `CSAPP`), match its existing chapter-naming style instead of inventing a new one.

| Path component | Maps to |
|----------------|---------|
| book folder (e.g. `csapp`, `ostep`) | top-level deck, e.g. `CSAPP`, `OSTEP` |
| chapter/part folder (e.g. `ch06`, `part1`) | sub-deck, human-readable, e.g. `Ch06 - Memory Hierarchy`, `Part 1 - CPU Virtualization` |

**Deck name to use:** `<BOOK>::<Chapter or Part label>`
Examples: `CSAPP::Ch06 - Memory Hierarchy`, `OSTEP::Part 1 - CPU Virtualization`

This is always exactly 2 levels, so `create_deck` can create it directly — no manual GUI step needed for this source type.

**Tags to apply to every card:** the book name, the chapter/part slug, and a topic slug derived from the chapter's subject:
```
<book>  <chapter-or-part-slug>  <topic-slug>
```
Example tags: `ostep`, `part1`, `cpu-virtualization`

> **Sub-deck limitation (UI Design decks only):** `create_deck` only supports 2-level names. Decks 3+ levels deep (as in 1a above) must be created manually in the Anki GUI first. If `add_notes` returns "Deck not found", tell the user to create the sub-deck in Anki's GUI, then retry. As a fallback, offer to add cards to `UI/UX::Learn UI Design` with the tags above so no cards are lost. Academic book decks (1b) don't hit this limitation since they're always 2 levels.

## Step 2 — Upload images

Parse the `.anki.md` file for ALL image references. Two path patterns appear:

- `![](images/<filename>)` — Mermaid PNGs, book-figure crops, and other illustrations
- `![](screenshots/<filename>)` — lesson screenshots

For each **unique** image file referenced (deduplicate — two cards can reference the same image):

### Try first: `store_media_file` with a Windows temp path

1. **Copy the file to Windows temp via Bash:**
   ```bash
   cp /home/lephuthuc/learn-ui-design/<unit>/<lesson>/images/<filename> \
      /mnt/c/Users/ADMIN/AppData/Local/Temp/<filename>
   # or for screenshots:
   cp /home/lephuthuc/learn-ui-design/<unit>/<lesson>/screenshots/<filename> \
      /mnt/c/Users/ADMIN/AppData/Local/Temp/<filename>
   ```
   You can batch all copies in a single `cp` command.

2. **Call `store_media_file`** with the Windows path:
   ```
   path: C:\Users\ADMIN\AppData\Local\Temp\<filename>
   filename: _<filename>
   ```
   The `_` prefix prevents Anki's unused-media cleanup from deleting the file.

> **WHY UNC PATHS DON'T WORK:** The AnkiMCP stdio server runs on Windows but resolves paths using Linux `path.resolve()`. Passing a UNC path (`\\wsl.localhost\...`) causes it to emit a Linux path to AnkiConnect, which cannot open it. The Windows-temp-copy workaround above exists specifically to route around that.

### Known-broken fallback: direct base64 POST to AnkiConnect

As of 2026-07, `store_media_file` with the Windows temp path above has also started failing with `Invalid argument` — AnkiConnect appears to be resolving the Windows path relative to a Linux working directory (joining `C:\...` onto the Linux cwd instead of treating it as an absolute Windows path). If you hit this error, skip the MCP tool entirely and POST directly to AnkiConnect:

```python
import base64, json, urllib.request

with open("/home/lephuthuc/learn-ui-design/<path>/<filename>", "rb") as f:
    data = base64.b64encode(f.read()).decode()

payload = {
    "action": "storeMediaFile",
    "version": 6,
    "params": {"filename": "_<filename>", "data": data}
}
req = urllib.request.Request(
    "http://172.23.240.1:8765",
    data=json.dumps(payload).encode(),
    headers={"Content-Type": "application/json"},
)
print(urllib.request.urlopen(req).read())
```

This is slower per-file than the path-based call but reliable — normal base64 concerns (token cost) don't apply here since the encoding happens in a Python subprocess, not in the model's own output. Batch multiple files in one script to minimize round trips. Before trying this fallback, first attempt the path-based `store_media_file` call — it's faster when it works, and whether it's still broken should be re-verified each session rather than assumed.

### After either method

Build a unified map: `original-path → stored-filename` keyed by the full original reference string (e.g. `screenshots/02-alignment-room.jpg`, or `images/mlfq-example.png`). Save the returned filename (Anki may add a hash suffix on collision).

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

**Answer formatting rule:**
- Every sentence in the answer that ends with a period (`.`) must be followed by `<br>` so each sentence renders on its own line in Anki. Apply this to all prose sentences. Do not add `<br>` after list items that already use `<br>` as a separator.

**Card fields:**
- **Front:** The question text (everything after `Q: `).
- **Back:** The answer text (everything after `A: `, with the sentence-break rule applied), followed by one `<br><img src="...">` tag per image this card references:
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
      "tags": ["<tag1>", "<tag2>", "<tag3>"]
    },
    ...
  ]
}
```

Use the deck name and tags derived in Step 1a or 1b, whichever applies to this source file.

## Step 5 — Sync to AnkiWeb

Call `sync` after all cards are uploaded to push the new cards and media to AnkiWeb.

## Step 6 — Report

After uploading and syncing, report:
- How many cards were created / skipped (duplicates) / failed
- Which deck they landed in
- Which images were uploaded (and their stored filenames if renamed)
- Whether the sync succeeded
- If any sub-deck was missing: instruct the user to create it in Anki GUI and re-run
