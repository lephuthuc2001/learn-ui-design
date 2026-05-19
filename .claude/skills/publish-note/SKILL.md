---
name: publish-note
description: Use when the user wants to publish a finished lesson notes .md file from this learn-ui-design repo to the blog at ~/blog.
---

# Publish Note

## Overview

Copies a lesson's `.md` notes file and its screenshots to the blog repo, fixes image paths, verifies the build, then commits and pushes.

## Steps

### 1. Read the source note

Read `<video-dir>/<slug>.md` to understand its content and which screenshots it references.

### 2. Determine slug and frontmatter

Use the video directory name as the slug (e.g. `02-alignment`). Prepare frontmatter:

```yaml
---
title: "<human-readable title>"
course: "Learn UI Design"
unit: "<unit folder name, e.g. '02 - Fundamentals of UI Design'>"
lesson: "<two-digit lesson number, e.g. '02'>"
date: <today's date>
tags: [ui-design, ...]
description: "<one-sentence description of what the lesson covers>"
---
```

### 3. Write the blog note

Write to `~/blog/src/content/notes/learn-ui-design/<slug>.md`:
- Paste the source note body **without** the leading `# Title` heading (PostLayout renders the title from frontmatter)
- Fix all image paths: change `screenshots/<file>.jpg` → `/notes/learn-ui-design/<slug>/<file>.jpg`

### 4. Copy screenshots

```bash
mkdir -p ~/blog/public/notes/learn-ui-design/<slug>
cp <video-dir>/screenshots/*.jpg ~/blog/public/notes/learn-ui-design/<slug>/
```

### 5. Verify build

```bash
cd ~/blog && pnpm build
```

Fix any errors before continuing. The page count should increase by 1.

### 6. Commit and push

Stage and commit in the blog repo:
- `src/content/notes/learn-ui-design/<slug>.md`
- `public/notes/learn-ui-design/<slug>/` (all screenshots)
- Any other changed files (e.g. `package.json`, `pnpm-lock.yaml` if dependencies changed)

```bash
cd ~/blog
git add src/content/notes/learn-ui-design/<slug>.md public/notes/learn-ui-design/<slug>/
git commit -m "Publish <slug> lesson notes"
git push
```

## Common Mistakes

- **Leaving the `# Title` heading** — the blog renders the title from frontmatter; a duplicate heading appears as a second H1.
- **Relative screenshot paths** — `./screenshots/…` won't resolve in the blog; always use `/notes/learn-ui-design/<slug>/…`.
- **Forgetting to copy screenshots** — build succeeds but images are broken at runtime.
- **Wrong deck path for the unit** — double-check the `unit` frontmatter field matches the folder name exactly.
