# Inconsistent/misleading input-validation errors across perp reads

**Severity:** normal
**Area:** SDK

## Steps to reproduce (markets already loaded)
1. `ex.fetchTicker("BTC-PERP")` / `ex.fetchTicker("")` / `ex.fetchTicker("BTC/USDSO:USDSO")`
2. `ex.fetchOrderBook("BTC/USDso:USDso", 0)`
3. `ex.fetchFundingRateHistory("BTC/USDso:USDso", undefined, 0)`
4. `client.listPerpMarkets({ limit: -1 })`

## Expected
Consistent typed `InvalidInputError` naming the bad argument, and an unknown-symbol message that does not blame `loadMarkets()` when markets are loaded (ideally listing close matches, e.g. case-insensitive hit `BTC/USDso:USDso`, or the app's `BTC-PERP` name used in the bot kit).

## Actual
1. `unknown symbol BTC-PERP — call loadMarkets() first` — misleading; `loadMarkets()` already ran. Same text for `""` and wrong case.
2. `book depth must be a positive safe integer and blockNumber nonnegative` — mentions `blockNumber`, which was not passed.
3. Returns `[]` silently for `limit=0` (while book depth 0 throws).
4. Leaks raw GraphQL: `IndexerError: indexer PerpMarkets failed: expected a non-negative 32-bit integer for type 'Int', but found a number` instead of `InvalidInputError`.

## Evidence
`harness/out/probe.json` keys `ticker BTC-PERP`, `ticker empty`, `book limit=0`, `fundingHistory limit 0`, `listPerpMarkets limit -1`.

## Environment
- `@somnia-chain/markets-sdk` 0.32.1 (npm), `viem` latest, Node 20.19.2, Linux
- Hideki testnet (chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql` (endpoints from `somnia-chain/dreamdex-bot-kit` `packages/perp-core/src/config.ts`)
- Run on 2026-10-20 ~10:30 UTC; read-only, no signer. Harness: `harness/probe.ts`, `harness/read.ts` in this repo.
