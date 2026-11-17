# Token Radar — pre-token protocols ranked by implied value

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/garisanku/token-radar/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/garisanku/token-radar/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

A token launch radar: it reads a sealed DefiLlama snapshot of 758 protocols, ranks the 200
pre-token ones (40 on the watchlist, 160 early rows below the floor) by an implied value the
model derives from the snapshot's own figures, and hands in a static dashboard with a board,
a detail view and a filter, each row carrying a concrete farm plan.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input <snapshot.json>
```

`main.ts` (Node 22) reads the snapshot, writes `board.json`, `data.js`, `dashboard/` and
`screenshots/` to the output directory, and writes `dossier.json` with the vendored library.

## The model (radar-2)

`implied = round(tvl_usd x category_multiple x (1 + clamp(change_7d, -60, 120) / 100 x 0.6) x (0.7 + min(age_days, 1095) / 1095 x 0.3))`

The category multiple is the median market-cap-to-TVL ratio of the live-token protocols in
that category, read from this very snapshot (at least 3 live protocols; fewer, and the
category uses the global median), clamped to [0.08, 1.20]. No protocol name is special-cased.

---

<sub>Entered on [make.fun](https://make.fun/?ref=8d53q39g&utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
