'use strict';
const dialog=document.querySelector('#experience'),film=document.querySelector('#film'),preview=document.querySelector('#preview'),gamePreview=document.querySelector('#game-preview'),host=document.querySelector('#game-host'),demo=document.querySelector('#demo-body'),stadiumHost=document.querySelector('#stadium-host'),playError=document.querySelector('#play-error');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let mode=null,stadium=null;
function syncPreview(){for(const v of [preview,gamePreview]){if(reduced.matches||document.hidden||dialog.open)v.pause();else v.play().catch(()=>{});}}
function fullScreen(){try{document.documentElement.requestFullscreen?.().catch(()=>{});}catch{/* Viewport-filling dialog remains usable. */}}
const observer=new IntersectionObserver(entries=>{for(const e of entries)stadium?.contentWindow?.postMessage({type:'stadium-visibility',visible:e.intersectionRatio>=.75&&dialog.open&&mode==='demo'},location.origin);},{root:demo,threshold:.75});
function open(next,userGesture=true,push=true){
 mode=next;demo.hidden=mode!=='demo';host.hidden=mode!=='game';playError.hidden=true;
 if(!dialog.open)dialog.showModal();if(push)history.pushState({experience:mode},'',`#${mode}`);
 if(mode==='demo'){
  if(userGesture)window.webkit?.messageHandlers?.experienceOrientation?.postMessage('demo');
  film.currentTime=0;demo.scrollTop=0;
  const nativePlayer=window.webkit?.messageHandlers?.nativeDemo;
  if(userGesture && nativePlayer){film.pause();nativePlayer.postMessage({url:film.src});}
  else{
   // Browser fullscreen must begin inside the tap, without waiting for a promise.
   if(userGesture && typeof film.webkitEnterFullscreen==='function'){film.removeAttribute('playsinline');try{film.webkitEnterFullscreen();}catch{}}
   film.play().catch(error=>{if(error.name!=='AbortError')playError.hidden=false;});
  }
  stadium=document.createElement('iframe');stadium.title='Interactive stadium: wire, circular cloud, flood and Neuromancer';stadium.src='scene/';stadium.loading='lazy';stadiumHost.replaceChildren(stadium);observer.observe(stadiumHost);
  stadium.addEventListener('load',()=>{const box=stadiumHost.getBoundingClientRect();stadium.contentWindow.postMessage({type:'stadium-visibility',visible:Math.max(0,Math.min(innerHeight,box.bottom)-Math.max(0,box.top))/box.height>=.75},location.origin)});
 }else{
  film.pause();const iframe=document.createElement('iframe');iframe.title='Jack In demo game and discount reveal';iframe.src='../';iframe.allow='fullscreen; autoplay';iframe.allowFullscreen=true;host.replaceChildren(iframe);
 }
 syncPreview();if(userGesture && !(mode==='demo' && typeof film.webkitEnterFullscreen==='function'))fullScreen();
}
function returnToEntrance(){window.webkit?.messageHandlers?.experienceOrientation?.postMessage('entrance');const pushed=Boolean(history.state?.experience);dialog.close();if(pushed)history.back();else history.replaceState(null,'',location.pathname+location.search);}
document.querySelector('#open-demo').addEventListener('click',()=>open('demo'));
document.querySelector('#open-game').addEventListener('click',()=>open('game'));
document.querySelector('#back').addEventListener('click',returnToEntrance);
document.querySelector('.scroll-cue').addEventListener('click',e=>{e.preventDefault();film.pause();playError.hidden=true;document.querySelector('#interactive').scrollIntoView({behavior:'smooth'});});
dialog.addEventListener('cancel',e=>{e.preventDefault();returnToEntrance();});
dialog.addEventListener('close',()=>{film.pause();host.replaceChildren();observer.disconnect();stadiumHost.replaceChildren();stadium=null;mode=null;if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});syncPreview();});
film.addEventListener('webkitbeginfullscreen',()=>window.webkit?.messageHandlers?.experienceOrientation?.postMessage('demo'));
film.addEventListener('playing',()=>{playError.hidden=true;});
addEventListener('native-demo-ended',()=>document.querySelector('#interactive').scrollIntoView({behavior:'smooth'}));
film.addEventListener('ended',()=>{if(film.webkitDisplayingFullscreen)film.webkitExitFullscreen?.();document.querySelector('#interactive').scrollIntoView({behavior:'smooth'});});
addEventListener('popstate',()=>{if(dialog.open)dialog.close();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)film.pause();syncPreview();});
reduced.addEventListener('change',syncPreview);syncPreview();
if(location.hash==='#demo'||location.hash==='#game')open(location.hash.slice(1),false,false);

const shareURL='https://neuromancer-motion-site.vercel.app/';
const shareDialog=document.querySelector('#share-dialog');
document.querySelector('#share').addEventListener('click',async()=>{
 if(navigator.share){try{await navigator.share({title:'Neuromancer · Demo & Game',url:shareURL});return;}catch(error){if(error.name==='AbortError')return;}}
 shareDialog.showModal();
});
document.querySelector('#close-share').addEventListener('click',()=>shareDialog.close());
document.querySelector('#copy-link').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(shareURL);document.querySelector('#share-status').textContent='Link copied';}
 catch{document.querySelector('#share-status').textContent=shareURL;}
});
