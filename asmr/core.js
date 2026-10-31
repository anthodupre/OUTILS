/* ASMR Zen : moteur (audio, progression, sauvegarde, interface) */
'use strict';
const ASMR=(()=>{
const $=s=>document.querySelector(s);
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.random()*a.length|0];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- Sauvegarde ---------- */
const SAVE_KEY='asmr-zen-save';
const DEF_SET={volume:.8,amb:'none',ambVol:.5,haptics:true,fx:true,theme:'auto'};
const G={pts:0,counts:{},set:Object.assign({},DEF_SET)};
let god=false;
function load(){try{const o=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(o&&typeof o==='object'){G.pts=Math.max(0,+o.pts||0);if(o.counts&&typeof o.counts==='object')G.counts=o.counts;Object.assign(G.set,sanitizeSet(o.set));}}catch(e){}}
function sanitizeSet(o){const r={};if(!o||typeof o!=='object')return r;for(const k in DEF_SET)if(k in o&&typeof o[k]===typeof DEF_SET[k])r[k]=o[k];return r;}
let saveT=0;
function save(explicit){
  clearTimeout(saveT);
  const run=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify({pts:G.pts,counts:G.counts,set:G.set,v:1}));if(explicit)toast('💾 Sauvegardé');}
    catch(e){if(explicit)toast('Sauvegarde impossible (stockage bloqué)');}};
  if(explicit)run();else saveT=setTimeout(run,700);
}
const encode=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/=+$/,'');
function decode(s){s=s.trim();while(s.length%4)s+='=';return JSON.parse(decodeURIComponent(escape(atob(s))));}

/* ---------- Niveaux ---------- */
const thr=n=>n<=1?0:Math.round(45*Math.pow(n-1,1.55));
function level(){let n=1;while(n<60&&G.pts>=thr(n+1))n++;return n;}
const ACTS={};
function register(id,def){ACTS[id]=def;}
const unlocked=id=>god||level()>=ACTS[id].lvl;
function updHud(){const L=level(),a=thr(L),b=thr(L+1);$('#lvl').textContent=`Niveau ${L} · ${G.pts} 🪷${god?' · 🍔':''}`;$('#bar i').style.width=clamp((G.pts-a)/(b-a)*100,0,100)+'%';}

/* ---------- Audio ---------- */
const AU={ctx:null,master:null,rev:null,noise:null,amb:null};
function audio(){
  if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return AU.ctx;}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
  const c=AU.ctx=new C();
  AU.master=c.createGain();AU.master.gain.value=G.set.volume;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;
  AU.master.connect(comp);comp.connect(c.destination);
  const len=c.sampleRate*1.8|0,ir=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6);}
  AU.rev=c.createConvolver();AU.rev.buffer=ir;const rg=c.createGain();rg.gain.value=.5;AU.rev.connect(rg);rg.connect(AU.master);
  const n=c.sampleRate*2|0;AU.noise=c.createBuffer(1,n,c.sampleRate);const nd=AU.noise.getChannelData(0);for(let i=0;i<n;i++)nd[i]=Math.random()*2-1;
  startAmb(G.set.amb);
  return c;
}
const ready=()=>!!AU.ctx&&G.set.volume>0;
function out(x,wet){
  const c=AU.ctx,g=c.createGain();let node=g;
  if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=clamp(x/Math.max(1,VW)*2-1,-1,1)*.7;g.connect(p);node=p;}
  node.connect(AU.master);
  if(wet>0){const s=c.createGain();s.gain.value=wet;node.connect(s);s.connect(AU.rev);}
  return g;
}
function env(g,t,a,peak,d){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);}
function tone(dst,type,f,t,a,d,v,to){const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(20,f),t);
  if(to)o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+a+d);env(g,t,a,v,d);o.connect(g);g.connect(dst);o.start(t);o.stop(t+a+d+.05);}
function hiss(dst,t,a,d,v,type,f,q,to){const c=AU.ctx,s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;s.loopStart=Math.random()*1.5;s.playbackRate.value=rnd(.9,1.1);
  const fl=c.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(Math.max(30,f),t);if(to)fl.frequency.exponentialRampToValueAtTime(Math.max(30,to),t+a+d);fl.Q.value=q||1;
  const g=c.createGain();env(g,t,a,v,d);s.connect(fl);fl.connect(g);g.connect(dst);s.start(t,s.loopStart);s.stop(t+a+d+.05);}
