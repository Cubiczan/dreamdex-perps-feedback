# Out-of-range `selfMatchingOption` is sent unvalidated and mines as a reverted tx with empty revert data

**Severity:** normal
**Area:** SDK / contracts

## Steps to reproduce
1. Funded MarginBank account, flat on ETH.
2. `trader.placePerpOrder({ pool: ETH pool, isBid: true, price: alignPrice(0.97 × bid), quantity: minQuantity, selfMatchingOption: 7 })` (a non-crossing resting limit, so self-matching never even comes into play).
3. Control: the identical order with `selfMatchingOption: 1` rests normally and can be cancelled.

## Expected
- `SELF_MATCHING_OPTION` only defines `0` (`CANCEL_TAKER`) and `1` (`CANCEL_MAKER`), so the SDK should reject any other value client-side with a typed `InvalidInputError` before signing anything.
- If it does reach the pool, a named custom error (for example `InvalidSelfMatchingOption(7)`) rather than an anonymous revert.

## Actual
- The SDK signs and broadcasts the order. The transaction is **mined and reverts**, so the nonce advances and gas is burned.
- The SDK raises `ContractRevertError: placeOrder reverted: for an unknown reason.` with `data 0x` and `errorName` undefined, so a bot can't tell what went wrong. Compare `builderFeeBpsTimes1k: 1500n` with no builder, which reverts with a nicely decoded `InvalidBuilder()` (`0x6d10926b`).
- Reproduced twice in a row; the control order with option `1` succeeded right after each time.

## Evidence (Hideki testnet, chain 50383)
- Reverted, `selfMatchingOption: 7`: `0xbf655fdc450e5e46dbcf58fa88f0092d562a6c6eb171674104aa15e5cf2474fb` (nonce 186) and `0xe97f61eb9c7a338f0a66917dd7f12b0614cb32ff902d2c4af20bc8d9c64c201d` (nonce 188)
- Reverted with decoded `InvalidBuilder()` for comparison: `0x5d3c7d23fbd77aeee5f995f70da841c82d37b4f9a56c7db3e89df64e6779717e` (nonce 187)
- Control with `selfMatchingOption: 1`, placed and cancelled: `0xc3a5b0b7044df30a67b8f3c9b3c2108431c8ffc456b1b9f3ec6a9d2956483ba9` / `0xa4879b83a181cee3a25d714b3eec7b63b226d7c2dd8625f04a44c1e17e3aa9f7`

## Environment
- `@somnia-chain/markets-sdk` 0.32.1 (npm), `viem` 2.57.7, Node 20.19.2, Linux
- Hideki testnet (chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`
- Signer `0xdFAFacBA862d1a9d6fb94eCE7842E95e7091DCbD` (own MarginBank account). Run on 2026-10-25 ~04:10 UTC.
