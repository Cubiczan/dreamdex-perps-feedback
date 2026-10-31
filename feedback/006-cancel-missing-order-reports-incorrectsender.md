# Cancelling an already-filled, cancelled or non-existent perp order reverts `IncorrectSender(me, 0x0)`

**Severity:** normal
**Area:** contracts / SDK

## Steps to reproduce
1. Place a resting BTC perp limit order, then cancel it (OK, tx `0x1f3c18d0a5b1adc6473e9b0ee58b0a106da638e7be5fd184840ffbbcf8ff8553`).
2. `trader.cancelOrder({ pool, orderId: 6862188795419959843987n })` again.
3. `trader.cancelOrder({ pool, orderId: 1n })` (never existed).

## Expected
A named `OrderNotFound` or `OrderNotActive` error, or a no-op. The bot kit's `cancelQuietly` already treats a fill/cancel race as normal, so a clear error would let bots tell that race apart from a real auth failure.

## Actual
Both revert with `IncorrectSender(0xdFAF…DCbD, 0x0000000000000000000000000000000000000000)`. This reads like an authorization failure: "you are not the owner" when the owner slot is empty. Both reverts **mine and cost gas**, because the SDK does not simulate before it sends.

## Evidence
`harness/orderflow/probe.ts` lines `cancel already-cancelled` and `cancel nonexistent`.

## Environment
- `@somnia-chain/markets-sdk` 0.32.1 (npm), `viem` 2.57.7, Node 20.19.2, Linux
- Hideki testnet (chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`
- Signer: fresh EOA `0xdFAFacBA862d1a9d6fb94eCE7842E95e7091DCbD` (own MarginBank account, no OWNER_ADDRESS). Run on 2026-10-21 ~01:45–01:55 UTC. Harness: `harness/orderflow/` in this repo.

## Update 2026-10-31: wrong-pool variant
- Same misleading error when the order exists but is sent to the wrong pool: a live ETH order (`16528282690043769543227`, placed in `0xc57ffb1a4da3b09bde35f03772b650b820342118f64237a57eb7730a7741999a`) cancelled via `trader.cancelOrder({ pool: BTC pool, orderId })` reverts in simulation with `IncorrectSender(0xdFAF…DCbD, 0x0000…0000)` instead of an order-not-found error. No tx was sent; the order was then cancelled correctly on the ETH pool (`0xcb76fdff3966267cf079eb1cf95f01c23de5fd15714d36e1c8c9437fdf2bc5a2`). Run on 2026-10-31 ~10:10 UTC.
