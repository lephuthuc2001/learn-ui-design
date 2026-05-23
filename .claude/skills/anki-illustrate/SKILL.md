---
name: anki-illustrate
description: Generate custom SVG illustrations for Anki flashcards in this learn-ui-design repo, when a concept needs a visual that screenshots and Mermaid diagrams cannot express. Use when working on .anki.md files and a card concept is inherently visual — colors, tonal ranges, design spectrums, or before/after comparisons — but no screenshot covers it and Mermaid can't render actual colors or freeform layouts. Common triggers: "add a visual to this card", "show the color palette", "illustrate the spectrum", "visualise the before/after".
---

# Anki Illustrate

Generates dark-mode–friendly SVG visuals for flashcards using a bundled Node.js script. No npm install needed — the script uses only Node built-ins.

## When to use vs. alternatives

| Situation | Use |
|---|---|
| Screenshot of the lesson exists | `screenshots/` reference — fastest |
| Concept has structure/flow | Mermaid diagram in .anki.md |
| Concept involves actual colors, layout panels, or a spectrum | **This skill** |

## Output

Always writes an `.svg` file into the lesson's `images/` folder. Attempts PNG conversion via `rsvg-convert` / `convert` / `inkscape` if available — falls back to SVG, which Anki supports natively.

Reference in `.anki.md`:
```
![](images/<slug>-<name>.svg)
```
If a `.png` was also produced, prefer it:
```
![](images/<slug>-<name>.png)
```

---

## Visual types

### `color-swatches`
A row of colored rectangles, optionally split into labelled groups.

**When:** comparing palettes (playful vs. flat), naming color families, showing what "fresh" vs "dull" looks like.

**Data shape:**
```json
{
  "groups": [
    {
      "label": "PLAYFUL",
      "swatches": [
        { "color": "#FF6B9D", "label": "pink-red",  "sublabel": "leans pink" },
        { "color": "#56C9D8", "label": "aqua-blue", "sublabel": "leans teal" }
      ]
    },
    {
      "label": "FLAT",
      "swatches": [
        { "color": "#CC0000", "label": "flat red" },
        { "color": "#003FCC", "label": "flat blue" }
      ]
    }
  ]
}
```
`sublabel` is optional. Any number of groups and swatches.

---

### `tonal-scale`
A row of rectangles showing one hue from darkest to lightest.

**When:** teaching "variations on a color", tonal hierarchy, how to use one color across multiple weights.

**Data shape:**
```json
{
  "stops":  ["#003D7A", "#0066CC", "#4DA3FF", "#B3D9FF", "#EBF5FF"],
  "labels": ["darkest", "", "mid", "", "lightest"]
}
```
Empty string `""` skips the label for that stop.

---

### `spectrum`
A horizontal gradient bar from a negative pole (red) to a positive pole (green), with optional position markers.

**When:** design spectrums — cluttered↔clean, low-brand↔high-brand, safe↔risky.

**Data shape:**
```json
{
  "left":    "Cluttered",
  "right":   "Clean",
  "markers": [
    { "position": 0.15, "label": "beginner layout" },
    { "position": 0.82, "label": "pro layout" }
  ]
}
```
`position` is 0–1. `markers` is optional.

---

### `comparison`
Two side-by-side panels with bullet items, separated by a "vs" badge.

**When:** before/after, bad/good, two approaches side by side.

**Data shape:**
```json
{
  "left": {
    "title": "Eric's bad chart",
    "items": ["incoherent colors", "no white space", "poor alignment"]
  },
  "right": {
    "title": "Parulski's good chart",
    "items": ["single blue hue × 3 tones", "generous white space", "clean grid"]
  }
}
```

---

## Running the script

```bash
node .claude/skills/anki-illustrate/scripts/generate-illustration.js \
  --type <type> \
  --output "<lesson-path>/images/<slug>-<name>.svg" \
  --title "<Title shown at top>" \
  --data '<json>'
```

Run from the repo root (`/home/lephuthuc/learn-ui-design`).

**Example — playful palette:**
```bash
node .claude/skills/anki-illustrate/scripts/generate-illustration.js \
  --type color-swatches \
  --output "01-introduction/04-building-gut-instinct/images/building-gut-instinct-playful-palette.svg" \
  --title "Playful Palette" \
  --data '{"groups":[{"label":"PLAYFUL","swatches":[{"color":"#FF6B9D","label":"pink-red","sublabel":"leans pink"},{"color":"56C9D8","label":"aqua-blue","sublabel":"leans teal"}]},{"label":"FLAT","swatches":[{"color":"#CC0000","label":"flat red"},{"color":"#003FCC","label":"flat blue"}]}]}'
```

## After generating

1. Check the file was created: `ls <lesson-path>/images/`
2. Open the SVG mentally (or `cat` it) to sanity-check dimensions make sense.
3. Add the reference to the relevant card in `.anki.md`.
4. If the card's mermaid diagram numbering shifts because you replaced a mermaid with this SVG, re-run `mmdc` to regenerate PNGs.
