/* ASMR Zen : activités 6 à 10 */
'use strict';
(()=>{
const A=ASMR,{SFX,award,spawnP,mk,mk0,rr,rrc,lighten,darken,shade,bgSoft,hud,drawKnife,vib,clamp,rnd,pick,TAU}=A;
const ctx=A.ctx,G=A.G,ptrs=A.ptrs;
const VW=()=>A.VW,VH=()=>A.VH;

/* ===== 6. Sable cinétique ===== */
A.register('sand',{e:'🏖️',n:'Sable cinétique',d:"Tranche le bloc, regarde-le s'effriter.",lvl:4,hint:'Glisse de haut en bas à travers le bloc pour le trancher',create(){
  const COLS=['#e8c48c','#f3a6bb','#9fd8c8','#c6b3ff','#f6d573','#a9d9ff'];let ci=0,blk=null,grains=[],pile,heights,floorY=0,tex,pat=null,SH=[],cuts=new Map(),knives=new Map();
  function texture(col){const c=mk0(64,64),g=c.getContext('2d');g.fillStyle=col;g.fillRect(0,0,64,64);
    for(let k=0;k<900;k++){g.fillStyle=Math.random()<.5?'rgba(255,255,255,.18)':'rgba(0,0,0,.12)';g.fillRect(Math.random()*64,Math.random()*64,1.2,1.2);}return c;}
  function newBlock(keep){const col=COLS[ci%COLS.length],w=Math.min(VW()*.74,420),h=Math.min(VH()*.26,200);blk={x:(VW()-w)/2,y:VH()*.3,w,h,col,drop:-80};
    tex=texture(col);pat=null;SH=[-.18,-.09,0,.08,.16].map(k=>shade(col,k));if(!keep)clearPile();}
  function clearPile(){pile=mk(VW(),VH());heights=new Float32Array(VW()+2);grains=[];}
  function slice(cx){if(!blk)return;cx=clamp(cx,blk.x,blk.x+blk.w);const lw=cx-blk.x,rw=blk.x+blk.w-cx;if(lw<5||rw<5)return;
    const left=lw<=rw,sx=left?blk.x:cx,sw=left?lw:rw,n=Math.min(1200,Math.round(sw*blk.h/9));
    for(let k=0;k<n;k++)grains.push({x:sx+Math.random()*sw,y:blk.y+Math.random()*blk.h,vx:(left?-1:1)*rnd(10,110)+rnd(-30,30),vy:rnd(-40,40),c:Math.random()*5|0});
    if(left)blk.x=cx;blk.w-=sw;SFX.crunch(cx);vib(14);award(5,cx,blk.y-10);
    if(blk.w<28){blk=null;setTimeout(()=>{if(A.act!==me)return;ci++;newBlock(true);SFX.whoosh(VW()/2);},500);}}
  const me={init(){floorY=VH()-34;newBlock(false);},resize(){floorY=VH()-34;newBlock(false);},
    down(p){knives.set(p.id,p);cuts.delete(p.id);},
    move(p){knives.set(p.id,p);if(!blk)return;const top=blk.y,bot=top+blk.h,inX=p.x>=blk.x-12&&p.x<=blk.x+blk.w+12;
      if(inX){if(p.py<top&&p.y>=top)cuts.set(p.id,{x:p.x,dir:1});else if(p.py>bot&&p.y<=bot)cuts.set(p.id,{x:p.x,dir:-1});}
      const c=cuts.get(p.id);if(c&&((c.dir>0&&p.y>=top+blk.h*.55)||(c.dir<0&&p.y<=bot-blk.h*.55))){cuts.delete(p.id);slice(c.x);}},
    up(p){knives.delete(p.id);cuts.delete(p.id);},
    update(dt){if(blk&&blk.drop<0)blk.drop=Math.min(0,blk.drop+dt*400);const pg=pile.getContext('2d'),W=VW();
      for(let i=grains.length-1;i>=0;i--){const g=grains[i];g.vy+=1700*dt;g.vx*=Math.pow(.3,dt);g.x+=g.vx*dt;g.y+=g.vy*dt;let c=Math.round(g.x);
        if(c<0||c>W){grains.splice(i,1);continue;}
        if(g.y>=floorY-heights[c]){let s=0;while(s++<40){const l=c>0?heights[c-1]:1e9,r=c<W?heights[c+1]:1e9,h=heights[c];if(l<h-3&&l<=r)c--;else if(r<h-3)c++;else break;}
          heights[c]+=2.4;pg.fillStyle=SH[g.c];pg.fillRect(c-1.2,floorY-heights[c]-1.2,2.4,2.4);grains.splice(i,1);}}},
    draw(){bgSoft('#fdf8f1','#eadfd0');ctx.fillStyle='#d9c7ad';ctx.fillRect(0,floorY,VW(),VH()-floorY);ctx.fillStyle='rgba(0,0,0,.08)';ctx.fillRect(0,floorY,VW(),3);
      if(blk){const y=blk.y+blk.drop;ctx.fillStyle='rgba(0,0,0,.14)';rr(blk.x-6,blk.y+blk.h+4,blk.w+12,8,4);ctx.fill();ctx.fillStyle='#fff';rr(blk.x-8,blk.y+blk.h,blk.w+16,6,3);ctx.fill();
        if(!pat)pat=ctx.createPattern(tex,'repeat');ctx.fillStyle=pat;rr(blk.x,y,blk.w,blk.h,6);ctx.fill();
        const gr=ctx.createLinearGradient(0,y,0,y+blk.h);gr.addColorStop(0,'rgba(255,255,255,.35)');gr.addColorStop(.25,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(0,0,0,.18)');ctx.fillStyle=gr;rr(blk.x,y,blk.w,blk.h,6);ctx.fill();}
      ctx.drawImage(pile,0,0,VW(),VH());for(const g of grains){ctx.fillStyle=SH[g.c];ctx.fillRect(g.x-1.3,g.y-1.3,2.6,2.6);}
      for(const[,p]of knives)drawKnife(p.x,p.y);hud(blk?`📏 ${Math.round(blk.w)} px`:'…');},
    tools:[{l:'🧱 Nouveau bloc',f(){newBlock(true);SFX.whoosh(VW()/2);}},{l:'🎨 Couleur',f(){ci++;newBlock(true);}},{l:'🧹 Balayer',f(){clearPile();SFX.whoosh(VW()/2);}}]};
  return me;
}});

/* ===== 7. Carte à gratter ===== */
A.register('scratch',{e:'🎟️',n:'Carte à gratter',d:'Gratte pour révéler ta récompense.',lvl:5,hint:'Gratte la surface argentée',create(){
  let under,cover,card,prog=0,done=false,rev=0,flakes=[],prize=0,scr,acc=0,brush=22,sampleT=0;
  function newCard(){card={x:16,y:64,w:VW()-32,h:VH()-150};done=false;rev=0;prog=0;flakes=[];prize=pick([10,15,20,25,30,40,50]);
    under=mk(card.w,card.h);const g=under.getContext('2d'),[c1,c2]=pick([['#ff9a9e','#fad0c4'],['#a18cd1','#fbc2eb'],['#84fab0','#8fd3f4'],['#fccb90','#d57eeb'],['#f6d365','#fda085'],['#43e97b','#38f9d7']]);
    const gr=g.createLinearGradient(0,0,card.w,card.h);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.fillRect(0,0,card.w,card.h);
    const em=pick(['🌸','⭐','🍀','🐚','🌙','🍓','🦋','🌈','🪷','🍬']);g.font='28px serif';g.textAlign='center';g.textBaseline='middle';g.globalAlpha=.5;
    for(let y=20;y<card.h;y+=58)for(let x=20;x<card.w;x+=58)g.fillText(em,x+((y/58|0)%2?29:0),y);g.globalAlpha=1;
    g.fillStyle='rgba(255,255,255,.85)';rrc(g,card.w/2-110,card.h/2-60,220,120,24);g.fill();g.fillStyle='#3b2a5a';g.font='800 44px system-ui,sans-serif';g.fillText(`+${prize} 🪷`,card.w/2,card.h/2-8);
    g.font='700 16px system-ui,sans-serif';g.fillStyle='#6b5a8a';g.fillText('Bravo !',card.w/2,card.h/2+34);
    cover=mk(card.w,card.h);const k=cover.getContext('2d'),cg=k.createLinearGradient(0,0,card.w,card.h);[['0','#c8ccd4'],['.3','#eceef2'],['.5','#b9bdc6'],['.75','#e3e5ea'],['1','#aeb3bd']].forEach(([s,c])=>cg.addColorStop(+s,c));
    k.fillStyle=cg;k.fillRect(0,0,card.w,card.h);k.fillStyle='rgba(255,255,255,.35)';k.font='700 22px system-ui,sans-serif';k.textAlign='center';k.textBaseline='middle';
    for(let y=30;y<card.h;y+=70)for(let x=50;x<card.w;x+=140)k.fillText('GRATTE',x,y);k.fillStyle='rgba(60,65,80,.8)';k.font='800 28px system-ui,sans-serif';k.fillText('🪙 Gratte ici 🪙',card.w/2,card.h/2);}
  function scratch(p){if(done)return;const k=cover.getContext('2d');k.globalCompositeOperation='destination-out';k.lineCap='round';k.lineJoin='round';k.lineWidth=brush*2;k.strokeStyle='#000';
    k.beginPath();k.moveTo(p.px-card.x,p.py-card.y);k.lineTo(p.x-card.x,p.y-card.y);k.stroke();k.globalCompositeOperation='source-over';
    const d=Math.hypot(p.x-p.px,p.y-p.py);scr.set(p.sp,p.x);acc+=d;while(acc>=50){acc-=50;award(1,p.x,p.y);}
    if(G.set.fx&&d>1&&flakes.length<300)for(let i=0;i<2;i++)flakes.push({x:p.x+rnd(-brush,brush),y:p.y+rnd(-brush,brush),vx:rnd(-40,40),vy:rnd(-20,60),a:1,s:rnd(2,4)});}
  function measure(){const s=mk0(40,60),g=s.getContext('2d');g.drawImage(cover,0,0,40,60);const d=g.getImageData(0,0,40,60).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]<120)n++;prog=n/2400;
    if(prog>=.8&&!done){done=true;SFX.shine(VW()/2);award(prize,VW()/2,VH()/2,0);vib(30);
      if(G.set.fx)for(let k=0;k<60;k++)spawnP(VW()/2,VH()/2,rnd(-300,300),rnd(-380,80),`hsl(${rnd(30,60)|0},95%,70%)`,rnd(.8,1.5),rnd(2,4),.8);
      setTimeout(()=>{if(A.act===me&&done)newCard();},2800);}}
  const me={init(){newCard();scr=A.cont('bandpass',2200,5200,1.4,.28,.15);},resize(){newCard();},move(p){scratch(p);},
    update(dt){if(done)rev=Math.min(1,rev+dt*1.6);for(let i=flakes.length-1;i>=0;i--){const f=flakes[i];f.vy+=900*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.a-=dt*1.4;if(f.a<=0)flakes.splice(i,1);}
      const now=performance.now();if(now-sampleT>250&&ptrs.size&&!done){sampleT=now;measure();}},
    draw(){bgSoft('#2a2250','#121a2e');ctx.fillStyle='rgba(0,0,0,.3)';rr(card.x+4,card.y+10,card.w,card.h,22);ctx.fill();
      ctx.save();rr(card.x,card.y,card.w,card.h,22);ctx.clip();ctx.drawImage(under,card.x,card.y,card.w,card.h);ctx.globalAlpha=1-rev;ctx.drawImage(cover,card.x,card.y,card.w,card.h);ctx.globalAlpha=1;ctx.restore();
      ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;rr(card.x,card.y,card.w,card.h,22);ctx.stroke();
      for(const f of flakes){ctx.fillStyle=`rgba(200,204,212,${f.a})`;ctx.fillRect(f.x,f.y,f.s,f.s);}hud(`${Math.round(prog*100)} %`);},
    tools:[{l:'🎟️ Nouvelle carte',f(){newCard();SFX.whoosh(VW()/2);}},{l:()=>brush>25?'🪙 Pièce : grosse':'🪙 Pièce : petite',f(){brush=brush>25?18:34;}}]};
  return me;
}});

/* ===== 8. Slime ===== */
A.register('slime',{e:'🫠',n:'Slime',d:'Presse, étire, écoute le squish.',lvl:6,hint:'Appuie et glisse dans le slime',create(){
  const TH={rose:['#ff7eb6','#ffb3d9'],menthe:['#5fe3c0','#b8fff0'],bleu:['#5aa9ff','#b9dcff'],galaxie:['#6b4cff','#c04cff'],miel:['#ffb84d','#ffe0a3']};
  let theme='rose',glitter=true;const N=44;let P=[],cx=0,cy=0,R=80,stars=[],sq,acc=0;const K1=70,D=7,K2=260,h=1/180;
  function build(){cx=VW()/2;cy=VH()*.5;R=Math.min(VW(),VH())*.3;P=[];for(let i=0;i<N;i++){const a=i/N*TAU;P.push({ox:Math.cos(a)*R,oy:Math.sin(a)*R*.92,x:cx+Math.cos(a)*R,y:cy+Math.sin(a)*R*.92,vx:0,vy:0});}
    stars=[];for(let i=0;i<40;i++)stars.push({a:rnd(0,TAU),d:Math.sqrt(Math.random())*.85,s:rnd(1,2.6),ph:rnd(0,TAU)});}
  function step(){const rest=TAU*R/N*.95;
    for(let i=0;i<N;i++){const p=P[i];let ax=(cx+p.ox-p.x)*K1-p.vx*D,ay=(cy+p.oy-p.y)*K1-p.vy*D;
      for(const q of[P[(i+N-1)%N],P[(i+1)%N]]){const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)||1e-6,f=(d-rest)/d*K2;ax+=dx*f;ay+=dy*f;}p.vx+=ax*h;p.vy+=ay*h;}
    for(const p of P){p.x+=p.vx*h;p.y+=p.vy*h;}
    for(const[,q]of ptrs){const PR=46;for(const p of P){const dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);if(d<PR){const k=(PR-d)/(d||1e-6);p.x+=dx*k;p.y+=dy*k;p.vx+=dx*k*20;p.vy+=dy*k*20;}}}}
  const inside=(x,y)=>Math.hypot(x-cx,y-cy)<R*.95;
  function path(){ctx.beginPath();ctx.moveTo((P[0].x+P[1].x)/2,(P[0].y+P[1].y)/2);for(let i=1;i<=N;i++){const p=P[i%N],q=P[(i+1)%N];ctx.quadraticCurveTo(p.x,p.y,(p.x+q.x)/2,(p.y+q.y)/2);}ctx.closePath();}
  const me={init(){build();sq=A.cont('lowpass',250,1400,5,.3,.3);},resize(){build();},
    down(p){if(inside(p.x,p.y)){SFX.squish(p.x,1);vib(12);award(1,p.x,p.y);}},
    move(p){if(inside(p.px,p.py)){const dx=p.x-p.px,dy=p.y-p.py;cx=clamp(cx+dx*.55,R*.7,VW()-R*.7);cy=clamp(cy+dy*.55,70+R*.7,VH()-80-R*.7);acc+=Math.hypot(dx,dy);while(acc>=120){acc-=120;award(1,p.x,p.y);}}},
    update(){for(let s=0;s<3;s++)step();let e=0;for(const p of P)e+=Math.abs(p.vx)+Math.abs(p.vy);e/=N;if(e>30)sq.set(clamp((e-30)*4,0,1000),cx);},
    draw(){const[c1,c2]=TH[theme];bgSoft('#fff8fb','#e9edff');ctx.fillStyle='rgba(60,40,90,.14)';ctx.beginPath();ctx.ellipse(cx,cy+R*1.02,R*.95,R*.22,0,0,TAU);ctx.fill();
      path();const gr=ctx.createRadialGradient(cx-R*.35,cy-R*.4,R*.1,cx,cy,R*1.2);gr.addColorStop(0,c2);gr.addColorStop(.55,c1);gr.addColorStop(1,darken(c1,.25));ctx.fillStyle=gr;ctx.fill();
      ctx.save();path();ctx.clip();
      if(glitter){const t=performance.now()/1000;for(const s of stars){const x=cx+Math.cos(s.a)*s.d*R*1.1,y=cy+Math.sin(s.a)*s.d*R;ctx.fillStyle=`rgba(255,255,255,${.4+.6*Math.abs(Math.sin(t*2+s.ph))})`;ctx.beginPath();ctx.arc(x,y,s.s,0,TAU);ctx.fill();}}
      ctx.fillStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.ellipse(cx-R*.35,cy-R*.45,R*.32,R*.16,-.5,0,TAU);ctx.fill();ctx.restore();
      path();ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=3;ctx.stroke();hud('🫠 '+theme);},
    tools:[{l:()=>'🎨 '+theme,f(){const k=Object.keys(TH);theme=k[(k.indexOf(theme)+1)%k.length];}},{l:()=>glitter?'✨ Paillettes : on':'✨ Paillettes : off',f(){glitter=!glitter;}},{l:'🔄 Reformer',f(){build();SFX.squish(VW()/2,1);}}]};
  return me;
}});

