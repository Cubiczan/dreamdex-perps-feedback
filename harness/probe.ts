import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import { defineChain } from "viem";
import { writeFileSync } from "node:fs";
const ws="wss://api.hideki2.infra.testnet.somnia.network/ws";
const chain = defineChain({ id: 50383, name: "hideki", nativeCurrency:{name:"STT",symbol:"STT",decimals:18}, rpcUrls:{default:{http:["https://api.hideki2.infra.testnet.somnia.network"],webSocket:[ws]}}});
const ex:any = new SomniaMarkets({ chain, wsRpcUrl:ws, indexerUrl:"https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_TESTNET_ADDRESSES });
const j=(x:any)=>JSON.stringify(x,(k,v)=>typeof v==="bigint"?v.toString()+"n":v,1);
const log:any={};
async function t(name:string, f:()=>Promise<any>){const s=Date.now();try{const r=await f();log[name]={ms:Date.now()-s,ok:true,r};console.log("OK",name,j(r).slice(0,250))}catch(e:any){log[name]={ms:Date.now()-s,ok:false,err:String(e?.message??e).slice(0,600),cls:e?.constructor?.name};console.log("ERR",name,e?.constructor?.name,String(e?.message??e).slice(0,250))}}
const mk=await ex.loadMarkets();
await t("ticker docs-casing BTC/USDSO:USDSO",()=>ex.fetchTicker("BTC/USDSO:USDSO"));
await t("funding docs-casing",()=>ex.fetchFundingRate("BTC/USDSO:USDSO"));
await t("ticker BTC-PERP",()=>ex.fetchTicker("BTC-PERP"));
await t("ticker unknown",()=>ex.fetchTicker("FOO/USDso:USDso"));
await t("ticker empty",()=>ex.fetchTicker(""));
for (const l of [0,-1,1,1.5,1000,undefined]) await t(`book limit=${l}`,()=>ex.fetchOrderBook("BTC/USDso:USDso",l));
await t("fundingHistory limit 5",()=>ex.fetchFundingRateHistory("BTC/USDso:USDso",undefined,5));
await t("fundingHistory limit 0",()=>ex.fetchFundingRateHistory("BTC/USDso:USDso",undefined,0));
await t("fundingHistory since future",()=>ex.fetchFundingRateHistory("BTC/USDso:USDso",Date.now()+86400000,5));
await t("ohlcv 1h 3",()=>ex.fetchOHLCV("BTC/USDso:USDso","1h",undefined,3));
await t("ohlcv bad tf",()=>ex.fetchOHLCV("BTC/USDso:USDso","7m",undefined,3));
await t("trades 3",()=>ex.fetchTrades("BTC/USDso:USDso",undefined,3));
await t("positions zero addr",()=>ex.fetchPositions(undefined,{account:"0x0000000000000000000000000000000000000001"}));
const c=ex.client ?? ex.getClient?.() ?? ex._client;
log.clientKeys=c?Object.getOwnPropertyNames(Object.getPrototypeOf(c)).filter((n:string)=>/perp/i.test(n)):null;
console.log("client perp methods", log.clientKeys?.length);
const btc=mk["BTC/USDso:USDso"].info;
if(c){
 await t("listPerpMarkets",()=>c.listPerpMarkets({limit:100}));
 await t("listPerpPoolStatuses",async()=>{const cfg=await c.getPerpSystemConfig(btc.marginBank);log.sys=cfg;return c.listPerpPoolStatuses({factory:cfg.perpPoolFactory??cfg.factory})});
 await t("riskParams BTC",()=>c.getPerpRiskParams(btc.poolAddress));
 await t("effImf BTC",()=>c.getEffectiveImfBps(btc.poolAddress));
 await t("voucherCampaign",()=>c.getPerpVoucherCampaign(btc.marginBank));
 await t("listPerpMarkets limit -1",()=>c.listPerpMarkets({limit:-1}));
}
writeFileSync("out/probe.json",j(log)); process.exit(0);
