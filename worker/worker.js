/* Ektyron Coach : serveur de sauvegarde et de notifications push.
   Cloudflare Worker gratuit + un espace KV (lié sous le nom EK) + un déclencheur cron toutes les 15 min.
   Variables : VAPID_PUBLIC, VAPID_PRIVATE (secret), VAPID_SUBJECT (ex. mailto:toi@exemple.fr).
   Chaque appareil s'identifie par son code personnel (en-tête X-Code) : seul son empreinte SHA-256 est stockée. */
const CORS={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,PUT,POST,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type,X-Code","Access-Control-Max-Age":"86400"};
const json=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{...CORS,"Content-Type":"application/json"}});
const enc=new TextEncoder();
const b64u=b=>{let s="";const a=new Uint8Array(b);for(let i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")};
const ub64=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")+"===".slice((s.length+3)%4)),c=>c.charCodeAt(0));
const cat=(...a)=>{const o=new Uint8Array(a.reduce((n,x)=>n+x.length,0));let i=0;for(const x of a){o.set(x,i);i+=x.length}return o};
async function idOf(code){if(!code||code.length<8)return null;return b64u(await crypto.subtle.digest("SHA-256",enc.encode("ektyron:"+code)))}

export default{
 async fetch(req,env){if(req.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
  const p=new URL(req.url).pathname.replace(/\/+$/,"")||"/";
  try{
   if(p==="/"||p==="/vapid")return json({ok:true,app:"ektyron-coach",key:env.VAPID_PUBLIC||null,kv:!!env.EK});
   if(!env.EK)return json({error:"espace KV « EK » non lié au Worker"},500);
   const id=await idOf(req.headers.get("X-Code"));if(!id)return json({error:"code manquant ou trop court"},401);
   if(p==="/backup"){
    if(req.method==="GET"){const v=await env.EK.get("b:"+id);return v?new Response(v,{headers:{...CORS,"Content-Type":"application/json"}}):json({error:"aucune sauvegarde"},404)}
    if(req.method==="PUT"){const t=await req.text();if(t.length>20e6)return json({error:"trop gros"},413);JSON.parse(t);await env.EK.put("b:"+id,t);return json({ok:true,t:Date.now()})}}
   if(p==="/push"){const k="s:"+id;
    if(req.method==="DELETE"){await env.EK.delete(k);return json({ok:true})}
    if(req.method==="PUT"){const b=await req.json(),cur=JSON.parse(await env.EK.get(k)||"{}");if(b.sub)cur.sub=b.sub;if(b.sched)cur.sched=b.sched;cur.sent=cur.sent||{};
     if(!cur.sub)return json({error:"abonnement push manquant"},400);await env.EK.put(k,JSON.stringify(cur));return json({ok:true})}}
   if(p==="/push/test"&&req.method==="POST"){const cur=JSON.parse(await env.EK.get("s:"+id)||"null");if(!cur||!cur.sub)return json({error:"aucun abonnement push"},404);
    const r=await sendPush(env,cur.sub,{t:"Test réussi ✅",b:"Les notifications push d'Ektyron Coach fonctionnent.",go:"today",tag:"test"});
    return json({ok:r.ok,status:r.status,detail:r.ok?"":await r.text()},r.ok?200:502)}
   if(p==="/group"&&req.method==="POST"){let code,n=0;do{code=gCode();n++}while(n<5&&await env.EK.get("g:"+code));
    await env.EK.put("g:"+code,JSON.stringify({t:Date.now(),m:{}}));return json({code})}
   if(p==="/admin"||p.startsWith("/admin/"))return admin(req,env,id,p);
   const gm=p.match(/^\/group\/([A-Z0-9]{6})$/);if(gm)return group(req,env,id,gm[1]);
   return json({error:"introuvable"},404)}catch(e){return json({error:String(e&&e.message||e)},500)}},
 async scheduled(ev,env,ctx){ctx.waitUntil(tick(env))}
};

/* ---------- Groupes entre potes : uniquement des scores (pseudo, %, séries, stats, records rapportés au poids), jamais les données brutes. ---------- */
const gCode=()=>{const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",b=crypto.getRandomValues(new Uint8Array(6));return [...b].map(x=>a[x%a.length]).join("")};
const num=(v,max)=>typeof v==="number"&&isFinite(v)?Math.max(0,Math.min(max,Math.round(v*100)/100)):undefined;
function clean(s){const o={nick:String(s.nick||"?").slice(0,24),t:Date.now()};
 for(const k of ["goal","streak","wDone","wPlan","lvl","kg"]){const v=num(s[k],1000);if(v!==undefined)o[k]=v}
 if(s.stats&&typeof s.stats==="object"){o.stats={};for(const k of ["pecs","dos","jambes","bras","reg","nut"]){const v=num(s.stats[k],1e7);if(v!==undefined)o.stats[k]=v}}
 if(s.rec&&typeof s.rec==="object"){o.rec={};for(const [k,v] of Object.entries(s.rec).slice(0,150))if(/^\w{1,20}$/.test(k)&&Array.isArray(v)){const r=num(v[0],10);if(r)o.rec[k]=[r,String(v[1]||k).slice(0,60)]}}
 return o}
const kings=m=>{const K={};for(const [mid,x] of Object.entries(m))for(const [e,[r]] of Object.entries(x.s.rec||{}))if(!K[e]||r>K[e][1])K[e]=[mid,r];return K};
async function group(req,env,id,code){const key="g:"+code,G=JSON.parse(await env.EK.get(key)||"null");if(!G)return json({error:"groupe introuvable"},404);
 const mid=(await idOf("m:"+id)).slice(0,12),out=()=>json({code,me:mid,members:Object.entries(G.m).map(([k,x])=>({id:k,...x.s}))});
 if(req.method==="GET"){if(!G.m[mid])return json({error:"tu n'es pas dans ce groupe"},403);return out()}
 if(req.method==="DELETE"){delete G.m[mid];await env.EK.put(key,JSON.stringify(G));return json({ok:true})}
 if(req.method==="PUT"){const t=await req.text();if(t.length>30000)return json({error:"trop gros"},413);
  if(!G.m[mid]&&Object.keys(G.m).length>=30)return json({error:"groupe complet (30)"},409);
  const before=kings(G.m);G.m[mid]={id,s:clean(JSON.parse(t))};const after=kings(G.m),lost={};
  for(const [e,[k]] of Object.entries(after))if(k===mid&&before[e]&&before[e][0]!==mid)(lost[before[e][0]]=lost[before[e][0]]||[]).push(G.m[mid].s.rec[e][1]);
  await env.EK.put(key,JSON.stringify(G));
  for(const [o,L] of Object.entries(lost)){const S=JSON.parse(await env.EK.get("s:"+G.m[o].id)||"null");if(!S||!S.sub)continue;
   try{await sendPush(env,S.sub,{t:`👑 ${G.m[mid].s.nick} t'a pris ${L.length>1?L.length+" machines":"une machine"}`,b:L.slice(0,4).join(", ")+" : à toi de la reprendre !",go:"jeu",tag:"roi"})}catch(e){}}
  return out()}
 return json({error:"méthode non gérée"},405)}

/* ---------- Admin : le premier compte qui le réclame devient l'unique admin. Il voit tous les groupes et peut retirer un membre ou supprimer un groupe. ---------- */
async function admin(req,env,id,p){const cur=await env.EK.get("admin");
 if(p==="/admin/claim"&&req.method==="POST"){if(!cur){await env.EK.put("admin",id);return json({ok:true})}return cur===id?json({ok:true}):json({error:"un admin existe déjà"},403)}
 if(cur!==id)return json({error:"réservé à l'admin"},403);
 if(p==="/admin"&&req.method==="GET"){const out=[];let cursor;
  do{const L=await env.EK.list({prefix:"g:",cursor});cursor=L.list_complete?null:L.cursor;
   for(const {name} of L.keys){const G=JSON.parse(await env.EK.get(name)||"null");if(!G)continue;
    out.push({code:name.slice(2),t:G.t,members:Object.entries(G.m).map(([k,x])=>({mid:k,nick:x.s.nick,t:x.s.t,lvl:x.s.lvl,me:x.id===id}))})}}while(cursor);
  return json({groups:out})}
 const m=p.match(/^\/admin\/group\/([A-Z0-9]{6})(?:\/([\w-]{1,20}))?$/);
 if(m&&req.method==="DELETE"){const key="g:"+m[1],G=JSON.parse(await env.EK.get(key)||"null");if(!G)return json({error:"groupe introuvable"},404);
  if(m[2]){delete G.m[m[2]];await env.EK.put(key,JSON.stringify(G))}else await env.EK.delete(key);return json({ok:true})}
 return json({error:"introuvable"},404)}

/* Heure locale de l'utilisateur (fuseau envoyé par l'appli). */
function local(tz){let f;try{f=new Intl.DateTimeFormat("en-CA",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",weekday:"short",hourCycle:"h23"}).formatToParts(new Date())}
 catch(e){return local("Europe/Paris")}const g=t=>f.find(x=>x.type===t).value;
 return{day:`${g("year")}-${g("month")}-${g("day")}`,min:+g("hour")*60+ +g("minute"),wd:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(g("weekday"))}}
/* Toutes les 15 min : envoie chaque rappel dont l'heure est passée (fenêtre de 3 h), une fois par jour, sauf s'il est déjà fait. */
async function tick(env){let cursor;
 do{const L=await env.EK.list({prefix:"s:",cursor});cursor=L.list_complete?null:L.cursor;
  for(const {name} of L.keys){const S=JSON.parse(await env.EK.get(name)||"null");if(!S||!S.sub||!S.sched)continue;
   const n=local(S.sched.tz||"Europe/Paris"),done=S.sched.done||{};S.sent=S.sent||{};let ch=false,gone=false;
   for(const it of S.sched.items||[]){const at=(it.h||0)*60+(it.m||0);if(n.min<at||n.min>at+180)continue;
    if(it.days?!it.days.includes(n.wd):!(it.from&&n.day>=it.from))continue;if(S.sent[it.id]===n.day||done[it.k]===n.day)continue;
    const r=await sendPush(env,S.sub,{t:it.t,b:it.b,go:it.go||"today",tag:it.k});S.sent[it.id]=n.day;ch=true;if(r.status===404||r.status===410){gone=true;break}}
   if(gone)await env.EK.delete(name);else if(ch)await env.EK.put(name,JSON.stringify(S))}}
 while(cursor)}

/* ---------- Web Push (RFC 8291 aes128gcm + VAPID RFC 8292), WebCrypto seul ---------- */
async function vapidKey(env){const pub=ub64(env.VAPID_PUBLIC);
 return crypto.subtle.importKey("jwk",{kty:"EC",crv:"P-256",x:b64u(pub.slice(1,33)),y:b64u(pub.slice(33,65)),d:env.VAPID_PRIVATE,ext:true},{name:"ECDSA",namedCurve:"P-256"},false,["sign"])}
async function jwt(env,aud){const part=o=>b64u(enc.encode(JSON.stringify(o))),h=part({typ:"JWT",alg:"ES256"}),p=part({aud,exp:Math.floor(Date.now()/1000)+12*3600,sub:env.VAPID_SUBJECT||"https://brutalgzx.github.io/carnet-ektyron/"});
 const s=await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},await vapidKey(env),enc.encode(h+"."+p));return h+"."+p+"."+b64u(s)}
async function hkdf(salt,ikm,info,len){const k=await crypto.subtle.importKey("raw",ikm,"HKDF",false,["deriveBits"]);return new Uint8Array(await crypto.subtle.deriveBits({name:"HKDF",hash:"SHA-256",salt,info},k,len*8))}
export async function encrypt(sub,text){const ua=ub64(sub.keys.p256dh),auth=ub64(sub.keys.auth);
 const kp=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]),as=new Uint8Array(await crypto.subtle.exportKey("raw",kp.publicKey));
 const uak=await crypto.subtle.importKey("raw",ua,{name:"ECDH",namedCurve:"P-256"},false,[]),sh=new Uint8Array(await crypto.subtle.deriveBits({name:"ECDH",public:uak},kp.privateKey,256));
 const ikm=await hkdf(auth,sh,cat(enc.encode("WebPush: info\0"),ua,as),32),salt=crypto.getRandomValues(new Uint8Array(16));
 const cek=await hkdf(salt,ikm,enc.encode("Content-Encoding: aes128gcm\0"),16),nonce=await hkdf(salt,ikm,enc.encode("Content-Encoding: nonce\0"),12);
 const key=await crypto.subtle.importKey("raw",cek,"AES-GCM",false,["encrypt"]),ct=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv:nonce},key,cat(enc.encode(text),new Uint8Array([2]))));
 const hd=new Uint8Array(21);hd.set(salt,0);new DataView(hd.buffer).setUint32(16,4096);hd[20]=65;return cat(hd,as,ct)}
export async function sendPush(env,sub,msg){const body=await encrypt(sub,JSON.stringify(msg));
 return fetch(sub.endpoint,{method:"POST",headers:{"Content-Encoding":"aes128gcm","Content-Type":"application/octet-stream",TTL:"86400",Urgency:"normal",Authorization:`vapid t=${await jwt(env,new URL(sub.endpoint).origin)}, k=${env.VAPID_PUBLIC}`},body})}
