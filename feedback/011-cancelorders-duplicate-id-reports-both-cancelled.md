# `cancelOrders` with a duplicated order id reports `cancelled: true` for both entries, though only one cancel happened

**Severity:** minor
**Area:** SDK

## Steps to reproduce
1. Funded MarginBank account, flat on ETH.
2. Rest one order: `trader.placePerpOrder({ pool: ETH pool, isBid: true, price: alignPrice(0.97 × bid), quantity: minQuantity })`, giving order id `X`.
3. `trader.cancelOrders({ pool: ETH pool, orderIds: [X, X] })`.
4. Control: `trader.cancelOrders({ pool, orderIds: [X] })` again on the now-cancelled id.

## Expected
- `CancelOrdersResult.outcomes` is documented as "index-aligned with the `orderIds` input", and `cancelled: true` means "this id was cancelled in this transaction"; `false` means the contract skipped it (already cancelled, etc.).
- The order can only be cancelled once, so the outcomes should be `[{ X, cancelled: true }, { X, cancelled: false }]`, or the SDK should reject duplicate ids client-side with an `InvalidInputError`.

## Actual
- The transaction succeeds and the order is cancelled once: the receipt has exactly **one** log from the pool (plus one other log), i.e. one cancel event.
- The SDK nevertheless returns `[{ X, cancelled: true }, { X, cancelled: true }]`. It appears to match each input id against the set of cancelled ids from the logs, so a single event satisfies both entries.
- Control behaves correctly: cancelling the already-cancelled `[X]` returns `[{ X, cancelled: false }]` with a successful tx.
- Reproduced twice in a row with fresh orders.

## Why it matters
A bot that counts `cancelled: true` outcomes (for example to reconcile how many rungs of a ladder it pulled, or to release reserved margin per cancelled order) over-counts whenever an id is repeated, e.g. after merging two id lists that overlap.

## Evidence (Hideki testnet, chain 50383)
- Run 1: place `0xdd54ff75e77e4587f4278e262c2428ab7236097cdb35175131bfe262303ca98d` (order `16417602225601511741991`), duplicate cancel `0x72bef34fc1c72f3d2dbdde3c31d46ec812529473ec0bd5e63bd5c9b4b508b4a3` (outcomes true/true), control re-cancel `0x91a53a3c2a3820247f1e88d65e700242b67186a508eb9e9f356e8c9292c012df` (outcome false)
- Run 2: place `0xdd652d260e7a2347fd2dc6d073629d05cb4b0765e6a9b397a3ad614cac87e7d6` (order `5460236245818038082141`), duplicate cancel `0xd18f7473fcdde09a0a6e522ee100426ce0d38be8fb621b6f5cde0a9c3fa6906c` (receipt status success, 2 logs, 1 from the pool; outcomes true/true)

## Environment
- `@somnia-chain/markets-sdk` 0.32.1 (npm), `viem` 2.57.7, Node 20.19.2, Linux
- Hideki testnet (chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`
- Signer `0xdFAFacBA862d1a9d6fb94eCE7842E95e7091DCbD` (own MarginBank account). Run on 2026-10-29 ~04:03 UTC.
