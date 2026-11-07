// Génère tes clés VAPID (à faire une seule fois) : node vapid.mjs
const k=await crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign"]);
const j=await crypto.subtle.exportKey("jwk",k.privateKey),raw=new Uint8Array(await crypto.subtle.exportKey("raw",k.publicKey));
const b64u=a=>Buffer.from(a).toString("base64url");
console.log("VAPID_PUBLIC  =",b64u(raw));console.log("VAPID_PRIVATE =",j.d);
