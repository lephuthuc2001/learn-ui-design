# CSAPP Chapter 6 — The Memory Hierarchy

## The flow
1. **Problem:** the CPU can execute billions of instructions per second, but a straight fetch from DRAM takes ~100 cycles — the CPU sits idle waiting on memory.
2. **Solution:** put a small bank of much faster memory between the CPU and RAM — a cache — built from SRAM (fast, expensive, low-density) instead of DRAM (slow, cheap, dense).
3. **Break:** SRAM is too expensive/low-density to hold everything, and even DRAM is far slower than SRAM while disk/SSD are far slower still — one cache level isn't enough at any size we can afford.
4. **Solution:** generalize into a full memory hierarchy — registers → L1 → L2 → L3 → RAM → SSD → HDD → network — each level acting as a cache for the level below, trading speed for size/cost as you go down.
5. **Break:** a hierarchy of caches only pays off if programs actually revisit the data sitting in the fast levels — otherwise it's just extra machinery moving data nobody reuses.
6. **Solution:** this works because real programs exhibit locality — temporal (reused data will likely be reused again soon) and spatial (nearby data will likely be touched soon) — so caches keep recently used data and pull in a whole 64-byte cache line around every access.
7. **Break:** locality is only exploited if the code's access pattern matches memory layout — row-major loops, sequential slices, and flat structs (`[]MyStruct`) ride the cache line for free, while column-major loops, pointer chasing, and linked lists jump address to address and miss almost every time.
8. **Break:** even with a cache-friendly access pattern, if the working set is simply bigger than the cache, good ordering can't save you — the cache thrashes, constantly evicting data it needs back immediately, and throughput collapses to RAM speed.
9. **Solution (practical payoff):** this is exactly why GC pause times blow up once a Go/Java heap grows past what fits in cache/RAM — the collector has to scan the whole live set, and if that scan doesn't fit in cache (or spills to disk), every pass eats cache misses or page faults; keep the live set comfortably smaller than RAM.

---

Q: Why do CPU caches exist?
A: This is the fundamental gap that everything else in the chapter answers: the CPU can execute billions of instructions per second, but fetching data from main memory (DRAM) takes ~100 CPU cycles — 100 cycles where the CPU is idle.<br>Caches are small, fast memory banks placed <b>between the CPU and RAM</b> that store recently used data so most fetches take 4 cycles (L1) instead of 100.<br>The processor-memory gap has widened every year as CPUs got faster but RAM latency barely improved — caches are the engineering answer to that gap.
![](images/cpumemgap-1.png)

Q: What are SRAM and DRAM, and which is used where?
A: Building on why caches exist: closing the CPU-memory gap forces a split between two physical technologies — a fast one for the cache and a cheap, dense one for the bulk store.<br><b>SRAM (Static RAM)</b>: stores each bit in 6 transistors — fast, stable, expensive. Used in <b>CPU caches</b> (L1/L2/L3).<br><b>DRAM (Dynamic RAM)</b>: stores each bit as a capacitor charge that leaks away and must be refreshed thousands of times per second — slower, cheap, dense. Used in <b>main memory</b> (your 16 GB RAM stick).<br>Think of SRAM as a whiteboard right in front of you vs DRAM as a filing cabinet across the room you have to physically walk to.
![](images/dramarray-1.png)

Q: How do disk, SSD, and RAM compare in speed?
A: Extending the same speed gap further down the stack: DRAM itself is nowhere near the bottom — disk and SSD are dramatically slower still, which is why the hierarchy needs more than just two levels.<br><b>RAM (DRAM)</b>: ~100 ns access time.<br><b>SSD</b>: ~100,000 ns — about <b>1,000× slower</b> than RAM.<br><b>HDD</b>: ~10,000,000 ns — about <b>100,000× slower</b> than RAM.<br>If RAM access = 1 second, SSD access = 17 minutes, HDD access = 4 months.<br>This is why keeping your app's working data in memory (and not spilling to disk swap) is critical for performance.
![](images/ssd-1.png)

Q: What is the memory hierarchy?
A: Stacking every one of these speed/cost tradeoffs into a single system is the memory hierarchy: computers organize storage into levels, trading off speed vs size vs cost:<br><b>Registers</b> → <b>L1 cache</b> → <b>L2 cache</b> → <b>L3 cache</b> → <b>RAM (DRAM)</b> → <b>SSD</b> → <b>HDD</b> → <b>Network</b><br>Each level acts as a <b>cache for the level below it</b>.<br>Speed drops and capacity grows as you go down — L1 is ~4 cycles / tens of KB; RAM is ~100 cycles / GB; disk is ~10M cycles / TB.
![](images/memhier-1.png)

Q: What is locality and why do caches exploit it?
A: This is what makes the whole hierarchy actually pay off, rather than just being extra layers of machinery: <b>locality</b> is the observation that programs don't access memory randomly — they tend to use data that is:<br>• <b>Temporally local</b>: recently used data will probably be used again soon<br>• <b>Spatially local</b>: if you use one address, you'll soon use nearby addresses<br>Caches exploit this by keeping recently accessed data and loading nearby data speculatively.<br>If your code has poor locality (jumping around in memory), caches can't help — performance collapses.
![](images/cacheconcept-1.png)

