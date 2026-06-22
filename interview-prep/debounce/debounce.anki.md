# Debounce — Anki Cards

Q: What does debounce do?
A: It wraps a function so that it only executes after a specified delay has passed since the last call. If the function is called again before the delay expires, the timer resets.

Q: What is the minimal correct implementation of debounce?
A: ```js
function debounce(func, wait) {
let timeoutId;
return function (...args) {
clearTimeout(timeoutId);
timeoutId = setTimeout(() => {
func.apply(this, args);
}, wait);
};
}

```

Q: In debounce, why must the timer variable live in the closure rather than inside the returned function?
A: Each invocation of the returned function is a separate call — it has no memory of previous calls. The timer variable needs to persist across calls so a new invocation can cancel the previous schedule. Closure scope (one level above) is the only place both invocations can read and write the same variable.

Q: Is it safe to call `clearTimeout` before a timeout has been scheduled (e.g. on the very first call)?
A: Yes. `clearTimeout(undefined)` and `clearTimeout` on an already-fired timer ID are both no-ops in JavaScript. You never need to guard against calling it unnecessarily.

Q: Why should the wrapper function returned by debounce be a regular `function`, not an arrow function?
A: Arrow functions capture `this` lexically at definition time (the closure scope, which is usually `undefined` or the module). A regular `function` gets `this` from the call site, so callers can invoke the debounced function as a method and have `this` correctly forwarded to the original function via `func.apply(this, args)`.

Q: What is wrong with using `Number` (capital N) as a TypeScript parameter type?
A: `Number` is the wrapper object type — it refers to instances of the `Number` class, not the primitive. The correct primitive type is `number` (lowercase). Same applies to `String` vs `string`, `Boolean` vs `boolean`. Always use the lowercase primitives in TypeScript type annotations.

Q: What is the difference between debounce and throttle?
A: Both limit how often a function runs, but differently. **Debounce** delays execution until calls stop — it fires once after a quiet period. **Throttle** fires at a fixed rate regardless of how many calls come in — it guarantees execution no more than once per interval even during continuous input.

Q: What is a real-world use case for debounce vs throttle?
A: **Debounce**: search input autocomplete — wait until the user stops typing before making an API call. **Throttle**: scroll or resize event handlers — fire at most once per 100ms to avoid overwhelming the browser even while the event fires continuously.
```
