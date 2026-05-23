#!/usr/bin/env node
'use strict';

/**
 * generate-illustration.js
 * Generates dark-mode SVG illustrations for Anki flashcards.
 *
 * Usage:
 *   node generate-illustration.js \
 *     --type <color-swatches|tonal-scale|spectrum|comparison> \
 *     --output <path/to/output.svg> \
 *     [--title "Title text"] \
 *     [--data '<json>']
 *
 * Output: SVG file at --output path. PNG attempted via rsvg-convert / convert / inkscape if available.
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── CLI ───────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      out[key] = argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

if (!args.type || !args.output) {
  console.error('Usage: node generate-illustration.js --type <type> --output <path> [--title <title>] [--data <json>]');
  console.error('Types: color-swatches, tonal-scale, spectrum, comparison');
  process.exit(1);
}

const TYPE   = args.type;
const OUTPUT = args.output;
const TITLE  = args.title || '';
const DATA   = args.data  ? JSON.parse(args.data) : {};

// ── Design tokens ─────────────────────────────────────────────────────────────

const BG       = '#1f1f1f';
const T1       = '#e0e0e0';   // primary text
const T2       = '#aaaaaa';   // secondary text
const T3       = '#666666';   // muted text
const FONT     = 'system-ui, -apple-system, sans-serif';

// ── SVG primitives ────────────────────────────────────────────────────────────

function wrap(w, h, inner) {
  return [
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">`,
    `  <rect width="${w}" height="${h}" fill="${BG}" rx="12"/>`,
    inner,
    `</svg>`,
  ].join('\n');
}

function t(x, y, str, { anchor = 'middle', size = 13, fill = T1, weight = 'normal' } = {}) {
  return `  <text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-family="${FONT}" font-size="${size}" font-weight="${weight}">${esc(str)}</text>`;
}

function rect(x, y, w, h, fill, { rx = 8, opacity = 1, stroke, strokeOpacity = 0.4 } = {}) {
  const s = stroke ? ` stroke="${stroke}" stroke-width="1" stroke-opacity="${strokeOpacity}"` : '';
  return `  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" fill-opacity="${opacity}"${s}/>`;
}

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Returns a label-safe version of a hex color — lightens colors that are too dark to read on #1f1f1f */
function readableOnDark(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  if (lum < 0.18) {
    const lighten = (c) => Math.round(c + (255 - c) * 0.55);
    const h = (n) => lighten(n).toString(16).padStart(2, '0');
    return `#${h(r)}${h(g)}${h(b)}`;
  }
  return hex;
}

// ── Generators ────────────────────────────────────────────────────────────────

/**
 * color-swatches
 * data.groups: Array<{ label?: string, swatches: Array<{ color, label, sublabel? }> }>
 */
function colorSwatches(title, data) {
  const groups    = data.groups || [];
  const SW        = 72;   // swatch width
  const SH        = 52;   // swatch height
  const SGAP      = 10;   // gap between swatches in a group
  const GGAP      = 36;   // gap between groups
  const PAD       = 24;   // horizontal padding
  const TITLE_H   = title ? 46 : 16;
  const GLABEL_H  = 18;   // height reserved for group label
  const SLABEL_H  = 32;   // height for swatch label rows

  // Compute total width
  let contentW = 0;
  groups.forEach((g, gi) => {
    if (gi > 0) contentW += GGAP;
    contentW += g.swatches.length * (SW + SGAP) - SGAP;
  });
  const W = Math.max(PAD * 2 + contentW, 240);
  const H = TITLE_H + GLABEL_H + SH + SLABEL_H + 10;

  const lines = [];

  if (title) {
    lines.push(t(W / 2, 30, title, { size: 15, weight: 'bold' }));
  }

  let x = PAD;
  groups.forEach((g, gi) => {
    if (gi > 0) x += GGAP;
    const groupW = g.swatches.length * (SW + SGAP) - SGAP;
    const cx     = x + groupW / 2;

    if (g.label) {
      lines.push(t(cx, TITLE_H + 12, g.label, { size: 11, fill: T2, weight: 'bold' }));
    }

    const swatchY = TITLE_H + GLABEL_H;
    g.swatches.forEach((s, si) => {
      const sx = x + si * (SW + SGAP);
      lines.push(rect(sx, swatchY, SW, SH, s.color));
      if (s.label) {
        lines.push(t(sx + SW / 2, swatchY + SH + 18, s.label, { size: 11, fill: readableOnDark(s.color) }));
      }
      if (s.sublabel) {
        lines.push(t(sx + SW / 2, swatchY + SH + 32, s.sublabel, { size: 10, fill: T3 }));
      }
    });

    x += groupW;
  });

  return wrap(W, H, lines.join('\n'));
}

