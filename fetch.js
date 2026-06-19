#!/usr/bin/env node
// Usage: node fetch.js <video-directory>
// Reads master.m3u8 / _resMaster.m3u8 / index.m3u8 from the given directory,
// extracts the video ID and hdntl token, then downloads and merges all English
// subtitle segments into <video-directory>/<slug>.vtt

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const MASTER_NAMES = ['master.m3u8', '_resMaster.m3u8', 'index.m3u8'];
// Akamai CDN (vod-akm.play.hotmart.com) requires HTTP/2 (negotiated via ALPN).
// Node's https module uses HTTP/1.1 and gets blocked by Akamai bot detection.
// curl --compressed triggers HTTP/2 negotiation and passes the fingerprint check.
const CURL_HEADERS = [
  'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0',
  'Accept: */*',
  'Accept-Language: en-US,en;q=0.9',
  'Origin: https://player.hotmart.com',
  'Referer: https://player.hotmart.com/',
  'Sec-Fetch-Dest: empty',
  'Sec-Fetch-Mode: cors',
  'Sec-Fetch-Site: same-site',
  'DNT: 1',
  'Pragma: no-cache',
  'Cache-Control: no-cache',
  ...(process.env.HOTMART_COOKIES ? [`Cookie: ${process.env.HOTMART_COOKIES}`] : []),
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const args = ['--compressed', '--silent', '--location', '--max-redirs', '5'];
    for (const h of CURL_HEADERS) args.push('-H', h);
    args.push(url);
    execFile('curl', args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(err.message));
      resolve(stdout);
    });
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

  const CONCURRENCY = 10;
  let done = 0;
  const results = new Array(segments.length).fill('');

  async function fetchSegment(i) {
    const seg = segments[i].trim();
    const url = seg.startsWith('http') ? seg : baseUrl + seg;
    try {
      results[i] = await fetchUrl(url);
    } catch (e) {
      console.error(`\nError on segment ${i + 1}: ${e.message}`);
    }
    done++;
    process.stdout.write(`\rFetching segments... ${done}/${segments.length}`);
  }

  // Run in batches of CONCURRENCY
  for (let i = 0; i < segments.length; i += CONCURRENCY) {
    const batch = [];
    for (let j = i; j < Math.min(i + CONCURRENCY, segments.length); j++) batch.push(fetchSegment(j));
    await Promise.all(batch);
  }
  console.log('');

  const seen = new Set();
  let result = 'WEBVTT\n\n';
  for (const text of results) {
    for (const block of text.split('\n\n')) {
      const trimmed = block.trim();
      if (!trimmed.includes('-->') || seen.has(trimmed)) continue;
      seen.add(trimmed);
      const lines = trimmed.split('\n').filter(l => !/^\d+$/.test(l.trim()));
      result += lines.join('\n') + '\n\n';
    }
  }

  const outFile = path.join(absDir, `${slug}.vtt`);
  fs.writeFileSync(outFile, result, 'utf-8');
  console.log(`\nDone → ${outFile}`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
