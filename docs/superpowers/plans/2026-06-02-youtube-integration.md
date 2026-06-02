# YouTube Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `fetch-youtube.js` script and `process-youtube` skill so pasting a YouTube URL produces `.md` notes with embedded screenshots, mirroring the existing Hotmart workflow.

**Architecture:** `fetch-youtube.js` calls `yt-dlp` via `child_process.execFileSync` to download the English `.vtt` transcript and `.mp4` video into `youtube/<slug>/`. The `process-youtube` skill orchestrates: run the script → dispatch `vtt-to-notes` subagent → extract screenshots with `ffmpeg` directly on the local `.mp4` → embed in notes.

**Tech Stack:** Node.js (no npm deps, stdlib only), yt-dlp CLI, ffmpeg CLI. Existing skills `vtt-to-notes`, `notes-to-anki`, `anki-upload` are reused unchanged.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `fetch-youtube.js` | **Create** | Download YouTube transcript + video via yt-dlp |
| `.claude/skills/process-youtube/SKILL.md` | **Create** | Orchestration skill for the full workflow |
| `youtube/` | **Create (dir)** | Root folder for all YouTube video notes |

---

## Task 1: Pure utility functions + test for `fetch-youtube.js`

**Files:**
- Create: `fetch-youtube.js`
- Create: `fetch-youtube.test.js` (throw-away inline test, deleted after Task 3)

- [ ] **Step 1: Create `fetch-youtube.js` with the two pure utility functions**

```js
#!/usr/bin/env node
// Usage: node fetch-youtube.js <youtube-url>
// Downloads English VTT transcript and MP4 video into youtube/<slug>/

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function videoIdFromUrl(url) {
  const match = url.match(/[?&]v=([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

module.exports = { toSlug, videoIdFromUrl };
```

- [ ] **Step 2: Create `fetch-youtube.test.js` and run it**

```js
const { toSlug, videoIdFromUrl } = require('./fetch-youtube');
const assert = require('assert');

assert.strictEqual(toSlug('Flux CSS Grid Layout Tutorial!'), 'flux-css-grid-layout-tutorial');
assert.strictEqual(toSlug('  Hello   World  '), 'hello-world');
assert.strictEqual(toSlug('100% Pure CSS'), '100-pure-css');
assert.strictEqual(toSlug('---'), '');

assert.strictEqual(videoIdFromUrl('https://www.youtube.com/watch?v=7xTGNNLPyMI'), '7xTGNNLPyMI');
assert.strictEqual(videoIdFromUrl('https://www.youtube.com/watch?v=abc&t=30s'), 'abc');
assert.strictEqual(videoIdFromUrl('https://youtu.be/abc123'), null); // short URLs not supported yet
assert.strictEqual(videoIdFromUrl('https://example.com'), null);

console.log('All tests pass');
```

Run:
```bash
node fetch-youtube.test.js
```
Expected: `All tests pass`

- [ ] **Step 3: Commit**

```bash
git add fetch-youtube.js fetch-youtube.test.js
git commit -m "feat: add fetch-youtube.js utility functions with tests"
```

---

## Task 2: Add yt-dlp integration to `fetch-youtube.js`

**Files:**
- Modify: `fetch-youtube.js`

- [ ] **Step 1: Replace the `module.exports` line at the bottom of `fetch-youtube.js` with the full script**

The final file should be exactly:

```js
#!/usr/bin/env node
// Usage: node fetch-youtube.js <youtube-url>
// Downloads English VTT transcript and MP4 video into youtube/<slug>/

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function videoIdFromUrl(url) {
  const match = url.match(/[?&]v=([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

function ytdlp(...args) {
  try {
    return execFileSync('yt-dlp', args, { encoding: 'utf-8', stdio: ['inherit', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.error('yt-dlp not found. Install it: pip install yt-dlp');
      process.exit(1);
    }
    const stderr = e.stderr ? e.stderr.toString() : e.message;
    throw new Error(stderr);
  }
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node fetch-youtube.js <youtube-url>');
    process.exit(1);
  }

  // Derive slug from video title
  console.log('Fetching video title...');
  let title;
  try {
    title = ytdlp('--print', 'title', url);
  } catch (e) {
    console.error('Could not fetch video title:', e.message);
    process.exit(1);
  }
  let slug = toSlug(title);
  if (!slug) {
    const id = videoIdFromUrl(url);
    if (!id) {
      console.error('Could not derive a slug from the title or URL. Is this a valid YouTube URL?');
      process.exit(1);
    }
    slug = id;
    console.log(`Title slug was empty; falling back to video ID: ${slug}`);
  }
  console.log(`Title: ${title}`);
  console.log(`Slug:  ${slug}`);

  // Create output directory
  const outDir = path.join('youtube', slug);
  fs.mkdirSync(outDir, { recursive: true });

  // Download English VTT transcript
  console.log('\nDownloading transcript...');
  try {
    ytdlp(
      '--write-auto-sub', '--sub-lang', 'en', '--skip-download',
      '--sub-format', 'vtt',
      '-o', path.join(outDir, slug),
      url
    );
  } catch (e) {
    console.error('Transcript download failed:', e.message);
    console.error('Check that the video has English captions (auto-generated or manual).');
    process.exit(1);
  }

  // yt-dlp writes <slug>.en.vtt — rename to <slug>.vtt
  const rawVtt = path.join(outDir, `${slug}.en.vtt`);
  const finalVtt = path.join(outDir, `${slug}.vtt`);
  if (fs.existsSync(rawVtt)) {
    fs.renameSync(rawVtt, finalVtt);
  } else if (!fs.existsSync(finalVtt)) {
    console.error(`Expected ${rawVtt} after yt-dlp download — no subtitle file found.`);
    process.exit(1);
  }
  console.log(`Transcript → ${finalVtt}`);

  // Download video (best available MP4)
  console.log('\nDownloading video (this may take a while)...');
  try {
    ytdlp(
      '-f', 'bv[ext=mp4]+ba[ext=m4a]/best[ext=mp4]',
      '-o', path.join(outDir, `${slug}.mp4`),
      url
    );
  } catch (e) {
    console.error('Video download failed:', e.message);
    process.exit(1);
  }
  const videoPath = path.join(outDir, `${slug}.mp4`);
  console.log(`Video     → ${videoPath}`);

  console.log(`\nDone → ${outDir}`);
  console.log(`Slug: ${slug}`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
```

