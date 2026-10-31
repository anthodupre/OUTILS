/* ASMR Zen : activités 1 à 5 */
'use strict';
(()=>{
const A=ASMR,{SFX,award,spawnP,mk,rr,rrc,lighten,darken,bgSoft,hud,wrapChars,vib,clamp,rnd,pick,TAU}=A;
const ctx=A.ctx,G=A.G;
const VW=()=>A.VW,VH=()=>A.VH;

/* ===== 1. Papier bulle ===== */
A.register('bubbles',{e:'🫧',n:'Papier bulle',d:'Éclate les bulles une à une… ou glisse ton doigt.',lvl:1,hint:'Touche ou glisse pour éclater les bulles',create(){
  const SZ={petites:15,moyennes:21,grosses:29};let size='moyennes',r=21,B=[],popped=0,sprU,sprP,sheet=0;
  function sprites(){
    const s=Math.ceil(r*2.6),cx=s/2,cy=s/2;
    sprU=mk(s,s);let g=sprU.getContext('2d');
    g.fillStyle='rgba(40,60,100,.16)';g.beginPath();g.arc(cx+1.5,cy+3,r,0,TAU);g.fill();
    let gr=g.createRadialGradient(cx-r*.35,cy-r*.4,r*.05,cx,cy,r);gr.addColorStop(0,'rgba(255,255,255,.97)');gr.addColorStop(.45,'rgba(224,236,250,.85)');gr.addColorStop(1,'rgba(160,185,215,.8)');
    g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();g.lineWidth=1.2;g.strokeStyle='rgba(255,255,255,.9)';g.stroke();
    g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.ellipse(cx-r*.38,cy-r*.42,r*.26,r*.14,-.7,0,TAU);g.fill();
    sprP=mk(s,s);g=sprP.getContext('2d');g.fillStyle='rgba(110,130,165,.32)';g.beginPath();
    for(let k=0;k<12;k++){const a=k/12*TAU,rr2=r*rnd(.82,1.02),x=cx+Math.cos(a)*rr2,y=cy+Math.sin(a)*rr2;k?g.lineTo(x,y):g.moveTo(x,y);}
    g.closePath();g.fill();g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.55)';g.stroke();g.strokeStyle='rgba(70,90,125,.45)';
    for(let k=0;k<4;k++){const a=rnd(0,TAU);g.beginPath();g.moveTo(cx+Math.cos(a)*r*.15,cy+Math.sin(a)*r*.15);g.lineTo(cx+Math.cos(a+rnd(-.5,.5))*r*.8,cy+Math.sin(a+rnd(-.5,.5))*r*.8);g.stroke();}
  }
  function layout(){
    r=SZ[size];sprites();B=[];popped=0;
    const step=r*2+Math.max(4,r*.3),rowH=step*.87,W=VW(),H=VH();
    const cols=Math.max(2,Math.floor((W-12)/step)),rows=Math.max(2,Math.floor((H-130)/rowH));
    const ox=(W-(cols-1)*step)/2,oy=58+((H-130)-(rows-1)*rowH)/2;
    for(let j=0;j<rows;j++){const n=j%2?cols-1:cols;for(let i=0;i<n;i++)B.push({x:ox+i*step+(j%2?step/2:0),y:oy+j*rowH,p:false,s:1});}
  }
  function pop(b){b.p=true;b.s=1.3;popped++;SFX.pop(b.x,(21/r)*rnd(.9,1.12));vib(8);award(1,b.x,b.y);
    if(G.set.fx)for(let k=0;k<5;k++)spawnP(b.x,b.y,rnd(-90,90),rnd(-140,20),'rgba(255,255,255,.9)',rnd(.25,.5),rnd(1.5,3),.5);
    if(popped===B.length)setTimeout(()=>{if(A.act!==me)return;SFX.whoosh(VW()/2);award(20,VW()/2,VH()/2,0);sheet=1;layout();},450);}
  function hit(p){for(const b of B)if(!b.p){const dx=b.x-p.x,dy=b.y-p.y;if(dx*dx+dy*dy<r*r*1.15)pop(b);}}
  const me={init(){layout();},resize(){layout();},down(p){hit(p);},move(p){hit(p);},
    update(dt){for(const b of B)if(b.s!==1)b.s+=(1-b.s)*Math.min(1,dt*12);if(sheet>0)sheet=Math.max(0,sheet-dt*2.2);},
    draw(){bgSoft('#eef3f9','#d3dce9');ctx.save();ctx.translate(0,-sheet*sheet*VH());const s=sprU.width/A.DPR;
      for(const b of B){const k=b.s;ctx.drawImage(b.p?sprP:sprU,b.x-s/2*k,b.y-s/2*k,s*k,s*k);}ctx.restore();hud(`${popped} / ${B.length}`);},
    tools:[{l:'🧻 Nouvelle feuille',f(){SFX.whoosh(VW()/2);sheet=1;layout();}},{l:()=>'🔘 Bulles '+size,f(){const k=Object.keys(SZ);size=k[(k.indexOf(size)+1)%k.length];layout();}}]};
  return me;
}});

/* ===== 2. Pop-it ===== */
A.register('popit',{e:'🟣',n:'Pop-it',d:'Pousse les bulles, retourne, recommence.',lvl:1,hint:'Appuie sur les bulles. Quand tout est enfoncé, ça se retourne !',create(){
  const PALS={arc:['#ff5c7a','#ff9742','#ffd23f','#5ad67d','#3fa7ff','#9b6bff','#ff6bd6'],pastel:['#ffb3c6','#ffd6a5','#fdffb6','#caffbf','#9bf6ff','#a0c4ff','#bdb2ff'],menthe:['#7fd8be','#a1e8c5','#5cc9a8','#7fd8be','#a1e8c5','#5cc9a8','#7fd8be']};
  const SHAPES=['carré','rond','cœur'];let shape='carré',pal='arc',C=[],cs=40,flip=0,flipping=false,reset=false,cols=6,rows=8,ox=0,oy=0,spr={};
  function inside(i,j){const u=(i+.5)/cols*2-1,v=(j+.5)/rows*2-1;if(shape==='carré')return true;if(shape==='rond')return u*u+v*v<=1.02;
    const x=u*1.3,y=-(v*1.3)+.25,a=x*x+y*y-1;return a*a*a-x*x*y*y*y<=0;}
  function layout(){
    if(shape==='carré'){cols=6;rows=8;}else cols=rows=9;
    cs=Math.floor(Math.min((VW()-36)/cols,(VH()-150)/rows));ox=(VW()-cols*cs)/2;oy=58+((VH()-130)-rows*cs)/2;C=[];spr={};const Pl=PALS[pal];
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)if(inside(i,j))C.push({j,x:ox+i*cs+cs/2,y:oy+j*cs+cs/2,d:false,s:1,col:Pl[j%Pl.length]});
  }
  function sprite(col,down){const k=col+down;if(spr[k])return spr[k];const s=cs,c=mk(s,s),g=c.getContext('2d'),r=cs*.42,cx=s/2,cy=s/2;
    if(!down){g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.arc(cx,cy+r*.12,r,0,TAU);g.fill();
      const gr=g.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);gr.addColorStop(0,lighten(col,.45));gr.addColorStop(.6,col);gr.addColorStop(1,darken(col,.18));g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();
      g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(cx-r*.3,cy-r*.42,r*.3,r*.16,-.6,0,TAU);g.fill();}
    else{const gr=g.createRadialGradient(cx+r*.2,cy+r*.3,r*.1,cx,cy,r);gr.addColorStop(0,darken(col,.35));gr.addColorStop(.7,darken(col,.12));gr.addColorStop(1,lighten(col,.2));g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();
      g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1.5;g.beginPath();g.arc(cx,cy,r-.75,0,TAU);g.stroke();}
    return spr[k]=c;}
  function press(c){if(c.d||flipping)return;c.d=true;c.s=.7;SFX.popit(c.x,1+(rows-1-c.j)*.07);vib(10);award(1,c.x,c.y);
    if(C.every(o=>o.d)){flipping=true;flip=0;reset=false;SFX.whoosh(VW()/2);award(15,VW()/2,VH()/2,0);}}
  function hit(p){for(const c of C)if(!c.d){const dx=c.x-p.x,dy=c.y-p.y;if(dx*dx+dy*dy<(cs*.45)**2)press(c);}}
  const me={init(){layout();},resize(){layout();},down(p){hit(p);},move(p){hit(p);},
    update(dt){for(const c of C)if(c.s!==1)c.s+=(1-c.s)*Math.min(1,dt*14);
      if(flipping){flip+=dt*1.6;if(flip>=.5&&!reset){reset=true;for(const c of C)c.d=false;}if(flip>=1){flipping=false;flip=0;}}},
    draw(){bgSoft('#fff1f8','#e6f0ff');const bx=ox-12,by=oy-12,bw=cols*cs+24,bh=rows*cs+24;
      ctx.save();ctx.translate(VW()/2,0);ctx.scale(Math.cos(flip*Math.PI),1);ctx.translate(-VW()/2,0);
      ctx.fillStyle='rgba(0,0,0,.12)';if(shape==='carré'){rr(bx+3,by+8,bw,bh,26);ctx.fill();ctx.fillStyle='#faf7ff';rr(bx,by,bw,bh,26);ctx.fill();}
      else{ctx.beginPath();for(const c of C)ctx.rect(c.x-cs/2+1,c.y-cs/2+7,cs+2,cs+2);ctx.fill();ctx.fillStyle='#faf7ff';ctx.beginPath();for(const c of C)ctx.rect(c.x-cs/2-2,c.y-cs/2-2,cs+4,cs+4);ctx.fill();}
      for(const c of C){const k=c.s;ctx.drawImage(sprite(c.col,c.d),c.x-cs/2*k,c.y-cs/2*k,cs*k,cs*k);}
      ctx.restore();hud(`${C.filter(c=>c.d).length} / ${C.length}`);},
    tools:[{l:()=>({carré:'◼ Carré',rond:'⬤ Rond',cœur:'♥ Cœur'})[shape],f(){shape=SHAPES[(SHAPES.indexOf(shape)+1)%3];layout();}},
      {l:()=>'🎨 '+pal,f(){const k=Object.keys(PALS);pal=k[(k.indexOf(pal)+1)%k.length];layout();}}]};
  return me;
}});

