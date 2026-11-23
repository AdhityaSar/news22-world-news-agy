// make.fun entry for news-image-20261122 (Node 22, standard library only).
// Reads entry.png beside this file, validates PNG header & size cap (1 MiB),
// and writes deterministically to $MAKEFUN_OUTPUT_DIR/entry.png (or /output/entry.png).

import { chmodSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1048576;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const rootDir = dirname(fileURLToPath(import.meta.url));
const srcPath = join(rootDir, 'entry.png');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const outPath = join(outDir, 'entry.png');

const data = readFileSync(srcPath);
if (data.length === 0 || data.length > MAX_BYTES) {
  throw new Error(`entry.png size ${data.length} bytes out of range (1..${MAX_BYTES})`);
}
if (!data.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error('entry.png does not start with valid PNG magic bytes');
}

mkdirSync(outDir, { recursive: true, mode: 0o755 });
try {
  chmodSync(outDir, 0o755);
} catch {
  // /output may be owned by root inside the grader sandbox
}

writeFileSync(outPath, data, { mode: 0o644 });
chmodSync(outPath, 0o644);
