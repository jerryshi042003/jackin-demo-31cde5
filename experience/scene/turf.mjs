import * as T from 'three';
// Photographic surface: Poly Haven grass_ground (CC0). Traffic wear is a
// deterministic, designed match-wear pattern, not a survey of this pitch.
export async function createTurf(renderer){
 const loader=new T.TextureLoader();const [map,normalMap]=await Promise.all([loader.loadAsync('textures/grass-diffuse.jpg'),loader.loadAsync('textures/grass-normal.jpg')]);
 map.colorSpace=T.SRGBColorSpace;
 for(const texture of [map,normalMap]){texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.generateMipmaps=true;}
 const material=new T.MeshStandardMaterial({map,normalMap,normalScale:new T.Vector2(.22,.22),roughness:.94,metalness:0});
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 turfPosition;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nturfPosition=position;');
  shader.fragmentShader='varying vec3 turfPosition;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
   vec2 p=turfPosition.xz;
   vec3 photo=texture2D(map,vMapUv).rgb;
   float variation=dot(photo,vec3(.21,.72,.07));
   // Broad mowing direction stays stable at oblique mobile views.
   float stripe=.5+.5*sin((p.x+55.)*.57);
   vec3 healthy=mix(vec3(.055,.16,.035),vec3(.095,.235,.05),stripe);
   healthy*=.8+variation*.85;
   float goal=exp(-pow(abs((abs(p.x)-49.)/4.8),2.)-pow(abs(p.y/9.),2.));
   float center=exp(-pow(abs(p.x/15.),2.)-pow(abs(p.y/12.),2.))*.28;
   float lanes=exp(-pow(abs(p.y/7.),2.))*exp(-pow(abs(p.x/43.),4.))*.13;
   float broken=.6+.4*sin(p.x*1.8+sin(p.y*1.9))*sin(p.y*2.1);
   float wear=clamp((goal*.65+center+lanes)*broken,0.,.65);
   vec3 worn=vec3(.18,.155,.065)*(.6+variation);
   diffuseColor.rgb*=mix(healthy,worn,wear);
  `);
 };
 material.customProgramCacheKey=()=> 'photographic-turf-r16';return material;
}