const SFX={
  pop(x,p=1){if(!ready())return;const t=AU.ctx.currentTime+.002,o=out(x,.3);hiss(o,t,.001,.045,.55,'bandpass',1500*p,2.5);tone(o,'sine',175*p,t,.002,.08,.5,75*p);},
  popit(x,p=1){if(!ready())return;const t=AU.ctx.currentTime+.002,o=out(x,.4);tone(o,'sine',430*p,t,.004,.13,.45,240*p);hiss(o,t,.001,.02,.14,'bandpass',2400,2);tone(o,'triangle',900*p,t,.001,.03,.08,500*p);},
  thock(x,row,type){if(!ready())return;const t=AU.ctx.currentTime+.001,o=out(x,.18);hiss(o,t,.001,type==='clicky'?.014:.02,.4,'highpass',type==='clicky'?3200:1800,1);
    tone(o,'sine',135+row*14+rnd(-6,6),t,.001,.055,.6,80);if(type==='clicky')tone(o,'square',2700,t,.0005,.01,.07);if(type==='tactile')tone(o,'triangle',380,t,.001,.025,.1);},
  clack(x){if(!ready())return;const t=AU.ctx.currentTime+.001,o=out(x,.15);hiss(o,t,.001,.012,.22,'highpass',3800,1);tone(o,'sine',700,t,.001,.02,.06);},
  drop(x,f,v=1){if(!ready())return;const t=AU.ctx.currentTime+.002,o=out(x,.6);tone(o,'sine',f*.55,t,.006,.17,.42*v,f*1.6);tone(o,'sine',f*2.1,t,.001,.05,.08*v,f*2.6);hiss(o,t,.001,.03,.08*v,'bandpass',3000,2);},
  crunch(x){if(!ready())return;const t=AU.ctx.currentTime+.002,o=out(x,.25);hiss(o,t,.002,.09,.35,'lowpass',600,1);for(let i=0;i<16;i++)hiss(o,t+Math.random()*.16,.001,.02,rnd(.08,.22),'bandpass',rnd(1600,5200),4);},
  squish(x,k=1){if(!ready())return;const t=AU.ctx.currentTime+.002,o=out(x,.35);hiss(o,t,.02,.12,.3*k,'lowpass',260,8,1500);hiss(o,t+.08,.01,.14,.22*k,'lowpass',1400,8,220);
    for(let i=0;i<2;i++)tone(o,'sine',rnd(500,900),t+rnd(.02,.14),.002,.04,.12*k,rnd(150,300));},
  slice(x,kind){if(!ready())return;const t=AU.ctx.currentTime+.002,o=out(x,.3);
    if(kind==='crisp'){hiss(o,t,.002,.11,.4,'highpass',3200,1,700);tone(o,'sine',1100,t,.001,.05,.12,320);}
    else if(kind==='soft')hiss(o,t,.01,.16,.3,'lowpass',1400,1,320);
    else if(kind==='wet')SFX.squish(x,.9);
    else if(kind==='chalk')hiss(o,t,.002,.1,.3,'bandpass',2200,2,900);
    else SFX.crunch(x);},
  whoosh(x){if(!ready())return;const t=AU.ctx.currentTime+.002,o=out(x,.4);hiss(o,t,.08,.25,.25,'bandpass',500,1,2600);},
  shine(x){if(!ready())return;const t=AU.ctx.currentTime,o=out(x,.7);[0,4,7,12,16,19,24].forEach((n,i)=>tone(o,'sine',523*Math.pow(2,n/12),t+i*.07,.005,.5,.18));},
  levelup(){if(!ready())return;const t=AU.ctx.currentTime,o=out(VW/2,.7);[0,4,7,12].forEach((n,i)=>{tone(o,'sine',392*Math.pow(2,n/12),t+i*.12,.01,.7,.22);tone(o,'sine',784*Math.pow(2,n/12),t+i*.12,.01,.3,.06);});},
  tap(x){if(!ready())return;const t=AU.ctx.currentTime+.002,o=out(x,.3);tone(o,'sine',320,t,.002,.06,.3,180);},
};
/* Son continu (frottement) dont le volume suit la vitesse du doigt */
class Cont{
  constructor(type,f0,f1,q,maxG,wet){Object.assign(this,{type,f0,f1,q,maxG,wet,on:false,last:0});}
  start(){if(this.on||!audio())return;const c=AU.ctx;this.on=true;
    const s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;const f=c.createBiquadFilter();f.type=this.type;f.frequency.value=this.f0;f.Q.value=this.q;
    const g=c.createGain();g.gain.value=0;let node=g;
    if(c.createStereoPanner){this.pan=c.createStereoPanner();g.connect(this.pan);node=this.pan;}
    node.connect(AU.master);if(this.wet){const w=c.createGain();w.gain.value=this.wet;node.connect(w);w.connect(AU.rev);}
    s.connect(f);f.connect(g);s.start();this.s=s;this.f=f;this.g=g;}
  set(speed,x){if(!this.on){this.start();if(!this.on)return;}if(!G.set.volume)return;const t=AU.ctx.currentTime,k=clamp(speed/1000,0,1);
    this.g.gain.setTargetAtTime(this.maxG*Math.pow(k,.7)*rnd(.8,1.15),t,.035);this.f.frequency.setTargetAtTime(this.f0+(this.f1-this.f0)*k,t,.06);
    if(this.pan)this.pan.pan.setTargetAtTime(clamp(x/VW*2-1,-1,1)*.7,t,.05);this.last=performance.now();}
  tick(now){if(this.on&&now-this.last>80&&this.g.gain.value>.001)this.g.gain.setTargetAtTime(0,AU.ctx.currentTime,.07);}
  stop(){if(!this.on)return;this.on=false;try{this.g.gain.setTargetAtTime(0,AU.ctx.currentTime,.05);const s=this.s;setTimeout(()=>{try{s.stop()}catch(e){}},300);}catch(e){}}
}
const conts=[];
function cont(type,f0,f1,q,maxG,wet){const c=new Cont(type,f0,f1,q,maxG,wet);conts.push(c);return c;}