/* ===== 9. Tranches ===== */
A.register('slices',{e:'🔪',n:'Tranches',d:'Coupe concombre, savon, gelée… en fines tranches.',lvl:7,hint:"Glisse de haut en bas à travers l'objet pour couper",create(){
  const TYPES=[{n:'Concombre',c:'#3f8f3a',i:'#d8eeb0',s:'crisp',h:64,seeds:true},{n:'Savon',c:'#f4b6cf',i:'#fde3ee',s:'soft',h:66},{n:'Sable',c:'#d9b57c',i:'#e7cb99',s:'crunch',h:76},
    {n:'Gelée',c:'#ff4f86',i:'#ff8fb3',s:'wet',h:70,wob:true},{n:'Craie',c:'#f3f3f5',i:'#ffffff',s:'chalk',h:52},{n:'Mousse',c:'#ffd166',i:'#ffe9a8',s:'soft',h:70},{n:'Carotte',c:'#ff8c2e',i:'#ffb46b',s:'crisp',h:56}];
  let ti=0,obj=null,S=[],boardY=0,count=0,force=null,last=new Map(),knives=new Map();
  function next(){const t=force||TYPES[(ti++)%TYPES.length],w=Math.min(VW()*.8,460);obj={t,x:VW()+30,w,y:boardY-t.h/2-6,h:t.h,st:'in',wob:0};}
  const target=()=>(VW()-obj.w)/2;
  function slice(cx){if(!obj||obj.st!=='ready')return;cx=clamp(cx,obj.x,obj.x+obj.w);let lw=cx-obj.x;if(lw<6)return;if(obj.w-lw<6)lw=obj.w;
    S.push({x:obj.x,y:obj.y,w:lw,h:obj.h,t:obj.t,vx:-rnd(80,200),vy:-rnd(120,260),vr:-rnd(2,5),r:0,a:1,life:1.6});obj.x+=lw;obj.w-=lw;count++;
    SFX.slice(cx,obj.t.s);vib(12);award(3,cx,obj.y-obj.h);
    if(obj.t.s==='crunch'&&G.set.fx)for(let k=0;k<40;k++)spawnP(cx,obj.y+rnd(-obj.h/2,obj.h/2),rnd(-120,120),rnd(-80,80),obj.t.i,rnd(.5,1),2.5,1);
    if(obj.t.wob)obj.wob=1;if(obj.w<24)obj.st='out';}
  function piece(x,y,w,h,t,rot,a,wob){ctx.save();ctx.globalAlpha=a;ctx.translate(x+w/2,y);ctx.rotate(rot);if(wob)ctx.scale(1+Math.sin(wob*20)*.05*wob,1-Math.sin(wob*20)*.05*wob);
    const rx=-w/2,ry=-h/2,g=ctx.createLinearGradient(0,ry,0,ry+h);g.addColorStop(0,lighten(t.c,.25));g.addColorStop(.5,t.c);g.addColorStop(1,darken(t.c,.3));ctx.fillStyle=g;rr(rx,ry,w,h,h*.35);ctx.fill();
    ctx.fillStyle=t.i;ctx.beginPath();ctx.ellipse(rx+h*.18,0,h*.18,h/2*.96,0,0,TAU);ctx.fill();
    if(t.seeds){ctx.fillStyle='rgba(255,255,255,.7)';for(let k=0;k<5;k++){const an=k/5*TAU;ctx.beginPath();ctx.ellipse(rx+h*.18+Math.cos(an)*h*.06,Math.sin(an)*h*.18,2,4,an,0,TAU);ctx.fill();}}ctx.restore();}
  const me={init(){boardY=VH()*.55;next();},resize(){boardY=VH()*.55;next();},
    down(p){knives.set(p.id,p);},
    move(p){knives.set(p.id,p);if(!obj||obj.st!=='ready')return;const y0=obj.y;
      if((p.py<y0&&p.y>=y0)||(p.py>y0&&p.y<=y0)){const t=(y0-p.py)/(p.y-p.py),x=p.px+(p.x-p.px)*t;
        if(x>=obj.x-6&&x<=obj.x+obj.w+6){const now=performance.now();if(now-(last.get(p.id)||0)>120){last.set(p.id,now);slice(x);}}}},
    up(p){knives.delete(p.id);},
    update(dt){if(obj){if(obj.st!=='out'){const tg=target();obj.x+=(tg-obj.x)*Math.min(1,dt*5);if(obj.st==='in'&&Math.abs(obj.x-tg)<2)obj.st='ready';}
        else{obj.x-=1000*dt;if(obj.x+obj.w<-20)next();}if(obj.wob>0)obj.wob=Math.max(0,obj.wob-dt*1.5);}
      for(let i=S.length-1;i>=0;i--){const s=S[i];s.vy+=1500*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.r+=s.vr*dt;if(s.y>boardY+70){s.y=boardY+70;s.vy*=-.2;s.vx*=.6;s.vr*=.5;}s.life-=dt;if(s.life<.5)s.a=s.life/.5;if(s.life<=0)S.splice(i,1);}},
    draw(){bgSoft('#f7efe3','#e6d7c0');const bh=130;ctx.fillStyle='rgba(0,0,0,.15)';rr(18,boardY-bh/2+8,VW()-36,bh,18);ctx.fill();
      const wg=ctx.createLinearGradient(0,boardY-bh/2,0,boardY+bh/2);wg.addColorStop(0,'#c99a64');wg.addColorStop(1,'#a87a48');ctx.fillStyle=wg;rr(14,boardY-bh/2,VW()-28,bh,18);ctx.fill();
      ctx.strokeStyle='rgba(90,55,20,.18)';ctx.lineWidth=2;for(let k=0;k<6;k++){const y=boardY-bh/2+12+k*20;ctx.beginPath();ctx.moveTo(20,y);ctx.bezierCurveTo(VW()*.3,y-6,VW()*.6,y+8,VW()-20,y-2);ctx.stroke();}
      for(const s of S)piece(s.x,s.y,s.w,s.h,s.t,s.r,s.a,0);if(obj)piece(obj.x,obj.y,obj.w,obj.h,obj.t,0,1,obj.wob);
      for(const[,p]of knives)drawKnife(p.x,p.y);hud(obj?`🔪 ${obj.t.n} · ${count} tranches`:'');},
    tools:[{l:'➡️ Suivant',f(){if(obj)obj.st='out';SFX.whoosh(VW()/2);}},{l:()=>'🥒 '+(force?force.n:'Varié'),f(){const i=force?TYPES.indexOf(force)+1:0;force=i>=TYPES.length?null:TYPES[i];if(obj)obj.st='out';}}]};
  return me;
}});

