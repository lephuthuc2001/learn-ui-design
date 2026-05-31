# Almanac — Design Analysis

**Site:** [almanac.io](https://almanac.io)
**Type:** Wiki / Workflow SaaS landing page

---

## Typography

> The edge of each character are a straight line, there are no CURVES or nothing, even the shape of the DOT is a square, not rounded, the Y R U they have a vertical line that looks like a rectangle. Just feel squary to me, lot of squared angle — these feels like lego that I can arrange and make something, it reminds me about Tetris.

This is a **geometric sans-serif** — letterforms constructed from basic geometric shapes rather than mimicking natural handwriting strokes. The square dots, flat terminals, and rectangular cuts are intentional. For a product selling organization and clarity, the font *feels* like the product: structured, precise, engineered, no decorative flourishes.

The weight hierarchy is consistent throughout: one large bold headline, one smaller lighter description — repeated every section. Easy to follow, easy to skim.

**Pattern:** Geometric sans-serif

**Trick:** Choose a typeface whose letterform construction matches the product's personality — geometric = engineered, humanist = warm, transitional = classic.

**Apply it:** Any product selling precision, structure, or efficiency. Developer tools, finance dashboards, productivity apps.

---

## Color

> Overall color are dark background and white text to really help to highlight things — show users what are really important, stands out to remember.

Strong contrast that ensures the important content always wins attention. Nothing competes. A lighter blue accent appears selectively (the "1M" figure, the large "M" shape in the background) to draw the eye without overwhelming the palette.

**Pattern:** Maximum contrast + single accent

**Trick:** Dark background + white text + one selective accent color. Nothing competes — the accent only fires when you need the eye to land somewhere specific.

**Apply it:** Any dark-mode landing page. Use the accent color on exactly one element per section — a stat, a CTA, a headline word.

---

## The "Big 3" Pattern — Multiple Variations

Almost every section is built from the same core: **Header + Description + Illustration**. But it's expressed in four different ways depending on what the section needs to communicate.

---

### 1. All Centered

![Hero — all centered, WHAT + WHY + HOW](images/image%201.png)

> Classic: Header + description + hero. Header is talking about it's the best product => WHAT. Description is used to elaborate about the reason why it's best product, what benefits it gave you => answer the WHY. The HERO is added as an illustration, user can see a sneak peek of the product in Action. Every thing are clear there => This is effective and serves the purpose that shows USER knows what the product is all about. Colors background black and the text white really create the absolute contrast => Really attract attention. I really like the texture of the background, some curves of white there make it enchanting and attract attention, without it I think it's quite neat and boring => Nice touch.

The hero answers three questions in sequence — what it is, why it matters, what it looks like — before the user has to scroll. The subtle curved white shapes in the background are a small but important touch: without them the dark background would feel flat and lifeless.

**Pattern:** Hero trifecta (WHAT + WHY + HOW)

**Trick:** Stack header (what it is), description (why it matters), and illustration (how it looks) in one centered block. Three questions answered before the first scroll.

**Apply it:** Any hero section for a new product. If the user can't answer all three questions without scrolling, the hero isn't doing its job.

---

### 2. The "1M" Stat Trick

![1M stat section](images/image%202.png)

> First thing I see is the background, dark blue and the 1M as lighter blue create an immediate effect, really attract attention. I see the 1M before the text, and when I read the text I know what the 1M is about => serves the purpose of highlighting the 1M => very impressive number 1M hours saved. Once again we see the power of 1 big bold header and a smaller lighter description that illustrate the header.

The number is shown as a visual element *before* its context is given. Your eye catches the 1M, then the headline tells you what it means — so by the time you read "1 million hours," your brain has already been primed by the scale of that number. The impact lands harder than if it were just embedded in a sentence.

**Pattern:** Stat-as-visual-anchor

**Trick:** Display the number at display scale before its label. The eye reads the number first, the brain gets primed, then the headline confirms the meaning — impact lands harder than if it's inline.

**Apply it:** Any social proof or traction section. "10,000 teams", "99.9% uptime", "$2B managed" — make the number the hero, not a footnote.

---

### 3. Scroll-to-Change (Grouped Benefits)

![Scroll state 1 — task list, purple gradient](images/image%203.png)

![Scroll state 2 — quick links, teal gradient](images/image%204.png)

> I like this. Still a combination of header + description + illustration. But design this way I feel like we can save a lot of space, since these are smaller benefits, no need to highlight it big like the first section of the page when we're talking about the PRODUCT => we dedicate 1 whole page for the combination of header + description + illustration. Things that are related are grouped and present together. With this, users are pretty much in the flow, no need to click anything to see different content/benefit, they just scroll down when they are done with 1 benefit and they immediately see the next benefit.

The scroll-triggered illustration change lets multiple related features share one section without requiring the user to do anything — no tabs, no clicks, just scroll. The gradient color shift (purple → teal) signals that something changed on screen without breaking the layout rhythm.

**Pattern:** Scroll-triggered feature carousel

**Trick:** Lock the layout, swap only the illustration and gradient as scroll progresses. Multiple features share one section — no tabs, no clicks needed.

**Apply it:** Any "here are 4 related benefits" section where each benefit is small enough to not deserve its own full page. Groups similar features without the overhead of a tab component.

---

### 4. Left–Right Split (Alternating)

![Consolidate — text left, product screenshot right](images/image%205.png)

![Eliminate information anxiety — product left, text right](images/image%206.png)

> Still a combination of big 3. But now text is in 1 side and illustration is in another side and this pattern is repeated and switching side alternatively. Text left image right and then text right image left. This highlights the benefits clearly, and predictable. People often read left to right top to bottom, so first I see text left image right, right below the image of the first section is the text for the next section => I can scroll down and see the text and look left for the images => I feel a sense of smoothness and ease when going through the page.

The alternating layout uses reading direction (left-to-right, top-to-bottom) deliberately — the eye follows a natural Z-path down the page. Predictability creates smoothness: the user knows the rhythm and stops thinking about the layout, focusing entirely on the content.

**Pattern:** Z-pattern alternating layout

**Trick:** Alternate text-left/image-right and image-left/text-right across pairs of sections. The eye follows a natural Z-path — each new section is where the reader's eye already is.

**Apply it:** Feature comparison sections, product benefit lists, anything with 4+ items that each deserve breathing room. Rhythm > variety here.

---

### 5. Header + Images Only (No Description)

![Take the guesswork out of collaboration — feature cards](images/image%207.png)

![There's a better way to wiki — feature cards with UI previews](images/image%208.png)

![Your work, secure your way — security features](images/image%209.png)

> These contain just 2 elements of the big 3: Header + images or texts. If something is clear enough with texts or images => need no description. Save space for users.

When the feature name and visual are self-explanatory, adding a description just adds noise and slows the page down. Dropping it respects the user's time and keeps the scrolling pace feeling fast and confident.

**Pattern:** Self-evident feature grid

**Trick:** Drop the description when the header + visual already say everything. Fewer words = faster scroll pace = more confidence in the product.

**Apply it:** Feature lists, integration grids, security/compliance badges. If you have to explain it, the label or icon isn't good enough — fix those first, then remove the description.

---

## Overall

> Overall, I feel like the typography is nice, neat and clean, easy to the eye and to follow. The combo of big 3 really stands out and there are multiple ways to do it. We can see a lot of space, things are neatly aligned and not cluttered.

Every design decision on this page points in the same direction: **structured, trustworthy, no-nonsense**. The geometric type, the high contrast palette, the consistent Big 3 rhythm, and the generous white space all say the same thing — this is a product that brings order to chaos. The design *is* the pitch.
