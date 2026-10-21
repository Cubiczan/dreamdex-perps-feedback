# Order from a never-funded signer is reported as `ContractRevertError: placeOrder reverted: Missing or invalid parameters` (data `0x02`) instead of a funding/account error

**Severity:** normal
**Area:** SDK (error classification)

## Steps to reproduce
1. Create a fresh EOA that has never received STT on Hideki (`eth_getBalance` = 0, MarginBank equity = 0). Here: `0xca42FF3Fa21239EA4F268bb8F1aa0518820C65B4`.
2. With that key, call a perfectly valid order: `trader.placePerpOrder({ pool: ETH pool, isBid: true, price: 0.98×bid (tick-aligned), quantity: minQuantity, orderType: ORDER_TYPE.LIMIT })`.
3. Repeat with `ORDER_TYPE.POST_ONLY`, or with `expireTimestampNs = now + 1h`.
4. Run the exact same calls with a funded signer (`0xdFAFacBA862d1a9d6fb94eCE7842E95e7091DCbD`, 90 USDso margin, ~49 STT): they succeed and rest on the book.

## Expected
A typed error that says what is wrong, e.g. `InsufficientFundsError` / `SignerRequiredError`-style "signer account does not exist / has no gas", or at least an `RpcError` that preserves the node's message. Not a contract revert.

## Actual
Every call throws:
```
ContractRevertError  data: 0x02
  "@somnia-chain/markets-sdk: placeOrder reverted: Missing or invalid parameters.
   Double check you have provided the correct parameters."
cause → InvalidInputRpcError  code -32000  details: "account does not exist"
cause → RpcRequestError       code -32000  data: 0x02
```
- The node's real reason (`account does not exist`, code -32000) is only visible two levels down in `cause`.
- The top-level error claims the **contract reverted** and tells the user to check their **parameters**, which are valid (proven by step 4). `0x02` is not a valid ABI error selector, so `errorName` is `undefined`.
- Nothing is mined (nonce stays 0), so this is a pre-flight failure being mislabelled as an on-chain revert. A bot that branches on `ContractRevertError` (e.g. to back off on bad input) will mis-handle an unfunded/new wallet, and new users following the README get sent to debug their order parameters.

## Evidence
`harness/orderflow/unfunded-signer.ts` prints the full `cause` chain. The funded-signer control run (same params, both orders rested, then cancelled) is in the bot wallet's history on 2026-10-21 ~04:20 UTC: PostOnly rest `0x11d4d11cde3d43361d32da4e68407d0edfa94313f1f5e665c0535ffa28b8ff56`, GTD +1h rest `0xde15b381128a3ab2213562d23411cdfd24e0ff1cc544fcbe1db93933cd2788b0`.

## Environment
- `@somnia-chain/markets-sdk` 0.32.1 (npm), `viem` 2.57.7, Node 20.19.2, Linux
- Hideki testnet (chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`
- Run on 2026-10-21 ~04:15–04:25 UTC.
