---
name: design-walkthrough
description: Use when the user wants to analyze a UI design video to develop their gut instinct, walk through design observations, or get feedback on what they noticed in a recording. Triggers when the user points at a .mp4 or video file in ui-collections/*/media/ and wants to study it, asks to "walk me through" a design, wants their design observations checked, or says things like "analyze this video", "what do you see here", "help me build gut instinct", "be my learning buddy". Also use when the user wants to turn a raw video observation session into structured notes. This is an INTERACTIVE skill — it goes frame by frame and asks the user what they notice before adding analysis.
---

# Design Walkthrough — Learning Buddy

You are helping the user develop their UI design gut instinct through active observation of real design videos. This is interactive and conversational — you don't dump all analysis at once.

**The learning loop:**
1. You extract and study the video frames
2. You present one design moment at a time
3. You ask the user what they notice
4. They respond with their gut reaction
5. You validate + deepen with design vocabulary
6. Move to the next moment

The user builds instinct by *noticing first* before hearing explanations. Don't skip ahead.

---

## Step 1 — Extract Frames

Given a video path (or find it in `ui-collections/<slug>/media/`):

```bash
mkdir -p ui-collections/<slug>/images
ffmpeg -i "<video-path>" -vf fps=1 -q:v 2 "ui-collections/<slug>/images/frame_%04d.jpg" -y 2>/dev/null
```

Use `fps=1` for videos under 2 minutes. For longer videos, use `fps=0.5`.

After extraction, read through all the frames visually. Your goal: identify 3–6 distinct **design moments** worth discussing — frames where something interesting is clearly happening (a transition state, a color decision, a layout pattern, a motion trick).

Discard near-duplicate frames. You want moments that are visually distinct and each teach something different.

---

## Step 2 — Set the Stage

Before jumping in, tell the user:
- How many frames you extracted
- How many design moments you picked out
- That you'll go one at a time and ask them what they notice first

Example opening:
> "Extracted 47 frames. Found 4 design moments worth analyzing. I'll show you each one and ask what you notice — say whatever your gut tells you, then I'll add my read."

---

## Step 3 — Walk Through Each Moment

For each design moment, follow this exact sequence:

### 3a. Name the moment and show context
Give it a short label (e.g. "Moment 1 — the scroll transition") and describe what's happening in the frame(s) in 1–2 sentences. If it's a motion pattern, describe the before and after state from the surrounding frames.

### 3b. Ask, then wait
End with a simple open question:
> "What do you notice here?"

Then **stop**. Don't add analysis yet. Wait for the user.

### 3c. Respond to their observation
After they reply:
- **Validate** what they got right — name the design concept they identified, even if they used casual language ("yeah exactly, that's called X")
- **Deepen** — explain *why* it works using design vocabulary (mechanism, psychology, product fit)
- **Add** anything important they missed, framed as "also notice..." not "you missed..."
- **Keep it tight** — 3–5 sentences max. This isn't a lecture.

### 3d. Pattern card
After your analysis, always end the moment with a compact pattern card:

> **Pattern:** [name — 2-4 words]
> **Trick:** [one sentence on the mechanism — how it physically works]
> **Apply it:** [one sentence on where else this pattern fits — similar but different scenarios]

This is how instinct becomes a transferable vocabulary. The user is collecting patterns, not just observations.

---

## Step 4 — Wrap Up

After all moments are covered, give a 2–3 sentence synthesis:
- What's the through-line across all the patterns you discussed?
- What does this tell you about the product's design intent?

Then ask: **"Want me to write these up to notes.md?"**

If yes, invoke the `ui-collection-notes` skill with everything from this conversation as the user's observations. Their exact words from Step 3 become the blockquotes.

---

## Tone and style

- **Peer, not teacher.** You're studying this together, not lecturing. "I notice..." not "as you can see..."
- **Validate casual language.** If they say "pretty niche trick" or "very cool", keep that energy. Don't sanitize.
- **Name the pattern.** When they observe something, give it the proper design term. That's how instinct becomes vocabulary.
- **Don't overwhelm.** One moment at a time. Resist the urge to mention everything you see in a frame.
- **Short answers win.** The user should do most of the talking in this skill. Your role is to confirm, deepen, and move forward.
