# Oversized perp order surfaces raw `ERC20: transfer amount exceeds balance` instead of a margin error, and invalid orders mine as reverted txs

**Severity:** normal
**Area:** SDK / contracts

## Steps to reproduce
1. The account has 90 USDso in the MarginBank and 10 USDso in the wallet.
2. `trader.placePerpOrder({ pool: BTC, isBid: true, price: 0.9×mid, quantity: minQuantity×100000 })`, which needs about 54k USDso of initial margin.
3. Also try `quantity = minQuantity - 1000`, `quantity = minQuantity + 1` and `price = x·1e18 + 1`.

## Expected
- For step 2, a typed insufficient-margin error, such as `InsufficientMargin(required, available)`, or the SDK's `getMaxPerpOrderSize`-style `limitedBy` reason.
- For deterministic input errors (below minimum, off-lot, off-tick), a client-side `InvalidInputError`, or at least a simulation failure before anything is sent. `market.info` already has `minQuantity`, `lotSize` and `tickSize`.

## Actual
- Step 2 reverts `Error(ERC20: transfer amount exceeds balance)`. The order tries to auto-pull the shortfall from the wallet, and the raw token error comes back instead of a margin error.
- `QuantityBelowMinimum(12000, 13000)`, `InvalidQuantity(13001, 1000)` and `InvalidPrice(74955000000000000000001, 100000000000000000)` are decoded nicely. However, **every one of these was mined** as a reverted transaction: the account's nonce went from 8 to 15 during the probe run. A bot that loops on a bad size burns gas on every attempt.

## Evidence
`harness/orderflow/probe.ts` (`huge size`, `below min qty`, `unaligned qty`, `unaligned price`, `market no-cross`). The account's nonce before and after can be checked with `eth_getTransactionCount`.

## Environment
- `@somnia-chain/markets-sdk` 0.32.1 (npm), `viem` 2.57.7, Node 20.19.2, Linux
- Hideki testnet (chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`
- Signer: fresh EOA `0xdFAFacBA862d1a9d6fb94eCE7842E95e7091DCbD` (own MarginBank account, no OWNER_ADDRESS). Run on 2026-10-21 ~01:45–01:55 UTC. Harness: `harness/orderflow/` in this repo.
