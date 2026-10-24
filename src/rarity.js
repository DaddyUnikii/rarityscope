// Core rarity math. Pure functions, no I/O.

const NONE = '(none)';

/** Normalise one metadata object into { id, name, traits: Map<type, value> }. */
export function normalize(meta, fallbackId) {
  const attrs = Array.isArray(meta.attributes) ? meta.attributes : Array.isArray(meta.traits) ? meta.traits : [];
  const traits = new Map();
  for (const a of attrs) {
    if (!a || a.trait_type == null) continue;
    if (a.display_type && a.display_type !== 'string') continue; // skip numeric/boost/date traits
    traits.set(String(a.trait_type), String(a.value));
  }
  const id = meta.tokenId ?? meta.token_id ?? meta.edition ?? idFromName(meta.name) ?? fallbackId;
  return { id: String(id), name: meta.name ?? `#${id}`, image: meta.image, traits };
}

function idFromName(name) {
  const m = typeof name === 'string' && name.match(/#\s*(\d+)/);
  return m ? m[1] : undefined;
}

/**
 * Rank tokens by rarity.
 * Score = sum over every trait type of (N / count(value)), where a missing trait counts as value "(none)",
 * plus the same term for the number of traits a token has. Higher score = rarer. Rank 1 = rarest.
 */
export function rank(tokens, { includeTraitCount = true, includeMissing = true } = {}) {
  const N = tokens.length;
  if (!N) return { tokens: [], traitTypes: [], counts: new Map() };
  const types = [...new Set(tokens.flatMap(t => [...t.traits.keys()]))].sort();
  const counts = new Map(types.map(t => [t, new Map()]));
  const tally = (type, value) => {
    if (!counts.has(type)) counts.set(type, new Map());
    const m = counts.get(type);
    m.set(value, (m.get(value) ?? 0) + 1);
  };
  for (const t of tokens) {
    for (const type of types) {
      const v = t.traits.get(type);
      if (v !== undefined) tally(type, v);
      else if (includeMissing) tally(type, NONE);
    }
    if (includeTraitCount) tally('Trait Count', String(t.traits.size));
  }

  const scored = tokens.map(t => {
    const breakdown = [];
    for (const type of counts.keys()) {
      const value = type === 'Trait Count' ? String(t.traits.size) : t.traits.get(type) ?? (includeMissing ? NONE : undefined);
      if (value === undefined) continue;
      const count = counts.get(type).get(value);
      breakdown.push({ type, value, count, pct: count / N, score: N / count });
    }
    const score = breakdown.reduce((s, b) => s + b.score, 0);
    breakdown.sort((a, b) => a.count - b.count);
    return { ...t, score, breakdown };
  });

  scored.sort((a, b) => b.score - a.score || Number(a.id) - Number(b.id));
  scored.forEach((t, i) => { t.rank = i + 1; t.percentile = (i + 1) / N; });
  return { tokens: scored, traitTypes: types, counts };
}

/** Human tier label from rank percentile. */
export function tier(percentile) {
  if (percentile <= 0.01) return 'Legendary';
  if (percentile <= 0.05) return 'Epic';
  if (percentile <= 0.15) return 'Rare';
  if (percentile <= 0.40) return 'Uncommon';
  return 'Common';
}
