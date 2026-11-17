// Same source choreography, evaluated in parallel on the GPU. Static attributes
// retain each soul's original stand position and traced logo destination.
export const vertexShader=`
uniform float time;uniform float size;uniform float pixelRatio;uniform mat4 titleMatrix;
attribute vec4 seeds;attribute vec3 origin;attribute vec3 logoTarget;attribute float buildSeed;attribute float group;
varying float visibility;
void main(){
 float t=time,a=seeds.x,b=seeds.y,c=seeds.z,d=seeds.w;
 float theta=a*6.28318530718+t*.19,rad=26.+3.*(b-.5),cloudY=55.+2.*sin(theta*3.+t)+c*3.;
 float cx=rad*cos(theta),cz=rad*sin(theta);
 float inward=smoothstep(.2+d,3.+d,t),lift=smoothstep(3.+d,7.+d,t);
 vec3 pos=mix(origin,vec3(cx,8.,cz),inward);pos.y=mix(pos.y,cloudY,lift);
 pos.x+=sin(lift*3.14159265)*sin(t*1.1+c*9.)*2.;pos.z+=sin(lift*3.14159265)*cos(t+c*9.)*2.;
 float opacity=smoothstep(0.,1.3,t)*.72;
 if(t>=9.){
  float age=t-9.,drop=smoothstep(9.+d*2.,13.+d*2.,t),impact=smoothstep(12.+d*2.,15.+d*2.,t);
  if(group<.5 && t<21.){
   float rr=rad+smoothstep(9.,12.,t)*8.+sin(t*1.2+b*4.)*.8;
   pos=vec3(rr*cos(theta),cloudY,rr*sin(theta));opacity=1.1*(1.-smoothstep(17.,21.,t));
  }else{
   pos=vec3(cx*(1.-drop*.92),mix(cloudY,1.+c,drop*drop),cz*(1.-drop*.92));
   float spread=smoothstep(12.,19.,t),px=(a*2.-1.)*52.*spread,pz=(b*2.-1.)*31.*spread;
   float wave=length(vec2(px,pz))*.37-age*3.5;
   float edge=1.-smoothstep(.72,1.,max(abs(px)/54.,abs(pz)/33.));
   float crest=2.+5.*pow(.5+.5*cos(wave),5.)+3.*pow(.5+.5*sin(px*.22+age*2.1),6.);
   float splash=c>.85?7.*pow(max(0.,sin(age*2.3+d*12.)),4.):0.;
   vec3 flood=vec3(px+edge*1.4*sin(pz*.28-age*2.),.5+c*.8+edge*(crest*(.3+c*.7)+splash),pz+edge*sin(px*.3+age*2.4));
   pos=mix(pos,flood,impact);opacity=.65;
   if(group>.5&&group<2.5&&t<23.){float q=fract(age*.36+b),join=smoothstep(19.,23.,t),rr=2.+4.*(1.-q)+c*2.;pos=mix(vec3(rr*cos(theta),55.*(1.-q*q),rr*sin(theta)),pos,join);}
  }
 }
 float build=smoothstep(23.+buildSeed*1.8,28.+buildSeed,t);
 pos=mix(pos,(titleMatrix*vec4(logoTarget,1.)).xyz,build);visibility=mix(opacity,.055,build);
 vec4 p=modelViewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*p;
 gl_PointSize=clamp(size*pixelRatio*180./-p.z,.65,5.);
}`;
export const fragmentShader=`varying float visibility;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float a=exp(-r*r*4.);gl_FragColor=vec4(.18,.85,.88,a*visibility);}`;
