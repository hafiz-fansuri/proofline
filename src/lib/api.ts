import config from '../config.json';
let session=localStorage.getItem('proofline-session');
if(!session){session=crypto.randomUUID();localStorage.setItem('proofline-session',session);}
export async function api(action:string,body:Record<string,unknown>={}) {
  const res=await fetch(config.url+'/functions/v1/proofline',{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publishableKey,Authorization:'Bearer '+config.gatewayToken},body:JSON.stringify({action,session,...body}),signal:AbortSignal.timeout(150000)});
  const data=await res.json();if(!res.ok)throw new Error(data.error??`Request failed (${res.status})`);return data;
}
export const sourceStorage=config.url+'/storage/v1/object/public/source-documents/';
