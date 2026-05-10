#!/usr/bin/env node
// Usage: node fetch.js <video-directory>
// Reads master.m3u8 / _resMaster.m3u8 / index.m3u8 from the given directory,
// extracts the video ID and hdntl token, then downloads and merges all English
// subtitle segments into <video-directory>/<slug>.vtt

const https = require('https');
const fs = require('fs');
const path = require('path');

const MASTER_NAMES = ['master.m3u8', '_resMaster.m3u8', 'index.m3u8'];
const HEADERS = {
  'Origin': 'https://player.hotmart.com',
  'Referer': 'https://player.hotmart.com/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0',
};

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: HEADERS }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location)
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseMaster(content) {
  // Find the English subtitle URI line
  const match = content.match(/TYPE=SUBTITLES[^\n]*LANGUAGE="en"[^\n]*URI="([^"]+)"/);
  if (!match) throw new Error('No English subtitle track found in master playlist');
  const uri = match[1]; // e.g. "3RGmoewaL4-1769628973000-textstream_eng=1000.m3u8?hdntl=..."

  // Extract video ID — the part before the first dash-followed-by-digits
  const videoId = uri.match(/^([^-]+)/)[1];

  // Validate token expiry
  const expMatch = uri.match(/exp=(\d+)/);
  if (expMatch) {
    const exp = parseInt(expMatch[1], 10);
    const now = Math.floor(Date.now() / 1000);
    if (exp < now) {
      const expired = new Date(exp * 1000).toISOString();
      throw new Error(`hdntl token expired at ${expired}. Re-open the video in your browser to refresh master.m3u8`);
    }
    const expiresIn = Math.round((exp - now) / 3600);
    console.log(`Token valid for ~${expiresIn} more hour(s)`);
  }

  return { videoId, subtitleUri: uri };
}

async function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error('Usage: node fetch.js <video-directory>');
    process.exit(1);
  }

  const absDir = path.resolve(dir);
  const slug = path.basename(absDir);

  // Find master playlist
  let masterPath = null;
  for (const name of MASTER_NAMES) {
    const candidate = path.join(absDir, name);
    if (fs.existsSync(candidate)) { masterPath = candidate; break; }
  }
  if (!masterPath) {
    throw new Error(`No master playlist found in ${absDir}. Tried: ${MASTER_NAMES.join(', ')}`);
  }
  console.log(`Using ${path.basename(masterPath)}`);

  const { videoId, subtitleUri } = parseMaster(fs.readFileSync(masterPath, 'utf-8'));
  const baseUrl = `https://vod-akm.play.hotmart.com/video/${videoId}/hls/`;
  console.log(`Video ID: ${videoId}`);

  // Fetch subtitle playlist
  const playlistUrl = baseUrl + subtitleUri;
  console.log('Fetching subtitle playlist...');
  const playlist = await fetchUrl(playlistUrl);
  fs.writeFileSync(path.join(absDir, '_subtitles.m3u8'), playlist);

  const segments = playlist.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  console.log(`Found ${segments.length} segments`);

  let result = 'WEBVTT\n\n';
  const seen = new Set();

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i].trim();
    const url = seg.startsWith('http') ? seg : baseUrl + seg;
    process.stdout.write(`\rFetching segment ${i + 1}/${segments.length}...`);
    try {
      const text = await fetchUrl(url);
      for (const block of text.split('\n\n')) {
        const trimmed = block.trim();
        if (!trimmed.includes('-->') || seen.has(trimmed)) continue;
        seen.add(trimmed);
        const lines = trimmed.split('\n').filter(l => !/^\d+$/.test(l.trim()));
        result += lines.join('\n') + '\n\n';
      }
    } catch (e) {
      console.error(`\nError on segment ${i + 1}: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 30));
  }

  const outFile = path.join(absDir, `${slug}.vtt`);
  fs.writeFileSync(outFile, result, 'utf-8');
  console.log(`\nDone → ${outFile}`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
