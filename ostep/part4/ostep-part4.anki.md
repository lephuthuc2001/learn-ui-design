# OSTEP Part 4 — Persistence

## The flow
1. **Problem:** programs need to store and locate data on disk without dealing with raw physical blocks.
2. **Solution:** the file system abstraction — hide physical layout behind logical names and byte offsets.
3. **Break:** the file system still needs a stable internal handle for each file, separate from its human-readable name.
4. **Solution:** the inode number (i-number) — a unique per-file identifier.
5. **Break:** inode numbers aren't human-friendly and have no hierarchy.
6. **Solution:** directories — just files mapping human-readable names to inode numbers.
7. **Break:** an inode number alone doesn't say where the file's data blocks live or how big it can grow.
8. **Solution:** the inode — metadata plus pointers to data blocks.
9. **Break:** a fixed number of direct pointers caps file size at (pointer count × block size).
10. **Solution:** indirect pointers — a block of more pointers, letting files grow much larger.
11. **Break:** resolving a path (`open("/foo/bar")`) means reading several inodes/directories in sequence — expensive.
12. **Solution:** the open file table entry — refcount, offset, and inode pointer, computed once at open() and reused by every read().
13. **Break:** forked children and `dup()`'d descriptors need to share that same in-flight position and state.
14. **Solution:** the child shares the parent's open file table entry directly; `dup()` makes a new fd point at the same entry.
15. **Break:** none of this protects against a crash mid-write — a logical update often spans several separate disk writes (inode, bitmap, data block), and a crash between them corrupts the file system.
16. **Solution:** write-ahead logging (journaling) — write intended changes to a log first, then checkpoint them to their real on-disk locations.
17. **Break:** without a journal, recovery means scanning the entire disk for inconsistencies (`fsck`) — slow.
18. **Solution:** on crash, just replay the journal — instant recovery, no full disk scan needed.

---

Q: What does the OS's file system abstraction actually hide from you?
A: This is the flow's starting point: The physical layout of data on disk — you interact with logical names and byte offsets, never actual disk blocks.
![](images/directory-tree.png)

Q: What is an inode number (i-number)?
A: Building on that abstraction: The low-level, unique identifier the file system uses internally to refer to a file — separate from its human-readable name.
![](images/directory-tree.png)

Q: What does a directory actually store?
A: Building on inode numbers: A list of (human-readable name → inode number) pairs — nothing more.
![](images/directory-tree.png)

Q: When a child process is forked, what does it inherit about its parent's open files?
A: This is where in-memory bookkeeping for an open file becomes shared state: The child shares the same <b>open file table entry</b> — including the current file offset — with the parent.
![](images/open-file-table.png)

Q: What three things does an open file table entry track?
A: This is what that shared open-file state actually holds: A reference count, the current file offset, and a pointer to the file's inode.
![](images/open-file-table.png)

Q: What does the `dup()` system call do?
A: Building on the open file table: Creates a new file descriptor number that points to the <b>same</b> underlying open file table entry as an existing one — used for things like shell output redirection.
![](images/open-file-table.png)

Q: What is an inode, in plain terms?
A: Stepping back to what the inode itself actually is: A per-file record on disk holding all its metadata (size, permissions, timestamps) plus pointers to where its actual data blocks live.
![](images/ext2-inode.png)

Q: Why can't an inode just store a fixed list of direct pointers to every data block for very large files?
A: This is the limit that plain inode pointers hit: A fixed number of direct pointers caps file size at (pointer count × block size) — too small for large files.
![](images/ext2-inode.png)

Q: What is an "indirect pointer" in an inode, and what does it solve?
A: This is what closes the gap left by fixed direct pointers: A pointer to a block that itself holds hundreds more pointers to data blocks — letting a file grow far past what direct pointers alone could address.
![](images/ext2-inode.png)

Q: When you call `open("/foo/bar")`, why does the file system need to read multiple inodes before it can even start?
A: This is why resolving a path costs more than it looks: It must traverse the path component by component — reading the root inode, then foo's inode, then bar's inode — to resolve human-readable names into disk locations.
![](images/file-read-timeline.png)

Q: Why is a single `read()` call on an already-open file usually cheaper than the initial `open()`?
A: This is the payoff of that open-time traversal: `open()` pays the cost of path traversal (multiple inode/directory reads); a subsequent `read()` just reads the file's inode plus the specific data block.
![](images/file-read-timeline.png)

Q: What's the "update problem" that makes file systems vulnerable to crashes mid-write?
A: None of the structure above protects against a crash mid-write — this is that gap: A single logical file update often requires multiple separate disk writes (inode, bitmap, data block); a crash between those writes can leave the file system in an inconsistent state.
![](images/journaling-timeline.png)

Q: What is the core idea behind write-ahead logging (journaling)?
A: This is journaling's answer to the update problem: Write the intended changes to a separate log first and mark it complete, then apply (checkpoint) those changes to their real on-disk locations — so a crash mid-update can be recovered by replaying the log.
![](images/journaling-timeline.png)

Q: Why does a journaled file system recover instantly after a crash, instead of needing a full disk scan?
A: Building on journaling: On reboot it only has to replay the journal — the log tells it exactly what was in-flight, without needing to scan the entire disk for inconsistencies (which is what the older `fsck` approach had to do).
![](images/journaling-timeline.png)
