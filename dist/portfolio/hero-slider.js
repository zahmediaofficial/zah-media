(() => {
  const root = new URL('./', document.currentScript.src);
  const stage = document.getElementById('orbit-stage');
  if (!stage) return;
  const track = document.getElementById('orbit-ring');
  const title = document.getElementById('orbit-label');
  const category = document.getElementById('showcase-category');
  const count = document.getElementById('showcase-count');
  const progress = document.getElementById('showcase-progress');
  const status = document.getElementById('orbit-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let photos = [], position = 0, drag = null, frame = null, step = 300, selected = -1;
  let autoTimer = null, autoPaused = reduced.matches, hovered = false, inView = false;
  function scheduleAuto() {
    clearTimeout(autoTimer);
    if (!photos.length || autoPaused || reduced.matches || hovered || drag || document.hidden || !inView || stage.matches(':focus-visible')) return;
    autoTimer = setTimeout(() => settle(Math.round(position) + 1), 6500);
  }
  const wrap = (n, length) => ((n % length) + length) % length;
  function render(announce = false) {
    if (!photos.length) return;
    const total = photos.length;
    photos.forEach((photo, i) => {
      const distance = wrap(i - position + total / 2, total) - total / 2;
      const depth = Math.abs(distance);
      const scale = Math.pow(.89, Math.min(depth, 3));
      photo.element.style.transform = `translate(-50%, -50%) translateX(${distance * step}px) scale(${scale})`;
      photo.element.style.opacity = String(Math.max(0, Math.min(1, (3.1 - depth) / .5)));
      photo.element.style.zIndex = String(10 - Math.round(depth * 3));
      photo.element.setAttribute('aria-hidden', String(i !== wrap(Math.round(position), total)));
    });
    const index = wrap(Math.round(position), total);
    if (selected !== index) {
      selected = index;
      title.textContent = photos[index].label;
      title.href = photos[index].gallery;
      category.textContent = photos[index].kind;
      count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      progress.style.width = `${100 / total}%`;
      progress.style.transform = `translateX(${index * 100}%)`;
    }
    if (announce) status.textContent = `Photograph ${index + 1} of ${total}. ${photos[index].label}`;
  }
  function resize() {
    const width = stage.clientWidth, height = stage.clientHeight;
    const centerWidth = Math.min(390, width * .54);
    step = centerWidth * .64;
    photos.forEach(photo => {
      const h = Math.min(height * .86, Math.min(540, width * .72) / (photo.width / photo.height));
      photo.element.style.width = `${h * photo.width / photo.height}px`;
      photo.element.style.height = `${h}px`;
    });
    render();
  }
  function settle(target) {
    cancelAnimationFrame(frame);
    if (reduced.matches) { position = target; render(true); scheduleAuto(); return; }
    const from = position, started = performance.now();
    function animate(now) {
      const t = Math.min((now - started) / 1050, 1);
      position = from + (target - from) * (1 - Math.pow(1 - t, 4));
      render();
      if (t < 1) frame = requestAnimationFrame(animate);
      else { position = wrap(target, photos.length); frame = null; render(true); scheduleAuto(); }
    }
    frame = requestAnimationFrame(animate);
  }
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !photos.length) return;
    cancelAnimationFrame(frame);
    clearTimeout(autoTimer);
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, start: position, lastX: event.clientX, lastTime: event.timeStamp, velocity: 0, locked: false };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.locked) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { cancelDrag(); return; }
      if (Math.abs(dx) < 5) return;
      drag.locked = true;
      stage.classList.add('is-dragging');
    }
    const dt = Math.max(event.timeStamp - drag.lastTime, 1);
    drag.velocity = -(event.clientX - drag.lastX) / step / dt;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    position = drag.start - dx / step;
    render();
  });
  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const velocity = event.timeStamp - drag.lastTime < 120 ? Math.max(-.003, Math.min(.003, drag.velocity)) : 0;
    const target = Math.round(position + velocity * 150);
    const pointer = drag.id;
    drag = null;
    stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture(pointer)) stage.releasePointerCapture(pointer);
    settle(target);
  }
  function cancelDrag() {
    if (!drag) return;
    const pointer = drag.id;
    drag = null;
    stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture(pointer)) stage.releasePointerCapture(pointer);
    settle(Math.round(position));
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', cancelDrag);
  stage.addEventListener('lostpointercapture', cancelDrag);
  stage.addEventListener('keydown', event => {
    if (!photos.length) return;
    if (event.code === 'Space') { event.preventDefault(); autoPaused = !autoPaused; status.textContent = autoPaused ? 'Automatic rotation paused.' : 'Automatic rotation resumed.'; scheduleAuto(); return; }
    clearTimeout(autoTimer);
    const current = Math.round(position);
    const targets = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: current - wrap(current, photos.length), End: current + photos.length - 1 - wrap(current, photos.length) };
    if (event.key in targets) { event.preventDefault(); settle(targets[event.key]); }
  });
  stage.addEventListener('mouseenter', () => { hovered = true; scheduleAuto(); });
  stage.addEventListener('mouseleave', () => { hovered = false; scheduleAuto(); });
  stage.addEventListener('focus', scheduleAuto);
  stage.addEventListener('blur', scheduleAuto);
  document.addEventListener('visibilitychange', scheduleAuto);
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; scheduleAuto(); }, { threshold: .2 }).observe(stage);
  new ResizeObserver(resize).observe(stage);
  reduced.addEventListener('change', () => { cancelAnimationFrame(frame); position = Math.round(position); autoPaused = reduced.matches; render(); scheduleAuto(); });
  async function load(name) {
    const response = await fetch(new URL(name, root));
    if (!response.ok) throw new Error('Photography unavailable');
    return response.json();
  }
  Promise.all([load('selection.json?v=clean-photographs'), load('collections.json?v=clean-photographs')]).then(([all, collections]) => {
    const chosen = [all.find(p => p.category === 'Creative portraits'), all.find(p => p.feature === 'people'), all.find(p => p.category === 'Weddings & connection'), all.find(p => p.label === 'Forged in Fire'), all.find(p => p.feature === 'moment'), all.find(p => p.opening === 1)].filter(Boolean);
    photos = chosen.map((photo, index) => {
      const element = document.createElement('figure');
      element.className = 'showcase-photo';
      element.setAttribute('aria-roledescription', 'slide');
      element.setAttribute('aria-label', `${index + 1} of ${chosen.length}: ${photo.label}`);
      const img = document.createElement('img');
      img.src = new URL(photo.src, root).href;
      img.alt = photo.alt;
      img.width = photo.width; img.height = photo.height;
      img.draggable = false; img.decoding = 'async';
      if (!index) img.fetchPriority = 'high';
      element.append(img); track.append(element);
      const collection = collections.find(g => g.photos.some(p => p.id === photo.id));
      const gallery = collection ? collection.path : 'portfolio/';
      const kind = photo.feature === 'people' || photo.category === 'Creative portraits' ? 'Portraits' : photo.category === 'Weddings & connection' ? 'Weddings' : photo.feature === 'moment' ? 'Live performance' : 'Events';
      return { ...photo, element, gallery, kind };
    });
    if (!photos.length) throw new Error('No photographs');
    resize();
    scheduleAuto();
  }).catch(() => {
    stage.textContent = 'Explore our photography in the galleries below.';
    title.textContent = 'Explore the portfolio';
    stage.removeAttribute('tabindex');
  });
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); clearTimeout(autoTimer); });
  window.addEventListener('pageshow', scheduleAuto);
})();
