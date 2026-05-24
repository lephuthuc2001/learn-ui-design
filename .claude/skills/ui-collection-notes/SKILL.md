---
name: ui-collection-notes
description: Use when writing or creating a design analysis notes file for a website in the ui-collections/ folder of this learn-ui-design repo. Triggers when the user wants to document their gut instinct homework for a specific website, write up a UI analysis, create notes from their Figma annotations, or produce a ui-collections/<slug>/notes.md file. Also use when the user says things like "write up my analysis", "document what I found", "make notes from my Figma homework", or "create the notes for [website]". The output is a structured markdown file that preserves the user's raw voice first, then adds polished analysis below each observation.
---

# UI Collection Notes

You're writing a structured design analysis for a real website the user has been studying as homework. The user has already done the observation work — your job is to faithfully capture their voice, organize their insights, and add analytical depth below each one.

The canonical example of the output format is at:
`ui-collections/almanac/notes.md`

Read it before writing. Every structural decision you make should be consistent with it.

---

## What you need before writing

Gather these in whatever order makes sense:

1. **Website name, URL, and type** (e.g. "Almanac — Wiki / Workflow SaaS landing page")
2. **The user's raw observations** — these come from one of:
   - A Figma frame with annotated screenshots (use `get_metadata` + `get_screenshot` to read the annotations from node text)
   - The conversation itself (the user has been describing what they see)
   - An existing rough notes file
3. **Images** — screenshots that correspond to each section of the analysis, already saved in `ui-collections/<slug>/images/`

If images are missing, ask the user to drop them in the folder before continuing. Don't write placeholder references.

---

## Output format

Write to `ui-collections/<slug>/notes.md`. The slug is a lowercase kebab-case version of the website name (e.g. `almanac`, `stripe`, `linear`).

### File structure

```markdown
# [Site Name] — Design Analysis

**Site:** [url](https://url)
**Type:** [category e.g. Wiki / Workflow SaaS]

---

## Typography

> [user's exact words, preserved verbatim]

[your polished analysis — 2-4 sentences explaining the WHY]

---

## Color

> [user's exact words]

[polished analysis]

---

## [Pattern or Section Name]

[optional: 1-sentence framing of what this section covers]

---

### [Sub-pattern name]

![caption](images/image-filename.png)

> [user's exact words for this sub-pattern]

[polished analysis]

---

## Overall

> [user's closing summary, verbatim]

[your synthesis — 2-3 sentences tying it all together]
```

---

## The core rule: voice first, analysis second

Every section follows this exact order:
1. **Blockquote** — the user's raw observation, word-for-word. Fix obvious typos only, never rewrite.
2. **Polished paragraph** — your analysis explaining *why* the thing they noticed works, using design vocabulary.

The user's voice is the primary artifact. Your analysis exists to deepen it, not replace it.

When the user says something like "feels like Tetris" or "very cool trick" — keep that. It's what makes the notes personal and memorable. Then explain in the next paragraph *why* Tetris is the right analogy (geometric sans-serif, modular letterforms, etc).

---

## Polished analysis: what to add

When writing the analytical paragraph below a user quote, focus on:

- **Name the concept** — give the design technique a proper name (geometric sans-serif, alternating layout, visual anchoring, etc.)
- **Explain the mechanism** — how does it physically work on the eye/brain?
- **Connect to the product** — why does this specific choice fit what this product is selling?
- **Reading flow** — if the user noticed something felt "smooth" or "predictable," explain the reading-direction logic behind it

Don't invent observations the user didn't make. Only elaborate on what they already noticed.

---

## Images

- Embed images immediately before the blockquote they illustrate, using a relative path: `![descriptive caption](images/filename.png)`
- If a section has multiple images (e.g. two scroll states), embed them all before the blockquote, stacked
- Caption describes what's in the image, not what the user thought of it
- Use `%20` for spaces in filenames: `image%201.png`

---

## Pattern naming

If the user gave a pattern a name (e.g. "Big 3", "the 1M trick"), use their name — capitalize it, treat it as a proper noun. If they didn't name it, give it a short descriptive name that they'd recognize.

---

## What not to do

- Don't sanitize the user's quotes. "1 big ass bold header" stays as written.
- Don't add sections the user didn't observe.
- Don't write generic design advice unconnected to what the user actually noticed.
- Don't use placeholder image references. If an image doesn't exist yet, leave a `<!-- TODO: image needed -->` comment and mention it to the user.
