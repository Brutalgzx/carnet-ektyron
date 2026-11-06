/* Animations : mannequin anatomique paramétrique. v = s (profil, face à droite), f (face), b (dos).
   Angles en degrés depuis la verticale vers le bas, + vers l'avant. t = inclinaison du buste. */
const AN={
 incl:{v:"s",m:["pecH","deltA","tri"],l:"Haut des pecs",A:{hx:170,hy:165,t:-60,th:80,sh:-10,ua:15,fa:150},B:{ua:150,fa:150},pr:["back","seat","bar"]},
 pfly:{v:"f",m:["pec"],l:"Pectoraux",A:{hy:150,ab:90,fa:100,hf:0,ls:.35},B:{hf:105},pr:["seatF","handles"]},
 dips:{v:"s",m:["pecL","tri","deltA"],l:"Bas des pecs + triceps",A:{hx:150,hy:150,t:22,ua:-60,fa:62,th:5,sh:-70,anc:{j:"hand",x:174,y:125}},B:{hy:120,t:8,ua:8,fa:8},pr:["dipbar"]},
 elat:{v:"f",m:["deltM"],l:"Deltoïde moyen",uni:1,A:{ab:12,fa:18,hf:12},B:{ab:88,fa:95},pr:[{k:"cable",x:95,y:205}]},
 tri1:{v:"s",m:["tri"],l:"Triceps",A:{t:8,ua:-5,fa:140},B:{fa:2},pr:[{k:"cable",x:178,y:12},"handle"]},
 ovh:{v:"s",m:["tri"],l:"Triceps · chef long",A:{t:20,ua:170,fa:-20},B:{fa:172},pr:[{k:"cable",x:92,y:122},"handle"]},
 tvert:{v:"b",m:["lat"],l:"Grand dorsal",A:{hy:150,ab:165,fa:178,ls:.35},B:{ab:38,fa:172},pr:["seatF",{k:"cable",x:160,y:4},"barF"]},
 rowm:{v:"s",m:["lat","deltP"],l:"Grand dorsal",A:{hx:125,hy:150,t:8,th:90,sh:5,ua:80,fa:82},B:{ua:-45,fa:75},pr:["seat","chestpad","handle"]},
 tlarg:{v:"b",m:["trap","deltP"],l:"Haut du dos",A:{hy:150,ab:88,fa:88,hf:80,fh:80,ls:.35},B:{hf:-35}},
 rfly:{v:"b",m:["deltP"],l:"Arrière d'épaule",A:{hy:150,ab:88,fa:90,hf:85,ls:.35},B:{hf:0},pr:["seatF","handles"]},
 pupi:{v:"s",m:["bic"],l:"Biceps",A:{hx:130,hy:150,t:18,th:90,sh:5,ua:45,fa:70},B:{fa:175},pr:["seat","armpad","bar"]},
 mart:{v:"s",m:["fore","bic"],l:"Brachial + avant-bras",A:{ua:-3,fa:3},B:{fa:140},pr:[{k:"cable",x:200,y:205},"handle"]},
 lcurl1:{v:"s",m:["ham"],l:"Ischio-jambiers",A:{hx:140,hy:150,t:-12,th:88,sh:78,ua:25,fa:70},B:{sh:-15},pr:["seat","back","rollBack"]},
 press:{v:"s",m:["quad","glu"],l:"Quadriceps",A:{hx:115,hy:165,t:-55,th:150,sh:52,ua:40,fa:60},B:{th:108,sh:104},pr:["back","seat","plate"]},
 rdl:{v:"s",m:["ham","glu","lowb"],l:"Ischios + fessiers",A:{t:78,th:6,sh:-6,anc:{j:"ankle",x:158,y:200}},B:{t:0,th:2,sh:0},pr:["db"]},
 lext:{v:"s",m:["quad"],l:"Quadriceps",A:{hx:140,hy:150,t:-15,th:90,sh:2,ua:20,fa:70},B:{sh:85},pr:["seat","back","roll"]},
 addab:{v:"f",m:["add"],l:"Adducteurs",A:{hy:150,la:38,ls:.35,ab:15,fa:40},B:{la:6},pr:["seatF"]},
 moll:{v:"s",m:["calf"],l:"Mollets",A:{fo:0,anc:{j:"toe",x:172,y:204}},B:{fo:42},pr:["step"]},
 tract:{v:"b",m:["lat"],l:"Grand dorsal",A:{hy:170,ab:170,fa:180,anc:{j:"handR",x:190,y:26}},B:{ab:40,fa:172},pr:["barF"]},
 dch:{v:"s",m:["pec","tri","deltA"],l:"Pectoraux",A:{hx:200,hy:160,t:-90,th:55,sh:-5,ua:10,fa:180},B:{ua:180},pr:["back","db"]},
 rowu:{v:"s",m:["lat"],l:"Grand dorsal",A:{hx:120,hy:128,t:78,th:-8,sh:5,ua:0,fa:0,ua2:12,fa2:12},B:{ua:-85,fa:-8},pr:[{k:"rect",x:165,y:180,w:90,h:9},"db"]},
 ecbh:{v:"f",m:["pecH"],l:"Haut des pecs",A:{ab:25,fa:30,hf:0},B:{ab:120,fa:125,hf:100},pr:[{k:"cableF",x1:40,y1:205,x2:280,y2:205},"handles"]},
 elmac:{v:"f",m:["deltM"],l:"Deltoïde moyen",A:{hy:150,ab:12,fa:20,ls:.35},B:{ab:85,fa:92},pr:["seatF"]},
 cpou:{v:"s",m:["bic"],l:"Biceps",A:{t:-5,ua:-18,fa:-18},B:{fa:125},pr:[{k:"cable",x:85,y:205},"handle"]},
 triv:{v:"s",m:["tri"],l:"Triceps",A:{hx:150,hy:150,t:-25,th:85,sh:0,ua:-22,fa:150},B:{fa:0},pr:["back","seat",{k:"cable",x:205,y:15},"handle"]},
 hack:{v:"s",m:["quad","glu"],l:"Quadriceps",A:{t:-12,th:100,sh:-32,ua:-10,fa:160,anc:{j:"ankle",x:150,y:200}},B:{th:6,sh:-6},pr:["back"]},
 lcurl2:{v:"s",m:["ham"],l:"Ischio-jambiers",A:{hx:130,hy:150,t:90,th:-90,sh:-90,ua:60,fa:30},B:{sh:-190},pr:[{k:"rect",x:40,y:164,w:190,h:10},"rollBack"]},
 bulg:{v:"s",m:["quad","glu"],l:"Quadriceps + fessiers",A:{t:12,th:80,sh:-12,th2:-40,sh2:-85,ua:-35,fa:165,anc:{j:"ankle",x:178,y:200}},B:{t:5,th:15,sh:-5,th2:-14,sh2:-80},pr:[{k:"rect",x:30,y:168,w:66,h:10},"bar"]},
 bext:{v:"s",m:["lowb","glu","ham"],l:"Lombaires",A:{hx:150,hy:110,t:140,th:-45,sh:-45,ua:20,fa:150,rel:1},B:{t:45},pr:["hippad","rollBack"]},
 crun:{v:"s",m:["abs"],l:"Grand droit",A:{hx:150,hy:160,t:10,th:0,sh:-90,ua:165,fa:10,rel:1},B:{t:72},pr:[{k:"cable",x:190,y:12}]},
 moll2:{v:"s",m:["calf"],l:"Soléaire",A:{hx:140,hy:150,th:90,sh:0,fo:0,ua:30,fa:80,anc:{j:"toe",x:200,y:198}},B:{fo:40},pr:["seat","kneepad"]}
};
AN.moll.A.hx=150;
const DEF={hx:150,hy:128,t:0,ua:5,fa:5,th:0,sh:0,fo:0,ab:8,hf:0,la:4,ls:1};
const R=Math.PI/180, dA=a=>[Math.sin(a*R),Math.cos(a*R)], ad=(a,b)=>[a[0]+b[0],a[1]+b[1]], ml=(v,k)=>[v[0]*k,v[1]*k], mid=(a,b,k=.5)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k], fn=a=>[Math.cos(a*R),-Math.sin(a*R)];
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
function phase(t){if(t<.28)return[ease(t/.28),"MONTÉE EXPLOSIVE"];if(t<.4)return[1,"CONTRACTION"];if(t<.9)return[1-ease((t-.4)/.5),"DESCENTE CONTRÔLÉE"];return[0,"ÉTIREMENT"]}
function pose(e,p){const A={...DEF,...e.A},o={...A};for(const k in e.B)if(typeof e.B[k]=="number")o[k]=A[k]+(e.B[k]-A[k])*p;return o}
function joints(v,p,uni){let J;
 if(v=="s"){const up=[Math.sin(p.t*R),-Math.cos(p.t*R)],n=[Math.cos(p.t*R),Math.sin(p.t*R)],hip=[p.hx,p.hy],sh=ad(hip,ml(up,60));
  const u=p.rel?p.ua+p.t:p.ua,f=p.rel?p.fa+p.t:p.fa,u2=p.ua2??u,f2=p.fa2??f,th2=p.th2??p.th,sh2=p.sh2??p.sh;
  const leg=(th,s)=>{const k=ad(hip,ml(dA(th),44)),an=ad(k,ml(dA(s),40));return[k,an,ad(an,[14*Math.cos(p.fo*R),14*Math.sin(p.fo*R)])]};
  const L1=leg(p.th,p.sh),L2=leg(th2,sh2),el=ad(sh,ml(dA(u),34)),el2=ad(sh,ml(dA(u2),34));
  J={up,n,t:p.t,hip,sh,head:ad(ad(hip,ml(up,82)),ml(n,2)),el,hand:ad(el,ml(dA(f),30)),el2,hand2:ad(el2,ml(dA(f2),30)),knee:L1[0],ankle:L1[1],toe:L1[2],knee2:L2[0],ankle2:L2[1],toe2:L2[2],a:{u,f,u2,f2,th:p.th,sh:p.sh,th2,sh2}};
 }else{const cx=160,hip=[cx,p.hy],sy=p.hy-60;J={cx,hip,sy,arms:[],legs:[]};
  for(const s of[1,-1]){const q=(uni&&s<0)?{ab:5,fa:5,hf:0}:p,shp=[cx+s*27,sy+4],hf=q.hf,fh=q.fh??hf;
   const el=ad(shp,[s*34*Math.sin(q.ab*R)*Math.cos(hf*R),34*Math.cos(q.ab*R)]),hd=ad(el,[s*30*Math.sin(q.fa*R)*Math.cos(fh*R),30*Math.cos(q.fa*R)]);
   const ze=34*Math.sin(q.ab*R)*Math.sin(hf*R);J.arms.push({s,sh:shp,el,hand:hd,z:{el:ze,hand:ze+30*Math.sin(q.fa*R)*Math.sin(fh*R)}});const hj=[cx+s*11,p.hy+2],k=ad(hj,[s*46*p.ls*Math.sin(p.la*R),46*p.ls*Math.cos(p.la*R)]),an=ad(k,[s*4,40]);
   const kz=46*Math.sqrt(Math.max(0,1-p.ls*p.ls));J.legs.push({s,hip:hj,knee:k,ankle:an,toe:ad(an,[s*8,4]),z:{knee:kz,ankle:kz,toe:kz+8}})}
  J.handR=J.arms[0].hand;J.handL=J.arms[1].hand;J.hand=J.handR}
 if(p.anc){const o=[p.anc.x-J[p.anc.j][0],p.anc.y-J[p.anc.j][1]];shift(J,o)}return J}