Q: What is temporal locality? Give a Go example.
A: One half of the locality that caches exploit: <b>temporal locality</b> = "data used recently will likely be used again soon."<br>Example: the loop variable <code>i</code> in <code>for i := 0; i &lt; n; i++</code> is read and written on <b>every iteration</b>.<br>The CPU recognizes this and keeps <code>i</code> in a register or L1 cache — it never needs to go to RAM for it.<br>Another example: a hot config struct read on every HTTP request benefits from temporal locality if it fits in L1/L2.
![](images/cacheconcept-1.png)

Q: What is spatial locality? Give a Go example.
A: The other half of the locality that caches exploit: <b>spatial locality</b> = "if you access one address, you'll soon access nearby addresses."<br>When the CPU loads one element, it pulls in a whole <b>64-byte cache line</b> of neighboring bytes for free.<br>Example: iterating <code>for _, v := range mySlice</code> reads elements sequentially — each cache line load covers the next 8–16 elements, so most iterations are instant cache hits.<br>Contrast: pointer-chasing (linked lists, maps) jumps around memory — no spatial locality, constant cache misses.
![](images/cachebus-1.png)

Q: What is a cache hit vs a cache miss?
A: This is the moment-to-moment outcome of a cache successfully (or unsuccessfully) exploiting locality: <b>cache hit</b>: the CPU looks up data and finds it already in the cache — served in 4 cycles (L1). Fast, the common case for well-written code.<br><b>Cache miss</b>: the data isn't in cache — the CPU must fetch it from a slower level (RAM: ~100 cycles, SSD: ~10M cycles) before execution can continue.<br>A 1% miss rate can halve program speed because each miss costs 100+ cycles of idle time on a CPU that could run at 1 cycle/instruction otherwise.
![](images/cacheconcept-1.png)

Q: What is a cache line and why is it 64 bytes?
A: This is the hardware unit that makes spatial locality free: when the CPU fetches any byte from RAM, it loads the surrounding <b>64-byte chunk</b> (a cache line) into the cache in one transfer.<br>This exploits spatial locality: if you read <code>arr[0]</code>, you automatically get <code>arr[1]</code>…<code>arr[7]</code> (for 8-byte ints) for free.<br>64 bytes is a hardware engineering sweet spot — large enough to amortize the transfer overhead, small enough that cache lines don't waste space on data you'll never use.
![](images/cachebus-1.png)

Q: Why does the order you loop through a 2D array change performance dramatically?
A: This is locality succeeding or failing purely based on access pattern: in Go (and most languages), a 2D array is stored <b>row by row</b> in memory (row-major order).<br>Looping <b>row-by-row</b>: reads elements contiguously — each 64-byte cache line covers 8 adjacent elements. Nearly all hits.<br>Looping <b>column-by-column</b>: jumps by a full row width on each access — each access lands in a different cache line. Nearly all misses.<br>The result: column-major traversal of a large matrix can be <b>10× slower</b> than row-major for the exact same work.
![](images/cachebus-1.png)

Q: Why is <code>[]MyStruct</code> faster than <code>[]*MyStruct</code> in Go?
A: Same access-pattern principle, applied to a Go data structure choice: <code>[]MyStruct</code> lays all structs <b>side by side</b> in memory — iterating reads sequential bytes, fully exploiting spatial locality and cache lines.<br><code>[]*MyStruct</code> stores only pointers contiguously; the actual struct values can be <b>scattered anywhere</b> on the heap.<br>Each pointer dereference likely lands in a different cache line → one cache miss per element → 100+ cycles each instead of ~4.<br>For a hot loop over thousands of items, the flat slice wins by a significant margin.
![](images/cachebus-1.png)

Q: Why is linked list traversal slow even though it's O(n)?
A: The extreme case of ignoring spatial locality: each linked list node stores a <code>next</code> pointer that can point <b>anywhere in the heap</b> — nodes are scattered randomly in memory.<br>Traversing a linked list causes <b>one cache miss per node</b>: the CPU has to wait 100 cycles for RAM on every step.<br>A Go slice or Java ArrayList stores elements contiguously — each cache line load covers ~8 elements, so traversal is mostly cache hits.<br>O(n) complexity is the same, but the constant factor is dominated by memory access patterns, not CPU ops.
![](images/cachebus-1.png)

Q: What is thrashing and when does it happen?
A: This is what breaks even a perfectly cache-friendly access pattern: <b>thrashing</b> happens when your program's <b>working set</b> (the data it actively uses) is larger than the cache.<br>The CPU is constantly evicting data from cache to make room, then immediately needing it back — the cache becomes useless and almost every access goes to RAM.<br>Example: scanning a 500 MB array with only 8 MB of L3 cache — every access misses, throughput drops to RAM speed (~10 GB/s instead of ~100 GB/s).<br>Signs: CPU is "busy" but throughput is low; cache miss rate spikes.
![](images/corei7caches-1.png)

Q: Why do GC pause times grow when the Go/Java heap exceeds available RAM?
A: This is the practical payoff of understanding thrashing: the GC has to scan a large portion of the heap to find live objects.<br>If the heap fits in L3 cache or RAM, traversal is fast.<br>If the heap is so large that pages have been <b>swapped to disk</b>, the GC triggers page faults as it scans — each fault costs ~10 million cycles, stalling the world-stop.<br>Even without swapping: a heap much larger than L3 causes constant cache misses during GC scan, lengthening pauses.<br>Rule of thumb: size your heap to fit comfortably in RAM and keep the <b>live set</b> much smaller than that.
![](images/corei7caches-1.png)