- [ ] **Step 2: Verify the test still passes (functions are no longer exported, update test)**

Update `fetch-youtube.test.js` to inline the functions instead of requiring them (since `module.exports` is gone):

```js
// Inline copies for testing — keep in sync with fetch-youtube.js
function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function videoIdFromUrl(url) {
  const match = url.match(/[?&]v=([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

const assert = require('assert');

assert.strictEqual(toSlug('Flux CSS Grid Layout Tutorial!'), 'flux-css-grid-layout-tutorial');
assert.strictEqual(toSlug('  Hello   World  '), 'hello-world');
assert.strictEqual(toSlug('100% Pure CSS'), '100-pure-css');
assert.strictEqual(toSlug('---'), '');

assert.strictEqual(videoIdFromUrl('https://www.youtube.com/watch?v=7xTGNNLPyMI'), '7xTGNNLPyMI');
assert.strictEqual(videoIdFromUrl('https://www.youtube.com/watch?v=abc&t=30s'), 'abc');
assert.strictEqual(videoIdFromUrl('https://youtu.be/abc123'), null);
assert.strictEqual(videoIdFromUrl('https://example.com'), null);

console.log('All tests pass');
```

Run:
```bash
node fetch-youtube.test.js
```
Expected: `All tests pass`

- [ ] **Step 3: Commit**

```bash
git add fetch-youtube.js fetch-youtube.test.js
git commit -m "feat: complete fetch-youtube.js with yt-dlp transcript + video download"
```

---

## Task 3: Integration test with the real YouTube URL

**Files:** none new — just validation

- [ ] **Step 1: Verify yt-dlp is installed**

```bash
yt-dlp --version
```
Expected: a version string like `2024.xx.xx`. If not found: `pip install yt-dlp`

- [ ] **Step 2: Run the script with the example URL**

From the repo root:
```bash
node fetch-youtube.js https://www.youtube.com/watch?v=7xTGNNLPyMI
```
Expected output (exact slug will depend on the video title):
```
Fetching video title...
Title: <video title>
Slug:  <slug>

Downloading transcript...
Transcript → youtube/<slug>/<slug>.vtt

Downloading video (this may take a while)...
Video     → youtube/<slug>/<slug>.mp4

Done → youtube/<slug>
Slug: <slug>
```

- [ ] **Step 3: Verify the output files exist and are non-empty**

```bash
ls -lh youtube/*/
```
Expected: `<slug>.vtt` (non-zero size) and `<slug>.mp4` (several hundred MB).

Check the VTT is valid:
```bash
head -5 youtube/*/*.vtt
```
Expected: starts with `WEBVTT`

- [ ] **Step 4: Delete the test file and commit**

```bash
rm fetch-youtube.test.js
git add -A
git commit -m "test: validate fetch-youtube.js integration with real YouTube URL"
```

---

## Task 4: Write the `process-youtube` skill

**Files:**
- Create: `.claude/skills/process-youtube/SKILL.md`

- [ ] **Step 1: Create the skill directory and SKILL.md**

```bash
mkdir -p .claude/skills/process-youtube
```

Write `.claude/skills/process-youtube/SKILL.md` with this exact content:

```markdown
---
name: process-youtube
description: Use when the user pastes a YouTube URL and wants notes written from it, or says "process this video", "learn from this", "make notes from this YouTube video". Downloads transcript and video via yt-dlp, writes notes, extracts screenshots. Also triggers on youtu.be short URLs.
---

# Process YouTube Video: Transcript + Notes + Screenshots

Workflow: given a YouTube URL, download transcript + video → write `.md` notes → embed screenshots. Stops after notes — Anki is a separate step.

## Workflow

```
YouTube URL
    │
    ▼