function shift(o,d){for(const k in o){const v=o[k];if(k=="up"||k=="n"||k=="a")continue;if(Array.isArray(v)&&typeof v[0]=="number")o[k]=ad(v,d);else if(Array.isArray(v))v.forEach(x=>shift(x,d));else if(k=="cx")o.cx+=d[0];else if(k=="sy")o.sy+=d[1]}}
function limb(c,a,b,w1,w2,dk){const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,g=c.createLinearGradient(a[0]+nx*w1,a[1]+ny*w1,a[0]-nx*w1,a[1]-ny*w1);
 g.addColorStop(0,dk?"#a3a8b0":"#eceef1");g.addColorStop(.5,dk?"#80858d":"#bfc4cb");g.addColorStop(1,dk?"#5a5f66":"#878d95");c.fillStyle=g;c.beginPath();
 c.moveTo(a[0]+nx*w1,a[1]+ny*w1);c.lineTo(b[0]+nx*w2,b[1]+ny*w2);c.lineTo(b[0]-nx*w2,b[1]-ny*w2);c.lineTo(a[0]-nx*w1,a[1]-ny*w1);c.fill();
 c.beginPath();c.arc(a[0],a[1],w1,0,7);c.arc(b[0],b[1],w2,0,7);c.fill();
 c.strokeStyle="rgba(60,64,72,.18)";c.lineWidth=.6;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(a[0]+nx*w1*i*.45,a[1]+ny*w1*i*.45);c.lineTo(b[0]+nx*w2*i*.45,b[1]+ny*w2*i*.45);c.stroke()}}
