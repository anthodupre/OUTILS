/* ASMR Zen : activités 16 à 20 */
'use strict';
(()=>{
const A=ASMR,{SFX,award,spawnP,mk,mk0,rr,rrc,lighten,darken,bgSoft,hud,vib,clamp,rnd,TAU,snd}=A;
const ctx=A.ctx,G=A.G,ptrs=A.ptrs;const VW=()=>A.VW,VH=()=>A.VH;
const{ready,out,tone,hiss}=snd,now=()=>snd.t();

/* ===== 16. Interrupteurs ===== */
A.register('switches',{e:'🎛️',n:'Interrupteurs',d:'Clics, boutons, potards et curseurs.',lvl:7,hint:'Bascule, appuie, tourne, glisse.',create(){
  let C=[],grab=new Map(),brush,pat=null;
  function layout(){C=[];const W=VW(),top=70,h=VH()-140;
    for(let i=0;i<6;i++)C.push({t:'tog',x:W*(.12+i*.152),y:top+h*.12,on:i%2===0,anim:i%2===0?1:0});
    ['#ff4d6d','#ffd166','#06d6a0'].forEach((c,i)=>C.push({t:'btn',x:W*(.22+i*.28),y:top+h*.34,on:false,p:0,c}));
    for(let i=0;i<2;i++)C.push({t:'knob',x:W*(.3+i*.4),y:top+h*.58,a:-2.2+i*1.5,r:34,det:0});
    for(let i=0;i<2;i++)C.push({t:'sld',x:W*(.2+i*.6),y:top+h*.82,v:.3+i*.4,len:Math.min(W*.3,h*.26)});
    brush=mk0(64,64);const g=brush.getContext('2d');g.fillStyle='#8a929c';g.fillRect(0,0,64,64);for(let i=0;i<64;i+=2){g.fillStyle=`rgba(255,255,255,${rnd(.03,.1)})`;g.fillRect(0,i,64,1);}pat=null;}
  function clack(x,on){if(!ready())return;const t=now(),o=out(x,.2);hiss(o,t,.001,.015,.4,'highpass',2500,1);tone(o,'sine',on?210:170,t,.001,.05,.5,110);tone(o,'triangle',on?1800:1400,t,.001,.02,.1);}
  function thunk(x){if(!ready())return;const t=now(),o=out(x,.25);tone(o,'sine',120,t,.002,.09,.6,70);hiss(o,t,.001,.03,.3,'lowpass',1500,1);tone(o,'sine',900,t+.02,.001,.04,.08);}
  function tick(x,hi){if(!ready())return;const t=now(),o=out(x,.1);hiss(o,t,.001,.008,.25,'highpass',hi?4000:3000,1);tone(o,'sine',hi?1500:1100,t,.001,.015,.12);}
  function find(p){for(const c of C){const hit=c.t==='sld'?Math.abs(p.x-c.x)<34&&Math.abs(p.y-c.y)<c.len/2+22:Math.hypot(p.x-c.x,p.y-c.y)<(c.t==='knob'?c.r+16:40);if(hit)return c;}return null;}
  function slide(c,p){const v=clamp(.5-(p.y-c.y)/c.len,0,1);if(Math.round(v*16)!==Math.round(c.v*16)){tick(c.x,false);vib(3);award(1,c.x,p.y);}c.v=v;}
  const me={init(){layout();},resize(){layout();},
    down(p){const c=find(p);if(!c)return;grab.set(p.id,{c,pa:Math.atan2(p.y-c.y,p.x-c.x)});
      if(c.t==='tog'){c.on=!c.on;clack(c.x,c.on);vib(10);award(1,c.x,c.y);}
      else if(c.t==='btn'){c.on=!c.on;c.p=1;thunk(c.x);vib(14);award(1,c.x,c.y);}
      else if(c.t==='sld')slide(c,p);},
    move(p){const g=grab.get(p.id);if(!g)return;const c=g.c;
      if(c.t==='knob'){const a=Math.atan2(p.y-c.y,p.x-c.x);let d=a-g.pa;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;g.pa=a;c.a=clamp(c.a+d,-2.4,2.4);const det=Math.round(c.a/(Math.PI/12));if(det!==c.det){c.det=det;tick(c.x,true);vib(4);award(1,c.x,c.y);}}
      else if(c.t==='sld')slide(c,p);},
    up(p){grab.delete(p.id);},
    update(dt){for(const c of C){if(c.t==='tog')c.anim+=((c.on?1:0)-c.anim)*Math.min(1,dt*18);if(c.t==='btn')c.p=Math.max(0,c.p-dt*6);}},
    draw(){if(!pat)pat=ctx.createPattern(brush,'repeat');ctx.fillStyle=pat;ctx.fillRect(0,0,VW(),VH());
      ctx.fillStyle='rgba(0,0,0,.25)';rr(10,52,VW()-20,VH()-112,22);ctx.fill();ctx.fillStyle='#3a3f47';for(const[x,y]of[[24,66],[VW()-24,66],[24,VH()-74],[VW()-24,VH()-74]]){ctx.beginPath();ctx.arc(x,y,5,0,TAU);ctx.fill();}
      for(const c of C){ctx.save();ctx.translate(c.x,c.y);
        if(c.t==='tog'){ctx.fillStyle='#22262c';rr(-22,-34,44,68,8);ctx.fill();ctx.fillStyle=c.on?'#4ade80':'#243a2c';ctx.beginPath();ctx.arc(0,-44,4,0,TAU);ctx.fill();if(c.on){ctx.shadowBlur=12;ctx.shadowColor='#4ade80';ctx.fill();ctx.shadowBlur=0;}
          const ly=(1-c.anim*2)*16;ctx.fillStyle='rgba(0,0,0,.5)';rr(-13,ly-16+4,26,32,6);ctx.fill();const g=ctx.createLinearGradient(-13,0,13,0);g.addColorStop(0,'#cfd4da');g.addColorStop(.5,'#f4f6f8');g.addColorStop(1,'#aab1ba');ctx.fillStyle=g;rr(-13,ly-16,26,32,6);ctx.fill();}
        else if(c.t==='btn'){ctx.fillStyle='#1d2026';ctx.beginPath();ctx.arc(0,0,34,0,TAU);ctx.fill();const dy=c.on?4:0,k=1-c.p*.06;ctx.fillStyle=darken(c.c,.45);ctx.beginPath();ctx.arc(0,6,26*k,0,TAU);ctx.fill();
          const g=ctx.createRadialGradient(-8,dy-8,4,0,dy,26);g.addColorStop(0,lighten(c.c,.4));g.addColorStop(1,c.c);ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,dy,26*k,0,TAU);ctx.fill();
          if(c.on){ctx.shadowBlur=18;ctx.shadowColor=c.c;ctx.fill();ctx.shadowBlur=0;}}
        else if(c.t==='knob'){ctx.strokeStyle='#2a2e35';ctx.lineWidth=2;for(let i=0;i<=12;i++){const a=-2.4+i*4.8/12-Math.PI/2;ctx.beginPath();ctx.moveTo(Math.cos(a)*(c.r+8),Math.sin(a)*(c.r+8));ctx.lineTo(Math.cos(a)*(c.r+14),Math.sin(a)*(c.r+14));ctx.stroke();}
          ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.arc(2,4,c.r,0,TAU);ctx.fill();const g=ctx.createRadialGradient(-10,-12,4,0,0,c.r);g.addColorStop(0,'#5c636d');g.addColorStop(1,'#1f2329');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,c.r,0,TAU);ctx.fill();
          const a=c.a-Math.PI/2;ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(Math.cos(a)*c.r*.35,Math.sin(a)*c.r*.35);ctx.lineTo(Math.cos(a)*c.r*.85,Math.sin(a)*c.r*.85);ctx.stroke();}
        else{ctx.fillStyle='#1d2026';rr(-6,-c.len/2-8,12,c.len+16,6);ctx.fill();ctx.strokeStyle='#2a2e35';ctx.lineWidth=2;for(let i=0;i<=8;i++){const y=-c.len/2+i*c.len/8;ctx.beginPath();ctx.moveTo(12,y);ctx.lineTo(22,y);ctx.stroke();}
          const hy=(.5-c.v)*c.len;ctx.fillStyle='rgba(0,0,0,.45)';rr(-20,hy-9+4,40,18,4);ctx.fill();const g=ctx.createLinearGradient(0,hy-9,0,hy+9);g.addColorStop(0,'#e6e9ee');g.addColorStop(1,'#9aa2ad');ctx.fillStyle=g;rr(-20,hy-9,40,18,4);ctx.fill();ctx.fillStyle='#ff5c7a';ctx.fillRect(-20,hy-1,40,2);}
        ctx.restore();}
      hud(`🎛️ ${C.filter(c=>c.on).length} allumés`);},
    tools:[{l:'🔁 Tout éteindre',f(){for(const c of C)if(c.t==='tog'||c.t==='btn')c.on=false;clack(VW()/2,false);}}]};
  return me;
}});

