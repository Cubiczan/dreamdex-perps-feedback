import { ex, market, place, cancel, mid, minQty, j, me } from "./perp.ts";
const s="BTC"; const m=await market(s); const {mid:md,ask,bid}=await mid(s); const q=await minQty(s);
const out:any={};
async function t(n:string,f:()=>Promise<any>){try{const r=await f(); out[n]={ok:true,r:j(r).slice(0,300)}}catch(e:any){out[n]={ok:false,name:e?.name,errorName:e?.errorName,msg:String(e?.shortMessage??e?.message).slice(0,400)}} console.log(n, j(out[n]).replace(/\n\s*/g," "));}
await t("cancel already-cancelled", ()=>cancel(s, 6862188795419959843987n));
await t("cancel nonexistent", ()=>cancel(s, 1n));
await t("below min qty", ()=>place(s,"long",q-1000n,md*0.9));
await t("unaligned qty", ()=>place(s,"long",q+1n,md*0.9));
await t("unaligned price", ()=>ex.trader.placePerpOrder({pool:m.info.poolAddress,isBid:true,price:BigInt(Math.round(md*0.9))*10n**18n+1n,quantity:q}));
await t("market no-cross", ()=>place(s,"long",q,(bid??md)*0.5,"market"));
await t("huge size", ()=>place(s,"long",q*100000n,md*0.9));
await t("previewClose flat", ()=>ex.client.previewPerpClosePnl({pool:m.info.poolAddress,marginBank:m.info.marginBank,account:me()}));
await t("fetchPositions flat", ()=>ex.fetchPositions());
await t("fetchOpenOrders", ()=>ex.fetchOpenOrders(m.symbol));
console.log("tick", m.info.tickSize, m.info.priceTick, Object.keys(m.info).join(","));
process.exit(0)
