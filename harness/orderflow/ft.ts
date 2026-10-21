import { ex, deposit, place, cancel, close, position, mid, minQty, marginState, j, me } from "./perp.ts";
console.log(j(await marginState()));
const step = process.argv[2];
if (step==="dep") await deposit(Number(process.argv[3]));
if (step==="flow") {
  const s="BTC"; const q=await minQty(s); const {bid,ask,mid:md}=await mid(s); console.log({bid,ask,md});
  const r=await place(s,"long",q,md*0.9,"limit","flow-rest"); if (r.orderId!==undefined) await cancel(s,r.orderId,"flow-cancel");
  await place(s,"long",q,(ask??md)*1.01,"market","flow-open");
  console.log("pos", j(await position(s)));
  await close(s,"flow-close"); console.log("pos after", j(await position(s)));
}
console.log(j(await marginState())); process.exit(0);
