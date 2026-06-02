const { toSlug, videoIdFromUrl } = require('./fetch-youtube');
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
