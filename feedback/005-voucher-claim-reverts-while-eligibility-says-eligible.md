# Credit-voucher claim reverts with undecodable `0x3e31dcc2` while `getPerpVoucherEligibility` returns `eligible: true`

**Severity:** major
**Area:** contracts / SDK

## Steps to reproduce
1. Fresh EOA, never deposited, no positions or orders. Hideki BTC perp market, `marginBank = 0x478769e1177c0773c43a593dccc4ad15f15f1394`.
2. `client.getPerpVoucherEligibility(marginBank, account)` → `{ eligible: true, grantAmount: 1000e18 }`.
3. `client.getPerpVoucherCampaign(marginBank)` → distributor `0x2ACD9EFdA721450906bfE1bef3edE269636E42C4`, startsAt 1790553600 (2026-09-28), endsAt 1798477478 (2026-12-28), `budgetRemaining` 421,984,000 USDso (the distributor really holds that balance), `claimsRemaining` 421984.
4. `trader.claimPerpVoucher({ marginBank })`.

## Expected
1,000 USDso credited as house money, or (if the claim is gated by something else) eligibility returning `eligible: false` with that reason, and the SDK decoding the revert by name.

## Actual
- The claim reverts `0x3e31dcc2` and **the transaction mines**, so it costs gas. Two attempts were mined as reverted txs (nonces 0 and 1 of the account above).
- The SDK throws `ContractRevertError: claim reverted: for an unknown reason` with `errorName: undefined`. The selector is not in any ABI shipped in markets-sdk 0.32.1, and it is not on 4byte or Sourcify.
- `eth_call` of `claim()` (`0x4e71d92d`) from **any** address, including `0x…dEaD`, reverts with the same data. So this is a global gate, not something specific to the account.
- `debug_traceCall` shows the proxy delegatecalls impl `0x9657f0fd53efc01cd108d93c835bb4b517732b43`, which reverts after about 870 gas, right after reading a flag from a namespaced storage slot. That looks like a pause or kill switch that `getPerpVoucherEligibility` does not read. Its docstring says the checks run "in the same order as `VoucherDistributor.claim()`".

## Evidence
`harness/orderflow/claim.ts`; reproduce read-only with:
```
curl -s -X POST https://api.hideki2.infra.testnet.somnia.network -H 'content-type: application/json' \
 -d '{"jsonrpc":"2.0","id":1,"method":"eth_call","params":[{"from":"0x000000000000000000000000000000000000dEaD","to":"0x2ACD9EFdA721450906bfE1bef3edE269636E42C4","data":"0x4e71d92d"},"latest"]}'
# {"error":{"code":3,"message":"execution reverted","data":"0x3e31dcc2"}}
```
Suggested fix: add the missing error to `voucherDistributorReadAbi` or `voucherDistributorWriteAbi`, mirror the gate in `getPerpVoucherEligibility` (for example `reason: "paused"`), and simulate before sending in `claimPerpVoucher`.

## Environment
- `@somnia-chain/markets-sdk` 0.32.1 (npm), `viem` 2.57.7, Node 20.19.2, Linux
- Hideki testnet (chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`
- Signer: fresh EOA `0xdFAFacBA862d1a9d6fb94eCE7842E95e7091DCbD` (own MarginBank account, no OWNER_ADDRESS). Run on 2026-10-21 ~01:45–01:55 UTC. Harness: `harness/orderflow/` in this repo.
