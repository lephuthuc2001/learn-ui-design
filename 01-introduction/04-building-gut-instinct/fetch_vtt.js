const https = require('https');
const fs = require('fs');
const path = require('path');

const VIDEO_ID = '3RGmoewaL4';
const BASE_URL = `https://vod-akm.play.hotmart.com/video/${VIDEO_ID}/hls/`;
const SUBTITLE_URI = '3RGmoewaL4-1769628973000-textstream_eng=1000.m3u8?hdntl=exp=1778511589~acl=/*~data=hdntl~hmac=d0ad6bb7423ad59f972e1f5dfbad603658c4413dc78eabf051a78cc685a492fa&app=aa2d356b-e2f0-45e8-9725-e0efc7b5d29c';
const OUT_DIR = __dirname;

const HEADERS = {
  'Origin': 'https://player.hotmart.com',
  'Referer': 'https://player.hotmart.com/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0'
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

async function main() {
  const playlistUrl = BASE_URL + SUBTITLE_URI;
  console.log('Fetching subtitle playlist...');
  const playlist = await fetchUrl(playlistUrl);
  fs.writeFileSync(path.join(OUT_DIR, '_subtitles.m3u8'), playlist);

  const segments = playlist.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  console.log(`Found ${segments.length} segments`);

  let result = 'WEBVTT\n\n';
  const seen = new Set();

  for (let i = 0; i < segments.length; i++) {
    const url = BASE_URL + segments[i].trim();
    const text = await fetchUrl(url);
    for (const block of text.split('\n\n')) {
      const trimmed = block.trim();
      if (!trimmed.includes('-->') || seen.has(trimmed)) continue;
      seen.add(trimmed);
      const lines = trimmed.split('\n').filter(l => !/^\d+$/.test(l.trim()));
      result += lines.join('\n') + '\n\n';
    }
    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${segments.length} segments done`);
    await new Promise(r => setTimeout(r, 30));
  }

  const outFile = path.join(OUT_DIR, 'building-gut-instinct.vtt');
  fs.writeFileSync(outFile, result);
  console.log(`Done! Written to ${outFile}`);
}

main().catch(err => { console.error(err); process.exit(1); });
