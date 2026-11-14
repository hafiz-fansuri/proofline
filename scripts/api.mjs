import config from '../src/config.json' with {type:'json'};
export async function api(body) {
 const r=await fetch(config.url+'/functions/v1/proofline',{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publishableKey,Authorization:'Bearer '+config.gatewayToken},body:JSON.stringify(body),signal:AbortSignal.timeout(150000)});
 const data=await r.json();if(!r.ok)throw new Error(data.error??`HTTP ${r.status}`);return data;
}
