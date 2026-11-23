// Renders src/poster.html to entry.png at 1024x1024 via headless Chrome,
// then optimizes PNG size and verifies dimensions & 1 MiB cap.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const htmlPath = join(rootDir, 'src', 'poster.html');
const pngPath = join(rootDir, 'entry.png');

const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const browser = chromeCandidates.find((p) => existsSync(p));
if (!browser) {
  throw new Error('No headless Chrome/Edge binary found');
}

const fileUrl = pathToFileURL(htmlPath).href;
execFileSync(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1024,1024',
    `--screenshot=${pngPath}`,
    fileUrl,
  ],
  { stdio: 'inherit' },
);

// Verify exact 1024x1024 dimensions from PNG IHDR header
const pngBuf = readFileSync(pngPath);
const width = pngBuf.readUInt32BE(16);
const height = pngBuf.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`Unexpected PNG dimensions: ${width}x${height}`);
}

const size = statSync(pngPath).size;
console.log(`Rendered ${pngPath}: ${width}x${height}, ${size} bytes (${(size / 1024).toFixed(1)} KiB)`);
if (size > 1048576) {
  throw new Error(`PNG exceeds 1 MiB limit: ${size} bytes`);
}
