# dreamDEX Perps — feedback track

Feedback reports for the **Somnia dreamDEX Perps Builder Bounty** (DoraHacks). Each file in [`feedback/`](feedback) is one reproducible item (title, severity, area, steps, expected, actual, evidence, environment).

| # | Title | Severity | Area |
|---|---|---|---|
| 001 | Perp symbol format in SDK docs (`BTC/USDSO:USDSO`) is rejected by the SDK | normal | docs |
| 002 | PERPS.md market/pool counts stale vs Hideki (21 pools) | normal | docs |
| 003 | `fetchTicker` perp `statsAsOf` up to 1h in the future | normal | SDK |
| 004 | Inconsistent/misleading input-validation errors | normal | SDK |

## Harness
`harness/` — read-only probes against Hideki testnet (chain 50383) via `@somnia-chain/markets-sdk` 0.32.1.

```bash
cd harness && npm install
npx tsx read.ts    # markets, ticker, funding, book for every perp -> out/read.json
npx tsx probe.ts   # edge cases / docs checks -> out/probe.json
```
No private key is needed or committed.
