import { makeEx, j, me } from "./lib.ts";
const ex=makeEx(); const mk=await ex.loadMarkets(); const m:any=mk["BTC/USDso:USDso"]; const mb=m.info.marginBank;
const c=ex.client; const a=me();
console.log("acct",a);
console.log("STT", await c.getViemClient().getBalance({address:a}));
const el=await c.getPerpVoucherEligibility(mb,a); console.log(j(el));
console.log(j(await c.getPerpVoucherCampaign(mb)));
if (el.eligible && process.argv[2]==="go"){ const r=await ex.trader.claimPerpVoucher({marginBank:mb}); console.log("claim", r.hash ?? j(r)); }
console.log(j(await c.getMarginAccount(mb,a)));
process.exit(0);