/* ===== 17. Velours ===== */
A.register('velvet',{e:'🧶',n:'Velours',d:'Caresse le tissu, le reflet change de sens.',lvl:8,hint:'Glisse vers le haut ou le bas : le reflet du velours change',create(){
  const COLS={bordeaux:'#5a0f2b',émeraude:'#0f4a3a',nuit:'#141a4a',prune:'#3b1549'};let col='bordeaux',vc,fiber,pat=null,sh,acc=0;
  function fresh(){vc=mk(VW(),VH());const g=vc.getContext('2d');g.fillStyle=COLS[col];g.fillRect(0,0,VW(),VH());}
  function fiberTex(){fiber=mk0(128,128);const g=fiber.getContext('2d');for(let i=0;i<3500;i++){g.fillStyle=`rgba(255,255,255,${rnd(.02,.07)})`;g.fillRect(Math.random()*128,Math.random()*128,1,rnd(2,5));}}
  function brushStroke(p){const dx=p.x-p.px,dy=p.y-p.py,d=Math.hypot(dx,dy);if(d<.5)return;const g=vc.getContext('2d'),up=-dy/d,base=COLS[col],c=up>0?lighten(base,.18+up*.22):darken(base,.1-up*.25);
    g.lineCap='round';g.strokeStyle=c;g.lineWidth=58;g.globalAlpha=.3;g.beginPath();g.moveTo(p.px,p.py);g.lineTo(p.x,p.y);g.stroke();g.lineWidth=78;g.globalAlpha=.1;g.stroke();g.globalAlpha=1;
    sh.set(p.sp,p.x);acc+=d;while(acc>=60){acc-=60;award(1,p.x,p.y);}}
  const me={init(){fresh();fiberTex();sh=A.cont('lowpass',500,1600,.8,.18,.3);},resize(){fresh();},move(p){brushStroke(p);},
    draw(){ctx.drawImage(vc,0,0,VW(),VH());if(!pat)pat=ctx.createPattern(fiber,'repeat');ctx.fillStyle=pat;ctx.fillRect(0,0,VW(),VH());hud('🧶 '+col);},
    tools:[{l:()=>'🎨 '+col,f(){const k=Object.keys(COLS);col=k[(k.indexOf(col)+1)%k.length];fresh();}},{l:'🔄 Lisser',f(){fresh();SFX.whoosh(VW()/2);}}]};
  return me;
}});