/* ===== 10. Peinture ===== */
A.register('paint',{e:'🎨',n:'Peinture',d:'Mélange les couleurs du bout du doigt.',lvl:8,hint:'Glisse pour étaler et mélanger la peinture',create(){
  const PALS=[['#ff6b6b','#ffd93d','#6bcb77','#4d96ff'],['#f72585','#7209b7','#3a0ca3','#4cc9f0'],['#ff9f1c','#ffbf69','#cbf3f0','#2ec4b6'],['#e63946','#f1faee','#a8dadc','#457b9d'],['#ffafcc','#bde0fe','#a2d2ff','#cdb4db']];
  let pc,tmp,brush=38,sm,acc=0,pi=0;
  function blob(g,c){const x=rnd(VW()*.15,VW()*.85),y=rnd(VH()*.2,VH()*.8),r=rnd(50,110),gr=g.createRadialGradient(x,y,r*.2,x,y,r);gr.addColorStop(0,c);gr.addColorStop(1,c+'00');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
  function fresh(){pc=mk(VW(),VH());const g=pc.getContext('2d');g.fillStyle='#fbf7f0';g.fillRect(0,0,VW(),VH());const Pl=PALS[pi%PALS.length];for(let k=0;k<7;k++)blob(g,Pl[k%Pl.length]);tmp=mk(brush*2,brush*2);}
  function smudge(p){const d=Math.hypot(p.x-p.px,p.y-p.py);if(d<.5)return;const steps=Math.ceil(d/(brush*.2)),g=pc.getContext('2d'),t=tmp.getContext('2d'),b=brush,D=A.DPR;
    for(let s=1;s<=steps;s++){const t0=(s-1)/steps,t1=s/steps,fx=p.px+(p.x-p.px)*t0,fy=p.py+(p.y-p.py)*t0,tx=p.px+(p.x-p.px)*t1,ty=p.py+(p.y-p.py)*t1;
      t.clearRect(0,0,b*2,b*2);t.drawImage(pc,(fx-b)*D,(fy-b)*D,b*2*D,b*2*D,0,0,b*2,b*2);
      t.globalCompositeOperation='destination-in';const m=t.createRadialGradient(b,b,0,b,b,b);m.addColorStop(0,'rgba(0,0,0,1)');m.addColorStop(.6,'rgba(0,0,0,.9)');m.addColorStop(1,'rgba(0,0,0,0)');t.fillStyle=m;t.fillRect(0,0,b*2,b*2);t.globalCompositeOperation='source-over';
      g.globalAlpha=.75;g.drawImage(tmp,tx-b,ty-b,b*2,b*2);g.globalAlpha=1;}
    sm.set(p.sp,p.x);acc+=d;while(acc>=60){acc-=60;award(1,p.x,p.y);}}
  const me={init(){fresh();sm=A.cont('lowpass',250,900,1,.2,.35);},resize(){fresh();},move(p){smudge(p);},
    draw(){ctx.drawImage(pc,0,0,VW(),VH());hud(`🖌️ ${brush} px`);},
    tools:[{l:'🎨 Palette',f(){pi++;fresh();SFX.whoosh(VW()/2);}},{l:'💧 Goutte',f(){blob(pc.getContext('2d'),pick(PALS[pi%PALS.length]));SFX.drop(VW()/2,600);}},{l:()=>'🖌️ '+brush,f(){brush=brush===38?60:brush===60?24:38;tmp=mk(brush*2,brush*2);}}]};
  return me;
}});
})();
