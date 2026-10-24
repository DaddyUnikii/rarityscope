<div align="center">

# 🔎 rarityscope

**Rank any NFT collection by trait rarity — straight from its metadata.**

[![CI](https://github.com/DaddyUnikii/rarityscope/actions/workflows/ci.yml/badge.svg)](https://github.com/DaddyUnikii/rarityscope/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-%E2%89%A518-339933?logo=node.js&logoColor=white)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

---

Marketplaces only show rarity after a collection is revealed, and every site scores it differently.
`rarityscope` gives you the number yourself, in one command, with zero dependencies.

```
$ rarityscope examples/metadata --top 5

  100 tokens · 4 trait types

  RANK    TOKEN                 TIER       SCORE     RAREST TRAIT
  1       Demo Droid #42        Legendary  247.2     Aura: Glitch (1, 1.0%)
  2       Demo Droid #32        Epic       35.7      Background: Cosmic (4, 4.0%)
  3       Demo Droid #26        Epic       31.8      Eyes: Void (6, 6.0%)
  4       Demo Droid #23        Epic       31.6      Background: Cosmic (4, 4.0%)
  5       Demo Droid #91        Epic       31.6      Background: Cosmic (4, 4.0%)
```

## ✨ Features

- 📂 Reads a **folder of metadata JSON**, a **JSON array file**, or a **URL**
- 🧮 **Rarity score** (rarity.tools style): sum of `supply / trait count`, including missing traits and trait count
- 🏷️ **Tiers**: Legendary (top 1%), Epic (5%), Rare (15%), Uncommon (40%), Common
- 🔍 Look up your own tokens with `--id`
- 📊 Full trait distribution with `--traits`
- 🤖 `--json` output for bots and dashboards
- 🪶 Zero dependencies, Node 18+

## 🚀 Usage

```bash
git clone https://github.com/DaddyUnikii/rarityscope && cd rarityscope

# top 10 rarest
node bin/rarityscope.js ./metadata

# check your own tokens
node bin/rarityscope.js ./metadata --id 4636,9369

# trait distribution
node bin/rarityscope.js ./metadata --traits

# JSON for scripts
node bin/rarityscope.js ./metadata --top 3 --json
```

Or install globally: `npm i -g .` then run `rarityscope <source>`.

## 🧠 How the score works

For a collection of `N` tokens, each trait a token has adds `N / (tokens sharing that trait value)`.
A token with **no** value for a trait type is scored as `(none)` (being the only one without a hat is rare too),
and the **number of traits** is scored as its own trait. Higher score means rarer; rank 1 is the rarest.

Use `--no-missing` or `--no-count` to turn either rule off.

## 🧪 Tests

```bash
npm test
```

## 📄 License

MIT © [Unikii](https://github.com/DaddyUnikii)
