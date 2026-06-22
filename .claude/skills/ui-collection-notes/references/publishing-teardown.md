# Publishing a UI collection teardown to the blog

Invoked from the `ui-collection-notes` skill when the user asks to publish a finished `ui-collections/<slug>/notes.md` as a teardown. This is the teardown-specific publish flow (`.mdx` + teardown components), distinct from the `publish-note` skill which handles regular lesson notes.

## Publishing to the blog

UI collection analyses are published as **teardown-type notes** under `course: "UI Collections"`. The file uses `.mdx` extension (not `.md`) to support the teardown layout and components.

The blog components live in `~/blog/src/components/teardown/`: `PatternIndex`, `Specimen`, `Captures`, `TakeawayCard`, `Overall`.

When the user asks to publish, run this publish step.

### 1. Create the blog content entry

Write to `~/blog/src/content/notes/learn-ui-design/<slug>.mdx` with this scaffold:

````mdx
---
title: "<site> — Design Analysis"
course: "UI Collections"
type: "teardown"
site: "https://<domain>"
siteType: "<category e.g. Finance SaaS landing>"
specimens: <count>
mechanism: "<primary technique e.g. Scroll-spy>"
date: YYYY-MM-DD
tags: [ui-design, ui-collections, <relevant-tags>]
description: "<1-2 sentence summary>"
---

import PatternIndex from '../../../components/teardown/PatternIndex.astro';
import Specimen from '../../../components/teardown/Specimen.astro';
import Captures from '../../../components/teardown/Captures.astro';
import TakeawayCard from '../../../components/teardown/TakeawayCard.astro';
import Overall from '../../../components/teardown/Overall.astro';

export const patterns = [
  { id: "s1", name: "<Pattern name>", tags: ["<tag>"] },
  // one entry per pattern/specimen
]

<PatternIndex patterns={patterns} />

<Specimen id="s1" number="01" title="<Pattern title>" sub="<One-sentence description.>">
  <Captures
    before={{ src: "/notes/learn-ui-design/<slug>/<before-image>", alt: "<alt>", label: "<State label>" }}
    after={{ src: "/notes/learn-ui-design/<slug>/<after-image>", alt: "<alt>", label: "<State label>" }}
  />

  > User's raw observation verbatim

  Polished analysis paragraph.

  <TakeawayCard
    name="<Pattern name>"
    id="P·01"
    tags={["<tag>"]}
    rows={[
      { key: "Pattern",  value: "<Name>" },
      { key: "Trick",    value: "<How it works>" },
      { key: "Apply it", value: "<When to use it>" },
    ]}
  />
</Specimen>

<Overall>

> User's closing summary verbatim

Synthesis paragraph.

</Overall>
````

**Notes on `Captures`:**
- `after` is optional — omit it for single-image patterns (renders full-width)
- Use the most representative pair of images; for 3+ images per pattern, pick the clearest before/after states

Use the body of `ui-collections/<slug>/notes.md` to fill in observations, analysis, and takeaway rows. Update all image paths from relative (`images/filename.jpg`) to absolute (`/notes/learn-ui-design/<slug>/filename.jpg`).

### 2. Copy images to blog public

```bash
mkdir -p ~/blog/public/notes/learn-ui-design/<slug>
cp ~/learn-ui-design/ui-collections/<slug>/images/*.{jpg,png} ~/blog/public/notes/learn-ui-design/<slug>/
```

### 3. Build to verify

```bash
cd ~/blog && pnpm build 2>&1 | tail -5
```

Fix any errors before continuing. The page count should increase by 1.

### 4. Commit both repos

```bash
git -C ~/learn-ui-design add ui-collections/<slug>/
git -C ~/learn-ui-design commit -m "feat: add <slug> UI collection notes"

git -C ~/blog add src/content/notes/learn-ui-design/<slug>.mdx public/notes/learn-ui-design/<slug>/
git -C ~/blog commit -m "feat(ui-collections): publish <slug> teardown"
```
