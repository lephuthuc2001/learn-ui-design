---
name: notes-to-anki
description: Use when generating Anki flashcards from a lesson notes .md file in this learn-ui-design repo. Produces a Markdown Q&A file with concept-recall and application/scenario cards.
---

# Notes to Anki

## Overview

Given a lesson notes file (`<slug>.md`) written by the `vtt-to-notes` skill, generate an Anki-style flashcard deck as a Markdown Q&A file that captures the key concepts, definitions, frameworks, and applications from the lesson.

## Input & Output

**Input:** path to the notes file
```
<unit>/<video-slug>/<video-slug>.md
```

**Output:** flashcard file in the same folder
```
<unit>/<video-slug>/<video-slug>.anki.md
```

## File Format

A flat list of Q/A pairs, separated by blank lines. No headers, no extra prose — the file should be easy to copy-paste into Anki (with a Markdown→Anki importer) or read on its own.

```markdown
# <Lesson Title> — Anki Cards

Q: <question>
A: <answer>

Q: <question>
A: <answer>
[optional Mermaid diagram block — see "Visuals" below]
```

- One blank line between cards.
- Question and answer each fit on one line if reasonable; if the answer needs multiple lines, indent continuation lines or use `<br>` so it stays one logical card.
- Use **the instructor's exact phrasing** (in quotes) when the answer is a memorable line or framework — don't sanitize it.

## Visuals (Mermaid diagrams)

The user is a visual learner. For any card whose answer has **structure** that a diagram would communicate better than prose, include a Mermaid diagram immediately after the answer line. Place it inside a fenced ` ```mermaid ` block so it renders in the Markdown preview.

Example (verbatim, no outer wrapping — write it directly to the output file):

> Q: What are the six core tools of the Fundamentals unit?
> A: Alignment, spacing, consistency (adding structure) + lightening, hiding, removing (reducing emphasis).
>
> \`\`\`mermaid
> flowchart LR
>     subgraph Add["Adding structure"]
>         A1[Alignment]
>         A2[Spacing]
>         A3[Consistency]
>     end
>     subgraph Reduce["Reducing emphasis"]
>         R1[Lightening]
>         R2[Hiding]
>         R3[Removing]
>     end
>     Add --> Goal[Make a messy<br/>design look clean]
>     Reduce --> Goal
> \`\`\`

(In the actual output file, use real triple-backticks — no `>` prefix, no escaping.)

### When to include a diagram

Good candidates — include a diagram:
- **Lists with relationships** (six tools split into two groups, three card styles → one outcome)
- **Spectrums / scales** (cluttered ↔ generous white space, low-brand ↔ high-brand)
- **Flows or decision orders** (usability first → then aesthetics; brand → levers → interface)
- **Hierarchies / breakdowns** (skill → sub-skills, concept → counterexample → conclusion)
- **Comparisons** (with vs. without alignment; gallery vs. vendor stall)

Skip the diagram — prose is fine:
- Pure definitions ("What is a heuristic?")
- Single-quote recall cards
- Cards whose answer is one named thing or a memorable line

Aim for **roughly 1 in 3 cards** to have a diagram. Don't force one onto every card — visual clutter from low-value diagrams is worse than none.

### Mermaid rules
- Always use `<br/>` for line breaks inside node labels — `\n` does not render.
- Keep diagrams small (5–10 nodes). A flashcard diagram is a glance, not a map.
- Prefer `flowchart LR` for spectrums and flows, `flowchart TD` for hierarchies, `graph` only when you need free-form edges.
- Use `subgraph` to group related items when the grouping is the point of the card.

## Card Styles

Generate two kinds of cards. Aim for ~15–30 cards per ~25-minute lesson — enough to cover the substance without becoming homework.

### 1. Concept-recall cards (Basic Q→A)

Test definitions, reasoning, named frameworks, and key claims.

Examples:
```
Q: What is a heuristic, and why are heuristics useful in design?
A: A rule of thumb — a go-to idea that doesn't apply 100% of the time but points you in the right direction. They take a space of trillions of possibilities and narrow it to a manageable few to try.

Q: Why does the instructor reject "design is subjective"?
A: A design has to serve a purpose, so it can be judged against that purpose. "When someone says design is subjective, what that tells me is they haven't actually analyzed it enough."

Q: What are the six core tools taught in the Fundamentals unit?
A: Alignment, spacing, consistency (adding structure) + lightening, hiding, removing (reducing emphasis).

