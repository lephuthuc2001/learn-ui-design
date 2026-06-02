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

function ytdlp(...args) {
  try {
    return execFileSync('yt-dlp', args, { encoding: 'utf-8', stdio: ['inherit', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.error('yt-dlp not found. Install it: pip install yt-dlp');
      process.exit(1);
    }
    const stderr = e.stderr ? e.stderr.toString() : e.message;
    throw new Error(stderr);
  }
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node fetch-youtube.js <youtube-url>');
    process.exit(1);
  }

  // Derive slug from video title
  console.log('Fetching video title...');
  let title;
  try {
    title = ytdlp('--print', 'title', url);
  } catch (e) {
    console.error('Could not fetch video title:', e.message);
    process.exit(1);
  }
  let slug = toSlug(title);
  if (!slug) {
    const id = videoIdFromUrl(url);
    if (!id) {
      console.error('Could not derive a slug from the title or URL. Is this a valid YouTube URL?');
      process.exit(1);
    }
    slug = id;
    console.log(`Title slug was empty; falling back to video ID: ${slug}`);
  }
  console.log(`Title: ${title}`);
  console.log(`Slug:  ${slug}`);

  // Create output directory
  const outDir = path.join('youtube', slug);
  fs.mkdirSync(outDir, { recursive: true });

  // Download English VTT transcript
  console.log('\nDownloading transcript...');
  try {
    ytdlp(
      '--write-auto-sub', '--sub-lang', 'en', '--skip-download',
      '--sub-format', 'vtt',
      '-o', path.join(outDir, slug),
      url
    );
  } catch (e) {
    console.error('Transcript download failed:', e.message);
    console.error('Check that the video has English captions (auto-generated or manual).');
    process.exit(1);
  }

  // yt-dlp writes <slug>.en.vtt — rename to <slug>.vtt
  const rawVtt = path.join(outDir, `${slug}.en.vtt`);
  const finalVtt = path.join(outDir, `${slug}.vtt`);
  if (fs.existsSync(rawVtt)) {
    fs.renameSync(rawVtt, finalVtt);
  } else if (!fs.existsSync(finalVtt)) {
    console.error(`Expected ${rawVtt} after yt-dlp download — no subtitle file found.`);
    process.exit(1);
  }
  console.log(`Transcript → ${finalVtt}`);

  // Download video (best available MP4)
  console.log('\nDownloading video (this may take a while)...');
  try {
    ytdlp(
      '-f', 'bv[ext=mp4]+ba[ext=m4a]/best[ext=mp4]',
      '-o', path.join(outDir, `${slug}.mp4`),
      url
    );
  } catch (e) {
    console.error('Video download failed:', e.message);
    process.exit(1);
  }
  const videoPath = path.join(outDir, `${slug}.mp4`);
  console.log(`Video     → ${videoPath}`);

  console.log(`\nDone → ${outDir}`);
  console.log(`Slug: ${slug}`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