function musc(c,M,key,ctr,rx,ry,rot,on,act){if(key!="x")M[key]=M[key]||ctr;c.save();c.translate(ctr[0],ctr[1]);c.rotate(rot);
 c.beginPath();c.moveTo(0,-ry);c.bezierCurveTo(rx*1.15,-ry*.62,rx*1.15,ry*.5,0,ry);c.bezierCurveTo(-rx*1.15,ry*.5,-rx*1.15,-ry*.62,0,-ry);c.closePath();
 const R0=Math.max(rx,ry);let g;
 if(on){g=c.createRadialGradient(-rx*.35,-ry*.35,1,0,0,R0);g.addColorStop(0,"#ff9a5c");g.addColorStop(.55,"#f04a1f");g.addColorStop(1,"#a8180f");
  c.globalAlpha=.55+.45*act;c.shadowColor="rgba(255,90,30,"+(.25+.6*act)+")";c.shadowBlur=5+10*act;c.fillStyle=g;c.fill();c.shadowBlur=0;c.globalAlpha=1;
  c.strokeStyle="rgba(110,8,0,.55)";c.lineWidth=.7;c.stroke();c.strokeStyle="rgba(110,8,0,.35)"}
 else{g=c.createRadialGradient(-rx*.4,-ry*.45,.5,0,0,R0*1.05);g.addColorStop(0,"#f3f4f6");g.addColorStop(.5,"#c3c7cd");g.addColorStop(1,"#7f858d");
  c.fillStyle=g;c.fill();c.strokeStyle="rgba(46,50,57,.6)";c.lineWidth=.7;c.stroke();c.strokeStyle="rgba(70,75,82,.28)"}
 c.lineWidth=.45;c.save();c.clip();for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*rx*.28,-ry);c.quadraticCurveTo(i*rx*.36,0,i*rx*.28,ry);c.stroke()}c.restore();
 c.fillStyle="rgba(255,255,255,"+(on?.18:.35)+")";c.beginPath();c.ellipse(-rx*.35,-ry*.35,rx*.28,ry*.22,0,0,7);c.fill();c.restore()}
function rrect(c,ctr,w,h,rot,col){c.save();c.translate(ctr[0],ctr[1]);c.rotate(rot);c.fillStyle=col||"#3b424d";c.fillRect(-w/2,-h/2,w,h);c.restore()}
const STEEL="#4a525e",CAB="rgba(210,214,220,.7)";
function props(c,e,J,v,front){for(const q of e.pr||[]){const k=q.k||q;
 if(v=="s"){const P=(b,u,n)=>ad(ad(b,ml(J.up,u)),ml(J.n,n)),na=fn(J.a.u),ns=fn(J.a.sh);
  if(!front){if(k=="back")rrect(c,P(J.hip,30,-17),9,86,J.t*R,STEEL);else if(k=="seat"){rrect(c,ad(J.hip,[8,16]),54,8,0,STEEL);rrect(c,ad(J.hip,[8,41]),5,44,0,"#333a44")}
   else if(k=="chestpad")rrect(c,P(J.hip,46,24),8,30,J.t*R,STEEL);else if(k=="armpad")rrect(c,ad(mid(J.sh,J.el),ml(na,-10)),9,44,-J.a.u*R,STEEL);
   else if(k=="hippad"){c.fillStyle=STEEL;c.beginPath();c.arc(...P(J.hip,0,17),8,0,7);c.fill()}else if(k=="kneepad")rrect(c,ad(J.knee,[0,-12]),24,6,0,STEEL);
   else if(k=="step")rrect(c,ad(J.toe,[-6,7]),34,10,0,STEEL);else if(k=="rect")rrect(c,[q.x+q.w/2,q.y+q.h/2],q.w,q.h,0,STEEL);
   else if(k=="dipbar"){rrect(c,ad(J.hand,[0,4]),40,5,0,"#59616d");rrect(c,ad(J.hand,[14,50]),4,90,0,"#333a44")}
   else if(k=="plate")rrect(c,ad(mid(J.ankle,J.toe),ml(dA(J.a.sh),7)),56,6,-J.a.sh*R,STEEL);
   else if(k=="cable"){c.strokeStyle=CAB;c.lineWidth=1.2;c.beginPath();c.moveTo(q.x,q.y);c.lineTo(...J.hand);c.stroke();c.fillStyle="#59616d";c.beginPath();c.arc(q.x,q.y,4,0,7);c.fill()}}
  else{if(k=="roll"||k=="rollBack"){c.fillStyle="#2e343d";c.beginPath();c.arc(...ad(mid(J.knee,J.ankle,.85),ml(ns,k=="roll"?9:-9)),6.5,0,7);c.fill()}
   else if(k=="bar"){c.fillStyle="#2a2f37";c.beginPath();c.arc(...J.hand,11,0,7);c.fill();c.fillStyle="#9aa1ab";c.beginPath();c.arc(...J.hand,3,0,7);c.fill()}
   else if(k=="db")for(const h of[J.hand,J.hand2]){rrect(c,h,6,18,0,"#2a2f37")}
   else if(k=="handle")rrect(c,J.hand,4,12,0,"#2a2f37")}}
 else{if(!front){if(k=="seatF"){rrect(c,[J.cx,J.sy+30],62,72,0,STEEL);rrect(c,[J.cx,J.hip[1]+8],78,12,0,"#3b424d")}
   else if(k=="cable"||k=="cableF"){c.strokeStyle=CAB;c.lineWidth=1.2;c.beginPath();if(k=="cable"){c.moveTo(q.x,q.y);c.lineTo(...(q.y<40?mid(J.handL,J.handR):J.handR))}else{c.moveTo(q.x1,q.y1);c.lineTo(...J.handL);c.moveTo(q.x2,q.y2);c.lineTo(...J.handR)}c.stroke()}}
  else{if(k=="barF"){const a=J.handL,b=J.handR,d=[(b[0]-a[0]),(b[1]-a[1])],L=Math.hypot(...d)||1,u=ml(d,1/L);c.strokeStyle="#2a2f37";c.lineWidth=5;c.lineCap="round";c.beginPath();c.moveTo(...ad(a,ml(u,-26)));c.lineTo(...ad(b,ml(u,26)));c.stroke()}
   else if(k=="handles")for(const h of[J.handL,J.handR]){c.fillStyle="#2a2f37";c.beginPath();c.arc(...h,5,0,7);c.fill()}}}}}