/* Ambiances */
function startAmb(kind){
  stopAmb();if(!AU.ctx||kind==='none')return;const c=AU.ctx;
  const g=c.createGain();g.gain.value=0;g.connect(AU.master);g.gain.setTargetAtTime(G.set.ambVol*.5,c.currentTime,1.2);
  AU.amb={g,nodes:[],kind,timer:0};
  const src=()=>{const s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;s.start();AU.amb.nodes.push(s);return s;};
  const flt=(type,f,q)=>{const x=c.createBiquadFilter();x.type=type;x.frequency.value=f;if(q)x.Q.value=q;return x;};
  const gain=v=>{const x=c.createGain();x.gain.value=v;return x;};
  switch(kind){
    case 'rain':{const s=src(),hp=flt('highpass',400),lp=flt('lowpass',2600),gg=gain(.5);s.connect(hp);hp.connect(lp);lp.connect(gg);gg.connect(g);break;}
    case 'fire':{const s=src(),lp=flt('lowpass',220),gg=gain(2.2);s.connect(lp);lp.connect(gg);gg.connect(g);break;}
    case 'wind':{const s=src(),bp=flt('bandpass',600,.7),gg=gain(.6);const l1=c.createOscillator(),g1=gain(350);l1.frequency.value=.07;l1.connect(g1);g1.connect(bp.frequency);l1.start();
      const l2=c.createOscillator(),g2=gain(.35);l2.frequency.value=.11;l2.connect(g2);g2.connect(gg.gain);l2.start();s.connect(bp);bp.connect(gg);gg.connect(g);AU.amb.nodes.push(l1,l2);break;}
    case 'bowl':{[1,2.76,5.4].forEach((m,i)=>{const o=c.createOscillator();o.frequency.value=174*m;const og=gain([.25,.08,.03][i]);const l=c.createOscillator(),lg=gain(og.gain.value*.5);l.frequency.value=.2+i*.13;
      l.connect(lg);lg.connect(og.gain);o.connect(og);og.connect(g);o.start();l.start();AU.amb.nodes.push(o,l);});break;}
    case 'white':{const s=src(),lp=flt('lowpass',4000),gg=gain(.25);s.connect(lp);lp.connect(gg);gg.connect(g);break;}
  }
}
function ambTick(now){
  const a=AU.amb;if(!a||now<a.timer||!G.set.volume)return;const t=AU.ctx.currentTime;
  if(a.kind==='rain'){a.timer=now+rnd(60,400);const o=out(rnd(0,VW||300),.6),f=rnd(600,2400);tone(o,'sine',f,t,.003,.08,.08*G.set.ambVol,f*2);}
  else if(a.kind==='fire'){a.timer=now+rnd(80,600);const o=out(rnd(0,VW||300),.2);hiss(o,t,.001,.03,.25*G.set.ambVol,'highpass',rnd(1500,4000),1);}
  else a.timer=now+1000;
}
function stopAmb(){const a=AU.amb;if(!a)return;a.g.gain.setTargetAtTime(0,AU.ctx.currentTime,.4);setTimeout(()=>{a.nodes.forEach(n=>{try{n.stop()}catch(e){}});try{a.g.disconnect()}catch(e){}},1500);AU.amb=null;}
function vib(ms){if(G.set.haptics&&navigator.vibrate)try{navigator.vibrate(ms)}catch(e){}}

