# Out-of-range `orderType` on `placePerpOrder` is sent unvalidated and mines as a reverted tx with empty revert data

**Severity:** normal
**Area:** SDK / contracts / docs

## Steps to reproduce
1. Funded MarginBank account, flat on ETH.
2. `trader.placePerpOrder({ pool: ETH pool, isBid: true, price: alignPrice(0.97 × bid), quantity: minQuantity, orderType: 9 })` (a non-crossing resting limit).
3. Repeat with `orderType: 4`.
4. Control: the identical order with `orderType: 0` rests normally and can be cancelled.

## Expected
- `ORDER_TYPE` defines `0` (limit), `1` (FillOrKill), `2` (market/IOC) and `3` (PostOnly). The SDK should reject any other value client-side with a typed `InvalidInputError` before signing.
- If it does reach the pool, a named custom error (for example `InvalidOrderType(9)`) rather than an anonymous revert.

## Actual
- The SDK signs and broadcasts the order. The transaction is **mined and reverts**, so the nonce advances and gas is burned.
- The SDK raises `ContractRevertError: placeOrder reverted: for an unknown reason.` with `data 0x` and `errorName` undefined. Compare `orderType: 1` (FillOrKill) on a non-crossing price, which reverts with a properly decoded `FillOrKillNotFillable()` (`0xc04ad919`).
- Reproduced three times (`9`, `9`, `4`); the control order with `orderType: 0` succeeded immediately after.
- Same failure pattern as item 009 (`selfMatchingOption`), so this looks like enum fields in the order request generally lack client-side and on-chain validation.

## Docs inconsistency
`PlacePerpOrderParams.orderType` is documented as "0 limit (default) or 2 market (IOC)", but `BatchOrderRequest.orderType` lists "0 limit, 1 FillOrKill, 2 market/IOC, 3 PostOnly", and `placePerpOrder` does accept `1` (it reaches the FOK check on-chain). The `placePerpOrder` doc comment should list every supported value.

## Evidence (Hideki testnet, chain 50383)
- Reverted, `orderType: 9`: `0xc66b9f47ede32a3636febf1a3bcfd1bd5394f8167a23ca57bfc9667f1f4e0899` (nonce 230) and `0x217557a056b46ceb25793757d2ec3b9329d9046aaa9d5884fcf7ab63a2fc3557` (nonce 231)
- Reverted, `orderType: 4`: `0x8bbc6ccf50a36cb9dc256c68d3bd3b71c525c48d52fbe5f124f4585b45e147e8` (nonce 232)
- Control `orderType: 0`, placed and cancelled: `0x0c193e6a2190fa46802d635e05c0f550adac305d4b2396736eacf980c0c9fe7a` / `0xa66dc355909d0bb8d4e0de7b2137e7a6005a3145db5665ead1ae0f59bf1bc9ed`

## Environment
- `@somnia-chain/markets-sdk` 0.32.1 (npm), `viem` 2.57.7, Node 20.19.2, Linux
- Hideki testnet (chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`
- Signer `0xdFAFacBA862d1a9d6fb94eCE7842E95e7091DCbD` (own MarginBank account). Run on 2026-10-26 ~04:15 UTC.