/* ===== 3. Jardin zen ===== */
A.register('zen',{e:'🪨',n:'Jardin zen',d:'Ratisse le sable autour des pierres.',lvl:1,hint:'Glisse ton doigt pour ratisser le sable',create(){
  let sand,stones=[],tines=5,scr,acc=0,fade=0;
  function makeSand(){sand=mk(VW(),VH());const g=sand.getContext('2d');g.fillStyle='#e7dcc6';g.fillRect(0,0,VW(),VH());
    for(let k=0;k<VW()*VH()/70;k++){g.fillStyle=Math.random()<.5?'rgba(120,95,60,.09)':'rgba(255,255,255,.14)';g.fillRect(Math.random()*VW(),Math.random()*VH(),1.4,1.4);}}
  function placeStones(){stones=[];for(let k=0;k<3;k++)stones.push({x:rnd(VW()*.2,VW()*.8),y:rnd(VH()*.25,VH()*.72),rx:rnd(24,44),ry:rnd(17,30),a:rnd(-.5,.5),c:pick(['#8a8f99','#6f7580','#9aa0a8'])});}
  function rake(p){const dx=p.x-p.px,dy=p.y-p.py,len=Math.hypot(dx,dy);if(len<.5)return;const nx=-dy/len,ny=dx/len,g=sand.getContext('2d'),sp=10;g.lineCap='round';
    for(let k=0;k<tines;k++){const o=(k-(tines-1)/2)*sp,ax=p.px+nx*o,ay=p.py+ny*o,bx=p.x+nx*o,by=p.y+ny*o;
      g.strokeStyle='rgba(110,85,50,.55)';g.lineWidth=4.5;g.beginPath();g.moveTo(ax+1.2,ay+1.5);g.lineTo(bx+1.2,by+1.5);g.stroke();
      g.strokeStyle='rgba(255,250,236,.8)';g.lineWidth=2;g.beginPath();g.moveTo(ax-.8,ay-.9);g.lineTo(bx-.8,by-.9);g.stroke();}
    scr.set(p.sp,p.x);acc+=len;while(acc>=80){acc-=80;award(1,p.x,p.y);}}
  const me={init(){makeSand();placeStones();scr=A.cont('bandpass',600,2200,.8,.3,.3);},resize(){makeSand();placeStones();},move(p){rake(p);},
    update(dt){if(fade>0)fade=Math.max(0,fade-dt*1.5);},
    draw(){ctx.drawImage(sand,0,0,VW(),VH());
      for(const s of stones){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.a);ctx.fillStyle='rgba(60,45,25,.28)';ctx.beginPath();ctx.ellipse(3,5,s.rx,s.ry,0,0,TAU);ctx.fill();
        const gr=ctx.createRadialGradient(-s.rx*.3,-s.ry*.4,2,0,0,s.rx);gr.addColorStop(0,lighten(s.c,.35));gr.addColorStop(1,darken(s.c,.3));ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(0,0,s.rx,s.ry,0,0,TAU);ctx.fill();ctx.restore();}
      if(fade>0){ctx.fillStyle=`rgba(231,220,198,${fade})`;ctx.fillRect(0,0,VW(),VH());}hud(`🧹 Râteau ${tines} dents`);},
    tools:[{l:'🧹 Lisser',f(){SFX.whoosh(VW()/2);makeSand();fade=1;}},{l:'🪨 Pierres',f(){SFX.tap(VW()/2);placeStones();}},{l:()=>`Râteau ${tines}`,f(){tines=tines===3?5:tines===5?7:3;}}]};
  return me;
}});