/* ---------- Canvas et outils de dessin ---------- */
const cv=$('#cv'),ctx=cv.getContext('2d');
let VW=320,VH=480,DPR=1;
function resize(){const r=$('#play').getBoundingClientRect();if(r.width<10||r.height<10)return;VW=Math.round(r.width);VH=Math.round(r.height);DPR=Math.min(2,devicePixelRatio||1);
  cv.width=VW*DPR;cv.height=VH*DPR;if(act&&act.resize)act.resize();}
new ResizeObserver(()=>resize()).observe($('#play'));
function mk(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*DPR));c.height=Math.max(1,Math.round(h*DPR));c.getContext('2d').setTransform(DPR,0,0,DPR,0,0);return c;}
function mk0(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function rrc(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
const rr=(x,y,w,h,r)=>rrc(ctx,x,y,w,h,r);
function hex2(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[n>>16&255,n>>8&255,n&255];}
function mix(h,tg,k){const[r,g,b]=hex2(h);return`rgb(${Math.round(r+(tg-r)*k)},${Math.round(g+(tg-g)*k)},${Math.round(b+(tg-b)*k)})`;}
const lighten=(h,k)=>mix(h,255,k),darken=(h,k)=>mix(h,0,k),shade=(h,k)=>k>0?lighten(h,k):darken(h,-k);
function bgSoft(c1,c2){const g=ctx.createLinearGradient(0,0,VW*.3,VH);g.addColorStop(0,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);}
function hud(t){if(!t)return;ctx.font='700 13px system-ui,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';const w=ctx.measureText(t).width+20;ctx.fillStyle='rgba(20,16,40,.45)';rr(12,10,w,28,14);ctx.fill();ctx.fillStyle='#fff';ctx.fillText(t,22,24);}
function drawKnife(x,y){ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(0,0,0,.15)';ctx.beginPath();ctx.ellipse(4,6,9,4,0,0,TAU);ctx.fill();
  const g=ctx.createLinearGradient(-6,0,6,0);g.addColorStop(0,'#cfd4db');g.addColorStop(.5,'#f4f6f9');g.addColorStop(1,'#aab1bb');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-6,-14);ctx.lineTo(-6,-78);ctx.lineTo(6,-78);ctx.lineTo(6,-20);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-3,-16);ctx.lineTo(-3,-74);ctx.stroke();
  ctx.fillStyle='#5a3b22';rr(-7,-118,14,42,5);ctx.fill();ctx.fillStyle='#c9a66b';ctx.fillRect(-7,-80,14,4);ctx.restore();}
function wrapChars(s,maxW){const lines=[];let cur='';for(const ch of s){const t=cur+ch;if(ctx.measureText(t).width>maxW&&cur){lines.push(cur);cur=ch;}else cur=t;}lines.push(cur);return lines;}