Q: Why is gray "the most important color"?
A: It doesn't unduly draw attention — feels understated, minimalist, and elegant. Underutilized by beginning designers.
```

Prioritize:
- **Named concepts and frameworks** the instructor coins or emphasizes
- **Why-style questions** that test reasoning, not just labels
- **Memorable quotes** as cloze-like recall ("Fill in: 'Alignment is sort of this signal that ___.'")
- **Counterexamples and tests** ("How does the instructor test whether alignment matters?")

### 2. Application / scenario cards

Force synthesis by giving a concrete situation and asking which tool / principle applies.

Examples:
```
Q: A client hands you a working but ugly app and asks you to clean it up. Which lesson category does this task fall under, and which tools apply?
A: "Making a messy design look clean." Apply alignment, spacing, consistency — plus lightening/hiding/removing to reduce emphasis on lesser elements.

Q: You're laying out furniture in a room and want it to feel "presented and elegant." Beyond aligning the furniture, what principle should you apply?
A: Generous spacing / white space around focal points. "When we're presented just with those few things, we intuitively grasp that we're meant to see those."

Q: You have 9 photos to hang on a wall. How does consistency help you arrange them?
A: Use identical frames and group them (e.g. a 3×3 grid) so they read as belonging together. Splitting them across separate walls would feel weird.
```

Prioritize:
- Scenarios drawn directly from examples in the lesson (the bachelor pad, vendor stall, Placeist app, wireframes, etc.)
- "Given X, which of the six tools applies?" style prompts
- Decision-order questions ("Do you optimize aesthetics or usability first?")

## Selection Guidelines

The core question for every potential card: **"Six months from now, mid-project, would having drilled this card have helped me design better?"** If yes, include it. If it would just confirm something you already know — or something irrelevant to the act of designing — skip it.

**Do include:**

- **Counter-intuitive insights** — things you'd get wrong without having studied them ("Why does *less* make something feel more expensive?")
- **Multi-part frameworks** — any list of 3+ items that needs to be held in memory together; you can't reconstruct these from logic alone
- **The reasoning behind rules** — not just "use more white space" but *why* it signals value; knowing the why lets you apply the rule in novel situations
- **Decision heuristics** — things you'd actually invoke at the keyboard: "when do I pick X vs Y?", "what do I do first?"
- **Counterexamples that test a rule** — the instructor's examples that show where a principle breaks or bends
- **Memorable quotes** — only when the phrasing itself carries the insight, not just because it's quotable

**Do not include:**

- **Things you'd do naturally** — if a principle is so obvious you'd follow it without prompting, drilling it wastes review time
- **Course metadata** — what a unit or lesson is "about", lesson titles, course structure. "What is Unit 1 about?" has zero design content.
- **Names without substance** — "What is the Six Strategies of Simplicity?" is not a card. The six strategies are the cards. Never card a label when the content behind it is what matters.
- **Instructor-specific resources** — tools, templates, or databases the instructor mentions using in their own practice (e.g. a font database they built). These can be Googled if ever needed.
- **Specific numbers or measurements from demos** — exact hex values, pixel counts, or settings from a screen recording don't generalize.
- **Throwaway transitions** — "let's switch gears", "as I mentioned earlier", course logistics.

**A second test for borderline cases:** Would you answer this card correctly on the first try, right now, without hesitation? If yes, don't card it — Anki is for the things you'd forget, not the things you already know.

## Style

- Keep questions **specific enough to have one good answer** — avoid "Tell me about alignment."
- Lead application cards with a scenario, not an abstract prompt.
- When quoting the instructor, use straight quotes inside the answer; do not wrap the whole answer in quotes unless it's verbatim.
- It's fine for a single concept to spawn 2–3 cards from different angles (definition, why, application).

## Workflow

1. Read the entire notes file first — don't card section-by-section without seeing the whole.
2. Draft a mental list of: named concepts, frameworks, counterexamples, distinctive quotes, scenarios.
3. Write concept-recall cards covering each.
4. Write 3–6 application/scenario cards using examples from the lesson.
5. Order cards roughly in the lesson's order, so the deck reads as a study path.
6. Write to `<slug>.anki.md` in the same folder as the notes.
7. **Render the Mermaid diagrams to PNGs** (see below) so they're usable in Anki — Anki does not render Mermaid natively.

## Rendering diagrams to PNG

After writing the `.anki.md`, render every ` ```mermaid ` block in it to a PNG using [`@mermaid-js/mermaid-cli`](https://github.com/mermaid-js/mermaid-cli). Place rendered images in a sibling `images/` folder so they can be imported into Anki as media.

```
<unit>/<video-slug>/
├── <slug>.md
├── <slug>.anki.md
└── images/
    ├── <slug>-card-03.png
    ├── <slug>-card-07.png
    └── ...
```

### One-shot render command

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

### Linking the PNGs in the .anki.md

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

### When to (re)render

Run `mmdc` after:
- Initial card generation
- Editing any Mermaid block
- Adding or removing a card that contains a diagram (numbering shifts)
