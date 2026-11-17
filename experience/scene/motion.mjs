// Deterministic particle choreography in the original stadium's metre coordinates.
export const ease=(a,b,t)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u)};
export function seed(i,k=0){const n=Math.sin(i*127.1+k*311.7+1)*43758.5453;return n-Math.floor(n)}
export function particle(i,t,origins,out){
 const a=seed(i),b=seed(i,1),c=seed(i,2),d=seed(i,3),j=(i%(origins.length/3))*3;
 const ox=origins[j],oy=origins[j+2]+.4,oz=-origins[j+1];
 const theta=a*Math.PI*2+t*.19,rad=26+3*(b-.5),cloudY=55+2*Math.sin(theta*3+t)+c*3;
 const cx=rad*Math.cos(theta),cz=rad*Math.sin(theta);
 // Reach the uncovered bowl horizontally before rising through the opening.
 const inward=ease(.2+d,3+d,t),lift=ease(3+d,7+d,t);
 let x=ox*(1-inward)+cx*inward,y=oy*(1-inward)+8*inward,z=oz*(1-inward)+cz*inward;
 y=y*(1-lift)+cloudY*lift;
 x+=Math.sin(lift*Math.PI)*Math.sin(t*1.1+c*9)*2;z+=Math.sin(lift*Math.PI)*Math.cos(t+c*9)*2;
 if(t>=9){
  const age=t-9,drop=ease(9+d*2,13+d*2,t),impact=ease(12+d*2,15+d*2,t);
  // The halo feeds a falling central column; a minority remains in its expanding rim.
  const halo=i%6===0,hold=1-ease(17,21,t);
  if(halo&&t<21){const rr=rad+ease(9,12,t)*8+Math.sin(t*1.2+b*4)*.8;x=rr*Math.cos(theta);z=rr*Math.sin(theta);y=cloudY;out[3]=1.1*hold;}
  else{
   x=cx*(1-drop*.92);z=cz*(1-drop*.92);y=cloudY*(1-drop*drop)+drop*drop*(1+c);
   const spread=ease(12,19,t),px=(a*2-1)*52*spread,pz=(b*2-1)*31*spread;
   const dist=Math.hypot(px,pz),wave=dist*.37-age*3.5;
   const edge=1-ease(.72,1,Math.max(Math.abs(px)/54,Math.abs(pz)/33));
   const crest=2+5*Math.pow(.5+.5*Math.cos(wave),5)+3*Math.pow(.5+.5*Math.sin(px*.22+age*2.1),6);
   const splash=c>.85?7*Math.pow(Math.max(0,Math.sin(age*2.3+d*12)),4):0;
   const wx=px+edge*1.4*Math.sin(pz*.28-age*2),wz=pz+edge*Math.sin(px*.3+age*2.4),wy=.5+c*.8+edge*(crest*(.3+c*.7)+splash);
   x=x*(1-impact)+wx*impact;z=z*(1-impact)+wz*impact;y=y*(1-impact)+wy*impact;out[3]=.65;
   if((i%6===1||i%6===2)&&t<23){
    const q=(age*.36+b)%1,join=ease(19,23,t),rr=2+4*(1-q)+c*2;
    x=(rr*Math.cos(theta))*(1-join)+x*join;z=(rr*Math.sin(theta))*(1-join)+z*join;y=(55*(1-q*q))*(1-join)+y*join;
   }

  }
 }else out[3]=ease(0,1.3,t)*.72;
 out[0]=x;out[1]=y;out[2]=z;
}
export function titleHeight(t){return 2.2+92*ease(30,36,t)}
export function titleTurn(t){return ease(36,41,t)}