/* ===== 4. Clavier ===== */
A.register('keys',{e:'⌨️',n:'Clavier',d:'Thock thock. Tape pour le plaisir des oreilles.',lvl:2,hint:'Tape sur les touches, ou glisse dessus',create(){
  const ROWS=['AZERTYUIOP','QSDFGHJKLM','WXCVBN'],TYPES=['tactile','linéaire','clicky'],TH={crème:['#f4efe4','#3a3530','#2a2622'],nuit:['#3a3d46','#f2f2f2','#15171c'],pastel:['#ffd9e8','#4a3b47','#3b2d4a'],menthe:['#cdeedd','#2f4a3a','#24352c']};
  let K=[],type='tactile',theme='crème',typed='',sprU,sprD,sprSU,sprSD,kw=30,kh=30,held=new Map();
  function cap(w,h,down){const c=mk(w+8,h+12),g=c.getContext('2d'),face=TH[theme][0],lift=down?1:5;
    g.fillStyle='rgba(0,0,0,.28)';rrc(g,4,6+lift,w,h,7);g.fill();g.fillStyle=darken(face,.35);rrc(g,4,6,w,h,7);g.fill();
    g.fillStyle=face;rrc(g,4,6-lift,w,h,7);g.fill();g.fillStyle=lighten(face,.25);rrc(g,4+w*.1,6-lift+h*.08,w*.8,h*.5,6);g.fill();return c;}
  function sprites(){sprU=cap(kw,kh,false);sprD=cap(kw,kh,true);const sw=kw*5+16;sprSU=cap(sw,kh,false);sprSD=cap(sw,kh,true);}
  function layout(){K=[];kw=Math.floor((VW()-24)/10)-4;kh=Math.round(kw*1.05);const gap=4,y0=VH()-4*(kh+gap)-64;
    ROWS.forEach((row,j)=>{const n=row.length,x0=(VW()-(n*(kw+gap)-gap))/2;for(let i=0;i<n;i++)K.push({ch:row[i],x:x0+i*(kw+gap),y:y0+j*(kh+gap),w:kw,h:kh,row:j,d:false,p:0});});
    const sw=kw*5+16;K.push({ch:' ',x:(VW()-sw)/2,y:y0+3*(kh+gap),w:sw,h:kh,row:3,d:false,p:0});sprites();}
  function find(p){for(const k of K)if(p.x>=k.x-2&&p.x<=k.x+k.w+2&&p.y>=k.y-6&&p.y<=k.y+k.h+4)return k;return null;}
  function press(k){if(k.d)return;k.d=true;k.p=1;SFX.thock(k.x+k.w/2,k.row,type);vib(10);award(1,k.x+k.w/2,k.y);typed+=k.ch;if(typed.length>80)typed=typed.slice(-80);}
  function release(k){if(!k.d)return;k.d=false;SFX.clack(k.x+k.w/2);}
  const me={init(){layout();},resize(){layout();},
    down(p){const k=find(p);if(k){held.set(p.id,k);press(k);}},
    move(p){const k=find(p),h=held.get(p.id);if(k!==h){if(h)release(h);if(k){press(k);held.set(p.id,k);}else held.delete(p.id);}},
    up(p){const h=held.get(p.id);if(h)release(h);held.delete(p.id);},
    update(dt){for(const k of K)if(k.p>0)k.p=Math.max(0,k.p-dt*8);},
    draw(){const[,legend,base]=TH[theme];bgSoft(lighten(base,.18),darken(base,.25));
      const sx=16,sy=52,sw=VW()-32,sh=Math.max(60,K[0].y-82);ctx.fillStyle='rgba(255,255,255,.1)';rr(sx,sy,sw,sh,16);ctx.fill();
      ctx.font='600 20px ui-monospace,Menlo,monospace';ctx.textAlign='left';ctx.textBaseline='top';const lines=wrapChars(typed,sw-32),maxL=Math.max(1,Math.floor((sh-24)/26));
      const show=lines.slice(-maxL);ctx.fillStyle='rgba(255,255,255,.9)';show.forEach((l,i)=>ctx.fillText(l,sx+16,sy+12+i*26));
      if(Math.floor(performance.now()/500)%2){const lw=ctx.measureText(show[show.length-1]||'').width;ctx.fillRect(sx+16+lw+2,sy+12+(show.length-1)*26,2,22);}
      const bx=K[0].x-14,by=K[0].y-14;ctx.fillStyle=base;rr(bx,by,VW()-2*bx,4*(kh+4)+24,18);ctx.fill();
      ctx.font=`700 ${Math.round(kw*.42)}px system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
      for(const k of K){const down=k.d||k.p>.5,sp=k.ch===' '?(down?sprSD:sprSU):(down?sprD:sprU);ctx.drawImage(sp,k.x-4,k.y-6,sp.width/A.DPR,sp.height/A.DPR);
        if(k.ch!==' '){ctx.fillStyle=legend;ctx.fillText(k.ch,k.x+k.w/2,k.y+k.h/2-(down?1:5));}}
      hud(`⌨️ ${type}`);},
    tools:[{l:()=>'🔧 '+type,f(){type=TYPES[(TYPES.indexOf(type)+1)%3];}},{l:()=>'🎨 '+theme,f(){const k=Object.keys(TH);theme=k[(k.indexOf(theme)+1)%k.length];sprites();}},{l:'🗑️ Effacer',f(){typed='';}}]};
  return me;
}});

/* ===== 5. Gouttes ===== */
A.register('drops',{e:'💧',n:'Gouttes',d:"Touche l'eau, écoute les gouttes chanter.",lvl:3,hint:"Touche l'eau. Plus haut = plus aigu",create(){
  const SC={penta:[0,2,4,7,9],majeure:[0,2,4,5,7,9,11],mineure:[0,2,3,5,7,8,10],zen:[0,3,5,7,10]};let scale='penta',rain=false,R=[],D=[],pads=[],acc=0,rt=0;
  function placePads(){pads=[];for(let k=0;k<3;k++)pads.push({x:rnd(VW()*.15,VW()*.85),y:rnd(VH()*.2,VH()*.82),r:rnd(26,44),a:rnd(0,TAU),ph:rnd(0,TAU)});}
  function noteAt(y){const sc=SC[scale],idx=Math.round((1-clamp((y-50)/(VH()-130),0,1))*(sc.length*2-1)),m=60+sc[idx%sc.length]+12*Math.floor(idx/sc.length);return 440*Math.pow(2,(m-69)/12);}
  function drop(x,y,user){for(let k=0;k<3;k++)R.push({x,y,r:2+k*6,v:90+k*20,a:.9-k*.2,w:2.2-k*.5});SFX.drop(x,noteAt(y),user?1:.5);
    if(user){vib(6);award(1,x,y);}if(G.set.fx)for(let k=0;k<6;k++)spawnP(x,y,rnd(-80,80),rnd(-220,-80),'rgba(200,235,255,.9)',rnd(.3,.6),rnd(1.5,3),1.2);}
  const me={init(){placePads();},resize(){placePads();},
    down(p){drop(p.x,p.y,true);acc=0;},move(p){acc+=Math.hypot(p.x-p.px,p.y-p.py);if(acc>70){acc=0;drop(p.x,p.y,true);}},
    update(dt){for(let i=R.length-1;i>=0;i--){const r=R[i];r.r+=r.v*dt;r.a-=dt*.55;if(r.a<=0)R.splice(i,1);}
      for(let i=D.length-1;i>=0;i--){const d=D[i];d.vy+=1600*dt;d.y+=d.vy*dt;if(d.y>=d.ty){D.splice(i,1);drop(d.x,d.ty,false);}}
      if(rain){rt-=dt;if(rt<=0){rt=rnd(.15,.55);D.push({x:rnd(10,VW()-10),y:-10,ty:rnd(70,VH()-30),vy:0});}}},
    draw(){const g=ctx.createLinearGradient(0,0,0,VH());g.addColorStop(0,'#1f6b7a');g.addColorStop(1,'#0a2433');ctx.fillStyle=g;ctx.fillRect(0,0,VW(),VH());const t=performance.now()/1000;
      for(const p of pads){const y=p.y+Math.sin(t*.8+p.ph)*2;ctx.save();ctx.translate(p.x,y);ctx.rotate(p.a);ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(3,4,p.r,p.r*.85,0,0,TAU);ctx.fill();
        ctx.fillStyle='#2f8f5b';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,p.r,.35,TAU-.35);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.ellipse(-p.r*.25,-p.r*.25,p.r*.5,p.r*.3,-.5,0,TAU);ctx.fill();ctx.restore();}
      ctx.lineCap='round';for(const r of R){ctx.strokeStyle=`rgba(210,240,255,${r.a*.9})`;ctx.lineWidth=r.w;ctx.beginPath();ctx.ellipse(r.x,r.y,r.r,r.r*.6,0,0,TAU);ctx.stroke();}
      ctx.fillStyle='rgba(220,245,255,.95)';for(const d of D){ctx.beginPath();ctx.ellipse(d.x,d.y,2.2,5,0,0,TAU);ctx.fill();}
      hud(`💧 ${scale}${rain?' · pluie':''}`);},
    tools:[{l:()=>rain?'🌧️ Pluie : on':'🌧️ Pluie : off',f(){rain=!rain;}},{l:()=>'🎵 '+scale,f(){const k=Object.keys(SC);scale=k[(k.indexOf(scale)+1)%k.length];}},{l:'🪷 Nénuphars',f(){placePads();}}]};
  return me;
}});
})();
