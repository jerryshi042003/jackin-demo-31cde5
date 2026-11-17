'use strict';
const dialog=document.querySelector('#experience'),film=document.querySelector('#film'),preview=document.querySelector('#preview'),host=document.querySelector('#game-host'),playError=document.querySelector('#play-error');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let mode=null;
function syncPreview(){if(reduced.matches||document.hidden||dialog.open)preview.pause();else preview.play().catch(()=>{});}
function fullScreen(){try{if(mode==='demo'&&typeof film.webkitEnterFullscreen==='function')film.webkitEnterFullscreen();else document.documentElement.requestFullscreen?.().catch(()=>{});}catch{/* The dialog still fills the browser viewport. */}}
function open(modeToOpen,userGesture=true,push=true){
 mode=modeToOpen;film.hidden=mode!=='demo';host.hidden=mode!=='game';playError.hidden=true;
 if(!dialog.open)dialog.showModal();
 if(push)history.pushState({experience:mode},'',`#${mode}`);
 if(mode==='demo'){film.currentTime=0;film.play().catch(()=>{playError.hidden=false;});}
 else{film.pause();const iframe=document.createElement('iframe');iframe.title='Spiral galaxy and Ring Lock game';iframe.src='https://jerryshi042003.github.io/jackin-demo-31cde5/';iframe.allow='fullscreen; autoplay';iframe.allowFullscreen=true;host.replaceChildren(iframe);}
 syncPreview();if(userGesture)fullScreen();
}
function returnToEntrance(){const pushed=Boolean(history.state?.experience);dialog.close();if(pushed)history.back();else history.replaceState(null,'',location.pathname+location.search);}
document.querySelector('#open-demo').addEventListener('click',()=>open('demo'));
document.querySelector('#open-game').addEventListener('click',()=>open('game'));
document.querySelector('#back').addEventListener('click',returnToEntrance);
dialog.addEventListener('cancel',e=>{e.preventDefault();returnToEntrance();});
dialog.addEventListener('close',()=>{film.pause();host.replaceChildren();mode=null;if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});syncPreview();});
film.addEventListener('playing',()=>{playError.hidden=true;});
film.addEventListener('webkitendfullscreen',()=>{if(dialog.open)returnToEntrance();});
addEventListener('popstate',()=>{if(dialog.open)dialog.close();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)film.pause();syncPreview();});
reduced.addEventListener('change',syncPreview);syncPreview();
if(location.hash==='#demo'||location.hash==='#game')open(location.hash.slice(1),false,false);
