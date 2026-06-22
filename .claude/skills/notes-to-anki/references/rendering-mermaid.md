# Rendering Mermaid diagrams to PNG (for Anki)

Anki does not render Mermaid natively. After writing the `.anki.md`, render every ` ```mermaid ` block in it to a PNG using [`@mermaid-js/mermaid-cli`](https://github.com/mermaid-js/mermaid-cli). Place rendered images in a sibling `images/` folder so they can be imported into Anki as media.

```
<unit>/<video-slug>/
├── <slug>.md
├── <slug>.anki.md
└── images/
    ├── <slug>-card-1.png
    ├── <slug>-card-2.png
    └── ...
```

## One-shot render command

`mmdc` accepts a Markdown input and renders **every** Mermaid block inside it to numbered output files in one pass:

```bash
mkdir -p <unit>/<video-slug>/images
mmdc \
  -i <unit>/<video-slug>/<slug>.anki.md \
  -o <unit>/<video-slug>/images/<slug>-card.png \
  -t dark -b "#1f1f1f"
```

This writes `<slug>-card-1.png`, `<slug>-card-2.png`, etc., one per Mermaid block, in document order. `mmdc` is installed globally (`@mermaid-js/mermaid-cli`); no per-run install needed.

`-t dark -b "#1f1f1f"` renders arrows and labels in light colors so they're visible against Anki's dark mode background. Do not use `-t default -b transparent` — default-theme arrows are dark and invisible on dark backgrounds.

Flags worth knowing:
- `-t dark` — use for Anki dark mode (light arrows on dark bg)
- `-b <hex>` — match Anki's card background (`#1f1f1f` is a close approximation)
- `-w 1200 -H 800` — explicit width/height if a diagram is getting clipped
- `-c config.json` — custom Mermaid config (rarely needed)

If `npx` is too slow each run, install once globally: `npm i -g @mermaid-js/mermaid-cli`.

## Linking the PNGs in the .anki.md

Immediately **after** each ` ```mermaid ` block, add a Markdown image reference pointing to the PNG that will be generated for that block. The user can preview the Mermaid source in their IDE *and* the PNG renders for Anki import:

```
Q: What are the six core tools of the Fundamentals unit?
A: Alignment, spacing, consistency (adding structure) + lightening, hiding, removing (reducing emphasis).

` ` `mermaid
flowchart LR
    ...
` ` `
![](images/<slug>-card-1.png)
```

Number image references in the same order as the Mermaid blocks (`-card-1.png`, `-card-2.png`, …) — `mmdc` writes them in document order, so the numbering matches automatically as long as you don't reorder the blocks after rendering.

## When to (re)render

Run `mmdc` after:
- Initial card generation
- Editing any Mermaid block
- Adding or removing a card that contains a diagram (numbering shifts)