/* Particules et textes flottants */
const P=[],FL=[];
function spawnP(x,y,vx,vy,c,life,s,g){if(P.length>(G.set.fx?1500:200))return;P.push({x,y,vx,vy,c,life,max:life,s,g});}
function updP(dt){for(let i=P.length-1;i>=0;i--){const p=P[i];p.life-=dt;if(p.life<=0){P[i]=P[P.length-1];P.pop();continue;}p.vy+=700*p.g*dt;p.vx*=Math.pow(.4,dt);p.x+=p.vx*dt;p.y+=p.vy*dt;}}
function drawP(){for(const p of P){ctx.globalAlpha=clamp(p.life/p.max*1.5,0,1);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,TAU);ctx.fill();}ctx.globalAlpha=1;}
function drawFloats(dt){ctx.font='800 16px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3;
  for(let i=FL.length-1;i>=0;i--){const f=FL[i];f.t+=dt;if(f.t>.9){FL.splice(i,1);continue;}const a=1-f.t/.9,y=f.y-30-f.t*50;
    ctx.strokeStyle=`rgba(40,30,70,${a*.6})`;ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.strokeText(f.s,f.x,y);ctx.fillText(f.s,f.x,y);}}

/* ---------- Points ---------- */
function award(n,x,y,cnt=1){
  const L0=level(),add=n*(god?100:1);G.pts+=add;
  if(actId&&cnt)G.counts[actId]=(G.counts[actId]||0)+cnt;
  if(n>0&&FL.length<30)FL.push({x,y,t:0,s:'+'+add});
  updHud();const L1=level();if(L1>L0)levelUp(L1);save();
}
function levelUp(L){
  SFX.levelup();toast(`✨ Niveau ${L} !`);
  const un=Object.values(ACTS).filter(a=>a.lvl===L);
  if(un.length)setTimeout(()=>toast(`🔓 Débloqué : ${un.map(a=>a.e+' '+a.n).join(', ')}`,3000),1700);
  if(G.set.fx)for(let k=0;k<70;k++)spawnP(VW/2,VH/2,rnd(-320,320),rnd(-420,120),`hsl(${rnd(0,360)|0},90%,70%)`,rnd(.8,1.6),rnd(2,5),.8);
}

/* ---------- Activités ---------- */
let act=null,actId=null,fps=0,fc=0,ft=0;
const ptrs=new Map();
function openAct(id){
  const d=ACTS[id];if(!unlocked(id)){toast(`🔒 Niveau ${d.lvl} requis (encore ${thr(d.lvl)-G.pts} 🪷)`);return;}
  audio();actId=id;$('#hub').hidden=true;$('#play').hidden=false;$('#back').hidden=false;$('#title').textContent=d.e+' '+d.n;
  resize();act=d.create();act.init&&act.init();renderTools();hint(d.hint);
}
function closeAct(){
  if(!act)return;for(const c of conts)c.stop();conts.length=0;act.destroy&&act.destroy();act=null;actId=null;ptrs.clear();P.length=0;FL.length=0;
  $('#play').hidden=true;$('#hub').hidden=false;$('#back').hidden=true;$('#title').textContent='🪷 ASMR Zen';renderHub();save(false);
}
function renderTools(){const t=$('#tools');t.innerHTML='';if(!act||!act.tools)return;
  for(const tl of act.tools){const b=document.createElement('button');b.type='button';b.textContent=typeof tl.l==='function'?tl.l():tl.l;
    b.addEventListener('click',()=>{audio();tl.f();renderTools();});t.append(b);}}
let hintT=0;
function hint(t){const h=$('#hint');h.textContent=t;h.classList.remove('off');clearTimeout(hintT);hintT=setTimeout(()=>h.classList.add('off'),5000);}

/* Pointeurs (multi-touch) */
function pos(e){const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];}
cv.addEventListener('pointerdown',e=>{if(!act)return;e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(x){}audio();const[x,y]=pos(e);
  const p={id:e.pointerId,x,y,px:x,py:y,sx:x,sy:y,t:performance.now(),sp:0,dist:0};ptrs.set(p.id,p);$('#hint').classList.add('off');act.down&&act.down(p);});
