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
 // The halo tightens as it crests. The brightest strands fall first, then
 // a radial sheet travels from the impact to the touchlines.
 float settle=smoothstep(6.7,8.,t);
 vec3 ring=vec3((32.+(b-.5)*1.25)*cos(theta),55.+.42*sin(theta*3.+t)+.65*c,(32.+(b-.5)*1.25)*sin(theta));
 pos=mix(pos,ring,settle);
 float inwardTime=smoothstep(7.85+d*.48,8.85+d*.48,t);
 float fall=clamp((t-8.5-d*.64)/1.15,0.,1.);
 float impact=9.65+d*.64;
 float direction=a*6.2831853+.12*sin(t*.8+b*8.);
 vec2 dir=vec2(cos(direction),sin(direction));
 float limit=min(51./max(.001,abs(dir.x)),30./max(.001,abs(dir.y)));
 float speed=17.+13.*b;
 float range=limit*sqrt(b),r=min(range,max(0.,t-impact)*speed);
 float rangeFraction=r/max(1.,range);
 vec2 runoff=dir*r;
 float crest=pow(.5+.5*cos(r*.40-(t-impact)*5.),4.);
 float crestHeight=sin(rangeFraction*3.14159)*(2.+4.*c)*crest;
 vec3 wet=vec3(runoff.x,.45+.65*c+crestHeight,runoff.y);
 if(t>=7.85){
   float jitter=(.5+2.*b)*fall;
   vec3 jet=vec3(ring.x*(1.-inwardTime)+jitter*cos(theta),mix(ring.y,.45,fall*fall),ring.z*(1.-inwardTime)+jitter*sin(theta));
   pos=mix(jet,wet,smoothstep(impact-.13,impact+.23,t));
   if(group<.5){
     vec3 rim=ring;rim.xz*=1.+.09*smoothstep(8.,11.,t);
     pos=mix(rim,wet,smoothstep(13.,15.7,t));
   }else if(group<1.5){
     float q=fract((t-8.85)*.83+b);
     float width=.5+2.5*sqrt(c)*q;
     vec3 stream=vec3(width*cos(a*6.283),55.*(1.-q*q),width*sin(a*6.283));
     pos=mix(pos,stream,smoothstep(9.8,10.65,t)*(1.-smoothstep(13.,15.4,t)));
   }
   opacity=mix(.75,.34,smoothstep(12.,16.,t));
 }
 float glyph=clamp(logoTarget.x/84.+.5,0.,1.);
 float build=smoothstep(15.8+glyph*2.3+buildSeed*.45,18.5+glyph*2.3+buildSeed*.45,t);
 vec3 destination=(titleMatrix*vec4(logoTarget,1.)).xyz;
 pos=mix(pos,destination,build);
 pos.y+=sin(build*3.14159)*(.8+1.4*c);
 visibility=mix(opacity,.045,build);
 vec4 p=modelViewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*p;
 gl_PointSize=clamp(size*pixelRatio*180./-p.z,.65,5.);
}`;
export const fragmentShader=`varying float visibility;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float a=exp(-r*r*4.);gl_FragColor=vec4(.18,.85,.88,a*visibility);}`;
