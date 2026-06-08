---
name: vtt-to-notes
description: Use when reading a .vtt subtitle file for any video in this learn-ui-design repo and writing notes from it
---

# VTT to Notes

## Overview

When the user provides a `.vtt` subtitle file from a course video, produce faithful, detailed notes that preserve the instructor's voice — not a cleaned-up summary.

## File & Folder Organization

For each video, create a folder named after the video slug inside its unit folder:

```
<unit>/
└── <video-slug>/
    ├── <video-slug>.vtt   ← move the original here
    └── <video-slug>.md    ← write notes here
```

Example: `introduction/begin-here.vtt` → `introduction/begin-here/begin-here.vtt` + `introduction/begin-here/begin-here.md`

## Note-Taking Style

### Preserve the instructor's voice
- Use **direct quotes** (in `>` blockquotes) for anything noteworthy the instructor actually says — opinions, asides, personal observations, punchlines
- Do not paraphrase if the original phrasing is distinctive or memorable
- Capture tone: if he's self-deprecating, funny, or emphatic — keep it

### Do not over-summarize
- Include all substantive points, not just the "main" ones
- Personal comments, analogies, and digressions are part of the content — do not drop them
- If the instructor makes an aside ("Have you noticed, by the way..."), include it, because the user wants it

### Structure
- Use `##` headers for major sections / units
- Use `###` for subsections
- Use bullet lists for enumerated items (sub-skills, rules, etc.)
- Use `>` blockquotes for direct quotes
- Use `**bold**` for named concepts, frameworks, and terms the instructor coins
- End with the instructor's closing words if they're meaningful

### Topics File (when present)

If the video directory contains a `topics.md` file, use it as the structural skeleton **before** reading the VTT.

Format:
```
TOPICS
[1:30] First topic title
[4:23] Second topic title
...
```

Steps:
1. Parse each line — top-level `[MM:SS] Title` lines become `##` headers; **indented** `[MM:SS] Title` lines become `###` headers under the parent `##` section
2. Lay out all headers first to scaffold the full structure
3. Read the VTT and fill content under each header using the timestamps as section boundaries — content between timestamp N and N+1 belongs under header N
4. If the final topic runs to the end of the video, include everything after its timestamp

Example — given this `topics.md`:
```
[3:34] Craigslist app example

    [4:42] Separators in the current header
    [13:19] Making the search bar a focal point
```
Produces:
```
## [3:34] Craigslist app example
### [4:42] Separators in the current header
### [13:19] Making the search bar a focal point
```

**Do not skip topics or merge adjacent ones** — the instructor defined this structure intentionally.

## Diagrams

Use **Mermaid** diagrams to visualize concepts that have structure — don't just describe them in prose when a diagram communicates it better. Good candidates:
- Multi-step progressions or flows (course structure, learning paths)
- Spectrums or scales (low-brand → high-brand)
- Hierarchies and breakdowns (skill → sub-skills)
- Input → transformation → output relationships (brand → levers → interface)
- Comparisons (passive watching vs. active practice)

Place diagrams inline, right where the concept is introduced — not in a separate section.

**Always use `<br/>` for line breaks inside Mermaid node labels — never `\n`, it does not render.**

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Turning a direct quote into a bullet point | Keep it as a `>` blockquote |
| Dropping personal asides ("I promise, this is not accidental") | Include them — the user wants the full picture |
| Writing a 5-bullet summary of a 13-minute video | Go deeper; match the density of the source |
| Cleaning up the instructor's phrasing | Preserve his exact words |
