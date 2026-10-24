#!/usr/bin/env node
import { load } from '../src/load.js';
import { rank, tier } from '../src/rarity.js';

const HELP = `rarityscope — rank an NFT collection by trait rarity

Usage:
  rarityscope <source> [options]

Source:
  a folder of metadata JSON files, a JSON array file, or a URL returning a JSON array

Options:
  --top <n>        show the n rarest tokens (default 10)
  --id <ids>       show specific tokens, comma separated (e.g. --id 12,404)
  --traits         print the trait distribution
  --json           machine-readable output
  --no-missing     do not score missing traits as "(none)"
  --no-count       do not score the number of traits
  -h, --help       show this help
`;

const argv = process.argv.slice(2);
if (!argv.length || argv.includes('-h') || argv.includes('--help')) { process.stdout.write(HELP); process.exit(0); }
const opt = (name, def) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : def; };
const source = argv.find((a, i) => !a.startsWith('-') && !['--top', '--id'].includes(argv[i - 1]));

const c = process.stdout.isTTY && !process.env.NO_COLOR
  ? { b: s => `\x1b[1m${s}\x1b[0m`, d: s => `\x1b[2m${s}\x1b[0m`, y: s => `\x1b[33m${s}\x1b[0m`, m: s => `\x1b[35m${s}\x1b[0m`, c: s => `\x1b[36m${s}\x1b[0m` }
  : { b: s => s, d: s => s, y: s => s, m: s => s, c: s => s };
const tierColor = { Legendary: c.y, Epic: c.m, Rare: c.c, Uncommon: s => s, Common: c.d };
const pad = (s, n) => String(s).padEnd(n);
const pct = p => (p * 100).toFixed(p < 0.01 ? 2 : 1) + '%';

try {
  const tokens = await load(source);
  if (!tokens.length) throw new Error('no metadata found in ' + source);
  const res = rank(tokens, { includeMissing: !argv.includes('--no-missing'), includeTraitCount: !argv.includes('--no-count') });
  const N = res.tokens.length;

  let pick;
  if (opt('--id')) {
    const want = new Set(opt('--id').split(',').map(s => s.trim()));
    pick = res.tokens.filter(t => want.has(t.id));
  } else pick = res.tokens.slice(0, Number(opt('--top', 10)));

  if (argv.includes('--json')) {
    console.log(JSON.stringify({
      supply: N,
      tokens: pick.map(t => ({ id: t.id, name: t.name, rank: t.rank, score: +t.score.toFixed(3), tier: tier(t.percentile),
        rarestTrait: t.breakdown[0] && { type: t.breakdown[0].type, value: t.breakdown[0].value, count: t.breakdown[0].count } })),
    }, null, 2));
    process.exit(0);
  }

  console.log(c.b(`\n  ${N.toLocaleString()} tokens · ${res.traitTypes.length} trait types\n`));
  console.log(c.d('  ' + pad('RANK', 8) + pad('TOKEN', 22) + pad('TIER', 11) + pad('SCORE', 10) + 'RAREST TRAIT'));
  for (const t of pick) {
    const r = t.breakdown.find(b => b.type !== 'Trait Count' && b.value !== '(none)') ?? t.breakdown[0];
    const tr = tier(t.percentile);
    console.log('  ' + pad(t.rank, 8) + pad(t.name.slice(0, 20), 22) + tierColor[tr](pad(tr, 11)) + pad(t.score.toFixed(1), 10)
      + `${r.type}: ${r.value} ${c.d(`(${r.count}, ${pct(r.pct)})`)}`);
  }

  if (argv.includes('--traits')) {
    console.log();
    for (const [type, values] of res.counts) {
      console.log(c.b('  ' + type));
      [...values].sort((a, b) => a[1] - b[1]).forEach(([v, n]) => console.log(`    ${pad(v, 26)}${pad(n, 7)}${c.d(pct(n / N))}`));
    }
  }
  console.log();
} catch (e) {
  console.error('rarityscope: ' + e.message);
  process.exit(1);
}
