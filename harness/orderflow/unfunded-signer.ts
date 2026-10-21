import { ORDER_TYPE } from "@somnia-chain/markets-sdk";
import { ex, market, mid, minQty, alignPrice, toRaw, me } from "./perp.ts";
const m = await market("ETH"); const q = await minQty("ETH"); const b = await mid("ETH");
try { await ex.trader.placePerpOrder({ pool: m.info.poolAddress, isBid: true, price: alignPrice(toRaw(b.bid * 0.98, 18), m), quantity: q, orderType: ORDER_TYPE.LIMIT }); console.log("OK?!"); }
catch (e: any) { let c = e; for (let i = 0; i < 6 && c; i++) { console.log(i, c.constructor?.name, c.name, "|", c.errorName, "|", String(c.shortMessage ?? "").slice(0,120), "| details:", String(c.details ?? "").slice(0,160), "| code", c.code, "| data", c.data); c = c.cause; } }
console.log("signer", me()); process.exit(0);
