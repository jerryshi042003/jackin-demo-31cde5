import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {titleHeight,titleTurn,seed} from './motion.mjs';
import {vertexShader,fragmentShader} from './particles.mjs';
import {createTurf} from './turf.mjs?v=r19';
const status=document.querySelector('#status');
const scene=new T.Scene();scene.background=new T.Color('#071315');scene.fog=new T.FogExp2(0x071315,.0015);
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio, 2, Math.sqrt(2600000 / (innerWidth * innerHeight))));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.7;document.querySelector('#stage').appendChild(renderer.domElement);
const camera=new T.PerspectiveCamera(2*Math.atan(Math.tan(Math.PI/6)/(innerWidth/innerHeight))*180/Math.PI,innerWidth/innerHeight,2,600);camera.position.set(150,125,-170);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,15,0);controls.minDistance=150;controls.maxDistance=320;controls.maxPolarAngle=Math.PI*.48;controls.enableDamping=true;controls.enablePan=false;controls.enableZoom=true;controls.minPolarAngle=.2;controls.maxPolarAngle=1.35;
scene.add(new T.HemisphereLight(0xc1ddf2,0x07100b,.3));const key=new T.DirectionalLight(0xc1e7ff,2);key.position.set(-40,100,-40);scene.add(key);
const lights=[];for(const x of [-32,32])for(const z of [-36,36]){let l=new T.PointLight(0x93e4ff,2000,110,2);l.position.set(x,24,z);scene.add(l);lights.push(l)}
const ease=(a,b,t)=>{let u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u)};
let time=0,manual=false,last=performance.now(),visibleScene=window.parent===window,parentManaged=false;
addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='stadium-visibility'){parentManaged=true;visibleScene=e.data.visible;last=performance.now()}});controls.addEventListener('start',()=>{manual=true});renderer.domElement.style.touchAction='pan-y';renderer.domElement.addEventListener('wheel',e=>e.stopImmediatePropagation(),{capture:true,passive:true});
new IntersectionObserver(entries=>{if(!parentManaged){visibleScene=entries[0].intersectionRatio>=.75;last=performance.now();}},{threshold:.75}).observe(renderer.domElement);
const metrics={ready:false,frames:0,errors:[],renderCalls:0};window.motionMetrics=metrics;window.addEventListener('error',e=>metrics.errors.push(e.message));
try{
 const draco=new DRACOLoader().setDecoderPath('vendor/examples/jsm/libs/draco/gltf/');const loader=new GLTFLoader().setDRACOLoader(draco);
 const [gltf,standRaw,logoRaw,logo]=await Promise.all([loader.loadAsync('stadium.glb'),fetch('stand-origins.bin').then(r=>r.arrayBuffer()),fetch('logo-points.bin').then(r=>r.arrayBuffer()),fetch('logo.json').then(r=>r.json())]);
 const origins=new Float32Array(standRaw),logoPoints=new Float32Array(logoRaw),N=logoPoints.length/2,duration=50;
 const turf=await createTurf(renderer);
 // Merge only equal original materials; preserve their textures, geometry and transforms.
 gltf.scene.updateMatrixWorld(true);const batches=new Map();
 gltf.scene.traverse(o=>{if(!o.isMesh)return;for(let p=o;p;p=p.parent)if(/crowd|people|V22 audience particles|V24 Persona/i.test(p.name))return;
 if(Array.isArray(o.material)) {scene.attach(o.clone());return;}let g=o.geometry.clone().applyMatrix4(o.matrixWorld);
 let surface=o;while(surface.parent&&!/^Stadium_00[23]$/.test(surface.name))surface=surface.parent;
 if(surface.name==='Stadium_002')g.translate(0,-.15,0);
 if(surface.name==='Stadium_003'){
  metrics.turfMeshes=(metrics.turfMeshes||0)+1;
  o.material=turf;const pos=g.attributes.position,uv=new Float32Array(pos.count*2);
  for(let i=0;i<pos.count;i++){uv[i*2]=pos.getX(i)/7.;uv[i*2+1]=pos.getZ(i)/7.;}
  g.setAttribute('uv',new T.BufferAttribute(uv,2));
 }
 for(const name of ['map','normalMap','roughnessMap'])if(o.material[name])o.material[name].anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 if(g.index)g=g.toNonIndexed();g.deleteAttribute('tangent');const signature=o.material.uuid+Object.keys(g.attributes).sort().map(k=>k+g.attributes[k].itemSize+g.attributes[k].normalized).join(',');let group=batches.get(signature);if(!group)batches.set(signature,group={material:o.material,geometry:[]});group.geometry.push(g)});
 for(const b of batches.values()){const g=mergeGeometries(b.geometry,false);if(g)scene.add(new T.Mesh(g,b.material));else for(const a of b.geometry)scene.add(new T.Mesh(a,b.material))}
 const seeds=new Float32Array(N*4),origin=new Float32Array(N*3),targets=new Float32Array(N*3),buildSeeds=new Float32Array(N),groups=new Float32Array(N);
 for(let i=0;i<N;i++){
  for(let k=0;k<4;k++)seeds[i*4+k]=seed(i,k);
  const j=(i%(origins.length/3))*3;origin.set([origins[j],origins[j+2]+.4,-origins[j+1]],i*3);
  targets.set([(logoPoints[i*2]-.5)*84,(.256-logoPoints[i*2+1])*84,(seed(i,2)-.5)*.12],i*3);
  buildSeeds[i]=seed(i,4);groups[i]=i%6;
 }
 const geometry=new T.BufferGeometry();
 for(const [name,array,size] of [['position',origin,3],['origin',origin,3],['seeds',seeds,4],['logoTarget',targets,3],['buildSeed',buildSeeds,1],['group',groups,1]])geometry.setAttribute(name,new T.BufferAttribute(array,size));
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:T.AdditiveBlending,uniforms:{time:{value:0},titleMatrix:{value:new T.Matrix4()},size:{value:1.5},pixelRatio:{value:renderer.getPixelRatio()}},vertexShader,fragmentShader});
 const points=new T.Points(geometry,material);points.frustumCulled=false;scene.add(points);
 // Use the actual traced mark as dimensional strokes, not a replacement font or billboard.
 const title=new T.Group(),strokeGeometries=[];
 for(const path of logo.paths){const p=path.map(([x,y])=>new T.Vector3((x-.5)*84,(.256-y)*84,0));if(p.length<2)continue;const curve=new T.CurvePath();for(let j=1;j<p.length;j++)curve.add(new T.LineCurve3(p[j-1],p[j]));strokeGeometries.push(new T.TubeGeometry(curve,Math.max(8,p.length*2),.17,6,false));}
 const titleMaterial=new T.MeshBasicMaterial({color:0xa4ffff,toneMapped:false,transparent:true,opacity:0});
 title.add(new T.Mesh(mergeGeometries(strokeGeometries,false),titleMaterial));scene.add(title);
 const flat=new T.Quaternion().setFromEuler(new T.Euler(-Math.PI/2,0,Math.PI)),targetQ=new T.Quaternion();
 // The matrix is actual pitch-aligned geometry, softly revealed under the impact.
 const gridVertices=[];for(let x=-50;x<=50;x+=5)gridVertices.push(x,.22,-30,x,.22,30);for(let z=-30;z<=30;z+=5)gridVertices.push(-50,.22,z,50,.22,z);
 const gridGeometry=new T.BufferGeometry();gridGeometry.setAttribute('position',new T.Float32BufferAttribute(gridVertices,3));const gridMaterial=new T.LineBasicMaterial({color:0x6ce8dc,transparent:true,opacity:0,depthWrite:false});const grid=new T.LineSegments(gridGeometry,gridMaterial);scene.add(grid);
 const poolMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:T.DoubleSide,uniforms:{age:{value:0},strength:{value:0}},vertexShader:`uniform float age;uniform float strength;varying vec2 field;varying float crest;void main(){field=position.xy;float r=length(vec2(field.x,field.y*1.25));float edge=1.-smoothstep(.7,1.,max(abs(field.x)/52.,abs(field.y)/31.));float outward=pow(.5+.5*sin(r*.36-age*3.5),5.);float crosswave=pow(.5+.5*sin(field.x*.25+age*2.2),8.);crest=outward+.45*crosswave;vec3 p=position;p.z+=strength*edge*(.5+3.8*crest);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`uniform float strength;varying vec2 field;varying float crest;void main(){float edge=1.-smoothstep(.76,1.,max(abs(field.x)/52.,abs(field.y)/31.));vec3 c=mix(vec3(.015,.18,.2),vec3(.24,.95,.9),clamp(crest,0.,1.));gl_FragColor=vec4(c,edge*strength*(.12+.34*crest));}`});
 const pool=new T.Mesh(new T.PlaneGeometry(104,62,128,80),poolMaterial);pool.rotation.x=-Math.PI/2;pool.position.y=.25;scene.add(pool);

 const wirePath=new T.CatmullRomCurve3([new T.Vector3(-51,.5,29),new T.Vector3(-36,.5,29),new T.Vector3(0,.7,29),new T.Vector3(47,.7,27),new T.Vector3(45,1,8),new T.Vector3(30,5,-7),new T.Vector3(9,14,-14),new T.Vector3(-12,30,-8),new T.Vector3(0,55,0)]);
 const wireGeo=new T.BufferGeometry().setFromPoints(wirePath.getPoints(700));const wireMaterial=new T.LineBasicMaterial({color:0x8beeff,transparent:true,depthWrite:false});scene.add(new T.Line(wireGeo,wireMaterial));const wireGlow=new T.PointLight(0x67ddff,800,28,2);scene.add(wireGlow);const tip=new T.Mesh(new T.SphereGeometry(.27,12,8),new T.MeshBasicMaterial({color:0xc5faff}));scene.add(tip);
 const phase=document.querySelector('#phase');
 function update(sequenceTime){
  const t=Math.max(0,sequenceTime-6),lead=Math.min(1,sequenceTime/5.6),tail=Math.max(0,lead-.22);
  wireGeo.setDrawRange(Math.floor(tail*700),Math.max(0,Math.floor((lead-tail)*700)));wireMaterial.opacity=1-ease(5.5,7,sequenceTime);tip.position.copy(wirePath.getPoint(lead));tip.visible=sequenceTime<6.8;wireGlow.position.copy(tip.position);wireGlow.intensity=1200*wireMaterial.opacity;points.visible=sequenceTime>=5.5;
  phase.textContent=sequenceTime<6?'Wire':t<7?'Souls from the stands':t<11?'Circular cloud':t<19?'Cloudburst → flood':t<24?'Waves → matrix':t<30?'Neuromancer':t<36?'Rise above the roof':'Neuromancer';
  if(!manual){const lift=ease(29,40,t);camera.position.set(100+15*ease(8,20,t),140+45*lift,-135);controls.target.set(0,16+57*lift,0);}controls.update();
  lights.forEach((l,j)=>l.intensity=1700+1400*Math.pow(.5+.5*Math.sin(t*1.1-j*.65),6));key.intensity=1.1+.15*Math.sin(t*.6);
  gridMaterial.opacity=ease(9,14,t)*(.6+.1*Math.sin(t*2))*(1-.5*ease(25,30,t));poolMaterial.uniforms.age.value=Math.max(0,t-9);poolMaterial.uniforms.strength.value=ease(12,18,t)*(1-ease(24,28,t));
  const turn=titleTurn(t);targetQ.copy(camera.quaternion);title.quaternion.copy(flat).slerp(targetQ,turn);const drift=t>=41?performance.now()/1000:0;title.position.set(drift?.45*Math.sin(drift*.6):0,titleHeight(t)+(drift?.65*Math.sin(drift*.8):0),0);if(drift)title.rotateY(.025*Math.sin(drift*.5));title.scale.setScalar(1+.6*turn);titleMaterial.opacity=ease(25,28,t);
  title.updateMatrix();material.uniforms.titleMatrix.value.copy(title.matrix);material.uniforms.time.value=t;
  material.uniforms.size.value=3.2-2.2*ease(23,29,t);
  metrics.time=sequenceTime;metrics.phase=phase.textContent;metrics.particles=N;metrics.titleBottom=title.position.y-24*turn;metrics.titleTurn=turn;
 }
 status.textContent='Drag sideways to orbit';document.documentElement.classList.add("ready");metrics.ready=true;metrics.particleBackend='GPU';
 document.querySelector('#reset').onclick=()=>{manual=false;update(time);renderer.render(scene,camera)};
 let sampleStart=performance.now(),sampleFrames=0;const frameTimes=[];
 function animate(now){
  if(document.hidden||!visibleScene){last=now;sampleStart=now;sampleFrames=0;requestAnimationFrame(animate);return}
  const dt=Math.max(0,Math.min((now-last)/1000,.25));last=now;time=Math.min(duration,time+dt);
  const started=performance.now();update(time);renderer.render(scene,camera);
  metrics.cpuMs=performance.now()-started;metrics.frames++;metrics.renderCalls=renderer.info.render.calls;sampleFrames++;
  frameTimes.push(dt*1000);if(frameTimes.length>180)frameTimes.shift();
  if(now-sampleStart>=1000){metrics.fps=sampleFrames*1000/(now-sampleStart);metrics.frameP95=[...frameTimes].sort((a,b)=>a-b)[Math.floor(frameTimes.length*.95)];sampleStart=now;sampleFrames=0;}
  requestAnimationFrame(animate);
 }
 requestAnimationFrame(animate);
}catch(e){status.textContent='The stadium could not load. Reload to retry.';metrics.errors.push(String(e));console.error(e)}
const stage=document.querySelector('#stage');
function fitStage(){
 const width=Math.max(1,stage.clientWidth),height=Math.max(1,stage.clientHeight);
 camera.aspect=width/height;camera.fov=Math.max(document.documentElement.classList.contains("landing") ? 42 : 35,2*Math.atan(Math.tan(Math.PI/6)/camera.aspect)*180/Math.PI);
 camera.updateProjectionMatrix();renderer.setSize(width,height,false);
 renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';
}
new ResizeObserver(fitStage).observe(stage);addEventListener('resize',fitStage);fitStage();
