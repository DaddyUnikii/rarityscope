import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, rank, tier } from '../src/rarity.js';
import { load } from '../src/load.js';

const mk = (id, attrs) => normalize({ name: `T #${id}`, attributes: Object.entries(attrs).map(([trait_type, value]) => ({ trait_type, value })) });

test('normalize reads id from name and skips numeric traits', () => {
  const t = normalize({ name: 'Cool #77', attributes: [{ trait_type: 'Hat', value: 'Cap' }, { trait_type: 'Power', value: 5, display_type: 'number' }] });
  assert.equal(t.id, '77');
  assert.deepEqual([...t.traits], [['Hat', 'Cap']]);
});

test('unique trait ranks first', () => {
  const res = rank([mk(1, { Hat: 'Cap' }), mk(2, { Hat: 'Cap' }), mk(3, { Hat: 'Crown' })]);
  assert.equal(res.tokens[0].id, '3');
  assert.equal(res.tokens[0].rank, 1);
});

test('missing trait counts as (none)', () => {
  const res = rank([mk(1, { Hat: 'Cap' }), mk(2, { Hat: 'Cap' }), mk(3, {})], { includeTraitCount: false });
  assert.equal(res.counts.get('Hat').get('(none)'), 1);
  assert.equal(res.tokens[0].id, '3');
});

test('tiers by percentile', () => {
  assert.equal(tier(0.005), 'Legendary');
  assert.equal(tier(0.1), 'Rare');
  assert.equal(tier(0.9), 'Common');
});

test('example collection: #42 is the rarest', async () => {
  const res = rank(await load(new URL('../examples/metadata', import.meta.url).pathname));
  assert.equal(res.tokens.length, 100);
  assert.equal(res.tokens[0].id, '42');
});
