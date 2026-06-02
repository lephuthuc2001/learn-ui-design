#!/usr/bin/env node
// Usage: node fetch-youtube.js <youtube-url>
// Downloads English VTT transcript and MP4 video into youtube/<slug>/

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function videoIdFromUrl(url) {
  const match = url.match(/[?&]v=([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

module.exports = { toSlug, videoIdFromUrl };
