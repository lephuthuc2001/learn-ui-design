---
name: academic-book-anki
description: Use when creating Anki flashcards from an academic textbook or dense technical reference book — CSAPP, operating-systems texts, networking books (Beej's, TCP/IP Illustrated), database-internals, distributed-systems papers, compiler books, etc. This is the textbook counterpart to notes-to-anki (which is for the UI-design video course). Its whole job is to calibrate WHICH concepts become cards and HOW DEEP they go to the user's real goal — a frontend developer becoming full-stack, learning CS fundamentals for practical leverage, NOT academic mastery. Trigger whenever the user asks to make cards/flashcards from a CS book, textbook chapter, or any heavy reference, even if they don't say "academic."
---

# Academic Book → Anki

## Who these cards are for (read this first — it changes everything)

The user is an **experienced frontend developer becoming full-stack**. They reach for these books to build the *mental models* under the web stack — why a request is slow, why memory leaks, why a query plan matters — not to become a systems programmer or pass a CS exam.

They work in **Go, Java, and JS/TS**. They do not write C. They are a **visual learner** and follow an **80/20, anti-academic** philosophy: maximum practical leverage per hour.

This single fact — *practitioner, not scholar* — is the lens for every decision below. When you're unsure whether something becomes a card, ask: **"Will this change how they write code, debug a problem, or reason about a system they'll actually touch?"** If yes, card it. If it's true-but-inert textbook knowledge, skip it.

## The trap to avoid

Textbooks are written for a CS course, so they go deep on mechanism: page-table bit layouts, cache associativity math, Y86 assembly, IEEE-754 rounding modes. It is tempting — and *wrong for this user* — to dutifully card all of it. A chapter that yields 27 atomic cards has almost certainly buried 10 great cards under 17 that won't survive contact with the user's actual job.

**Fewer, sharper cards win.** Target **8–15 cards per chapter**, occasionally up to ~20 for a genuinely dense, high-relevance chapter (memory hierarchy, virtual memory, networking). If you're past 20, you're treating the user like a CS major — stop and cut.

## The tiering rubric — what becomes a card

Sort every candidate concept into one of three tiers. **Card Tier 1 and most of Tier 2. Skip Tier 3.**

**Tier 1 — Practical takeaway (always card).**
Things that change how the user writes or debugs real code. These are the reason they're reading the book.
- "Why does `[]Struct` beat `[]*Struct` in a hot loop?" (cache locality)
- "Why does a null pointer *segfault* instead of silently corrupting?" (VM protection)
- "Why do GC pauses get worse as the heap grows past RAM?" (paging/locality)
- "Why is reading a column-major loop 10× slower?" (spatial locality)

**Tier 2 — Mental model (card if it grounds something real).**
The intuition layer. Card it when it makes a Tier-1 fact click or explains a term the user will hear in real engineering conversations (page fault, TLB, cache line, context switch, mmap). Use plain language and a concrete analogy. Skip it if it's a model they'll never invoke.

**Tier 3 — Mechanism / exam trivia (skip).**
True, precise, and irrelevant to a full-stack practitioner. The bit-level and math-heavy interior of the machine.
- Page-table entry bit layouts, multi-level page-walk arithmetic
- Cache set/way index math, replacement-policy proofs
- Assembly encodings, Y86, floating-point rounding internals
- Anything whose only use is reconstructing the hardware on a whiteboard

When in doubt between Tier 2 and Tier 3, the deciding question is: *would a senior full-stack engineer who's great at their job ever need this?* If not, it's Tier 3.

## Even chapters and books get triaged

Before carding a whole book, apply the same 80/20 lens to **which chapters** deserve cards at all. For CSAPP and this user specifically, the high-value chapters are **1 (tour), 6 (memory hierarchy), 8 (exceptional control flow), 9 (virtual memory)** — the ones that explain the runtime beneath Go/Java. Chapters 3–5 (assembly, processor architecture, optimization) and 7 (linking) are largely C/systems-programmer territory: card them only if the user explicitly asks, and even then stay in Tier 1.

If the user points you at a chapter that's mostly Tier 3 for them, say so plainly and propose the handful of cards actually worth making rather than manufacturing volume.

## Flow — cards are a chain, not a list

The user's core learning method is **problem → solution → what that solution breaks → next solution**, chained end to end. A component only makes sense as the answer to the previous component's shortcoming. Cards must show where they sit in that chain, not stand alone as isolated definitions.

Concrete worked example (OS process execution, in the user's own words): the fastest way to run a program is hand it directly to the kernel/hardware — but then it can freely manipulate I/O devices and do real harm. So we restrict direct access, but the program still needs *some* controlled access (allocate memory, read a file) → **limited direct execution**. How does a restricted program get that access? → **syscalls**, but only through a **trap** the OS installs at boot time, so arbitrary code can never redirect control → trusted trap table. New problem: what if a program loops forever and never syscalls — how does the OS regain control? → timer interrupts. New problem: the OS now has to save/restore state when interrupting → **context switching**. Each step exists because the step before it left a gap.

Apply this with two mechanisms together:

1. **A flow map at the top of the file**, right after the title heading: a short ordered outline of the chapter's problem → solution → next-problem chain, one line per step, e.g.:
   ```
   ## The flow
   1. **Problem:** run a program as fast as possible → hand control straight to the CPU.
   2. **Break:** unrestricted hardware access means a program can do real harm.
   3. **Solution:** limited direct execution — restrict access but still allow controlled operations.
   4. **Break:** controlled operations need a doorway into the OS that user code can't forge.
   5. **Solution:** syscalls via a trap table installed at boot, trusted by construction.
   6. **Break:** a program that never syscalls (infinite loop) never gives control back.
   7. **Solution:** timer interrupts force a return to the OS.
   8. **Break:** interrupting mid-execution loses the program's state.
   9. **Solution:** context switching — save/restore state around every handoff.
   ```
2. **Per-card orientation** — each card's answer opens with a short clause locating it in that chain before the fact itself, e.g. "Building on limited direct execution: ..." or "This is what closes the gap left by the trap table: ...". Keep it to one short clause, not a paragraph — the atomic fact and its "why it matters" line still do the heavy lifting.

When a chapter is genuinely a flat list of independent concepts with no causal chain (rare, but possible for e.g. a glossary-style chapter), say so and skip the flow map rather than manufacturing a fake chain.

## Card style — simple words, real examples

- **Plain language over textbook register.** Explain it the way you'd explain it to a sharp colleague at a whiteboard, not the way the book phrases it. Define jargon in the answer rather than assuming it.
- **A concrete example in their stack on most cards.** Go, Java, JS/TS, or web-request terms. A card about locality should mention slices/arrays; a card about virtual memory can mention the JVM heap or a segfault they've actually seen.
- **One fact per card** (atomic), but let the *answer* carry a short "why it matters" line — that's what makes a practitioner card stick versus a definition card.
- Answers render as HTML in Anki: use `<b>`, `<code>`, `<br>`, `<ul>/<ol>`. One sentence per line (`<br>` after each sentence-ending period).

**Example — a kept Tier-1 card:**
```
Q: Why can a slice of structs be much faster than a slice of pointers to structs in Go?
A: <code>[]MyStruct</code> stores all the structs <b>side by side</b> in memory, so looping reads sequential bytes — great for the CPU cache.<br><code>[]*MyStruct</code> stores pointers; the real structs can be scattered across the heap, so each access risks a <b>cache miss</b> and a slow trip to RAM.<br>In a big hot loop the flat slice can win by a lot.
![](images/...)
```

**Example — a Tier-3 card to NOT make:**
```
Q: How many bits of a 32-bit virtual address are the VPN vs the VPO for a 4 KB page?
A: 20-bit VPN, 12-bit VPO.
```
This is real and precise and the user will never need it. Cut it.

## Visuals — every card gets an image

This is a hard rule for this user (a visual learner): **every card must have an illustration, and it must be a real image fetched from the web — never generated.**

1. **Official course/book figure.** For CSAPP, download the matching figure PDF from `https://csapp.cs.cmu.edu/3e/ics3/<chapter>/<fig>.pdf` and convert with `pdftoppm -r 150 -png <fig>.pdf <fig>`. The chapter directory codes: `mem` (ch6), `ecf` (ch8), `vm` (ch9), `data` (ch2), `intro` (ch1). Browse the figure list at `https://csapp.cs.cmu.edu/3e/figures.html`.
2. **Web search** (Wikipedia/Wikimedia Commons preferred for clean, freely-licensed diagrams; open textbook figures, real screenshots, and documentation-site diagrams are also fine) for every other book — this is the *only* fallback when no book figure fits the card's concept. Download into the chapter's `images/` folder with a real user-agent (`curl -L -A "Mozilla/5.0" -o <path> <url>`) and verify with `file` that it's a real image, not an HTML error page.

**Never generate a diagram yourself** — no Mermaid, no hand-authored SVG, nothing drawn. If a concept is hard to illustrate, that means search harder (more queries, other sources, a looser but still real match) — it is never a reason to draw something. The user has explicitly rejected generated images twice; treat this as a hard constraint, not a style preference.

After writing the deck, **audit every card for an `![](images/...)` line pointing to a real downloaded file.** A card without one isn't finished, and a card with a generated placeholder isn't finished either.

## Output

Write to `<book>/<chapter>/<book>-<chapter>.anki.md` (e.g. `csapp/ch06/csapp-ch06.anki.md`), images in the sibling `images/` folder. Title heading, then the flow map (see "Flow" above), then `Q:`/`A:` pairs separated by blank lines, image line directly under each answer.

When done, report the card count and the source of each image (book figure vs web), and note any concepts you deliberately skipped as Tier 3 so the user can overrule if they want them.
