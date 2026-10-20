# PERPS.md describes 2 perp markets / 10 pools (4 restricted); Hideki has 21 tradeable pools, none restricted

**Severity:** normal
**Area:** docs

## Steps to reproduce
1. `await exchange.loadMarkets()` and count `type === "swap"`.
2. `const sys = await client.getPerpSystemConfig(marginBank); await client.listPerpPoolStatuses({ factory: sys.perpPoolFactory })`.

## Expected
Per docs/PERPS.md (SDK 0.32.1): L3 "Perps are live on testnet: `BTC/USDSO:USDSO` and `ETH/USDSO:USDSO`"; L571-572 "Testnet today has 10 pools, four of them restricted `SBTC*` arena markets."

## Actual
- `loadMarkets()`: 21 perp markets (BTC, ETH, SOL, HYPE, XRP, DOGE, BNB, ADA, SUI, LINK, AVAX, XLM, NEAR, WLD, …), all `active: true`.
- `listPerpPoolStatuses`: 21 pools, `restricted: 0`, `tradeable: 21`; no `SBTC*` market.
- The doc also never says which testnet ("testnet" vs Hideki 50383 vs Shannon 50312), so readers cannot tell which deployment the numbers describe.

## Evidence
`harness/out/probe.json` keys `listPerpPoolStatuses`, `listPerpMarkets`; `harness/out/read.json` `marketsRaw`.

## Environment
- `@somnia-chain/markets-sdk` 0.32.1 (npm), `viem` latest, Node 20.19.2, Linux
- Hideki testnet (chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql` (endpoints from `somnia-chain/dreamdex-bot-kit` `packages/perp-core/src/config.ts`)
- Run on 2026-10-20 ~10:30 UTC; read-only, no signer. Harness: `harness/probe.ts`, `harness/read.ts` in this repo.
