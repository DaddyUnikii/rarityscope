# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-10-24

### Added
- Rarity scoring from NFT metadata (sum of `supply / trait count`), including missing traits and trait count.
- Tiers: Legendary, Epic, Rare, Uncommon, Common.
- Sources: folder of JSON files, JSON array file, or URL.
- CLI flags `--top`, `--id`, `--traits`, `--json`, `--no-missing`, `--no-count`.
- Test suite and CI on Node 18, 20 and 22.