/**
 * tonal-scale
 * data.stops:  string[]   — hex colors from darkest to lightest
 * data.labels: string[]   — optional label per stop
 */
function tonalScale(title, data) {
  const stops  = data.stops  || [];
  const labels = data.labels || stops.map(() => '');
  const SW     = 76;
  const SH     = 56;
  const GAP    = 8;
  const PAD    = 24;
  const TITLE_H = title ? 44 : 14;

  const W = PAD * 2 + stops.length * (SW + GAP) - GAP;
  const H = TITLE_H + SH + 36;

  const lines = [];
  if (title) lines.push(t(W / 2, 28, title, { size: 15, weight: 'bold' }));

  stops.forEach((color, i) => {
    const x = PAD + i * (SW + GAP);
    lines.push(rect(x, TITLE_H, SW, SH, color));
    if (labels[i]) {
      lines.push(t(x + SW / 2, TITLE_H + SH + 18, labels[i], { size: 10, fill: T2 }));
    }
  });

  // Subtle arrow hinting direction
  const arrowY = TITLE_H + SH / 2;
  lines.push(`  <text x="${PAD - 6}" y="${arrowY + 5}" text-anchor="end" fill="${T3}" font-family="${FONT}" font-size="18">←</text>`);
  lines.push(`  <text x="${W - PAD + 6}" y="${arrowY + 5}" text-anchor="start" fill="${T3}" font-family="${FONT}" font-size="18">→</text>`);

  return wrap(W, H, lines.join('\n'));
}

/**
 * spectrum
 * data.left:    string   — left-end label
 * data.right:   string   — right-end label
 * data.markers: Array<{ position: 0–1, label: string }>
 */
function spectrum(title, data) {
  const W      = 520;
  const H      = title ? 160 : 130;
  const BAR_X  = 48;
  const BAR_W  = W - BAR_X * 2;
  const BAR_Y  = title ? 90 : 62;
  const BAR_H  = 18;
  const markers = data.markers || [];

  const lines = [];
  if (title) lines.push(t(W / 2, 32, title, { size: 15, weight: 'bold' }));

  // Gradient definition
  const gid = 'sg';
  lines.push(`  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#C0392B"/>
      <stop offset="100%" stop-color="#27AE60"/>
    </linearGradient>
  </defs>`);

  // Bar
  lines.push(`  <rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" rx="${BAR_H / 2}" fill="url(#${gid})"/>`);

  // End labels
  lines.push(t(BAR_X,         BAR_Y + BAR_H + 22, data.left  || '', { anchor: 'start', size: 13, fill: '#C0392B' }));
  lines.push(t(BAR_X + BAR_W, BAR_Y + BAR_H + 22, data.right || '', { anchor: 'end',   size: 13, fill: '#27AE60' }));

  // Markers
  markers.forEach(m => {
    const mx = BAR_X + m.position * BAR_W;
    lines.push(`  <line x1="${mx}" y1="${BAR_Y - 10}" x2="${mx}" y2="${BAR_Y + BAR_H + 10}" stroke="${T1}" stroke-width="2" stroke-dasharray="3,2" opacity="0.7"/>`);
    lines.push(t(mx, BAR_Y - 16, m.label || '', { size: 11, fill: T2 }));
  });

  return wrap(W, H, lines.join('\n'));
}

