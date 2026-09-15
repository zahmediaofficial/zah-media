// Pages CMS edits the JSON files in content/ and uploads images to assets/.
// Keep the published pages useful even if a content request temporarily fails.
const siteRoot = new URL('./', document.currentScript.src);
const photoURL = value => {
  if (typeof value !== 'string' || !value.trim()) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const relative = value.replace(/^\/?zah-media\//, '').replace(/^\/+/, '');
  return new URL(relative, siteRoot).href;
};
const loadContent = async name => {
  const response = await fetch(new URL(`content/${name}.json`, siteRoot), { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Unable to load ${name} content`);
  return response.json();
};
const putText = (element, value) => {
  if (element && typeof value === 'string') element.textContent = value;
};
const putPhoto = (image, photo) => {
  const url = photoURL(photo?.image);
  if (!image || !url) return;
  image.src = url;
  image.alt = photo.alt || '';
  image.removeAttribute('width');
  image.removeAttribute('height');
};

async function updateGallery(type) {
  const content = await loadContent(type);
  putText(document.querySelector('.gallery-hero > p:last-child'), content.introduction);
  putText(document.querySelector('.gallery-note > p'), content.note);
  const gallery = document.querySelector('.gallery');
  if (!gallery || !Array.isArray(content.photos)) return;
  const photos = content.photos.filter(photo => photoURL(photo?.image));
  if (!photos.length) return;
  const existing = gallery.querySelectorAll(':scope > figure');
  const note = gallery.querySelector('.gallery-note');
  const fragment = document.createDocumentFragment();
  photos.forEach((photo, index) => {
    const figure = document.createElement('figure');
    const frame = document.createElement('div');
    frame.className = 'gallery-feature';
    const image = document.createElement('img');
    image.loading = index === 0 ? 'eager' : 'lazy';
    putPhoto(image, photo);
    frame.append(image);
    const caption = document.createElement('figcaption');
    caption.className = 'photo-caption';
    const label = document.createElement('span');
    label.textContent = photo.caption || '';
    const count = document.createElement('span');
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
    caption.append(label, count);
    figure.append(frame, caption);
    fragment.append(figure);
  });
  existing.forEach(figure => figure.remove());
  gallery.insertBefore(fragment, note);
  const credits = [...new Set(photos.map(photo => photo.credit).filter(Boolean))];
  const credit = document.querySelector('.credit');
  putText(credit, credits.length ? `Photography: ${credits.join(', ')}.` : '');
}

async function updateHome() {
  const [home, weddings, events, portraits] = await Promise.all([
    loadContent('home'), loadContent('weddings'), loadContent('events'), loadContent('portraits')
  ]);
  putText(document.querySelector('.hero-intro'), home.hero_intro);
  putText(document.querySelector('#about > p:not(.eyebrow)'), home.about_intro);
  const featured = { weddings: weddings.photos?.[0], events: events.photos?.[0], portraits: portraits.photos?.[0] };
  putPhoto(document.querySelector('.ribbon-wedding img'), featured.weddings);
  putPhoto(document.querySelector('.wedding-panel > img'), featured.weddings);
  putPhoto(document.querySelector('.ribbon-event img'), featured.events);
  putPhoto(document.querySelector('.event-panel > img'), featured.events);
  putPhoto(document.querySelector('.ribbon-portrait img'), featured.portraits);
  putPhoto(document.querySelector('.portrait-image img'), featured.portraits);
  const label = (photo, type) => photo?.illustrative ? 'Illustrative image' : `ZAH Media ${type} photography`;
  putText(document.querySelector('.event-panel .image-label'), label(featured.events, 'event'));
  putText(document.querySelector('.portrait-panel .image-label'), label(featured.portraits, 'portrait'));
  putText(document.querySelector('.wedding-panel .image-label'), label(featured.weddings, 'wedding'));
  const stock = Object.entries(featured).filter(([, photo]) => photo?.illustrative).map(([type]) => type);
  const note = stock.length ? `Illustrative stock images: ${stock.join(' and ')}.` : 'Photography by ZAH Media.';
  putText(document.querySelector('.sample-note'), note);
  putText(document.querySelector('.stock-disclosure'), note);
  const credits = [...new Set(Object.values(featured).map(photo => photo?.credit).filter(Boolean))];
  putText(document.querySelector('.footer-bottom details p'), `Photography: ${credits.join(', ')}.`);
}

async function updateAbout() {
  const [about, weddings] = await Promise.all([loadContent('about'), loadContent('weddings')]);
  putText(document.querySelector('.about-hero .lead'), about.lead);
  const paragraphs = document.querySelectorAll('.story-copy > p:not(.eyebrow)');
  putText(paragraphs[0], about.story_one);
  putText(paragraphs[1], about.story_two);
  const featured = weddings.photos?.[0];
  putPhoto(document.querySelector('.story figure img'), featured);
  putText(document.querySelector('.story figcaption'), featured?.caption);
}

const page = location.pathname.replace(/\/+$/, '').split('/').pop();
const task = ['weddings', 'events', 'portraits'].includes(page)
  ? updateGallery(page)
  : page === 'about' ? updateAbout() : document.querySelector('.hero') ? updateHome() : null;
task?.catch(error => console.warn('Using saved page content:', error));

