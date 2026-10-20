import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import { defineChain } from "viem";
const ws="wss://api.hideki2.infra.testnet.somnia.network/ws";
const chain = defineChain({ id: 50383, name: "hideki", nativeCurrency:{name:"STT",symbol:"STT",decimals:18}, rpcUrls:{default:{http:["https://api.hideki2.infra.testnet.somnia.network"],webSocket:[ws]}}});
const ex:any = new SomniaMarkets({ chain, wsRpcUrl:ws, indexerUrl:"https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_TESTNET_ADDRESSES });
const mk=await ex.loadMarkets(); const mb=mk["BTC/USDso:USDso"].info.marginBank;
const c=ex.client; const a="0xca42FF3Fa21239EA4F268bb8F1aa0518820C65B4";
console.log(await c.getPerpVoucherEligibility(mb,a));
const camp=await c.getPerpVoucherCampaign(mb); console.log(camp.endsAt, new Date(Number(camp.endsAt)*1000).toISOString());
console.log("STT", await c.getViemClient().getBalance({address:a})); process.exit(0)