/* ===== 18. Film protecteur ===== */
A.register('film',{e:'📱',n:'Film protecteur',d:'Décolle le film plastique de l’écran.',lvl:9,hint:'Attrape un coin et tire pour décoller le film',create(){
  let dev,wall,film,peel=null,done=false,rev=0,wp=0,scr,acc=0,ut=0;
  function newDevice(){const m=Math.min(VW()*.1,40);dev={x:m,y:70,w:VW()-2*m,h:VH()-150};done=false;rev=0;peel=null;wp=(wp+1)%5;
    wall=mk(dev.w,dev.h);const g=wall.getContext('2d'),W=[['#ff9a9e','#fecfef'],['#667eea','#764ba2'],['#f6d365','#fda085'],['#43cea2','#185a9d'],['#30cfd0','#330867']][wp],gr=g.createLinearGradient(0,0,dev.w,dev.h);gr.addColorStop(0,W[0]);gr.addColorStop(1,W[1]);g.fillStyle=gr;g.fillRect(0,0,dev.w,dev.h);
    for(let i=0;i<14;i++){g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.arc(rnd(0,dev.w),rnd(0,dev.h),rnd(20,90),0,TAU);g.fill();}
    const d=new Date();g.fillStyle='rgba(255,255,255,.9)';g.font='700 46px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'),dev.w/2,dev.h*.18);
    for(let j=0;j<4;j++)for(let i=0;i<4;i++){g.fillStyle=`hsla(${(i*47+j*83)%360},70%,60%,.9)`;rrc(g,dev.w*.1+i*dev.w*.21,dev.h*.35+j*dev.h*.14,dev.w*.15,dev.w*.15,dev.w*.04);g.fill();}
    film=mk(dev.w,dev.h);const k=film.getContext('2d');k.fillStyle='rgba(170,215,245,.42)';k.fillRect(0,0,dev.w,dev.h);const sg=k.createLinearGradient(0,0,dev.w,dev.h);[[0,.45],[.35,0],[.55,.3],[.7,0],[1,.35]].forEach(([s,a])=>sg.addColorStop(s,`rgba(255,255,255,${a})`));k.fillStyle=sg;k.fillRect(0,0,dev.w,dev.h);
    for(let i=0;i<30;i++){k.fillStyle='rgba(255,255,255,.5)';k.beginPath();k.arc(rnd(0,dev.w),rnd(0,dev.h),rnd(1,3),0,TAU);k.fill();}
    k.fillStyle='rgba(60,90,120,.6)';k.font='700 16px system-ui,sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText('PEEL · DÉCOLLER',dev.w/2,dev.h/2);
    k.fillStyle='#ff5c7a';rrc(k,dev.w-74,-2,74,40,8);k.fill();k.fillStyle='#fff';k.font='800 13px system-ui,sans-serif';k.fillText('TIRE ↙',dev.w-37,19);}
  const corners=()=>[[dev.x,dev.y],[dev.x+dev.w,dev.y],[dev.x,dev.y+dev.h],[dev.x+dev.w,dev.y+dev.h]];
  const diag=()=>Math.hypot(dev.w,dev.h);
  function upd(p){const[cx,cy]=peel.c,dx=p.x-cx,dy=p.y-cy,L=Math.hypot(dx,dy);if(L<4)return;peel.d=[dx/L,dy/L];const nL=clamp(L,0,diag()*2.05),prog=nL/(diag()*2);
    if(prog>peel.prog){acc+=(prog-peel.prog)*diag()*2;while(acc>=40){acc-=40;award(1,p.x,p.y);}}peel.prog=prog;peel.L=nL;scr.set(p.sp,p.x);
    if(prog>=.98&&!done){done=true;SFX.shine(VW()/2);award(25,VW()/2,VH()/2,0);vib(30);ut=setTimeout(()=>{if(A.act===me)newDevice();},2200);}}
  function halfPlane(qx,qy,dx,dy,side,R){const nx=-dy,ny=dx;ctx.beginPath();ctx.moveTo(qx-nx*R,qy-ny*R);ctx.lineTo(qx+nx*R,qy+ny*R);ctx.lineTo(qx+nx*R+dx*side*R,qy+ny*R+dy*side*R);ctx.lineTo(qx-nx*R+dx*side*R,qy-ny*R+dy*side*R);ctx.closePath();}
  const me={init(){newDevice();scr=A.cont('bandpass',1800,4500,1.2,.26,.15);},resize(){newDevice();},destroy(){clearTimeout(ut);},
    down(p){if(done)return;if(!peel){let best=null,bd=1e9;for(const c of corners()){const d=Math.hypot(c[0]-p.x,c[1]-p.y);if(d<bd){bd=d;best=c;}}peel={c:best,d:[0,0],L:0,prog:0};}upd(p);},
    move(p){if(!done&&peel)upd(p);},
    update(dt){if(done)rev=Math.min(1,rev+dt*2);},
    draw(){bgSoft('#1c1b2e','#0d0d17');ctx.fillStyle='rgba(0,0,0,.4)';rr(dev.x-10,dev.y-2,dev.w+20,dev.h+20,34);ctx.fill();ctx.fillStyle='#1e2230';rr(dev.x-10,dev.y-10,dev.w+20,dev.h+20,34);ctx.fill();
      ctx.save();rr(dev.x,dev.y,dev.w,dev.h,26);ctx.clip();ctx.drawImage(wall,dev.x,dev.y,dev.w,dev.h);
      if(rev<1){ctx.globalAlpha=1-rev;
        if(!peel||peel.L<4)ctx.drawImage(film,dev.x,dev.y,dev.w,dev.h);
        else{const[cx,cy]=peel.c,[dx,dy]=peel.d,half=peel.L/2,qx=cx+dx*half,qy=cy+dy*half,R=diag()*3;
          ctx.save();halfPlane(qx,qy,dx,dy,1,R);ctx.clip();ctx.drawImage(film,dev.x,dev.y,dev.w,dev.h);ctx.restore();
          const qd=qx*dx+qy*dy;ctx.save();ctx.transform(1-2*dx*dx,-2*dx*dy,-2*dx*dy,1-2*dy*dy,2*qd*dx,2*qd*dy);halfPlane(qx,qy,dx,dy,-1,R);ctx.clip();ctx.globalAlpha=(1-rev)*.85;ctx.drawImage(film,dev.x,dev.y,dev.w,dev.h);ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(dev.x,dev.y,dev.w,dev.h);ctx.restore();
          ctx.globalAlpha=1-rev;const nx=-dy,ny=dx;ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(qx-nx*R,qy-ny*R);ctx.lineTo(qx+nx*R,qy+ny*R);ctx.stroke();
          const sg=ctx.createLinearGradient(qx,qy,qx+dx*22,qy+dy*22);sg.addColorStop(0,'rgba(0,30,60,.35)');sg.addColorStop(1,'rgba(0,30,60,0)');ctx.save();halfPlane(qx,qy,dx,dy,1,R);ctx.clip();ctx.fillStyle=sg;ctx.fillRect(dev.x,dev.y,dev.w,dev.h);ctx.restore();}
        ctx.globalAlpha=1;}
      ctx.restore();ctx.fillStyle='#0a0c12';ctx.beginPath();ctx.arc(dev.x+dev.w/2,dev.y+14,6,0,TAU);ctx.fill();
      hud(done?'✨ Nickel !':`📱 ${Math.round((peel?Math.min(1,peel.prog):0)*100)} %`);},
    tools:[{l:'📱 Nouveau film',f(){clearTimeout(ut);newDevice();SFX.whoosh(VW()/2);}}]};
  return me;
}});

