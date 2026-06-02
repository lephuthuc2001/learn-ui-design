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
