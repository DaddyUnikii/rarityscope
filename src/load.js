import fs from 'node:fs/promises';
import path from 'node:path';
import { normalize } from './rarity.js';

/** Load metadata from a directory of JSON files, a JSON array file, or an http(s) URL returning a JSON array. */
export async function load(source) {
  if (/^https?:\/\//.test(source)) {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${source}`);
    return toTokens(await res.json());
  }
  const stat = await fs.stat(source);
  if (stat.isDirectory()) {
    const files = (await fs.readdir(source)).filter(f => /^[^.].*?(\.json)?$/i.test(f));
    const tokens = [];
    for (const f of files) {
      const full = path.join(source, f);
      if ((await fs.stat(full)).isDirectory()) continue;
      try {
        const meta = JSON.parse(await fs.readFile(full, 'utf8'));
        tokens.push(normalize(meta, path.basename(f, '.json')));
      } catch { /* skip non-JSON files */ }
    }
    return tokens;
  }
  return toTokens(JSON.parse(await fs.readFile(source, 'utf8')));
}

function toTokens(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data.tokens) ? data.tokens : Object.values(data);
  return list.map((m, i) => normalize(m, i));
}