/**
 * comparison
 * data.left:  { title, items: string[] }
 * data.right: { title, items: string[] }
 */
function comparison(title, data) {
  const left   = data.left  || { title: 'Before', items: [] };
  const right  = data.right || { title: 'After',  items: [] };
  const W      = 520;
  const PAD    = 20;
  const PGAP   = 40;   // gap between panels
  const PW     = (W - PAD * 2 - PGAP) / 2;
  const TITLE_H = title ? 48 : 16;
  const maxItems = Math.max(left.items.length, right.items.length);
  const H = TITLE_H + 46 + maxItems * 24 + 24;

  const lines = [];
  if (title) lines.push(t(W / 2, 30, title, { size: 15, weight: 'bold' }));

  const configs = [
    { x: PAD,              panel: left,  accent: '#C0392B' },
    { x: PAD + PW + PGAP, panel: right, accent: '#27AE60' },
  ];

  configs.forEach(({ x, panel, accent }) => {
    const pH = H - TITLE_H - 10;
    lines.push(rect(x, TITLE_H + 8, PW, pH, accent, { opacity: 0.08, stroke: accent, strokeOpacity: 0.3 }));
    lines.push(t(x + PW / 2, TITLE_H + 30, panel.title, { size: 13, weight: 'bold', fill: accent }));
    panel.items.forEach((item, i) => {
      lines.push(t(x + 14, TITLE_H + 50 + i * 24, `• ${item}`, { anchor: 'start', size: 11, fill: T2 }));
    });
  });

  // vs badge
  const vsX = PAD + PW + PGAP / 2;
  const vsY = TITLE_H + 8 + (H - TITLE_H - 10) / 2;
  lines.push(`  <circle cx="${vsX}" cy="${vsY}" r="14" fill="${BG}" stroke="${T3}" stroke-width="1"/>`);
  lines.push(t(vsX, vsY + 5, 'vs', { size: 12, fill: T3 }));

  return wrap(W, H, lines.join('\n'));
}

// ── Main ──────────────────────────────────────────────────────────────────────

const generators = {
  'color-swatches': colorSwatches,
  'tonal-scale':    tonalScale,
  'spectrum':       spectrum,
  'comparison':     comparison,
};

if (!generators[TYPE]) {
  console.error(`Unknown type: ${TYPE}`);
  console.error(`Available: ${Object.keys(generators).join(', ')}`);
  process.exit(1);
}

const svg = generators[TYPE](TITLE, DATA);

// Normalise output path — always write SVG
const svgPath = OUTPUT.endsWith('.png') ? OUTPUT.replace(/\.png$/, '.svg') : OUTPUT;
fs.mkdirSync(path.dirname(svgPath), { recursive: true });
fs.writeFileSync(svgPath, svg, 'utf8');
console.log(`✅ SVG  → ${svgPath}`);

// Optional PNG conversion — try common tools in order
if (OUTPUT.endsWith('.png')) {
  const pngPath = OUTPUT;
  const converters = [
    `rsvg-convert -o "${pngPath}" "${svgPath}"`,
    `convert "${svgPath}" "${pngPath}"`,
    `inkscape "${svgPath}" --export-filename="${pngPath}"`,
  ];
  let converted = false;
  for (const cmd of converters) {
    try {
      execSync(cmd, { stdio: 'ignore', timeout: 15000 });
      converted = true;
      console.log(`✅ PNG  → ${pngPath}`);
      break;
    } catch (_) { /* try next */ }
  }
  if (!converted) {
    console.log(`ℹ️  PNG conversion unavailable — SVG is Anki-compatible.`);
    console.log(`   Embed as: ![](${path.relative(process.cwd(), svgPath)})`);
  }
}