/* ===== 19. Perles ===== */
A.register('beads',{e:'🔮',n:'Perles',d:'Un bol de perles à brasser du bout du doigt.',lvl:10,hint:'Glisse ton doigt dans le bol',create(){
  const PALS={mix:['#ff5c7a','#ffb347','#ffe66d','#6bd98a','#4cc9f0','#b388ff'],pastel:['#ffc6d9','#ffe0b3','#fff5b0','#c9f2d5','#c6ecff','#e0d0ff'],perle:['#f7f3ee','#ece6dd','#fdfbf7','#e8e2d8','#f3eee6','#ffffff']};
  let pal='mix',B=[],cx=0,cy=0,R=100;const r=8;let spr={},lastClick=0,acc=0;const grid=new Map();
  function sprite(c){if(spr[c])return spr[c];const s=r*2+4,cv2=mk(s,s),g=cv2.getContext('2d'),gr=g.createRadialGradient(s/2-r*.35,s/2-r*.4,r*.1,s/2,s/2,r);gr.addColorStop(0,lighten(c,.6));gr.addColorStop(.5,c);gr.addColorStop(1,darken(c,.35));g.fillStyle=gr;g.beginPath();g.arc(s/2,s/2,r,0,TAU);g.fill();return spr[c]=cv2;}
  function build(n){cx=VW()/2;cy=VH()*.52;R=Math.min(VW(),VH()-160)*.46;B=[];spr={};add(n);}
  function add(n){const P=PALS[pal];for(let i=0;i<n&&B.length<520;i++){const a=rnd(0,TAU),d=Math.sqrt(Math.random())*(R-r-2);B.push({x:cx+Math.cos(a)*d,y:cy+Math.sin(a)*d*.6-R*.3,vx:0,vy:0,c:P[(B.length)%P.length]});}}
  function click(x,v){const t0=performance.now();if(t0-lastClick<28||!ready())return;lastClick=t0;const t=now(),o=out(x,.25),k=clamp(v/400,.2,1);tone(o,'sine',rnd(1800,2600),t,.001,.03,.18*k,900);hiss(o,t,.001,.012,.2*k,'highpass',3500,1);}
  function step(h){for(const b of B){b.vy+=1500*h;b.x+=b.vx*h;b.y+=b.vy*h;}
    grid.clear();const cs=r*2.1;for(const b of B){const k=((b.x/cs)|0)*4096+((b.y/cs)|0);let c=grid.get(k);if(!c)grid.set(k,c=[]);c.push(b);}
    for(const b of B){const gx=(b.x/cs)|0,gy=(b.y/cs)|0;for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){const c=grid.get((gx+ox)*4096+(gy+oy));if(!c)continue;
      for(const o of c){if(o===b||o.x<b.x||(o.x===b.x&&o.y<=b.y))continue;const dx=o.x-b.x,dy=o.y-b.y,d2=dx*dx+dy*dy,min=r*2;if(d2>=min*min||d2<1e-9)continue;
        const d=Math.sqrt(d2),nx=dx/d,ny=dy/d,ov=(min-d)/2;b.x-=nx*ov;b.y-=ny*ov;o.x+=nx*ov;o.y+=ny*ov;
        const vn=(o.vx-b.vx)*nx+(o.vy-b.vy)*ny;if(vn<0){const j=-1.25*vn/2;b.vx-=j*nx;b.vy-=j*ny;o.vx+=j*nx;o.vy+=j*ny;if(-vn>150)click(b.x,-vn);}}}}
    const tnow=performance.now();
    for(const b of B){const dx=b.x-cx,dy=b.y-cy,d=Math.hypot(dx,dy),lim=R-r;if(d>lim){const nx=dx/d,ny=dy/d;b.x=cx+nx*lim;b.y=cy+ny*lim;const vn=b.vx*nx+b.vy*ny;if(vn>0){b.vx-=1.4*vn*nx;b.vy-=1.4*vn*ny;if(vn>200)click(b.x,vn);}}
      for(const[,p]of ptrs){const px=b.x-p.x,py=b.y-p.y,pd=Math.hypot(px,py),pr=26+r;if(pd<pr&&pd>1e-6){const nx=px/pd,ny=py/pd;b.x=p.x+nx*pr;b.y=p.y+ny*pr;const mv=tnow-p.t<60,pvx=mv?(p.x-p.px)*60:0,pvy=mv?(p.y-p.py)*60:0;b.vx=b.vx*.5+pvx*.6+nx*60;b.vy=b.vy*.5+pvy*.6+ny*60;}}
      b.vx*=.995;b.vy*=.995;}}
  const me={init(){build(220);},resize(){build(220);},
    move(p){if(Math.hypot(p.x-cx,p.y-cy)<R){acc+=Math.hypot(p.x-p.px,p.y-p.py);while(acc>=60){acc-=60;award(1,p.x,p.y);}}},
    update(dt){const n=Math.max(1,Math.round(dt*120)),h=dt/n;for(let i=0;i<n;i++)step(h);},
    draw(){bgSoft('#f7f1ea','#e7dccd');ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(cx,cy+R*.1,R*1.05,R*1.02,0,0,TAU);ctx.fill();
      const g=ctx.createRadialGradient(cx,cy-R*.3,R*.2,cx,cy,R);g.addColorStop(0,'#fff');g.addColorStop(1,'#d9d2c6');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.fill();
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.clip();const s=r*2+4;for(const b of B)ctx.drawImage(sprite(b.c),b.x-s/2,b.y-s/2,s,s);ctx.restore();
      ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=6;ctx.beginPath();ctx.arc(cx,cy,R+2,0,TAU);ctx.stroke();hud(`🔮 ${B.length} perles`);},
    tools:[{l:()=>'🎨 '+pal,f(){const k=Object.keys(PALS);pal=k[(k.indexOf(pal)+1)%k.length];build(B.length);}},{l:'➕ Perles',f(){add(60);SFX.whoosh(VW()/2);}},{l:'🌀 Secouer',f(){for(const b of B){b.vx+=rnd(-500,500);b.vy-=rnd(200,700);}}}]};
  return me;
}});

