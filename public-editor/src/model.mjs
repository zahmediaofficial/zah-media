export const ROOT='https://zahmediastudio.com/';
export const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export function validate(state, original){
 if(!state||state.base!==original.base||!Array.isArray(state.collections)||state.collections.length!==original.collections.length)throw Error('Invalid draft.');
 const ids=new Set();const paths=new Map(original.collections.map(g=>[g.id,g]));
 for(const g of state.collections){const old=paths.get(g.id);if(!old||ids.has(g.id)||g.path!==old.path||g.slug!==old.slug||g.category!==old.category)throw Error('Gallery identity cannot change.');ids.add(g.id);
  if(typeof g.title!=='string'||!g.title.trim()||g.title.length>160||!Array.isArray(g.photos)||!g.photos.length||g.photos.length>500)throw Error('Each gallery needs a title and photos.');
  const photos=new Set();for(const p of [...g.photos,...(g.cover?[g.cover]:[])]){if(!/^[\w-]{1,200}$/.test(p.id)||!/^assets\/[\w-]+\.(webp|jpg|png)$/.test(p.src)||!Number.isInteger(p.width)||!Number.isInteger(p.height)||p.width<1||p.height<1||p.width>10000||p.height>10000||typeof p.alt!=='string'||p.alt.length>500)throw Error('Invalid photograph.');if(g.photos.includes(p)){if(photos.has(p.id))throw Error('Duplicate photo in gallery.');photos.add(p.id);}}
 }
 if(!Array.isArray(state.carousel)||state.carousel.length<1||state.carousel.length>12)throw Error('Choose 1–12 carousel images.');
 const all=new Set(state.collections.flatMap(g=>g.photos.map(p=>p.id)));if(state.carousel.some(id=>!all.has(id)))throw Error('Carousel photo must belong to a public gallery.');
 if(!Array.isArray(state.text)||state.text.length!==original.text.length)throw Error('Invalid text fields.');
 state.text.forEach((f,i)=>{const o=original.text[i];if(f.page!==o.page||f.key!==o.key||typeof f.value!=='string'||f.value.length>3000)throw Error('Invalid page text.');});
 return state;
}
export function photoMarkup(p,i){const ratio=p.width/p.height;return `<figure class="photo collection-print" data-orientation="${ratio>1.15?'landscape':ratio<.85?'portrait':'square'}" data-sequence="${i%8}"><button type="button" aria-label="Open ${escape(p.alt)}"><img src="../../portfolio/${p.src}" alt="${escape(p.alt)}" width="${p.width}" height="${p.height}" loading="lazy" decoding="async"></button><figcaption><span>${escape(p.label)}</span><span aria-hidden="true">↗</span></figcaption></figure>`;}
export function renderGallery(html,g){
 const grid=/<div class="collection-grid" id="collection-grid">[\s\S]*?<\/div><button class="load-more"/;
 if(!grid.test(html))throw Error('Gallery template changed. Refresh the draft.');
 html=html.replace(grid,()=>'<div class="collection-grid" id="collection-grid">'+g.photos.map(photoMarkup).join('')+'</div><button class="load-more"');
 html=html.replace(/(<h1 id="project-title">)[\s\S]*?(<\/h1>)/,(_,a,b)=>a+escape(g.title)+b).replace(/(<p class="collection-status" id="project-status">).*?(<\/p>)/,(_,a,b)=>a+`Showing ${g.photos.length} of ${g.photos.length} photographs`+b);
 html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,(_,j)=>{const data=JSON.parse(j);data.name=g.title;data.hasPart=g.photos.map(p=>({'@type':'ImageObject',contentUrl:ROOT+'portfolio/'+p.src,name:p.alt,width:p.width,height:p.height,creditText:'ZAH Media'}));return '<script type="application/ld+json">'+JSON.stringify(data).replaceAll('<','\\u003c')+'</script>';});
 return html;
}
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
export function extractText(html,page){const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';const fields=[];let key=0;for(const m of main.matchAll(/<(h1|h2|p)\b[^>]*>([\s\S]*?)<\/\1>/g)){for(const part of m[2].split(/(<[^>]+>)/)){if(part.startsWith('<')||!part.trim())continue;fields.push({page,key:key++,value:decode(part)});}}return fields;}
export function renderText(html,page,fields){let key=0;return html.replace(/(<main\b[^>]*>)([\s\S]*?)(<\/main>)/,(_,a,main,b)=>a+main.replace(/(<(?:h1|h2|p)\b[^>]*>)([\s\S]*?)(<\/(?:h1|h2|p)>)/g,(_,start,value,end)=>start+value.split(/(<[^>]+>)/).map(part=>{if(part.startsWith('<')||!part.trim())return part;const f=fields.find(f=>f.page===page&&f.key===key++);return f&&f.value!==decode(part)?escape(f.value):part;}).join('')+end)+b);}
