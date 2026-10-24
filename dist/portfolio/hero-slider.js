import { createLayout, wrap } from './hero-layout.mjs?v=flat-layered-20261024';

const root = new URL('./', import.meta.url);
const stage = document.getElementById('orbit-stage');
const track = document.getElementById('orbit-ring');
const showcase = stage.closest('.photo-showcase');
const title = document.getElementById('orbit-label');
const explore = document.getElementById('showcase-explore');
const category = document.getElementById('showcase-category');
const count = document.getElementById('showcase-count');
const progress = document.getElementById('showcase-progress');
const status = document.getElementById('orbit-status');
const pause = document.getElementById('showcase-pause');
const choices = document.getElementById('story-choices');
const previous = document.getElementById('showcase-previous');
const next = document.getElementById('showcase-next');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 759px)');
let photos = [], position = 0, selected = -1, step = 330, drag = null;
let frame = null, autoTimer = null, autoPaused = reduced.matches;
let hovered = false, inView = false, manuallyMoved = false;
let destination = 0;

function scheduleAuto() {
  clearTimeout(autoTimer);
  if (photos.length < 2 || autoPaused || reduced.matches || hovered || manuallyMoved || drag || document.hidden || !inView || showcase.contains(document.activeElement)) return;
  autoTimer = setTimeout(() => settle(Math.round(position) + 1), 6500);
}
function syncPause() {
  pause.textContent = autoPaused ? 'Play rotation' : 'Pause rotation';
  pause.setAttribute('aria-pressed', String(autoPaused));
}
function togglePause() {
  autoPaused = !autoPaused;
  manuallyMoved = false;
  syncPause();
  status.textContent = autoPaused ? 'Automatic rotation paused.' : reduced.matches ? 'Reduced motion is enabled. Use the arrow keys or swipe to browse.' : 'Automatic rotation will resume when you leave the carousel.';
  scheduleAuto();
}
function render(announce = false) {
  if (!photos.length) return;
  const layout = createLayout(photos.map(photo => photo.width / photo.height), stage.clientWidth, stage.clientHeight, position, compact.matches);
  const index = wrap(Math.round(position), photos.length);
  photos.forEach((photo, i) => {
    const item = layout[i];
    // Upright photographs share a center line and glide between layered sizes.
    // Only the hidden wrap seam fades; photographs are never cropped.
    photo.element.style.width = `${photo.baseWidth}px`;
    photo.element.style.height = `${photo.baseHeight}px`;
    photo.element.style.transform = `translate(-50%, -50%) translate(${item.x}px, ${item.y}px) scale(${item.height / photo.baseHeight})`;
    photo.element.style.opacity = String(item.opacity);
    photo.element.style.zIndex = String(item.zIndex);
    photo.element.setAttribute('aria-hidden', String(i !== index));
    photo.chip.setAttribute('aria-pressed', String(i === index));
  });
  step = stage.clientWidth * (compact.matches ? .62 : .22);
  if (selected !== index) {
    selected = index;
    title.textContent = photos[index].label;
    title.href = photos[index].gallery;
    explore.href = photos[index].gallery;
    explore.setAttribute('aria-label', `Explore ${photos[index].label} gallery`);
    category.textContent = photos[index].kind;
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
    progress.style.width = `${100 / photos.length}%`;
    progress.style.transform = `translateX(${index * 100}%)`;
  }
  if (announce) status.textContent = `Photograph ${index + 1} of ${photos.length}. ${photos[index].label}`;
}
function settle(target, fromDrag = false) {
  if (!photos.length) return;
  destination = target;
  cancelAnimationFrame(frame);
  frame = null;
  if (reduced.matches) {
    position = wrap(target, photos.length);
    render(true); scheduleAuto(); return;
  }
  const from = position, started = performance.now();
  function animate(now) {
    const t = Math.min((now - started) / (fromDrag ? 700 : 1050), 1);
    // Buttons/autoplay ease in and out; a released drag keeps its momentum.
    const ease = fromDrag ? 1 - Math.pow(1 - t, 3) : t * t * t * (10 + t * (-15 + 6 * t));
    position = from + (target - from) * ease;
    render();
    if (t < 1) frame = requestAnimationFrame(animate);
    else { position = wrap(target, photos.length); destination = position; frame = null; render(true); scheduleAuto(); }
  }
  frame = requestAnimationFrame(animate);
}
stage.addEventListener('pointerdown', event => {
  if (event.button !== 0 || photos.length < 2 || drag) return;
  cancelAnimationFrame(frame); frame = null;
  destination = Math.round(position);
  clearTimeout(autoTimer);
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, start: position, step, lastX: event.clientX, lastTime: event.timeStamp, velocity: 0, locked: false };
  stage.setPointerCapture(event.pointerId);
});
stage.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.id) return;
  const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
  if (!drag.locked) {
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { endDrag(event, true); return; }
    if (Math.abs(dx) < 5) return;
    drag.locked = true; manuallyMoved = true;
    stage.classList.add('is-dragging');
  }
  const dt = Math.max(event.timeStamp - drag.lastTime, 1);
  drag.velocity = -(event.clientX - drag.lastX) / drag.step / dt;
  drag.lastX = event.clientX; drag.lastTime = event.timeStamp;
  position = drag.start - dx / drag.step;
  render();
});
function endDrag(event, cancel = false) {
  if (!drag || event.pointerId !== drag.id) return;
  const velocity = !cancel && event.timeStamp - drag.lastTime < 120 ? Math.max(-.003, Math.min(.003, drag.velocity)) : 0;
  const pointer = drag.id, fromDrag = drag.locked;
  const target = Math.round(position + velocity * 120);
  drag = null; stage.classList.remove('is-dragging');
  if (stage.hasPointerCapture(pointer)) stage.releasePointerCapture(pointer);
  settle(target, fromDrag);
}
stage.addEventListener('pointerup', event => endDrag(event));
stage.addEventListener('pointercancel', event => endDrag(event, true));
stage.addEventListener('lostpointercapture', event => endDrag(event, true));
stage.addEventListener('keydown', event => {
  if (!photos.length) return;
  if (event.code === 'Space') { event.preventDefault(); togglePause(); return; }
  const current = frame === null ? Math.round(position) : destination;
  const targets = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: current - wrap(current, photos.length), End: current + photos.length - 1 - wrap(current, photos.length) };
  if (event.key in targets) {
    event.preventDefault(); manuallyMoved = true; clearTimeout(autoTimer); settle(targets[event.key]);
  }
});
pause.addEventListener('click', togglePause);
function changeBy(amount) {
  if (!photos.length) return;
  manuallyMoved = true; clearTimeout(autoTimer);
  settle((frame === null ? Math.round(position) : destination) + amount);
}
previous.addEventListener('click', () => changeBy(-1));
next.addEventListener('click', () => changeBy(1));
showcase.addEventListener('mouseenter', () => { hovered = true; scheduleAuto(); });
showcase.addEventListener('mouseleave', () => { hovered = false; manuallyMoved = false; scheduleAuto(); });
showcase.addEventListener('focusin', scheduleAuto);
showcase.addEventListener('focusout', () => requestAnimationFrame(scheduleAuto));
document.addEventListener('visibilitychange', scheduleAuto);
new IntersectionObserver(entries => {
  inView = entries[0].isIntersecting && entries[0].intersectionRatio >= .35;
  if (!inView) manuallyMoved = false;
  scheduleAuto();
}, { threshold: .35 }).observe(stage);
new ResizeObserver(() => render()).observe(stage);
reduced.addEventListener('change', () => {
  cancelAnimationFrame(frame); frame = null; position = Math.round(position);
  if (reduced.matches) autoPaused = true;
  syncPause(); render(); scheduleAuto();
});
async function load(file) {
  const response = await fetch(new URL(file, root));
  if (!response.ok) throw new Error('Photography unavailable');
  return response.json();
}
syncPause();
Promise.all([load('selection.json?v=clean-photographs'), load('collections.json?v=clean-photographs')]).then(([all, collections]) => {
  const chosen = [all.find(p => p.category === 'Creative portraits'), all.find(p => p.feature === 'people'), all.find(p => p.category === 'Weddings & connection'), all.find(p => p.label === 'Forged in Fire'), all.find(p => p.feature === 'moment'), all.find(p => p.opening === 1)].filter(Boolean);
  // Keep the visual editor's chosen/carouselIds assignment contract above.
  const chipNames = new Map([
    [all.find(p => p.category === 'Creative portraits')?.id, 'Prom portraits'],
    [all.find(p => p.feature === 'people')?.id, 'Laudem recital'],
    [all.find(p => p.category === 'Weddings & connection')?.id, 'Weddings'],
    [all.find(p => p.label === 'Forged in Fire')?.id, 'Forged in Fire'],
    [all.find(p => p.feature === 'moment')?.id, 'Live performance'],
    [all.find(p => p.opening === 1)?.id, 'Events'],
  ]);
  photos = chosen.map((photo, index) => {
    const chipName = chipNames.get(photo.id) || photo.label;
    const chip = document.createElement('button');
    chip.type = 'button'; chip.textContent = chipName;
    chip.setAttribute('aria-label', `Show ${chipName}`);
    chip.setAttribute('aria-controls', 'orbit-stage');
    chip.setAttribute('aria-pressed', String(index === 0));
    chip.addEventListener('click', () => {
      manuallyMoved = true; clearTimeout(autoTimer);
      settle(index + Math.round((position - index) / photos.length) * photos.length);
    });
    choices.insertBefore(chip, choices.lastElementChild);
    const element = document.createElement('figure');
    element.className = 'showcase-photo';
    element.setAttribute('role', 'group');
    element.setAttribute('aria-roledescription', 'slide');
    element.setAttribute('aria-label', `${index + 1} of ${chosen.length}: ${photo.label}`);
    const img = document.createElement('img');
    img.src = new URL(photo.src, root).href; img.alt = photo.alt;
    img.width = photo.width; img.height = photo.height;
    img.draggable = false; img.decoding = 'async';
    if (!index) img.fetchPriority = 'high';
    element.append(img); track.append(element);
    const collection = collections.find(g => g.photos.some(p => p.id === photo.id));
    const gallery = collection ? collection.path : 'portfolio/';
    const kind = photo.feature === 'people' || photo.category === 'Creative portraits' ? 'Portraits' : photo.category === 'Weddings & connection' ? 'Weddings' : photo.feature === 'moment' ? 'Live performance' : 'Events';
    return { ...photo, element, chip, gallery, kind, baseWidth: 500 * photo.width / photo.height, baseHeight: 500 };
  });
  if (!photos.length) throw new Error('Featured photographs missing');
  previous.disabled = next.disabled = photos.length === 1;
  pause.hidden = photos.length === 1;
  render(); scheduleAuto();
}).catch(() => {
  photos = []; clearTimeout(autoTimer);
  track.replaceChildren(); stage.textContent = 'Explore our photography in the galleries below.';
  title.textContent = 'Explore the portfolio'; title.href = 'portfolio/';
  explore.href = 'portfolio/'; stage.removeAttribute('tabindex'); pause.hidden = true;
  previous.disabled = true; next.disabled = true;
  choices.querySelectorAll('button').forEach(button => button.remove());
});
window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); clearTimeout(autoTimer); });
window.addEventListener('pageshow', () => { position = Math.round(position); render(); scheduleAuto(); });
