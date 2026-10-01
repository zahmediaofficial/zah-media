// Image and business-policy references live in ../content/graduation.json.
// Development image overrides are served by the local preview only, never published.
const root=new URL('../',document.currentScript.src);
const photoButtons=[...document.querySelectorAll('.story-photo')];
const viewer=document.querySelector('#photo-viewer');let opened=0,returnFocus;
const bookingURL=(base,id)=>{const url=new URL(base,root);url.searchParams.set('service','graduation');if(id)url.searchParams.set('package',id);return url.href;};
function imageURL(value){if(typeof value!=='string'||!value.trim())return null;try{const url=new URL(value.replace(/^\/?zah-media\//,'').replace(/^\/(?!\/)/,''),root);if(url.protocol!=='https:'&&url.origin!==location.origin)return null;return url;}catch{return null;}}
function renderPhotos(config){for(const slot of document.querySelectorAll('[data-photo]')){const photo=config.images?.[slot.dataset.photo];if(!photo?.src)continue;if(photo.developmentOnly&&!['localhost','127.0.0.1','[::1]'].includes(location.hostname))continue;const url=imageURL(photo.src);if(!url)continue;
 const img=new Image();img.alt=photo.alt||'Graduation portrait';img.width=photo.width||1200;img.height=photo.height||1600;img.loading=slot.dataset.photo==='hero'?'eager':'lazy';img.decoding='async';if(slot.dataset.photo==='hero')img.fetchPriority='high';
 if(url.hostname==='images.pexels.com'&&photo.developmentOnly){const widths=[360,640,960,1440];img.srcset=widths.map(width=>{const u=new URL(url);u.searchParams.set('w',width);u.searchParams.set('auto','compress');u.searchParams.set('fit','crop');return u.href+' '+width+'w';}).join(', ');img.sizes=slot.dataset.photo==='hero'?'(max-width: 760px) 100vw, 58vw':'(max-width: 760px) 100vw, 60vw';url.searchParams.set('w',slot.dataset.photo==='hero'?'1440':'960');url.searchParams.set('auto','compress');}
 else if(Array.isArray(photo.variants)){img.srcset=photo.variants.filter(v=>Number.isInteger(v.width)&&imageURL(v.src)).map(v=>imageURL(v.src).href+' '+v.width+'w').join(', ');img.sizes='(max-width: 760px) 100vw, 60vw';}
 img.src=url.href;slot.style.setProperty('--photo-position',photo.position||'50% 35%');slot.replaceChildren(img);if(slot.tagName==='BUTTON'){slot.disabled=false;slot.setAttribute('aria-label','Open photograph: '+img.alt);}
 img.addEventListener('error',()=>{slot.replaceChildren();if(slot.tagName==='BUTTON')slot.disabled=true;});
}}
function showPhoto(index){const available=photoButtons.filter(b=>!b.disabled);if(!available.length)return;opened=(index+available.length)%available.length;const image=available[opened].querySelector('img');const full=document.querySelector('#viewer-image');full.src=image.src;full.alt=image.alt;document.querySelector('#viewer-position').textContent=`${String(opened+1).padStart(2,'0')} / ${String(available.length).padStart(2,'0')}`;}
photoButtons.forEach(button=>button.addEventListener('click',()=>{returnFocus=button;showPhoto(photoButtons.filter(b=>!b.disabled).indexOf(button));viewer.showModal();document.body.classList.add('viewer-open');document.querySelector('#viewer-close').focus();}));
document.querySelector('#viewer-close').addEventListener('click',()=>viewer.close());
document.querySelector('#viewer-prev').addEventListener('click',()=>showPhoto(opened-1));document.querySelector('#viewer-next').addEventListener('click',()=>showPhoto(opened+1));
viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(opened-1);}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(opened+1);}});
viewer.addEventListener('click',e=>{if(e.target===viewer){const r=viewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)viewer.close();}});
viewer.addEventListener('close',()=>{document.body.classList.remove('viewer-open');document.querySelector('#viewer-image').removeAttribute('src');returnFocus?.focus();});
const menu=document.querySelector('.mobile-menu');menu.addEventListener('click',e=>{if(e.target.closest('a'))menu.open=false;});document.addEventListener('keydown',e=>{if(e.key==='Escape')menu.open=false;});
const sticky=document.querySelector('.sticky-book');
if('IntersectionObserver'in window){const visible=new Set();const stickyObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);}sticky.classList.toggle('at-final',visible.size>0);sticky.setAttribute('tabindex',visible.size>0?'-1':'0');},{threshold:0});stickyObserver.observe(document.querySelector('.grad-hero'));stickyObserver.observe(document.querySelector('.grad-final'));stickyObserver.observe(document.querySelector('footer'));}
if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('motion');const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.remove('pending');observer.unobserve(e.target);}},{rootMargin:'0px 0px -30px 0px',threshold:.05});for(const el of document.querySelectorAll('.reveal')){el.classList.add('pending');observer.observe(el);}}
async function configure(){const response=await fetch(new URL('content/graduation.json',root),{cache:'no-cache'});if(!response.ok)throw Error('Configuration unavailable');const config=await response.json();renderPhotos(config);
 for(const link of document.querySelectorAll('[data-book]')){const url=bookingURL(config.booking_url||'booking/',link.dataset.book);if(new URL(url).origin===location.origin||new URL(url).protocol==='https:')link.href=url;}
 for(const el of document.querySelectorAll('[data-policy]')){const text=config.policies?.[el.dataset.policy];if(typeof text==='string'&&text.trim())el.textContent=text;}
 if(typeof config.whatsapp_number==='string'&&/^\d{10,15}$/.test(config.whatsapp_number)){const link=document.querySelector('#whatsapp');link.href='https://wa.me/'+config.whatsapp_number+'?text='+encodeURIComponent('Hi ZAH Media, I’d like to book a graduation portrait session.');link.hidden=false;document.querySelector('#email-contact').hidden=true;}
 if(config.production_ready===true){document.querySelector('meta[name=robots]').content='index,follow';}
 if(config.og_image){const url=imageURL(config.og_image);if(url){const meta=document.createElement('meta');meta.setAttribute('property','og:image');meta.content=url.href;document.head.append(meta);}}
}
configure().catch(()=>{/* Static packages, policies and booking links remain usable. */});
