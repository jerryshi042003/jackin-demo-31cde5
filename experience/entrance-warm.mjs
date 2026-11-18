// Keep a single live stadium iframe through unlock so its decoded model and GPU
// resources survive. Only public media is prepared before the password is valid.
const preparing = document.createElement('main');
preparing.className = 'arrival';
preparing.inert = true;
preparing.style.cssText = 'position:fixed;inset:0;visibility:hidden;pointer-events:none';
const stage = document.createElement('div');
stage.id = 'landing-stage';
stage.style.gridRow = '2';
preparing.append(stage);
document.body.append(preparing);

const previews = new Map();
if (!['#demo', '#game'].includes(location.hash)) {
  for (const [id, clip] of [['preview','demo'], ['game-preview','game']]) {
    const video = document.createElement('video');
    video.id = id;
    video.muted = video.defaultMuted = video.loop = video.playsInline = true;
    video.preload = 'auto';
    video.poster = `media/${clip}-preview.webp`;
    video.src = `media/${clip}-preview.mp4`;
    video.setAttribute('aria-hidden', 'true');
    video.tabIndex = -1;
    video.load();
    previews.set(id, video);
  }
  const frame = document.createElement('iframe');
  frame.title = 'Orbit the stadium';
  frame.src = 'scene/?landing&warm&v=r21';
  stage.append(frame);
}

export function reveal(html) {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const arrival = parsed.querySelector('main.arrival');
  const originalStage = arrival.querySelector('#landing-stage');
  stage.setAttribute('aria-label', originalStage.getAttribute('aria-label'));
  for (const [id, video] of previews) arrival.querySelector('#' + id).replaceWith(video);
  // Insert the protected controls around the already-mounted frame. Reparenting
  // an iframe would reload it in Safari and discard the entire warm-up.
  for (const child of Array.from(arrival.children)) {
    if (child === originalStage) continue;
    if (child.tagName === 'HEADER') preparing.prepend(child);
    else preparing.append(child);
  }
  arrival.remove();
  document.body.append(...parsed.body.children);
  document.title = parsed.title;
  document.querySelector('#gate').remove();
  document.querySelector('#gate-style').remove();
  preparing.removeAttribute('style');
  preparing.inert = false;
  stage.style.removeProperty('grid-row');
  // The gate already loaded the landing stylesheet and font. Load the two
  // original scripts in order only after their decrypted controls exist.
  for (const source of parsed.head.querySelectorAll('script[src]')) {
    const script = document.createElement('script');
    script.async = false;
    script.src = source.getAttribute('src');
    document.head.append(script);
  }
}
