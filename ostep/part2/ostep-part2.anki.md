# OSTEP Part 2 — Memory Virtualization

---

Q: What is a virtual address space?
A: The illusion that a process owns the entire address space (0 to max) completely alone.
![](images/address-space.png)

Q: What are the three main regions inside a process's address space?
A: <b>Code</b> at the bottom, <b>heap</b> growing upward, <b>stack</b> growing downward from the top.
![](images/address-space.png)

Q: What two problems does virtual memory solve?
A: <b>Isolation</b> (processes can't touch each other's memory) and <b>transparency</b> (a process doesn't need to know where it physically sits in RAM).
![](images/virtual-memory.png)

Q: What do "base and bounds" registers do?
A: Translate a virtual address to a physical one: <code>physical = virtual + base</code>, checked against the bounds register.
![](images/physical-memory-relocated.png)

Q: What's the main weakness of base-and-bounds relocation?
A: It treats the whole address space as one contiguous chunk — wasting physical RAM on the unused gap between heap and stack.
![](images/physical-memory-relocated.png)

Q: How does segmentation improve on plain base-and-bounds?
A: It uses <b>separate</b> base/bounds pairs for code, heap, and stack, so each can be placed independently and sized to actual usage.
![](images/segmentation-physical-memory.png)

Q: What is external fragmentation?
A: Free memory split into scattered chunks, each too small to satisfy a request — even though total free space would be enough.
![](images/segmentation-physical-memory.png)

Q: Why can a JVM throw OutOfMemoryError even with 60% of the heap free?
A: External fragmentation — no single contiguous region is large enough for the allocation.
![](images/segmentation-physical-memory.png)

Q: What is paging?
A: Dividing both the virtual address space and physical memory into small, fixed-size chunks (pages and page frames).
![](images/paging-physical-memory.png)

Q: Why does paging eliminate external fragmentation entirely?
A: Any virtual page can go into any free physical frame — no contiguous placement is ever required.
![](images/paging-physical-memory.png)

Q: What is a page table?
A: A per-process map from virtual page number (VPN) to physical frame number (PFN).
![](images/tlb-control-flow.png)

Q: What does the "valid" bit in a page table entry protect against?
A: Illegal memory accesses — this is the mechanism behind a C segfault or a safely-contained Go/Java NPE.
![](images/tlb-control-flow.png)

Q: Why isn't a plain page-table lookup fast enough for every memory access?
A: The page table itself lives in RAM, so translation would double the cost of every single memory access.
![](images/tlb-control-flow.png)

Q: What is a TLB?
A: A small, very fast on-chip cache of recent virtual-to-physical (VPN→PFN) translations.
![](images/tlb-control-flow.png)

Q: What kind of locality does the TLB rely on to be effective?
A: <b>Spatial locality</b> — nearby memory addresses tend to share the same page.
![](images/tlb-array-example.png)

Q: Why does looping over a Go slice (`[]int`) beat chasing a linked list, at the hardware level?
A: The slice's contiguous memory keeps hitting the same pages (TLB hits); the linked list's scattered heap nodes cause repeated TLB misses.
![](images/tlb-array-example.png)

Q: What does the "present bit" in a page table entry indicate?
A: Whether the page is currently in physical RAM, or swapped out to disk.
![](images/swap-space.png)

Q: What happens, step by step, on a page fault?
A: OS pauses the process, loads the missing page from disk into a free frame, updates the page table, then resumes the process.
![](images/swap-space.png)

Q: What is thrashing?
A: When too many active processes' combined working sets exceed RAM, causing constant swapping instead of real work.
![](images/swap-space.png)

Q: What's the telltale symptom of a thrashing machine?
A: CPU utilization near 0% while disk I/O utilization is near 100%.
![](images/swap-space.png)

Q: What's the actual fix for thrashing?
A: Reduce memory pressure (fewer processes, smaller heaps) or add more RAM — you can't schedule your way out of it.
![](images/swap-space.png)

Q: What does a page replacement policy decide?
A: Which resident page to evict when a new page needs to be brought into a full memory.
![](images/fifo-trace.png)

Q: Why does FIFO page replacement perform poorly?
A: It evicts whichever page arrived first, regardless of whether it's still being used heavily.
![](images/fifo-trace.png)

Q: What replacement policy do real systems use instead of FIFO, and why?
A: <b>LRU</b> (or approximations like Clock) — recent access is a much better predictor of near-future access than arrival order.
![](images/fifo-trace.png)
