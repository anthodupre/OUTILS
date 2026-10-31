/* ASMR Zen : activités 11 à 15 */
'use strict';
(()=>{
const A=ASMR,{SFX,award,spawnP,mk,mk0,rr,lighten,darken,bgSoft,hud,vib,clamp,rnd,pick,TAU,snd}=A;
const ctx=A.ctx,G=A.G,ptrs=A.ptrs;const VW=()=>A.VW,VH=()=>A.VH;
const{ready,out,tone,hiss}=snd,now=()=>snd.t();

/* ===== 11. Mousse à raser ===== */
A.register('foam',{e:'🧴',n:'Mousse à raser',d:'Étale la mousse, puis rase-la proprement.',lvl:2,hint:'Glisse pour étaler la mousse. Le bouton Raser la retire.',create(){
  let fc,mode='mousse',hs,rz,acc=0,tiles,pat=null;
  function fresh(){fc=mk(VW(),VH());}
  function tilesTex(){tiles=mk0(80,80);const g=tiles.getContext('2d');g.fillStyle='#cfe6f2';g.fillRect(0,0,80,80);g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=3;g.strokeRect(1.5,1.5,77,77);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(6,6,30,30);}
  function blob(g,x,y,r){g.fillStyle='rgba(160,185,205,.35)';g.beginPath();g.arc(x+3,y+5,r,0,TAU);g.fill();
    const gr=g.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.8,'rgba(250,252,255,.95)');gr.addColorStop(1,'rgba(235,242,250,.9)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
  function spread(p){const g=fc.getContext('2d'),d=Math.hypot(p.x-p.px,p.y-p.py),n=Math.max(1,Math.ceil(d/6));
    for(let i=0;i<n;i++){const t=i/n;blob(g,p.px+(p.x-p.px)*t+rnd(-10,10),p.py+(p.y-p.py)*t+rnd(-10,10),rnd(16,30));}
    hs.set(p.sp*.7+200,p.x);if(Math.random()<.15&&ready()){const t=now(),o=out(p.x,.2);tone(o,'sine',rnd(900,1600),t,.002,.03,.05,500);}
    acc+=d;while(acc>=70){acc-=70;award(1,p.x,p.y);}}
  function shave(p){const g=fc.getContext('2d');g.globalCompositeOperation='destination-out';g.lineCap='round';g.lineWidth=44;g.strokeStyle='#000';g.beginPath();g.moveTo(p.px,p.py);g.lineTo(p.x,p.y);g.stroke();g.globalCompositeOperation='source-over';
    rz.set(p.sp,p.x);acc+=Math.hypot(p.x-p.px,p.y-p.py);while(acc>=50){acc-=50;award(1,p.x,p.y);}}
  function razor(x,y){ctx.save();ctx.translate(x,y);ctx.fillStyle='#d9dee5';rr(-24,-10,48,14,4);ctx.fill();ctx.fillStyle='#8e96a3';ctx.fillRect(-24,2,48,3);ctx.fillStyle='#3b4250';rr(-5,-64,10,54,5);ctx.fill();ctx.restore();}
  const me={init(){fresh();tilesTex();hs=A.cont('lowpass',900,2200,.7,.14,.3);rz=A.cont('bandpass',1200,2600,1.2,.25,.2);},resize(){fresh();},
    move(p){mode==='mousse'?spread(p):shave(p);},
    draw(){if(!pat)pat=ctx.createPattern(tiles,'repeat');ctx.fillStyle=pat;ctx.fillRect(0,0,VW(),VH());ctx.drawImage(fc,0,0,VW(),VH());
      if(mode==='raser')for(const[,p]of ptrs)razor(p.x,p.y);hud(mode==='mousse'?'🧴 Mousse':'🪒 Rasoir');},
    tools:[{l:()=>mode==='mousse'?'🪒 Raser':'🧴 Mousse',f(){mode=mode==='mousse'?'raser':'mousse';}},
      {l:'🫧 Remplir',f(){const g=fc.getContext('2d');for(let k=0;k<VW()*VH()/900;k++)blob(g,rnd(0,VW()),rnd(0,VH()),rnd(18,34));SFX.whoosh(VW()/2);}},
      {l:'🧼 Nettoyer',f(){fresh();SFX.whoosh(VW()/2);}}]};
  return me;
}});

/* ===== 12. Tapping ===== */
A.register('tapping',{e:'🪵',n:'Tapping',d:'Bois, verre, métal… tapote 12 matières.',lvl:3,hint:'Tapote les carreaux. Chaque matière a son son.',create(){
  const MAT=[['Bois','#a26a3a'],['Verre','#9fd3e6'],['Métal','#9aa3ad'],['Livre','#d9c7a3'],['Pierre','#7d7f84'],['Plastique','#ff8fa3'],['Bambou','#b7c48a'],['Céramique','#f1ece4'],['Cuir','#6b3f24'],['Carton','#c9a070'],['Coquillage','#f3d9d0'],['Cristal','#d8c8ff']];
  let tiles=[],nail=false;
  function layout(){tiles=[];const cols=3,rows=4,gap=10,w=(VW()-gap*(cols+1))/cols,h=(VH()-120-gap*(rows+1))/rows;
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const k=j*cols+i;tiles.push({k,x:gap+i*(w+gap),y:56+gap+j*(h+gap),w,h,m:MAT[k],p:0,ring:0,dots:Array.from({length:50},()=>[Math.random(),Math.random()])});}}
  function sound(k,x){if(!ready())return;const t=now(),o=out(x,.3),v=nail?1.25:1;
    if(nail)hiss(o,t,.001,.01,.18,'highpass',3500,1);
    switch(k){
      case 0:tone(o,'sine',220,t,.002,.07,.5*v,170);hiss(o,t,.001,.03,.25,'lowpass',1200,1);break;
      case 1:tone(o,'sine',1800,t,.001,.3,.25*v);tone(o,'sine',2750,t,.001,.2,.12*v);hiss(o,t,.001,.015,.15,'highpass',4000,1);break;
      case 2:tone(o,'triangle',880,t,.001,.6,.22*v);tone(o,'triangle',1330,t,.001,.45,.12*v);hiss(o,t,.001,.02,.2,'highpass',2500,1);break;
      case 3:hiss(o,t,.002,.06,.35,'bandpass',1400,1.5);tone(o,'sine',180,t,.002,.04,.15);break;
      case 4:tone(o,'sine',420,t,.001,.045,.45*v,300);hiss(o,t,.001,.03,.3,'lowpass',2500,1);break;
      case 5:tone(o,'square',600,t,.001,.03,.08*v);hiss(o,t,.001,.02,.25,'highpass',2000,1);tone(o,'sine',300,t,.001,.04,.2);break;
      case 6:tone(o,'sine',330,t,.002,.1,.45*v,290);hiss(o,t,.001,.04,.2,'lowpass',900,1);break;
      case 7:tone(o,'sine',1400,t,.001,.16,.3*v);tone(o,'sine',2100,t,.001,.1,.12*v);hiss(o,t,.001,.015,.15,'highpass',3500,1);break;
      case 8:hiss(o,t,.003,.07,.35,'lowpass',500,1);tone(o,'sine',120,t,.002,.06,.3);break;
      case 9:hiss(o,t,.002,.08,.35,'lowpass',700,1);tone(o,'sine',150,t,.002,.06,.25,100);break;
      case 10:tone(o,'sine',2400,t,.001,.09,.25*v);hiss(o,t,.001,.02,.2,'bandpass',4000,2);break;
      case 11:tone(o,'sine',2093,t,.001,.7,.22*v);tone(o,'sine',3136,t,.001,.5,.1*v);tone(o,'sine',4186,t,.001,.3,.05*v);break;}}
  function hit(p){for(const tl of tiles)if(p.x>=tl.x&&p.x<=tl.x+tl.w&&p.y>=tl.y&&p.y<=tl.y+tl.h){tl.p=1;tl.ring=1;sound(tl.k,p.x);vib(8);award(1,p.x,p.y);
      if(G.set.fx)for(let i=0;i<5;i++)spawnP(p.x,p.y,rnd(-60,60),rnd(-90,-20),'rgba(255,255,255,.8)',rnd(.2,.4),rnd(1,2.5),.6);return;}}
  function texture(tl,x,y,w,h){ctx.save();rr(x,y,w,h,14);ctx.clip();const k=tl.k;ctx.globalAlpha=.25;
    if(k===0||k===6){ctx.strokeStyle='#000';ctx.lineWidth=1.5;for(let i=0;i<8;i++){const yy=y+i*h/8+5;ctx.beginPath();ctx.moveTo(x,yy);ctx.bezierCurveTo(x+w*.3,yy-4,x+w*.6,yy+10,x+w,yy+2);ctx.stroke();}}
    else if(k===1||k===11){ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(x+w*.1,y+h*.9);ctx.lineTo(x+w*.5,y+h*.1);ctx.lineTo(x+w*.6,y+h*.1);ctx.lineTo(x+w*.2,y+h*.9);ctx.fill();}
    else if(k===2){ctx.strokeStyle='#fff';ctx.lineWidth=1;for(let i=0;i<h;i+=3){ctx.beginPath();ctx.moveTo(x,y+i);ctx.lineTo(x+w,y+i);ctx.stroke();}}
    else if(k===3||k===9){ctx.strokeStyle='#000';ctx.lineWidth=1;for(let i=10;i<h;i+=9){ctx.beginPath();ctx.moveTo(x+8,y+i);ctx.lineTo(x+w-8,y+i);ctx.stroke();}}
    else if(k===4||k===8){ctx.fillStyle='#000';for(const[a,b]of tl.dots)ctx.fillRect(x+a*w,y+b*h,k===4?2:3,k===4?2:1);}
    else if(k===7){ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.strokeRect(x+10,y+10,w-20,h-20);}
    else if(k===10){ctx.strokeStyle='#fff';ctx.lineWidth=2;for(let i=1;i<6;i++){ctx.beginPath();ctx.arc(x+w/2,y+h*.9,i*h/6,Math.PI,TAU);ctx.stroke();}}
    ctx.restore();}
  const me={init(){layout();},resize(){layout();},down(p){hit(p);},
    update(dt){for(const tl of tiles){tl.p=Math.max(0,tl.p-dt*6);tl.ring=Math.max(0,tl.ring-dt*2.2);}},
    draw(){bgSoft('#2b2735','#17141f');
      for(const tl of tiles){const k=1-tl.p*.04,cx=tl.x+tl.w/2,cy=tl.y+tl.h/2,w=tl.w*k,h=tl.h*k,x=cx-w/2,y=cy-h/2;
        ctx.fillStyle='rgba(0,0,0,.35)';rr(x+3,y+6,w,h,14);ctx.fill();const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,lighten(tl.m[1],.2));g.addColorStop(1,darken(tl.m[1],.2));ctx.fillStyle=g;rr(x,y,w,h,14);ctx.fill();
        texture(tl,x,y,w,h);
        if(tl.ring>0){ctx.save();rr(x,y,w,h,14);ctx.clip();ctx.strokeStyle=`rgba(255,255,255,${tl.ring*.8})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,(1-tl.ring)*Math.max(w,h)*.7+6,0,TAU);ctx.stroke();ctx.restore();}
        ctx.fillStyle='rgba(255,255,255,.92)';ctx.font='700 13px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText(tl.m[0],cx,y+h-8);}
      hud(nail?'💅 Ongle':'👆 Doigt');},
    tools:[{l:()=>nail?'👆 Doigt':'💅 Ongle',f(){nail=!nail;}}]};
  return me;
}});

/* ===== 13. Bulles de savon ===== */
A.register('soap',{e:'🫧',n:'Bulles de savon',d:'Souffle des bulles, fais-les éclater.',lvl:4,hint:'Reste appuyé pour souffler. Touche une bulle pour la faire éclater.',create(){
  let B=[],blow,acc=0,blowers=new Map();
  function spawn(x,y){if(B.length>150)return;B.push({x,y,r:rnd(10,34),vx:rnd(-20,20),vy:rnd(-40,-15),ph:rnd(0,TAU),hue:rnd(0,360),a:0,life:rnd(6,12)});}
  function pop(b,x){B.splice(B.indexOf(b),1);if(ready()){const t=now(),o=out(x,.4);tone(o,'sine',rnd(700,1100)*(20/b.r),t,.002,.07,.3,300);hiss(o,t,.001,.02,.12,'bandpass',3000,2);}vib(6);award(1,b.x,b.y);
    if(G.set.fx)for(let i=0;i<8;i++){const a=rnd(0,TAU);spawnP(b.x+Math.cos(a)*b.r,b.y+Math.sin(a)*b.r,Math.cos(a)*rnd(40,120),Math.sin(a)*rnd(40,120)-40,'rgba(220,240,255,.9)',rnd(.3,.6),rnd(1,2.5),.8);}}
  function wand(x,y){ctx.save();ctx.translate(x,y);ctx.strokeStyle='#ffd166';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-14,14,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,40);ctx.stroke();ctx.restore();}
  const me={init(){blow=A.cont('bandpass',500,1300,.8,.16,.3);},
    down(p){for(let i=B.length-1;i>=0;i--){const b=B[i];if(Math.hypot(b.x-p.x,b.y-p.y)<b.r+6){pop(b,p.x);return;}}blowers.set(p.id,0);},
    move(p){if(blowers.has(p.id))return;for(let i=B.length-1;i>=0;i--){const b=B[i];if(Math.hypot(b.x-p.x,b.y-p.y)<b.r)pop(b,p.x);}},
    up(p){blowers.delete(p.id);},
    update(dt){for(const[id,t]of blowers){const p=ptrs.get(id);if(!p){blowers.delete(id);continue;}blowers.set(id,t+dt);blow.set(600,p.x);
        if(t>.12&&Math.random()<dt*9){spawn(p.x+rnd(-10,10),p.y-10);acc++;if(acc%5===0)award(1,p.x,p.y,0);}}
      const tm=performance.now()/1000;for(let i=B.length-1;i>=0;i--){const b=B[i];b.a=Math.min(1,b.a+dt*3);b.vx+=Math.sin(tm*1.3+b.ph)*18*dt;b.vy+=(-26-b.vy)*dt*.6;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
        if(b.x<-40||b.x>VW()+40||b.y<-50||b.life<=0)B.splice(i,1);}},
    draw(){const g=ctx.createLinearGradient(0,0,0,VH());g.addColorStop(0,'#1a2a6c');g.addColorStop(1,'#b21f8a');ctx.fillStyle=g;ctx.fillRect(0,0,VW(),VH());
      for(const b of B){ctx.globalAlpha=b.a;const gr=ctx.createRadialGradient(b.x,b.y,b.r*.6,b.x,b.y,b.r);gr.addColorStop(0,'rgba(255,255,255,.02)');gr.addColorStop(.75,`hsla(${b.hue},90%,75%,.18)`);gr.addColorStop(.92,`hsla(${(b.hue+120)%360},90%,70%,.45)`);gr.addColorStop(1,'rgba(255,255,255,.75)');
        ctx.fillStyle=gr;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.ellipse(b.x-b.r*.4,b.y-b.r*.45,b.r*.22,b.r*.12,-.6,0,TAU);ctx.fill();}
      ctx.globalAlpha=1;for(const[id]of blowers){const p=ptrs.get(id);if(p)wand(p.x,p.y);}hud(`🫧 ${B.length}`);},
    tools:[{l:'💨 Souffler ×20',f(){for(let i=0;i<20;i++)spawn(rnd(40,VW()-40),VH()-rnd(40,120));SFX.whoosh(VW()/2);}}]};
  return me;
}});

/* ===== 14. Tableau à craie ===== */
A.register('chalk',{e:'🖍️',n:'Tableau',d:'Dessine à la craie, puis efface à l’éponge.',lvl:5,hint:'Dessine à la craie. Le bouton éponge efface.',create(){
  const COLS=['#f5f1e6','#ffe08a','#ff9fb0','#9ad5ff','#b8f0b0'];let bd,ci=0,eraser=false,sc,acc=0;
  function fresh(){bd=mk(VW(),VH());const g=bd.getContext('2d');g.fillStyle='#2f4a3c';g.fillRect(0,0,VW(),VH());for(let k=0;k<VW()*VH()/60;k++){g.fillStyle=Math.random()<.5?'rgba(255,255,255,.03)':'rgba(0,0,0,.08)';g.fillRect(Math.random()*VW(),Math.random()*VH(),1.5,1.5);}}
  function stroke(p){const g=bd.getContext('2d'),d=Math.hypot(p.x-p.px,p.y-p.py);if(d<.3)return;
    if(eraser){g.lineCap='round';g.lineWidth=46;g.strokeStyle='rgba(47,74,60,.55)';g.beginPath();g.moveTo(p.px,p.py);g.lineTo(p.x,p.y);g.stroke();g.fillStyle='rgba(255,255,255,.025)';for(let i=0;i<8;i++)g.fillRect(p.x+rnd(-22,22),p.y+rnd(-22,22),3,1);sc.set(p.sp*.6,p.x);}
    else{const w=clamp(9-p.sp/150,3,9),n=Math.ceil(d/1.2);g.fillStyle=COLS[ci];for(let i=0;i<n;i++){const t=i/n,x=p.px+(p.x-p.px)*t,y=p.py+(p.y-p.py)*t;for(let k=0;k<5;k++){g.globalAlpha=rnd(.15,.6);g.fillRect(x+rnd(-w/2,w/2),y+rnd(-w/2,w/2),1.4,1.4);}}g.globalAlpha=1;sc.set(p.sp,p.x);}
    acc+=d;while(acc>=60){acc-=60;award(1,p.x,p.y);}}
  const me={init(){fresh();sc=A.cont('bandpass',1500,3500,1.5,.22,.15);},resize(){fresh();},move(p){stroke(p);},
    draw(){ctx.drawImage(bd,0,0,VW(),VH());ctx.strokeStyle='#8b5a2b';ctx.lineWidth=10;ctx.strokeRect(5,5,VW()-10,VH()-10);hud(eraser?'🧽 Éponge':'🖍️ Craie');},
    tools:[{l:()=>eraser?'🖍️ Craie':'🧽 Éponge',f(){eraser=!eraser;}},{l:'🎨 Couleur',f(){ci=(ci+1)%COLS.length;eraser=false;}},{l:'🗑️ Tout effacer',f(){fresh();SFX.whoosh(VW()/2);}}]};
  return me;
}});

/* ===== 15. Glace ===== */
A.register('ice',{e:'🧊',n:'Glace',d:'Fissure la glace jusqu’à la briser.',lvl:6,hint:'Touche la glace pour la fissurer. Insiste pour la briser.',create(){
  let cr,frost,taps=0,shards=[],under=0,gone=false,ut=0,bubbles=[];
  function newPane(){cr=mk(VW(),VH());taps=0;shards=[];gone=false;under=(under+1)%4;frost=mk(VW(),VH());const g=frost.getContext('2d');
    g.fillStyle='rgba(205,232,250,.55)';g.fillRect(0,0,VW(),VH());for(let k=0;k<VW()*VH()/40;k++){g.fillStyle='rgba(255,255,255,.18)';g.fillRect(Math.random()*VW(),Math.random()*VH(),1.5,1.5);}
    const gr=g.createLinearGradient(0,0,VW(),VH());gr.addColorStop(0,'rgba(255,255,255,.25)');gr.addColorStop(.5,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(255,255,255,.2)');g.fillStyle=gr;g.fillRect(0,0,VW(),VH());
    bubbles=Array.from({length:14},(_,i)=>({x:rnd(0,VW()),y:rnd(0,VH()),r:2+i%3,v:rnd(8,25),ph:rnd(0,TAU)}));}
  function crack(x,y){const lines=[],n=5+Math.random()*4|0,base=rnd(0,TAU);
    for(let i=0;i<n;i++){let a=base+i/n*TAU+rnd(-.3,.3),qx=x,qy=y;const len=rnd(40,140)*(1+taps*.08),segs=4+Math.random()*4|0,pts=[[qx,qy]];
      for(let s=0;s<segs;s++){a+=rnd(-.5,.5);qx+=Math.cos(a)*len/segs;qy+=Math.sin(a)*len/segs;pts.push([qx,qy]);if(Math.random()<.35){const b=a+rnd(-1.2,1.2),bl=rnd(10,35);lines.push([[qx,qy],[qx+Math.cos(b)*bl,qy+Math.sin(b)*bl]]);}}
      lines.push(pts);}
    const g=cr.getContext('2d');g.lineCap='round';g.lineJoin='round';
    for(const[sty,w,off]of[['rgba(30,60,90,.35)',3.5,1.2],['rgba(255,255,255,.95)',1.6,0]]){g.strokeStyle=sty;g.lineWidth=w;g.beginPath();for(const pts of lines){g.moveTo(pts[0][0]+off,pts[0][1]+off);for(let k=1;k<pts.length;k++)g.lineTo(pts[k][0]+off,pts[k][1]+off);}g.stroke();}
    taps++;if(ready()){const t=now(),o=out(x,.35);for(let i=0;i<4;i++)hiss(o,t+i*.012,.001,.03,.35,'highpass',rnd(2500,6000),1);tone(o,'sine',rnd(1800,2600),t,.001,.12,.15,900);hiss(o,t,.002,.08,.3,'lowpass',500,1);}
    vib(10);award(2,x,y);if(taps>=7+Math.random()*4)shatter(x,y);}
  function shatter(x,y){gone=true;shards=[];for(let i=0;i<70;i++){const cx=rnd(0,VW()),cy=rnd(0,VH()),s=rnd(30,90);shards.push({x:cx,y:cy,pts:[[rnd(-s,s),rnd(-s,s)],[rnd(-s,s),rnd(-s,s)],[rnd(-s,s),rnd(-s,s)]],vx:(cx-x)*rnd(.5,2),vy:(cy-y)*rnd(.5,2)-200,r:0,vr:rnd(-5,5),a:1});}
    if(ready()){const t=now(),o=out(x,.5);hiss(o,t,.002,.5,.5,'highpass',3000,.5);for(let i=0;i<12;i++)tone(o,'sine',rnd(1500,4000),t+rnd(0,.3),.001,.3,.1);}
    vib(40);award(20,x,y,0);ut=setTimeout(()=>{if(A.act===me)newPane();},2600);}
  const me={init(){newPane();},resize(){newPane();},destroy(){clearTimeout(ut);},
    down(p){if(!gone)crack(p.x,p.y);},
    update(dt){for(const s of shards){s.vy+=1400*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.r+=s.vr*dt;if(s.y>VH()+200)s.a=0;}
      for(const b of bubbles){b.y-=b.v*dt;if(b.y<-10){b.y=VH()+10;b.x=rnd(0,VW());}}},
    draw(){const U=[['#0b3d91','#1d8de0'],['#1b4332','#52b788'],['#3c096c','#ff6d00'],['#03045e','#00b4d8']][under],g=ctx.createLinearGradient(0,0,VW(),VH());g.addColorStop(0,U[0]);g.addColorStop(1,U[1]);ctx.fillStyle=g;ctx.fillRect(0,0,VW(),VH());
      const tm=performance.now()/1000;ctx.fillStyle='rgba(255,255,255,.4)';for(const b of bubbles){ctx.beginPath();ctx.arc(b.x+Math.sin(tm+b.ph)*6,b.y,b.r,0,TAU);ctx.fill();}
      if(!gone){ctx.drawImage(frost,0,0,VW(),VH());ctx.drawImage(cr,0,0,VW(),VH());}
      else for(const s of shards){if(!s.a)continue;ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.r);ctx.fillStyle='rgba(215,238,252,.7)';ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(s.pts[0][0],s.pts[0][1]);ctx.lineTo(s.pts[1][0],s.pts[1][1]);ctx.lineTo(s.pts[2][0],s.pts[2][1]);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
      hud(gone?'💥 Brisée !':`🧊 ${taps} fissure${taps>1?'s':''}`);},
    tools:[{l:'🧊 Nouvelle glace',f(){clearTimeout(ut);newPane();SFX.whoosh(VW()/2);}},{l:'💥 Briser',f(){if(!gone)shatter(VW()/2,VH()/2);}}]};
  return me;
}});
})();