/* ===== 20. Dominos ===== */
A.register('dominos',{e:'🁣',n:'Dominos',d:'Pose une file, touche le premier, écoute la cascade.',lvl:11,hint:'Glisse pour poser des dominos, puis touche-en un',create(){
  const COLS=['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9f1c'],SP=24,W=22,TH=8,H=44;let D=[],ci=0,lastPos=null,pend=[],last=new Map();
  function place(x,y,a){if(D.length>=400)return;D.push({x,y,a,f:0,st:0,dir:1,c:COLS[ci]});}
  function clack(x){if(!ready())return;const t=now(),o=out(x,.25);tone(o,'sine',rnd(380,460),t,.001,.045,.45,180);hiss(o,t,.001,.02,.35,'lowpass',2200,1);tone(o,'triangle',rnd(1400,1900),t,.001,.015,.1);}
  function topple(i,dir){const d=D[i];if(!d||d.st)return;d.st=1;d.dir=dir;pend.push({i,dir,t:.075});}
  const me={
    down(p){last.set(p.id,{moved:0});lastPos=null;},
    move(p){const l=last.get(p.id);if(!l)return;l.moved+=Math.hypot(p.x-p.px,p.y-p.py);if(!lastPos){lastPos={x:p.x,y:p.y};return;}
      const dx=p.x-lastPos.x,dy=p.y-lastPos.y,d=Math.hypot(dx,dy);
      if(d>=SP){if(!D.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<SP*.8)){place(p.x,p.y,Math.atan2(dy,dx));if(ready()){const t=now(),o=out(p.x,.2);tone(o,'sine',260,t,.001,.03,.25,160);}}lastPos={x:p.x,y:p.y};}},
    up(p){const l=last.get(p.id);last.delete(p.id);if(!l||l.moved>12)return;let best=-1,bd=30;D.forEach((d,i)=>{const dd=Math.hypot(d.x-p.x,d.y-p.y);if(dd<bd){bd=dd;best=i;}});if(best>=0){topple(best,1);topple(best,-1);}},
    update(dt){for(let i=pend.length-1;i>=0;i--){const q=pend[i];q.t-=dt;if(q.t<=0){pend.splice(i,1);const d=D[q.i];clack(d.x);vib(5);award(1,d.x,d.y);
        const j=q.i+q.dir,n=D[j];if(n&&!n.st&&Math.hypot(n.x-d.x,n.y-d.y)<H*1.15)topple(j,q.dir);}}
      for(const d of D)if(d.st)d.f=Math.min(1,d.f+dt*7);},
    draw(){bgSoft('#efe7d8','#d9ccb6');ctx.strokeStyle='rgba(120,90,50,.12)';ctx.lineWidth=1;for(let x=0;x<VW();x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,VH());ctx.stroke();}for(let y=0;y<VH();y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(VW(),y);ctx.stroke();}
      for(const d of D){ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.a);const f=d.f,len=TH+(H-TH)*f,off=d.dir*(len-TH)/2;
        ctx.fillStyle='rgba(0,0,0,.22)';rr(-TH/2+off+3,-W/2+4,len,W,3);ctx.fill();ctx.fillStyle=f<1?d.c:lighten(d.c,.25);rr(-TH/2+off,-W/2,len,W,3);ctx.fill();
        if(f>=1){ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(off-1,-W/2+3,2,W-6);for(const[px,py]of[[-12,-6],[-12,6],[12,-6],[12,6],[-6,0],[6,0]]){ctx.beginPath();ctx.arc(off+px,py,2,0,TAU);ctx.fill();}}
        else{ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(-TH/2+off,-W/2,len,2);}ctx.restore();}
      hud(`🁣 ${D.length} · ${D.filter(d=>d.f>=1).length} tombés`);},
    tools:[{l:'🔁 Relever',f(){for(const d of D){d.st=0;d.f=0;}pend=[];SFX.whoosh(VW()/2);}},{l:'🎨 Couleur',f(){ci=(ci+1)%COLS.length;}},
      {l:'🌀 Spirale',f(){D=[];pend=[];const cx=VW()/2,cy=VH()*.5;for(let t=0;t<TAU*3.2;t+=.002){const rad=30+t*14,x=cx+Math.cos(t)*rad,y=cy+Math.sin(t)*rad,q=D[D.length-1];if((!q||Math.hypot(q.x-x,q.y-y)>=SP)&&y>60&&y<VH()-70&&x>10&&x<VW()-10)place(x,y,t+Math.PI/2);}}},
      {l:'🗑️ Enlever',f(){D=[];pend=[];}}]};
  return me;
}});
})();
