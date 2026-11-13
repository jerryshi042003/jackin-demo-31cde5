// Jack In mark: the LA Galaxy crest as a "thinking logo" — a 3D dot cloud that leaves the crest for a working form and comes back.
// Engine: thinking-logos by Enes Ozturk, a fork of thinking-orbs by Jakub Antalik (MIT). https://github.com/enesozturk/thinking-logos
window.GALAXY_MARK_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-6 -6 210.25 264\"><path d=\"M99.15 252C38.34 220.23.62 133.76 0 62.01c20.67-4.77 61.84-13.26 99.14-62 37.29 48.82 78.41 57.32 99.11 62-.61 71.75-38.33 158.16-99.1 189.93\" fill=\"none\" stroke=\"#000\" stroke-width=\"9\" stroke-linejoin=\"round\"/><path d=\"M158.73 172.61a319.61 319.61 0 0 0-59.64-5.39 317.07 317.07 0 0 0-62 5.87 203.54 203.54 0 0 0-19.84 4.77c4.58 7.14 9.81 15.46 14.31 22.26 4.42-1.1 9.08-2.11 13.9-3.08a274.07 274.07 0 0 1 53.79-5.09 276.82 276.82 0 0 1 51.68 4.66c5.71 1.1 11.13 2.19 16.12 3.34 4.6-7 9.65-15 14.31-22-5.28-1.59-13.15-3.51-22.39-5.3\" fill=\"none\" stroke=\"#000\" stroke-width=\"5\"/><path d=\"M52.03 98.27v45.28a5.3 5.3 0 0 0 5.22 5.21h29.54v-5.65h-28.3V98.27h-6.46z\" fill=\"#000\"/><path d=\"M98.94 148.76h6.2l4.77-12.26h17.64c-.86-2.21-1.34-3.4-1.84-4.77h-13.92l11.73-29.97 13.79 35.38s3 8 4.29 11.62h6.74c-2.62-6.42-16.52-41-18-44.67s-3.18-5.52-6.11-5.52h-.07c-4.17 0-5.66 1.83-7.14 5.47 0 0-16 39.58-18.08 44.71\" fill=\"#000\"/><path d=\"M99.15 51.07a.11.11 0 0 1 .11.11 27.68 27.68 0 0 0 25.14 25.46.12.12 0 0 1 .13.13c0 .13-.1.11-.14.13a27.16 27.16 0 0 0-6 1.19 27.64 27.64 0 0 0-19.15 24.17.12.12 0 0 1-.1.13.13.13 0 0 1-.11-.13 27.61 27.61 0 0 0-25.12-25.35.14.14 0 0 1-.12-.15c0-.13 0-.11.13-.13a27.67 27.67 0 0 0 25.1-25.41.13.13 0 0 1 .13-.13\" fill=\"#000\"/><path d=\"M116.08 76.71a16.82 16.82 0 0 1-16.84-16.62.1.1 0 0 0-.19 0 16.51 16.51 0 0 1-4.77 11.75 16.68 16.68 0 0 1-11.72 4.92.1.1 0 0 0-.1.1.1.1 0 0 0 .1 0 16.82 16.82 0 0 1 16.51 17 .1.1 0 0 0 .1 0 16.93 16.93 0 0 1 16.91-16.98.1.1 0 0 0 .08-.1\" fill=\"#000\"/></svg>";
// mountMark(canvas, {state, size, tint, count}) -> {draw(timeSeconds), setSpeed(x), ready}
window.mountMark = function(canvas, o){
  const TL = window.ThinkingLogos, ctx = canvas.getContext('2d'), size = o.size || 200, rgb = TL.adaptTint(TL.parseTint(o.tint || '#2ff5d0'), true);
  const m = { ready:false, speed:1, t:0, last:-1,
    draw(now){ if(!m.ready) return; if(m.last<0) m.last=now; m.t += (now-m.last)*m.speed*m.base; m.last=now;
      const k = canvas.width/size; ctx.setTransform(k,0,0,k,0,0); ctx.clearRect(0,0,size,size);
      TL.paintFrameTinted(ctx, m.frame(size, m.t, m.opts, m.binding), true, rgb); },
    setSpeed(x){ m.speed=x; } };
  TL.bakeLogo({svg: window.GALAXY_MARK_SVG}, {count: o.count || 420, style: o.style || 'fill'}).then(points => {
    const r = TL.resolveLogo(o.state || 'thinking', points, o.tune); m.frame=r.frame; m.opts=r.opts; m.binding=r.binding; m.base=r.speed;
    m.t = (typeof r.opts.dwell==='number'?r.opts.dwell:5.5) + (typeof r.opts.morph==='number'?r.opts.morph:1.9) - .6;   // open just before the crest is fully formed
    m.ready=true; }).catch(e => console.warn('mark bake failed', e));
  return m;
};
