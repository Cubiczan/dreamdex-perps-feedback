import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import { defineChain } from "viem";
import { writeFileSync } from "node:fs";
const chain = defineChain({ id: 50383, name: "hideki", nativeCurrency:{name:"STT",symbol:"STT",decimals:18},
  rpcUrls:{default:{http:["https://api.hideki2.infra.testnet.somnia.network"],webSocket:["wss://api.hideki2.infra.testnet.somnia.network/ws"]}}});
const ex = new SomniaMarkets({ chain, wsRpcUrl:"wss://api.hideki2.infra.testnet.somnia.network/ws", indexerUrl:"https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_TESTNET_ADDRESSES });
const j=(x:any)=>JSON.stringify(x,(k,v)=>typeof v==="bigint"?v.toString()+"n":v,1);
const log:any={};
async function t(name:string, f:()=>Promise<any>){const s=Date.now();try{const r=await f();log[name]={ms:Date.now()-s,ok:true,r};console.log("OK",name,Date.now()-s+"ms");return r}catch(e:any){log[name]={ms:Date.now()-s,ok:false,err:String(e?.message??e).slice(0,800),name:e?.name,errorName:e?.errorName};console.log("ERR",name,String(e?.message??e).slice(0,300));}}
const mk=await t("loadMarkets",()=>ex.loadMarkets());
const perps=Object.values(mk??{}).filter((m:any)=>m.type==="swap");
console.log("perp symbols",perps.map((m:any)=>`${m.symbol} active=${m.active}`));
for(const m of perps as any[]){
  await t(`ticker ${m.symbol}`,()=>ex.fetchTicker(m.symbol));
  await t(`funding ${m.symbol}`,()=>ex.fetchFundingRate(m.symbol));
  await t(`book ${m.symbol}`,()=>ex.fetchOrderBook(m.symbol, 5));
}
const c:any=(ex as any).client ?? (ex as any).getClient?.();
log.marketsRaw=perps.map((m:any)=>({symbol:m.symbol,active:m.active,precision:m.precision,limits:m.limits,info:m.info}));
writeFileSync("out/read.json",j(log)); process.exit(0);