cv.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p||!act)return;
  const evs=(e.getCoalescedEvents&&e.getCoalescedEvents())||[];if(!evs.length)evs.push(e);
  for(const ev of evs){const[x,y]=pos(ev),now=performance.now(),dtm=Math.max(1,now-p.t),d=Math.hypot(x-p.x,y-p.y);
    p.sp=p.sp*.5+(d/dtm*1000)*.5;p.px=p.x;p.py=p.y;p.x=x;p.y=y;p.t=now;p.dist+=d;act.move&&act.move(p);}});
const pend=e=>{const p=ptrs.get(e.pointerId);if(!p)return;ptrs.delete(e.pointerId);act&&act.up&&act.up(p);};
cv.addEventListener('pointerup',pend);cv.addEventListener('pointercancel',pend);cv.addEventListener('lostpointercapture',pend);
cv.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});
document.addEventListener('contextmenu',e=>{if(e.target===cv)e.preventDefault();});

/* Boucle */
let last=performance.now();
function loop(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;fc++;if(now-ft>500){fps=Math.round(fc*1000/(now-ft));fc=0;ft=now;}
  if(act){ctx.setTransform(DPR,0,0,DPR,0,0);act.update&&act.update(dt);act.draw();updP(dt);drawP();drawFloats(dt);for(const c of conts)c.tick(now);
    if(god)$('#stats').textContent=`FPS ${fps} · particules ${P.length} · doigts ${ptrs.size} · ${G.pts} pts`;}
  ambTick(now);requestAnimationFrame(loop);
}

/* ---------- Hub ---------- */
const fmtN=n=>n>=1000?(n/1000).toFixed(1)+'k':String(n);
function renderHub(){
  const L=level();let h='<h2 class="sec">Activités</h2><div class="grid">';
  for(const id in ACTS){const a=ACTS[id],un=unlocked(id),c=G.counts[id]||0;
    h+=`<button type="button" class="card${un?'':' locked'}" data-id="${id}"><span class="e">${a.e}</span><span class="n">${esc(a.n)}</span><span class="d">${esc(a.d)}</span>${c&&un?`<span class="c">${fmtN(c)}</span>`:''}${un?'':`<span class="lk">🔒 Niveau ${a.lvl}</span>`}</button>`;}
  h+='</div>';
  const nxt=Object.values(ACTS).filter(a=>a.lvl>L&&!god).sort((a,b)=>a.lvl-b.lvl)[0];
  h+=`<p class="note">${nxt?`Prochain déblocage : ${nxt.e} ${esc(nxt.n)} au niveau ${nxt.lvl} (${thr(nxt.lvl)} 🪷). Chaque geste rapporte des 🪷.`:'Tout est débloqué 🎉 Continue pour le plaisir.'}</p>`;
  $('#hub').innerHTML=h;updHud();
}
$('#hub').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b){audio();openAct(b.dataset.id);}});
$('#back').addEventListener('click',closeAct);
$('#saveBtn').addEventListener('click',()=>save(true));