function head(c,ctr,back,ang){c.fillStyle="#b9bec5";c.beginPath();c.ellipse(ctr[0],ctr[1],10.5,12.5,ang,0,7);c.fill();
 c.fillStyle="#141619";c.beginPath();if(back)c.ellipse(ctr[0],ctr[1]-1,11,12.5,ang,0,7);else c.ellipse(ctr[0],ctr[1]-4,11,9,ang,Math.PI*1.02,Math.PI*1.98);c.fill()}
/* Écorché : chaque muscle est dessiné ; le groupe ciblé passe en rouge-orange. */
function figure(c,e,J,act){const v=e.v,on=k=>e.m.includes(k),M={},m=(k,ct,rx,ry,rot)=>musc(c,M,k,ct,rx,ry,rot,k!="x"&&on(k),act);
 if(v=="s"){const P=(b,u,n)=>ad(ad(b,ml(J.up,u)),ml(J.n,n)),tr=J.t*R,A=J.a;
  const arm=(sh,el,hd,u,f,dk)=>{limb(c,sh,el,8.5,6.5,dk);limb(c,el,hd,6.5,4.2,dk);if(dk)return;const na=fn(u),nf=fn(f);
   m("tri",ad(mid(sh,el,.5),ml(na,-3.8)),4.8,12.5,-u*R);m("bic",ad(mid(sh,el,.58),ml(na,3.4)),4.6,11,-u*R);
   m("fore",ad(mid(el,hd,.32),ml(nf,2)),3.6,10,-f*R);m("fore",ad(mid(el,hd,.38),ml(nf,-2.2)),3.2,10,-f*R);
   m("deltP",ad(sh,ml(J.n,-4.5)),5.5,9,-u*R);m("deltA",ad(sh,ml(J.n,4.5)),5.5,9,-u*R);m("deltM",ad(mid(sh,el,.12),[0,0]),6.5,10,-u*R);
   c.fillStyle="#d3d6db";c.beginPath();c.arc(...hd,3.8,0,7);c.fill()};
  const leg=(hp,kn,an,to,th,s,dk)=>{limb(c,hp,kn,11,8,dk);limb(c,kn,an,8,4.8,dk);limb(c,an,to,4,2.8,dk);if(dk)return;const nt=fn(th),ns=fn(s);
   m("ham",ad(mid(hp,kn,.5),ml(nt,-4.6)),5.5,16,-th*R);m("quad",ad(mid(hp,kn,.45),ml(nt,4.2)),5.5,16,-th*R);m("quad",ad(mid(hp,kn,.55),ml(nt,.5)),6,15,-th*R);
   m("calf",ad(mid(kn,an,.3),ml(ns,-3.4)),5,11,-s*R);m("calf",ad(mid(kn,an,.55),ml(ns,-2.6)),3.4,9,-s*R);m("x",ad(mid(kn,an,.45),ml(ns,3)),2.8,11,-s*R)};
  arm(J.sh,J.el2,J.hand2,A.u2,A.f2,1);leg(J.hip,J.knee2,J.ankle2,J.toe2,A.th2,A.sh2,1);
  limb(c,J.hip,J.sh,16,19);limb(c,J.sh,P(J.hip,74,1),6.5,6);
  m("trap",P(J.hip,64,-7),5,9,tr);m("x",P(J.hip,70,2),2.6,7,tr+.5);
  m("lat",P(J.hip,36,-9),6.5,18,tr);m("lowb",P(J.hip,12,-12),5.5,10,tr);
  for(let i=0;i<3;i++)m("x",P(J.hip,40-i*6,6),2.6,3.6,tr+.9);m("x",P(J.hip,14,7),5.5,9,tr);
  m("pec",P(J.hip,47,11),11,8,tr);m("pecH",P(J.hip,53,11),8,4,tr);m("pecL",P(J.hip,42,11),8,4,tr);
  for(let i=0;i<3;i++)m("abs",P(J.hip,10+i*9.5,12.5),3.6,4.4,tr);
  m("glu",P(J.hip,-2,-11),10,11.5,tr);
  leg(J.hip,J.knee,J.ankle,J.toe,A.th,A.sh,0);head(c,J.head,0,tr);arm(J.sh,J.el,J.hand,A.u,A.f,0);
 }else{const cx=J.cx,sy=J.sy,hy=J.hip[1],back=v=="b",ang=(a,b)=>-Math.atan2(b[0]-a[0],b[1]-a[1]);
  for(const L of J.legs){limb(c,L.hip,L.knee,11.5,8.5);limb(c,L.knee,L.ankle,8.5,5);limb(c,L.ankle,L.toe,4,3)}
  const g=c.createLinearGradient(cx-30,0,cx+30,0);g.addColorStop(0,"#80868e");g.addColorStop(.5,"#d9dce0");g.addColorStop(1,"#80868e");c.fillStyle=g;
  c.beginPath();c.moveTo(cx-31,sy+2);c.quadraticCurveTo(cx,sy-9,cx+31,sy+2);c.lineTo(cx+19,hy-20);c.lineTo(cx+18,hy+7);c.lineTo(cx-18,hy+7);c.lineTo(cx-19,hy-20);c.closePath();c.fill();
  limb(c,[cx,sy-2],[cx,sy-13],6.5,6);
  for(const A of J.arms){limb(c,A.sh,A.el,9,6.8);limb(c,A.el,A.hand,6.8,4.4)}
  for(const s of[1,-1]){const A=J.arms[s>0?0:1],L=J.legs[s>0?0:1],au=ang(A.sh,A.el),af=ang(A.el,A.hand),lu=ang(L.hip,L.knee),tl=Math.max(5,Math.hypot(L.knee[0]-L.hip[0],L.knee[1]-L.hip[1])/2.7);
   m("calf",ad(mid(L.knee,L.ankle,.32),[s*2.4,0]),3.8,10,0);m("calf",ad(mid(L.knee,L.ankle,.32),[-s*2.4,0]),3.8,10,0);
   if(back){m("lat",[cx+s*16,sy+31],8.5,21,-s*.28);m("x",[cx+s*15,sy+16],7,6,-s*.5);m("glu",[cx+s*9,hy+5],9.5,9.5,0);
    m("ham",ad(mid(L.hip,L.knee),[s*3,0]),4.5,tl,lu);m("ham",ad(mid(L.hip,L.knee),[-s*3,0]),4,tl*.95,lu);m("lowb",[cx+s*4.5,hy-18],3.4,13,0)}
   else{m("pec",[cx+s*12,sy+16],12.5,8.5,0);m("pecH",[cx+s*12,sy+10],11,4.5,0);m("trap",[cx+s*13,sy-2],9,3.5,s*.35);m("x",[cx+s*5,sy-8],2.4,7,s*.45);
    for(let i=0;i<3;i++)m("x",[cx+s*21,sy+28+i*6],3.5,2.6,-s*.6);m("x",[cx+s*15,hy-16],4.5,10,-s*.2);
    m("quad",ad(mid(L.hip,L.knee,.5),[s*4.5,0]),4.5,tl,lu);m("quad",mid(L.hip,L.knee,.45),4.6,tl*.95,lu);m("quad",ad(mid(L.hip,L.knee,.8),[-s*3.5,0]),4,tl*.45,lu);
    m("add",ad(mid(L.hip,L.knee,.35),[-s*6,0]),3.2,tl*.75,lu);m("x",ad(mid(L.knee,L.ankle,.5),[s*2,0]),2.6,11,0)}
   m(back?"deltP":"deltM",ad(A.sh,[s*3,0]),7.5,10,au);
   m(back?"tri":"bic",mid(A.sh,A.el,.55),5.2,11.5,au);m("fore",mid(A.el,A.hand,.35),4.2,10,af);
   c.fillStyle="#d3d6db";c.beginPath();c.arc(...A.hand,4,0,7);c.fill()}
  if(back)m("trap",[cx,sy+14],12,21,0);else for(let i=0;i<3;i++)for(const s of[1,-1])m("abs",[cx+s*4.6,hy-40+i*10],4,4.6,0);
  head(c,[cx,sy-21],back,0)}
 return M}
