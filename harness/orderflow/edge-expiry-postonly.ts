// Probe 2026-10-21 (funded bot wallet): already-expired GTD/IOC orders. Run from a dir whose .env holds the funded key.
import { ORDER_TYPE } from "@somnia-chain/markets-sdk";
import { ex, market, cancel, close, position, mid, minQty, alignPrice, toRaw, logTx, j, me } from "./perp.ts";
import { createPublicClient, http } from "viem"; import { chain, RPC } from "./lib.ts";
const pc = createPublicClient({ chain, transport: http(RPC) });
const s = "ETH"; const m = await market(s); const q = await minQty(s); const nc = () => pc.getTransactionCount({ address: me(), blockTag: "pending" });
console.log("signer", me(), "nonce", await nc());
const b = await mid(s); const ids: bigint[] = []; const past = BigInt(Date.now() - 3600_000) * 1_000_000n;
async function t(name: string, f: () => Promise<any>) { const n0 = await nc(); try { const r = await f(); const filled = (r.fills??[]).reduce((a:bigint,x:any)=>a+x.quantityFilled,0n); console.log(name, "OK", r.hash, r.orderId?.toString(), "filled", filled.toString()); logTx(name, r.hash, { orderId: r.orderId, filled }); if (r.orderId !== undefined) ids.push(r.orderId); } catch (e: any) { console.log(name, "ERR", e?.name, e?.errorName, String(e?.shortMessage ?? e?.message).slice(0, 160), "data", e?.data ?? e?.cause?.data); } console.log("  nonce", n0, "->", await nc(), "pos", (await position(s) as any).size, "open", (await ex.fetchOpenOrders(m.symbol)).map((o:any)=>o.id)); }
await t("expired GTD limit long @ bid*0.98 (expiry 1h ago)", () => ex.trader.placePerpOrder({ pool: m.info.poolAddress, isBid: true, price: alignPrice(toRaw(b.bid * 0.98, 18), m), quantity: q, expireTimestampNs: past }));
await t("expired IOC long @ ask*1.01 (expiry 1h ago)", () => ex.trader.placePerpOrder({ pool: m.info.poolAddress, isBid: true, price: alignPrice(toRaw(b.ask * 1.01, 18), m), quantity: q, orderType: ORDER_TYPE.MARKET, expireTimestampNs: past }));
for (const o of await ex.fetchOpenOrders(m.symbol)) { try { await cancel(s, BigInt(o.id), "edge-cleanup"); } catch (e: any) { console.log("cancel fail", o.id, String(e?.shortMessage ?? e).slice(0, 150)); } }
await close(s, "edge-cleanup");
console.log("final pos", (await position(s) as any).size, "open", (await ex.fetchOpenOrders(m.symbol)).length);
process.exit(0);
