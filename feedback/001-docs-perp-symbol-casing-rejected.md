# Perp symbol format in SDK docs (`BTC/USDSO:USDSO`) is rejected by the SDK

**Severity:** normal
**Area:** docs

## Steps to reproduce
1. Build a `SomniaMarkets` for Hideki (see Environment) and `await exchange.loadMarkets()`.
2. Follow the PERPS.md Quick start verbatim: `await exchange.fetchFundingRate("BTC/USDSO:USDSO")` (also `fetchTicker`).

## Expected
The documented symbol resolves (docs/PERPS.md L3, L1197-1200; docs/EXCHANGE.md L39; TSDoc in `src/unified/symbols.ts` L6 and `structs.ts` L530 all use `BTC/USDSO:USDSO`), or symbol lookup is case-insensitive.

## Actual
```
InvalidInputError @somnia-chain/markets-sdk: unknown symbol BTC/USDSO:USDSO — call loadMarkets() first
```
`loadMarkets()` returns the symbol as `BTC/USDso:USDso` (mixed case), which works. Every copy-pasted docs example (`depositMargin`, `createOrder`, `fetchFundingRate`, `fetchFundingRateHistory`) therefore fails.

## Evidence
- `Object.keys(await ex.loadMarkets())` contains `"BTC/USDso:USDso"`, `"ETH/USDso:USDso"`, … (21 perps), none upper-case.
- Output of `harness/probe.ts`, entries `ticker docs-casing BTC/USDSO:USDSO` and `funding docs-casing` in `harness/out/probe.json`.

## Environment
- `@somnia-chain/markets-sdk` 0.32.1 (npm), `viem` latest, Node 20.19.2, Linux
- Hideki testnet (chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql` (endpoints from `somnia-chain/dreamdex-bot-kit` `packages/perp-core/src/config.ts`)
- Run on 2026-10-20 ~10:30 UTC; read-only, no signer. Harness: `harness/probe.ts`, `harness/read.ts` in this repo.