function scene(c,e,p){const J=joints(e.v,pose(e,p),e.uni);props(c,e,J,e.v,0);const M=figure(c,e,J,p);props(c,e,J,e.v,1);return M}
function drawEx(cv,now){const e=AN[cv.dataset.id];if(!e)return;const c=cv.getContext("2d");c.setTransform(2,0,0,2,0,0);
 const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,[p,lab]=RM?[1,"CONTRACTION"]:phase((now/2600)%1);
 const bg=c.createRadialGradient(160,110,20,160,120,230);bg.addColorStop(0,"#3a414c");bg.addColorStop(1,"#171a20");c.fillStyle=bg;c.fillRect(0,0,320,240);
 c.fillStyle="rgba(255,255,255,.05)";c.fillRect(0,214,320,26);
 const M=scene(c,e,p),tgt=M[e.m[0]]||[160,120],cxo=tgt[0]>200?62:258,cyo=58,r=40;
 c.strokeStyle="#e8641e";c.lineWidth=1.3;c.beginPath();c.moveTo(...tgt);const dx=tgt[0]-cxo,dy=tgt[1]-cyo,d=Math.hypot(dx,dy)||1;c.lineTo(cxo+dx/d*r,cyo+dy/d*r);c.stroke();
 c.fillStyle="#fff";c.beginPath();c.arc(...tgt,2.6,0,7);c.fill();c.strokeStyle="#e8641e";c.stroke();
 c.save();c.beginPath();c.arc(cxo,cyo,r,0,7);c.clip();c.fillStyle="#111418";c.fillRect(cxo-r,cyo-r,2*r,2*r);const z=2.3;c.translate(cxo-tgt[0]*z,cyo-tgt[1]*z);c.scale(z,z);scene(c,e,p);c.restore();
 c.lineWidth=2.5;c.strokeStyle="#e8641e";c.beginPath();c.arc(cxo,cyo,r,0,7);c.stroke();
 c.font="800 13px 'Barlow Condensed','Arial Narrow',sans-serif";const T=e.l.toUpperCase(),tw=c.measureText(T).width+14;
 c.fillStyle="#0d0f12";c.fillRect(cxo-tw/2,cyo+r+5,tw,18);c.strokeStyle="#e8641e";c.lineWidth=1.2;c.strokeRect(cxo-tw/2,cyo+r+5,tw,18);c.fillStyle="#fff";c.textAlign="center";c.textBaseline="middle";c.fillText(T,cxo,cyo+r+14.5);
 c.textAlign="left";c.font="500 9px 'IBM Plex Mono',monospace";c.fillStyle=p>.5?"rgba(255,140,80,.9)":"rgba(255,255,255,.55)";c.fillText(lab,10,229)}
(function loop(now){document.querySelectorAll("canvas.anim").forEach(cv=>{const r=cv.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight&&(!document.body.classList.contains("g-on")||cv.closest("#game")))drawEx(cv,now)});requestAnimationFrame(loop)})(0);

