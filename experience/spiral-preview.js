(()=>{

// Spiral galaxy button — standalone. Canvas 2D. Two arms of dots turning around a bright core; inner dots turn faster than outer ones. Tap it: the arms collapse into the core.

const cv=document.getElementById('spiral'), g=cv.getContext('2d'); let W,H;
const DPR=Math.min(devicePixelRatio||1,2); function fit(){ W=cv.clientWidth; H=cv.clientHeight; cv.width=W*DPR; cv.height=H*DPR; g.setTransform(DPR,0,0,DPR,0,0); } addEventListener('resize',fit); fit();
const TEAL='#2ff5d0', MAG='#ff2bd6', AMB='#ffb23a', WHITE='#eafffb', BLUE='#7aa2ff', RED='#ff3355', MONO='ui-monospace,Menlo,Consolas,monospace';
const KANA='アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789';
const rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[(Math.random()*a.length)|0], clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const easeOut=t=>1-Math.pow(1-clamp(t,0,1),3), easeBack=t=>{ t=clamp(t,0,1); const c=1.70158; return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2); };
function txt(s,x,y,size,col,al='center',glow=0,weight=700){ g.font=weight+' '+size+'px '+MONO; g.textAlign=al; g.fillStyle=col; g.shadowColor=col; g.shadowBlur=glow; g.fillText(s,x,y); g.shadowBlur=0; }
let time=0, last=performance.now();
function bg(){g.clearRect(0,0,W,H);}

const ARMS=Array.from({length:190},(_,i)=>({f:Math.pow((i+1)/190,.8),arm:i%2,j:rnd(-.22,.22),jr:rnd(-.06,.06),gold:Math.random()<.22,tw:rnd(0,6.28)}));
let press=-9;
function galaxy(cx,cy,R){
  const k=clamp((time-press)/.6,0,1), suck = k<1 ? 1-easeOut(k)*.85 : 1, pulse=.5+.5*Math.sin(time*3.2);
  for(let i=0;i<2;i++){ const q=((time*.55+i*.5)%1); g.strokeStyle='rgba(47,245,208,'+(1-q)*.45+')'; g.lineWidth=1.5; g.beginPath(); g.arc(cx,cy,R*(1.05+q*.9),0,6.2832); g.stroke(); }
  g.strokeStyle='rgba(47,245,208,.5)'; g.lineWidth=1; g.setLineDash([2,7]); g.lineDashOffset=-time*26; g.beginPath(); g.arc(cx,cy,R*1.16,0,6.2832); g.stroke(); g.setLineDash([]);
  g.strokeStyle=TEAL; g.lineWidth=2.5; g.lineCap='round'; g.shadowColor=TEAL; g.shadowBlur=12;
  for(let i=0;i<3;i++){ const a0=-time*1.3+i*2.0944; g.beginPath(); g.arc(cx,cy,R*1.04,a0,a0+.7); g.stroke(); } g.shadowBlur=0;
  for(const d of ARMS){ const r=(R*(.14+.8*d.f)+d.jr*R)*suck, an=d.f*5.2+d.arm*Math.PI+d.j+time*(1.5-d.f*1.05)+(1-suck)*6, x=cx+Math.cos(an)*r, y=cy+Math.sin(an)*r*.92, tw=.6+.4*Math.sin(time*4+d.tw);
    g.fillStyle=d.gold?'rgba(255,196,84,'+(.95-d.f*.4)*tw+')':'rgba(120,255,228,'+(.95-d.f*.45)*tw+')'; g.beginPath(); g.arc(x,y,.9+(1-d.f)*1.9,0,6.2832); g.fill(); }
  const cr=R*(.3+.05*pulse+(1-suck)*.5), cg=g.createRadialGradient(cx,cy,0,cx,cy,cr); cg.addColorStop(0,'#fff'); cg.addColorStop(.35,'rgba(160,255,238,.85)'); cg.addColorStop(1,'rgba(47,245,208,0)'); g.fillStyle=cg; g.beginPath(); g.arc(cx,cy,cr,0,6.2832); g.fill();

}
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)");
function frame(now){ time+=document.hidden||document.querySelector("#experience").open?0:Math.min(.05,(now-last)/1000); last=now; if(document.hidden||document.querySelector("#experience").open){if(!reduceMotion.matches)requestAnimationFrame(frame);return;} bg(); if(time-press>3.2) press=time; galaxy(W/2,H*.43,Math.min(110,W*.23,H*.24)); if(!reduceMotion.matches)requestAnimationFrame(frame); }
requestAnimationFrame(frame);
new ResizeObserver(()=>{fit();if(reduceMotion.matches)frame(performance.now());}).observe(cv);
reduceMotion.addEventListener("change",()=>requestAnimationFrame(frame));

})();
