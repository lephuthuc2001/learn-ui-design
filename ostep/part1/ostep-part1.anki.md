# OSTEP Part 1 — CPU Virtualization

---

Q: What are the OS's three core jobs?
A: <b>Virtualizing the CPU</b>, <b>virtualizing memory</b>, and <b>persistence</b> (the file system).
![](images/os-architecture.png)

Q: What illusion does CPU virtualization give a process?
A: That it owns the entire processor alone, even while sharing it with many other processes.
![](images/os-architecture.png)

Q: What illusion does memory virtualization give a process?
A: That it has its own private, exclusive address space, isolated from every other process.
![](images/os-architecture.png)

Q: What is a process, concretely?
A: A running program: its code, its private memory (heap/stack/data), and its current execution state.
![](images/process-states.png)

Q: What two pieces of state does the OS save to pause a process?
A: The <b>program counter</b> (next instruction) and the <b>register values</b>.
![](images/process-states.png)

Q: What are the three basic states a process can be in?
A: <b>Running</b> (on the CPU), <b>Ready</b> (could run, not picked yet), <b>Blocked</b> (waiting on something external).
![](images/process-states.png)

Q: What causes a process to go from Running to Blocked?
A: It makes a blocking call — e.g. a synchronous disk read or network request.
![](images/process-states.png)

Q: What causes a process to go from Blocked back to Ready?
A: The event it was waiting on completes (e.g. the disk read finishes).
![](images/process-states.png)

Q: What causes a process to go from Running to Ready (without it choosing to)?
A: The scheduler preempts it — its time slice ran out.
![](images/process-states.png)

Q: What is "Limited Direct Execution," in one sentence?
A: Let the process run directly on the CPU for full speed, but pre-install hardware traps so the OS can safely regain control.
![](images/lde-protocol-syscall.png)

Q: What is a trap table, and when is it set up?
A: A table telling the CPU where to jump on a syscall or fault; installed once at boot, in kernel mode.
![](images/lde-protocol-syscall.png)

Q: What CPU mode does your application code normally run in?
A: <b>User mode</b> — restricted, can't touch hardware or privileged instructions directly.
![](images/lde-protocol-syscall.png)

Q: What instruction does a system call use to enter the kernel?
A: A <code>trap</code> instruction, carrying a syscall number.
![](images/lde-protocol-syscall.png)

Q: What happens to the CPU's mode during a system call?
A: It switches from user mode to kernel mode, then back to user mode via "return-from-trap" once the OS is done.
![](images/lde-protocol-syscall.png)

Q: How does the OS regain control from a process stuck in an infinite loop?
A: A hardware <b>timer interrupt</b> fires periodically, forcing a trap into the OS no matter what the process is doing.
![](images/lde-timer-interrupt.png)

Q: What does a context switch actually do?
A: Save the current process's registers, load the next process's saved registers, and resume it.
![](images/lde-timer-interrupt.png)

Q: Why are goroutine switches cheaper than OS thread context switches?
A: Goroutine switches happen inside the Go runtime (user space), skipping the kernel trap entirely.
![](images/lde-timer-interrupt.png)

Q: Why does MLFQ use multiple priority queues instead of one fixed priority per job?
A: The scheduler can't know in advance whether a job is short/interactive or long/CPU-bound — behavior has to be observed.
![](images/mlfq-example.png)

Q: Where does a new job start in MLFQ?
A: At the <b>highest-priority</b> queue.
![](images/mlfq-example.png)

Q: What is a job's "allotment" in MLFQ?
A: The amount of CPU time it's allowed to use at its current priority level before being demoted.
![](images/mlfq-example.png)

Q: What happens if a job uses its entire allotment while running?
A: It gets demoted to a lower-priority queue (longer time slice, less priority).
![](images/mlfq-example.png)

Q: What happens if a job gives up the CPU (e.g. blocks on I/O) before using its full allotment?
A: It stays at the same priority level — this looks like interactive behavior, not CPU-hogging.
![](images/mlfq-example.png)