/* ---------- Réglages ---------- */
let toastT=0;
function toast(m,ms){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),ms||1800);}
const AMBS=[['none','Aucune'],['rain','🌧️ Pluie'],['fire','🔥 Feu'],['wind','🍃 Vent'],['bowl','🔔 Bol'],['white','📻 Bruit blanc']];
const THEMES=[['auto','Auto'],['light','☀️ Clair'],['dark','🌙 Sombre']];
function seg(el,opts,cur,on){el.innerHTML=opts.map(([v,l])=>`<button type="button" data-v="${v}" class="${v===cur?'on':''}">${l}</button>`).join('');el.onclick=e=>{const b=e.target.closest('[data-v]');if(b){on(b.dataset.v);seg(el,opts,b.dataset.v,on);}};}
function applyTheme(){document.documentElement.dataset.theme=G.set.theme==='auto'?'':G.set.theme;}
function syncSettings(){
  $('#sVol').value=G.set.volume;$('#oVol').textContent=Math.round(G.set.volume*100)+' %';
  $('#sAmbVol').value=G.set.ambVol;$('#oAmbVol').textContent=Math.round(G.set.ambVol*100)+' %';
  $('#sHap').checked=G.set.haptics;$('#sFx').checked=G.set.fx;
  seg($('#sAmb'),AMBS,G.set.amb,v=>{G.set.amb=v;audio();startAmb(v);save();});
  seg($('#sTheme'),THEMES,G.set.theme,v=>{G.set.theme=v;applyTheme();save();});
}
function openSheet(on){$('#sheet').classList.toggle('on',on);$('#dim').hidden=!on;if(on)syncSettings();}
$('#gear').addEventListener('click',()=>openSheet(true));
$('#shClose').addEventListener('click',()=>openSheet(false));
$('#dim').addEventListener('click',()=>openSheet(false));
$('#sVol').addEventListener('input',e=>{G.set.volume=+e.target.value;$('#oVol').textContent=Math.round(G.set.volume*100)+' %';if(AU.master)AU.master.gain.value=G.set.volume;save();});
$('#sVol').addEventListener('change',()=>{audio();SFX.popit(VW/2);});
$('#sAmbVol').addEventListener('input',e=>{G.set.ambVol=+e.target.value;$('#oAmbVol').textContent=Math.round(G.set.ambVol*100)+' %';if(AU.amb)AU.amb.g.gain.setTargetAtTime(G.set.ambVol*.5,AU.ctx.currentTime,.2);save();});
$('#sHap').addEventListener('change',e=>{G.set.haptics=e.target.checked;save();if(G.set.haptics)vib(20);});
$('#sFx').addEventListener('change',e=>{G.set.fx=e.target.checked;save();});
$('#bSave').addEventListener('click',()=>save(true));
async function copy(text,msg){try{await navigator.clipboard.writeText(text);toast(msg);}catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.append(ta);ta.select();try{document.execCommand('copy');toast(msg);}catch(e2){toast('Copie impossible');}ta.remove();}}
$('#bCode').addEventListener('click',()=>copy(encode({pts:G.pts,counts:G.counts}),'📋 Code copié'));
$('#bImp').addEventListener('click',()=>{try{const o=decode($('#impCode').value);if(!o||typeof o.pts!=='number')throw 0;G.pts=Math.max(0,o.pts|0);G.counts=o.counts&&typeof o.counts==='object'?o.counts:{};save(true);renderHub();$('#impCode').value='';toast('📥 Progression importée');}catch(e){toast('❌ Code invalide');}});
$('#bReset').addEventListener('click',()=>{if(confirm('Remettre la progression à zéro ?')){G.pts=0;G.counts={};save(true);renderHub();}});
$('#bDev').addEventListener('click',()=>{const b=$('#devBox');b.hidden=!b.hidden;if(!b.hidden)$('#devCode').focus();});
function devTry(){if($('#devCode').value.trim().toUpperCase()==='BURGER'){god=true;$('#devCode').value='';$('#devMsg').textContent='🍔 MODE DIEU : tout débloqué, points ×100, stats';$('#devTools').hidden=false;$('#stats').hidden=false;renderHub();toast('🍔 MODE DIEU ACTIVÉ');}else $('#devMsg').textContent='❌ Code invalide';}
$('#devOk').addEventListener('click',devTry);
$('#devCode').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();devTry();}});
$('#devTools').addEventListener('click',e=>{const b=e.target.closest('[data-dev]');if(!b)return;const d=b.dataset.dev;
  if(d==='pts')G.pts+=1000;else if(d==='max')G.pts=Math.max(G.pts,thr(Math.max(...Object.values(ACTS).map(a=>a.lvl))));else if(d==='zero')G.pts=0;
  else if(d==='off'){god=false;$('#devTools').hidden=true;$('#stats').hidden=true;$('#devMsg').textContent='Mode dieu désactivé';}
  save();renderHub();});
addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#sheet').classList.contains('on'))openSheet(false);else closeAct();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){save(true);}});
addEventListener('pagehide',()=>save(true));

function start(){load();applyTheme();renderHub();requestAnimationFrame(loop);}
return{register,start,get ctx(){return ctx;},get VW(){return VW;},get VH(){return VH;},get DPR(){return DPR;},get act(){return act;},ptrs,G,
  SFX,cont,audio,award,spawnP,mk,mk0,rr,rrc,lighten,darken,shade,bgSoft,hud,drawKnife,wrapChars,vib,clamp,rnd,pick,TAU,toast};
})();