node fetch-youtube.js <url>
    ├── youtube/<slug>/<slug>.vtt
    └── youtube/<slug>/<slug>.mp4
                │
                ▼
    [vtt-to-notes subagent]  →  youtube/<slug>/<slug>.md
                                        │
                                        ▼
                          [ffmpeg screenshot extraction]
                          4–8 frames embedded in .md
                                        │
                                        ▼
                                ⏸ STOP — notes done
```

## Step 1 — Download transcript + video

Run from the repo root:
```bash
node fetch-youtube.js <youtube-url>
```

The script prints the `Slug: <slug>` at the end. Note it — you'll use it for every subsequent path.

Output:
- `youtube/<slug>/<slug>.vtt` — English transcript
- `youtube/<slug>/<slug>.mp4` — video file

**If yt-dlp is not installed:** tell the user to run `pip install yt-dlp` and retry.
**If no English captions:** tell the user the video may not have captions; they can try `yt-dlp --list-subs <url>` to see what's available.

## Step 2 — Write the notes (dispatch as subagent)

The `.vtt` is large (often 30k+ tokens) — dispatch to a **general-purpose subagent** to protect main context.

Subagent prompt (fill in `<slug>` before dispatching):

> Read `youtube/<slug>/<slug>.vtt` and write notes to `youtube/<slug>/<slug>.md`. Load and follow the `vtt-to-notes` skill exactly. Preserve the speaker's voice: direct quotes in `>` blockquotes, include asides and digressions, use Mermaid diagrams with `<br/>` for line breaks (never `\n`). Do not summarize — match the density of the source material.

Wait for the subagent to complete. Only the final `.md` enters main context.

## Step 3 — Extract screenshots and embed in notes

Read `youtube/<slug>/<slug>.vtt` to identify 4–8 key visual moments: section transitions, diagrams being drawn, demos, before/after comparisons.

For each moment, find the timestamp in the VTT (take the cue start time, add 1–2 seconds so the visual is fully on screen). Then run:

```bash
mkdir -p youtube/<slug>/screenshots
ffmpeg -i youtube/<slug>/<slug>.mp4 \
  -ss HH:MM:SS -frames:v 1 \
  youtube/<slug>/screenshots/<NN>-<concept>.jpg
```

Name files `01-<concept>.jpg`, `02-<concept>.jpg`, etc.

Embed each screenshot in `youtube/<slug>/<slug>.md` at the relevant section:
```markdown
![Alt text explaining what the screenshot demonstrates](screenshots/<NN>-<concept>.jpg)
```

Alt text should explain *what the image proves or illustrates*, not just describe what's in it.

## Step 4 — Hand off to user

Tell the user:
- Notes are complete at `youtube/<slug>/<slug>.md`
- Run `notes-to-anki` if they want flashcards, then `anki-upload` to push to Anki

## Prerequisites

- `yt-dlp` installed: `pip install yt-dlp`
- `ffmpeg` installed (check: `ffmpeg -version`)
- Internet access to reach YouTube
```

- [ ] **Step 2: Verify the skill file is valid**

```bash
head -5 .claude/skills/process-youtube/SKILL.md
```
Expected:
```
---
name: process-youtube
description: Use when the user pastes a YouTube URL...
---
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/process-youtube/SKILL.md
git commit -m "feat: add process-youtube skill for end-to-end YouTube video notes"
```

---

## Task 5: Smoke-test the full workflow with the example URL

**Files:** none new — end-to-end validation

- [ ] **Step 1: Confirm the downloaded files are present from Task 3**

```bash
ls youtube/*/
```
Expected: `<slug>.vtt` and `<slug>.mp4` exist.

- [ ] **Step 2: Manually trigger the vtt-to-notes subagent**

In Claude Code, say:

> "Read `youtube/<slug>/<slug>.vtt` and write notes to `youtube/<slug>/<slug>.md`. Load and follow the `vtt-to-notes` skill exactly."

Wait for it to complete.

- [ ] **Step 3: Extract one test screenshot with ffmpeg**

Pick any timestamp from the VTT (the first cue with a `-->` line), e.g. `00:01:30`. Run:

```bash
mkdir -p youtube/<slug>/screenshots
ffmpeg -i youtube/<slug>/<slug>.mp4 \
  -ss 00:01:30 -frames:v 1 \
  youtube/<slug>/screenshots/01-test.jpg
```

Verify the file exists and is a valid image:
```bash
ls -lh youtube/<slug>/screenshots/01-test.jpg
```
Expected: file exists, non-zero size.

- [ ] **Step 4: Final commit**

```bash
git add youtube/
git commit -m "chore: add first YouTube video notes (smoke test)"
```
