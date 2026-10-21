# dreamDEX Perps — feedback track

Feedback reports for the **Somnia dreamDEX Perps Builder Bounty** (DoraHacks). Each file in [`feedback/`](feedback) is one reproducible item (title, severity, area, steps, expected, actual, evidence, environment).

| # | Title | Severity | Area |
|---|---|---|---|
| 001 | Perp symbol format in SDK docs (`BTC/USDSO:USDSO`) is rejected by the SDK | normal | docs |
| 002 | PERPS.md market/pool counts stale vs Hideki (21 pools) | normal | docs |
| 003 | `fetchTicker` perp `statsAsOf` up to 1h in the future | normal | SDK |
| 004 | Inconsistent/misleading input-validation errors | normal | SDK |
| 005 | Voucher claim reverts `0x3e31dcc2` while eligibility says `eligible: true` | major | contracts/SDK |
| 006 | Cancel of filled/missing order reverts `IncorrectSender(me, 0x0)` | normal | contracts/SDK |
| 007 | Oversize order → raw ERC20 error; invalid orders mine as reverted txs | normal | SDK/contracts |

## Harness
`harness/` — read-only probes against Hideki testnet (chain 50383) via `@somnia-chain/markets-sdk` 0.32.1.

```bash
cd harness && npm install
npx tsx read.ts    # markets, ticker, funding, book for every perp -> out/read.json
npx tsx probe.ts   # edge cases / docs checks -> out/probe.json
```
No private key is needed or committed.

### Order-flow harness (signed, tiny sizes)
`harness/orderflow/` places, cancels and closes real orders on Hideki. It reads `PRIVATE_KEY` from a git-ignored `.env`.
```bash
npx tsx harness/orderflow/ft.ts flow   # rest+cancel, market open, market close on BTC (min size)
npx tsx harness/orderflow/probe.ts     # error-path probes (items 006/007)
```
Real tx log: `harness/orderflow/txs.jsonl` (e.g. open `0xd1b80b6c…84d2`, close `0xd3ee6340…a479`).