/* Rendu 3D temps réel : un seul moteur WebGL hors écran, chaque carte reçoit son image puis la bulle zoom en 2D. */
(function(){if(!window.THREE)return;try{
const V=(x,y,z)=>new THREE.Vector3(x,y,z),T3=(p,z)=>V(p[0]-160,214-p[1],z||0),Y=V(0,1,0);
const rd=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});rd.setSize(640,480,false);rd.setPixelRatio(1);
rd.shadowMap.enabled=true;rd.shadowMap.type=THREE.PCFSoftShadowMap;rd.outputEncoding=THREE.sRGBEncoding;rd.toneMapping=THREE.ACESFilmicToneMapping;rd.toneMappingExposure=.92;
const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(30,4/3,10,3000);
sc.add(new THREE.HemisphereLight(0xffffff,0x2a2e35,.45));
const key=new THREE.DirectionalLight(0xffffff,1.15);key.position.set(-160,320,280);key.castShadow=true;key.shadow.mapSize.set(1024,1024);
Object.assign(key.shadow.camera,{left:-260,right:260,top:260,bottom:-260,near:10,far:1200});key.shadow.bias=-.0008;sc.add(key);
const rim=new THREE.DirectionalLight(0x9fb8ff,.7);rim.position.set(220,160,-300);sc.add(rim);
const fill=new THREE.DirectionalLight(0xffe2cc,.25);fill.position.set(300,60,200);sc.add(fill);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.ShadowMaterial({opacity:.38}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;sc.add(floor);
const MAT={g:new THREE.MeshStandardMaterial({color:0x8c929b,roughness:.34,metalness:.28}),
 h:new THREE.MeshStandardMaterial({color:0xd8330e,emissive:0xff2200,emissiveIntensity:.3,roughness:.32,metalness:.05}),
 d:new THREE.MeshStandardMaterial({color:0x15171b,roughness:.8}),st:new THREE.MeshStandardMaterial({color:0x3d4552,roughness:.55,metalness:.4}),
 k:new THREE.MeshStandardMaterial({color:0x22262d,roughness:.4,metalness:.6}),c:new THREE.MeshStandardMaterial({color:0xcfd3d9,roughness:.3,metalness:.7})};
const GEO={s:new THREE.SphereGeometry(1,22,16),b:new THREE.BoxGeometry(1,1,1),c:new THREE.CylinderGeometry(1,1,1,18)},POOL={s:[],b:[],c:[]},N={s:0,b:0,c:0};
function get(t,m){let o=POOL[t][N[t]++];if(!o){o=new THREE.Mesh(GEO[t],m);o.castShadow=true;POOL[t].push(o);sc.add(o)}o.material=m;o.visible=true;return o}
const BW={l:V(1,0,0),d:V(0,1,0),f:V(0,0,1)},M4=new THREE.Matrix4();
function basis(dv,hint){const d=dv.clone().normalize();let f=hint.clone().sub(d.clone().multiplyScalar(hint.dot(d)));
 if(f.length()<1e-3)f=Math.abs(d.y)<.9?V(0,1,0).cross(d):V(1,0,0).cross(d);f.normalize();return{d,f,l:d.clone().cross(f)}}
function ell(c,B,sl,sd,sf,m){const o=get("s",m);o.position.copy(c);M4.makeBasis(B.l,B.d,B.f);o.quaternion.setFromRotationMatrix(M4);o.scale.set(sl,sd,sf);return o}
function box(c,B,sl,sd,sf,m){const o=get("b",m||MAT.st);o.position.copy(c);M4.makeBasis(B.l,B.d,B.f);o.quaternion.setFromRotationMatrix(M4);o.scale.set(sl,sd,sf)}
function cyl(a,b,r,m){const o=get("c",m||MAT.k),d=b.clone().sub(a),L=d.length()||1;o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(Y,d.multiplyScalar(1/L));o.scale.set(r,L,r)}
const lerp3=(a,b,t)=>a.clone().lerp(b,t);
function build(e,J,act){for(const k in N)N[k]=0;const side=e.v=="s",hot=ks=>ks.some(k=>e.m.includes(k)),Mk={};MAT.h.emissiveIntensity=.1+.55*act;
 const mus=(a,b,B,sl,t,fo,lo,rf,rl,lf,ks)=>{const L=a.distanceTo(b),c=lerp3(a,b,t).add(B.f.clone().multiplyScalar(fo)).add(B.l.clone().multiplyScalar(lo*sl)),h=hot(ks);
  ell(c,B,rl*1.14,Math.max(L*lf,2),rf*1.14,h?MAT.h:MAT.g);if(h)for(const k of ks)if(e.m.includes(k)&&!Mk[k])Mk[k]=c};
 let H,S,HD,arms,legs,outw,fr,tf;
 if(side){H=T3(J.hip);S=T3(J.sh);HD=T3(J.head);
  arms=[{s:1,sh:T3(J.sh,17),el:T3(J.el,19),hand:T3(J.hand,17)},{s:-1,sh:T3(J.sh,-17),el:T3(J.el2,-19),hand:T3(J.hand2,-17)}];
  legs=[{s:1,hip:T3(J.hip,9),knee:T3(J.knee,10),ankle:T3(J.ankle,10),toe:T3(J.toe,11)},{s:-1,hip:T3(J.hip,-9),knee:T3(J.knee2,-10),ankle:T3(J.ankle2,-10),toe:T3(J.toe2,-11)}];
  outw=s=>V(0,0,s);fr=d=>V(-d.y,d.x,0);const u=S.clone().sub(H).normalize();tf=V(u.y,-u.x,0)}
 else{const cx=J.cx;H=T3(J.hip);S=T3([cx,J.sy+4]);HD=T3([cx,J.sy-21]);
  arms=J.arms.map(A=>({s:A.s,sh:T3(A.sh),el:T3(A.el,A.z.el),hand:T3(A.hand,A.z.hand)}));
  legs=J.legs.map(L=>({s:L.s,hip:T3(L.hip),knee:T3(L.knee,L.z.knee),ankle:T3(L.ankle,L.z.ankle),toe:T3(L.toe,L.z.toe)}));
  outw=s=>V(s,0,0);fr=()=>V(0,0,1);tf=V(0,0,1)}
 const BT=basis(S.clone().sub(H),tf),LT=H.distanceTo(S),slT=1;
 ell(lerp3(H,S,.02),BT,15,10,10,MAT.g);ell(lerp3(H,S,.5),BT,13.5,LT*.5,10,MAT.g);ell(lerp3(H,S,.76),BT,17.5,LT*.2,11,MAT.g);
 for(const s of[1,-1]){
  mus(H,S,BT,slT,.82,8,s*8,3.6,8.5,.12,["pec","pecH"]);mus(H,S,BT,slT,.69,8.6,s*8,4,8.5,.13,["pec","pecL"]);
  for(const t of[.17,.3,.43])mus(H,S,BT,slT,t,9.4,s*3.8,2.3,3.4,.07,["abs"]);
  mus(H,S,BT,slT,.28,5,s*10.5,3,3.6,.18,["x"]);for(const t of[.57,.65])mus(H,S,BT,slT,t,5.5,s*12.8,2.2,2.6,.05,["x"]);
  mus(H,S,BT,slT,.55,-5,s*11,3.6,6.5,.32,["lat"]);mus(H,S,BT,slT,.88,-6,s*5,3,7,.2,["trap"]);mus(H,S,BT,slT,1.02,-2,s*8,3,5,.08,["trap"]);
  mus(H,S,BT,slT,.74,-7.5,s*8.5,2.4,5.5,.12,["x"]);mus(H,S,BT,slT,.2,-7.5,s*3.6,3,3,.18,["lowb"]);mus(H,S,BT,slT,-.06,-7,s*6.6,6,6.5,.16,["glu"])}
 ell(S.clone().add(BT.d.clone().multiplyScalar(7)),BT,5.5,7,5.5,MAT.g);
 const BH=basis(BT.d,tf);ell(HD,BH,9.3,11.3,10.3,MAT.g);ell(HD.clone().add(BH.d.clone().multiplyScalar(2)).add(BH.f.clone().multiplyScalar(-2.4)),BH,9.8,11.2,10.2,MAT.d);
 for(const A of arms){const o=outw(A.s),d1=A.el.clone().sub(A.sh),B1=basis(d1,fr(d1)),s1=Math.sign(B1.l.dot(o))||1,L1=d1.length();
  ell(lerp3(A.sh,A.el,.5),B1,5.2,L1/2+1,5.2,MAT.g);
  mus(A.sh,A.el,B1,s1,.1,3.8,1,4.6,5.4,.24,["deltA"]);mus(A.sh,A.el,B1,s1,.1,0,4.2,5,5.6,.26,["deltM"]);mus(A.sh,A.el,B1,s1,.1,-3.8,1,4.6,5.4,.24,["deltP"]);
  mus(A.sh,A.el,B1,s1,.56,3.2,0,4.1,4.4,.33,["bic"]);mus(A.sh,A.el,B1,s1,.46,-3.4,0,4.5,4.8,.4,["tri"]);
  ell(A.el,B1,4.4,4.4,4.4,MAT.g);const d2=A.hand.clone().sub(A.el),B2=basis(d2,fr(d2)),s2=Math.sign(B2.l.dot(o))||1;
  ell(lerp3(A.el,A.hand,.45),B2,3.6,d2.length()*.55,3.4,MAT.g);mus(A.el,A.hand,B2,s2,.28,1.6,.8,3.3,3.4,.3,["fore"]);mus(A.el,A.hand,B2,s2,.32,-1.4,-.8,3,3.1,.3,["fore"]);
  ell(A.hand,B2,3.4,4.6,2.8,MAT.g)}
 for(const L of legs){const o=outw(L.s),d1=L.knee.clone().sub(L.hip),B1=basis(d1,fr(d1)),s1=Math.sign(B1.l.dot(o))||1,L1=d1.length();
  ell(lerp3(L.hip,L.knee,.5),B1,7.2,L1/2+2,7.2,MAT.g);
  mus(L.hip,L.knee,B1,s1,.5,4,0,4.4,4.6,.4,["quad"]);mus(L.hip,L.knee,B1,s1,.55,1.5,4.6,4.2,4.4,.4,["quad"]);mus(L.hip,L.knee,B1,s1,.8,2.4,-3.8,3.8,4,.17,["quad"]);
  mus(L.hip,L.knee,B1,s1,.5,-4,1.6,4.4,4.2,.4,["ham"]);mus(L.hip,L.knee,B1,s1,.5,-3.8,-2,4,3.8,.37,["ham"]);mus(L.hip,L.knee,B1,s1,.35,0,-5,3.6,3.4,.3,["add"]);
  ell(L.knee,B1,5.2,5.2,5.2,MAT.g);const d2=L.ankle.clone().sub(L.knee),B2=basis(d2,fr(d2)),s2=Math.sign(B2.l.dot(o))||1;
  ell(lerp3(L.knee,L.ankle,.45),B2,4.2,d2.length()*.55,4.2,MAT.g);
  mus(L.knee,L.ankle,B2,s2,.3,-3.2,1.8,4,3.4,.25,["calf"]);mus(L.knee,L.ankle,B2,s2,.3,-3.2,-1.8,4,3.4,.25,["calf"]);mus(L.knee,L.ankle,B2,s2,.56,-2.4,0,3,4,.2,["calf"]);
  mus(L.knee,L.ankle,B2,s2,.45,2.6,.8,2.2,2.2,.3,["x"]);ell(L.ankle,B2,3.2,3.2,3.2,MAT.g);
  const d3=L.toe.clone().sub(L.ankle),B3=basis(d3,V(0,1,0));ell(lerp3(L.ankle,L.toe,.5),B3,3.8,d3.length()/2+1.5,2.6,MAT.g)}
 props3(e,J,{H,S,BT,arms,legs,side});
 for(const t in POOL)for(let i=N[t];i<POOL[t].length;i++)POOL[t][i].visible=false;
 return Mk}
function props3(e,J,X){const BT=X.BT,near=X.arms[0],Z=V(0,0,1);
 for(const q of e.pr||[]){const k=q.k||q;
  if(X.side){
   if(k=="back")box(X.H.clone().add(BT.d.clone().multiplyScalar(30)).add(BT.f.clone().multiplyScalar(-16)),BT,34,86,7);
   else if(k=="seat"){box(T3(ad(J.hip,[8,16])),BW,54,8,40);box(T3(ad(J.hip,[8,41])),BW,5,44,5)}
   else if(k=="chestpad")box(X.H.clone().add(BT.d.clone().multiplyScalar(46)).add(BT.f.clone().multiplyScalar(22)),BT,34,30,7);
   else if(k=="armpad"){const B=basis(near.el.clone().sub(near.sh),V(-(near.el.y-near.sh.y),near.el.x-near.sh.x,0));box(lerp3(near.sh,near.el,.5).add(B.f.clone().multiplyScalar(-9)),B,30,44,7)}
   else if(k=="hippad"){const c=X.H.clone().add(BT.f.clone().multiplyScalar(16));cyl(c.clone().add(V(0,0,-20)),c.clone().add(V(0,0,20)),8,MAT.st)}
   else if(k=="kneepad")box(T3(ad(J.knee,[0,-12]),0),BW,24,6,34);else if(k=="step")box(T3(ad(J.toe,[-6,7])),BW,34,10,50);
   else if(k=="rect")box(T3([q.x+q.w/2,q.y+q.h/2]),BW,q.w,q.h,60);
   else if(k=="dipbar")for(const z of[27,-27]){cyl(T3(ad(J.hand,[-22,4]),z),T3(ad(J.hand,[22,4]),z),2.4);cyl(T3(ad(J.hand,[14,4]),z),T3([J.hand[0]+14,214],z),2.2,MAT.st)}
   else if(k=="plate"){const L=X.legs[0],B=basis(L.ankle.clone().sub(L.knee),V(0,1,0));box(lerp3(L.ankle,L.toe,.5).add(B.d.clone().multiplyScalar(6)),B,60,5,56)}
   else if(k=="cable"){const a=T3([q.x,q.y],17);cyl(a,near.hand,.8,MAT.c);cyl(a.clone().add(V(0,0,-4)),a.clone().add(V(0,0,4)),5,MAT.k)}
   else if(k=="roll"||k=="rollBack"){const pp=ad(mid(J.knee,J.ankle,.85),ml(fn(J.a.sh),k=="roll"?9:-9));cyl(T3(pp,-20),T3(pp,20),6.5,MAT.st)}
   else if(k=="bar"){const h=T3(J.hand);cyl(T3(J.hand,-58),T3(J.hand,58),1.8,MAT.c);for(const z of[42,-42])cyl(T3(J.hand,z-3),T3(J.hand,z+3),14,MAT.k)}
   else if(k=="db")for(const A of X.arms){cyl(A.hand.clone().add(V(0,0,-8)),A.hand.clone().add(V(0,0,8)),1.6,MAT.c);for(const z of[-8,8])cyl(A.hand.clone().add(V(0,0,z-2)),A.hand.clone().add(V(0,0,z+2)),6,MAT.k)}
   else if(k=="handle")cyl(near.hand.clone().add(V(0,0,-6)),near.hand.clone().add(V(0,0,6)),2)}
  else{const hL=X.arms[1].hand,hR=X.arms[0].hand;
   if(k=="seatF"){if(e.v=="f")box(T3([J.cx,J.sy+30],-16),BW,62,72,6);box(T3([J.cx,J.hip[1]+8],14),BW,78,10,48)}
   else if(k=="cable"){const a=T3([q.x,q.y]);cyl(a,q.y<40?lerp3(hL,hR,.5):hR,.8,MAT.c)}
   else if(k=="cableF"){cyl(T3([q.x1,q.y1]),hL,.8,MAT.c);cyl(T3([q.x2,q.y2]),hR,.8,MAT.c)}
   else if(k=="barF"){const u=hR.clone().sub(hL).normalize();cyl(hL.clone().add(u.clone().multiplyScalar(-26)),hR.clone().add(u.clone().multiplyScalar(26)),2.2,MAT.c)}
   else if(k=="handles")for(const h of[hL,hR])cyl(h.clone().add(V(0,-6,0)),h.clone().add(V(0,6,0)),2.4)}}}
const BASE={s:34,f:-24,b:204},LOOK=V(0,96,0);
function drawEx3(cv,now){const e=AN[cv.dataset.id];if(!e)return;const c=cv.getContext("2d");c.setTransform(2,0,0,2,0,0);
 const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,[p,lab]=RM?[1,"CONTRACTION"]:phase((now/2600)%1);
 const J=joints(e.v,pose(e,p),e.uni),Mk=build(e,J,p),a=(BASE[e.v]+(RM?0:7*Math.sin(now/3200)))*R,D=480;
 cam.position.set(LOOK.x+Math.sin(a)*D,LOOK.y+D*.2,LOOK.z+Math.cos(a)*D);cam.lookAt(LOOK);rd.render(sc,cam);
 const bg=c.createRadialGradient(160,100,20,160,120,240);bg.addColorStop(0,"#454c58");bg.addColorStop(1,"#14171c");c.fillStyle=bg;c.fillRect(0,0,320,240);
 c.drawImage(rd.domElement,0,0,320,240);
 const w=Mk[e.m[0]]||LOOK,pv=w.clone().project(cam),tgt=[(pv.x+1)*160,(1-pv.y)*120],cxo=tgt[0]>190?62:258,cyo=58,r=40,z=2.3;
 c.strokeStyle="#e8641e";c.lineWidth=1.3;c.beginPath();c.moveTo(...tgt);const dx=tgt[0]-cxo,dy=tgt[1]-cyo,dd=Math.hypot(dx,dy)||1;c.lineTo(cxo+dx/dd*r,cyo+dy/dd*r);c.stroke();
 c.fillStyle="#fff";c.beginPath();c.arc(...tgt,2.6,0,7);c.fill();c.stroke();
 c.save();c.beginPath();c.arc(cxo,cyo,r,0,7);c.clip();c.fillStyle="#101317";c.fillRect(cxo-r,cyo-r,2*r,2*r);const hs=r/z;
 c.drawImage(rd.domElement,(tgt[0]-hs)*2,(tgt[1]-hs)*2,hs*4,hs*4,cxo-r,cyo-r,2*r,2*r);c.restore();
 c.lineWidth=2.5;c.strokeStyle="#e8641e";c.beginPath();c.arc(cxo,cyo,r,0,7);c.stroke();
 c.font="800 13px 'Barlow Condensed','Arial Narrow',sans-serif";const T=e.l.toUpperCase(),tw=c.measureText(T).width+14;
 c.fillStyle="#0d0f12";c.fillRect(cxo-tw/2,cyo+r+5,tw,18);c.strokeStyle="#e8641e";c.lineWidth=1.2;c.strokeRect(cxo-tw/2,cyo+r+5,tw,18);c.fillStyle="#fff";c.textAlign="center";c.textBaseline="middle";c.fillText(T,cxo,cyo+r+14.5);
 c.textAlign="left";c.font="500 9px 'IBM Plex Mono',monospace";c.fillStyle=p>.5?"rgba(255,140,80,.9)":"rgba(255,255,255,.55)";c.fillText(lab,10,229)}
drawEx=drawEx3;
}catch(err){console.warn("3D indisponible, rendu 2D",err)}})();
