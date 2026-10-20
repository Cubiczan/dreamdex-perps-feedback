# `fetchTicker` on a perp returns `statsAsOf` up to 1h in the future

**Severity:** normal
**Area:** SDK

## Steps to reproduce
1. `await exchange.fetchTicker("BTC/USDso:USDso")` at any time not on the hour.
2. Compare `statsAsOf` with `timestamp` / wall clock.

## Expected
`statsAsOf` is documented (structs.ts L411-418) as "the end of the window the 24h statistics were folded over … the statistics' own as-of". It should never be later than the data it describes (i.e. ≤ now / ≤ last folded trade).

## Actual
Ticker at 10:27:45Z:
```json
"timestamp": 1792492065816,      // 2026-10-20T10:27:45.816Z
"lastSource": {"timestamp": 1792490400000},  // 10:00Z bucket
"statsAsOf": 1792494000000       // 2026-10-20T11:00:00Z  <- 32 min in the future
```
Cause: `src/unified/exchange.ts` L2642 `statsAsOf = (Number(lastCandle.bucketStart) + 3600) * 1000`, i.e. the end of the *still-open* hourly bucket. A consumer doing a freshness check (`now - statsAsOf`) gets a negative age and treats stats as fresh forever. Suggest `min(bucketStart+3600, now)` or the last trade time.

## Evidence
`harness/out/read.json` key `ticker BTC/USDso:USDso` (same on all 21 perps).

## Environment
- `@somnia-chain/markets-sdk` 0.32.1 (npm), `viem` latest, Node 20.19.2, Linux
- Hideki testnet (chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql` (endpoints from `somnia-chain/dreamdex-bot-kit` `packages/perp-core/src/config.ts`)
- Run on 2026-10-20 ~10:30 UTC; read-only, no signer. Harness: `harness/probe.ts`, `harness/read.ts` in this repo.
