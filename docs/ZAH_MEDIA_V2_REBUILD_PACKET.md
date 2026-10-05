# ZAH MEDIA V2 — REBUILD DATA PACKAGE

Discovery date: 2026-10-04. Scope: public frontend only. This is a source reconstruction specification, not a deployment approval.

Authoritative repository: https://github.com/zahmediaofficial/zah-media
Production source: main at `d3a365f5a3655cd7cbd63c3c452c76e480f5fcfc`.
Production tree: `0da2c0a921bb822630efdbd0484f3574a3f83aed`.
All source listings below are immutable copies from that commit, not from local drafts.
Latest Publish ZAH Media run: https://github.com/zahmediaofficial/zah-media/actions/runs/36804633027 — success, main, same production SHA, 2026-10-01T02:11:15Z.
No live browser or GUI was opened. No form submission, live database query, configuration change, deployment, or DNS change was performed.

## 1. Executive Summary

The public website is seven static HTML directory-index pages in dist/, five CSS files, three browser scripts, five editable JSON content files, and four assets. GitHub Pages publishes dist/ directly; there is no public build, root package.json, package-lock.json, framework, bundler, or npm dependency installation.

Recommendation: reconstruct only dist/ in a separate new repository, using static HTML + CSS + browser JavaScript. Preserve exact page structure, CSS cascade, content overrides and form field names. Keep Pages CMS configuration if editing parity is required. Do not copy gallery-app/ into the new frontend deployment.

Cloudflare continues to own the Worker, D1, Google Drive access, email/code login, private gallery UI, management UI/backend, and Jotform registration synchronization. Public pages link to that origin; they do not call its authenticated APIs.

Risk level: MEDIUM for eventual cutover because live third-party form configuration, preview routing and domain ownership still need verification; LOW for an isolated static source reconstruction.

### Repository-state verification and branch safety

| Check | Result |
|---|---|
| Local working folder | C:/Users/judah/Documents/Codex/2026-09-10/create-an-image-of-3 |
| Local source copy | outputs/zah-media/ |
| Valid local Git checkout | NO: git rev-parse/status/remote fail with “not a git repository” |
| Local repository root, branch, HEAD and git remote | Not available; this folder has no Git checkout |
| Authoritative remote | https://github.com/zahmediaofficial/zah-media.git |
| Default / production branch | main |
| Remote production HEAD | d3a365f5a3655cd7cbd63c3c452c76e480f5fcfc |
| Local tracked / untracked status | Cannot classify without Git metadata; all local work preserved |
| Local vs remote production | 33 of 52 production blobs match byte-for-byte; 17 differ; 2 absent |
| Remote metadata | Repository, branches, commits, recursive tree, open draft PR and workflow runs fetched read-only |
| Discovery branch | rebuild/zah-media-v2-discovery |
| BRANCH CREATION | PASS — created remotely through the GitHub API from the production SHA; no checkout or local draft used |
| Main / production files / Cloudflare | Unchanged |

Local differing paths: .pages.yml; README.md; dist/about.css; dist/about/index.html; dist/assets/event.jpg; dist/assets/portrait.jpg; dist/booking.css; dist/booking.js; dist/booking/index.html; dist/cms-content.js; dist/content/about.json; dist/content/home.json; dist/content/weddings.json; dist/gallery.css; dist/index.html; dist/weddings/index.html; gallery-app/wrangler.jsonc. Some differences may be line endings; no Git-modification claim is made.
Local absent paths: gallery.html; wedding.jpg.
Additional local graduation, dev and review files are drafts, not production. Do not transplant the local folder wholesale.

There is no local origin alias to push through. The authorized docs-only commit/push is performed through GitHub Git tree, commit and non-force ref APIs on the discovery branch, equivalent to publishing that branch without modifying main.

## 2. Production Architecture

| System | Source / location | Responsibility and communication |
|---|---|---|
| PUBLIC WEBSITE | dist/; https://zahmediaofficial.github.io/zah-media/ | Static pages; same-site GET of JSON; native POST of booking to Jotform; iframe identification form; normal links to Cloudflare |
| CLOUDFLARE WORKER | gallery-app/src/worker.mjs, admin.mjs, google-drive.mjs, repository.mjs, security.mjs, storage.mjs; gallery-app/wrangler.jsonc | Serves its own ASSETS and /api/*; enforces sessions, client-folder checks, status/expiry/download permissions |
| D1 | gallery-app/schema.sql; admin-schema.sql; studio_links table created in admin.mjs | Galleries, hashed codes, opaque hashed sessions, rate-limit attempts, minimal registrations, saved studio links |
| PRIVATE GALLERY | gallery-app/public/index.html, gallery.js, gallery.css; https://zah-private-gallery.zahmediaofficial.workers.dev/ | Same-origin email + code login, list thumbnails, modal full images, pagination and optional download |
| MANAGEMENT DASHBOARD | gallery-app/public/manage/; same Worker origin /manage/ | Admin sign-in, Jotform sync, folder assignment, code rotation, status/expiry/download settings, private saved links |
| JOTFORM | Booking form 262545240735052; identification form 262725740128053 | Stores submissions; provides confirmation UI and identification upload controls; Worker imports minimal registration metadata on authenticated explicit sync |
| EXTERNAL SERVICES | Google OAuth / Drive v3; Google thumbnail hosts; Jotform CDN/API; Pages CMS; GitHub Pages | Google credentials stay inside Worker; Pages CMS edits GitHub JSON/assets; GitHub Actions publishes dist/ |

Flow: browser → public static files → public JSON. Booking browser → Jotform submit endpoint. Identify browser → Jotform iframe + embed handler. Gallery link → Worker-hosted client page → same-origin Worker API → D1 + private Drive. Management link → Worker-hosted admin page → same-origin admin API → D1; explicit sync → Jotform API → D1 registrations. Registration does NOT automatically grant photo access.

Worker deployment settings: entry src/worker.mjs; compatibility date 2026-09-30; keep_vars enabled; preview URLs disabled; static assets directory ./public with run_worker_first enabled. These existing settings are outside the rebuild.

Environment and binding inventory — names and purpose only; no credential or binding-ID values:

| Name | Purpose |
|---|---|
| DB | Existing Cloudflare D1 database binding |
| ASSETS | Existing Worker private gallery/management static asset binding |
| ACCESS_CODE_PEPPER | Server-side gallery-code and rate-bucket hashing secret |
| ADMIN_ACCESS_KEY | Server-side management authentication secret |
| JOTFORM_API_KEY | Server-only read-only registration synchronization credential |
| GOOGLE_SERVICE_ACCOUNT_JSON | Server-only Google service-account credentials for private Drive reads |
| DRIVE_ROOT_FOLDER_ID | Server-only root boundary for permitted client folders |
| SESSION_TTL_SECONDS | Client-session lifetime configuration |

Public frontend environment variables: NONE found. No .env or committed credential file appears in the production tree. Do not request or copy production credentials for V2.

## 3. Complete Production Route Map

There are exactly seven HTML page routes in the published dist/ tree. JSON, images, CSS and scripts are static resource endpoints, not additional pages. The root-level gallery.html is not in the Pages artifact.

| Route | Source file | Page title | Purpose | Navigation entry | Assets | Scripts | External services | Backend calls | Notes |
|---|---|---|---|---|---|---|---|---|---|
| / | dist/index.html | ZAH Media — Every moment. Worth keeping. | Studio overview and service enquiries | Brand / Home / Back to home | assets/favicon.svg; styles.css; assets/portrait.jpg; assets/wedding.jpg?v=zah-0470; assets/event.jpg | cms-content.js | mailto:zahmediaofficial@gmail.com?subject=Wedding%20photography%20enquiry; mailto:zahmediaofficial@gmail.com; https://zah-private-gallery.zahmediaofficial.workers.dev/; https://zah-private-gallery.zahmediaofficial.workers.dev/manage/ | No Cloudflare API call; static/JSON only | Saved HTML + CMS overrides |
| /about/ | dist/about/index.html | About ZAH Media — Photography for Every Occasion | Studio purpose, approach and services | About / Meet ZAH Media | ../assets/favicon.svg; ../about.css; ../assets/wedding.jpg?v=zah-0470 | ../cms-content.js | None | No Cloudflare API call; static/JSON only | Saved HTML + CMS overrides |
| /booking/ | dist/booking/index.html | Book Photography — ZAH Media | Photography booking request | Book / Booking / service CTA | ../assets/favicon.svg; ../booking.css | ../booking.js | https://submit.jotform.com/submit/262545240735052; https://form.jotform.com/zahmediaofficial/zah-media-booking; mailto:zahmediaofficial@gmail.com | No Cloudflare API call; Jotform native POST | Native navigation to Jotform confirmation |
| /events/ | dist/events/index.html | Event Gallery — ZAH Media | Public events portfolio | events top nav and gallery links | ../assets/favicon.svg; ../gallery.css; ../assets/event.jpg | ../cms-content.js | mailto:zahmediaofficial@gmail.com | No Cloudflare API call; static/JSON only | CMS-rendered ordered figures; saved HTML fallback |
| /identify/ | dist/identify/index.html | Photo identification — ZAH Media | Client identity/reference-photo intake | No home top-nav entry; direct URL / management workflow | ../assets/favicon.svg; identify.css?v=3 | identify.js?v=3; https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js | https://form.jotform.com/262725740128053; mailto:zahmediaofficial@gmail.com; https://zah-private-gallery.zahmediaofficial.workers.dev/; https://zah-private-gallery.zahmediaofficial.workers.dev/manage/; https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js | No Cloudflare API call; Jotform iframe | noindex,nofollow; intro replay; desktop iframe crop |
| /portraits/ | dist/portraits/index.html | Portrait Gallery — ZAH Media | Public portraits portfolio | portraits top nav and gallery links | ../assets/favicon.svg; ../gallery.css; ../assets/portrait.jpg | ../cms-content.js | mailto:zahmediaofficial@gmail.com | No Cloudflare API call; static/JSON only | CMS-rendered ordered figures; saved HTML fallback |
| /weddings/ | dist/weddings/index.html | Wedding Gallery — ZAH Media | Public weddings portfolio | weddings top nav and gallery links | ../assets/favicon.svg; ../gallery.css; ../assets/wedding.jpg?v=zah-0470 | ../cms-content.js | mailto:zahmediaofficial@gmail.com | No Cloudflare API call; static/JSON only | CMS-rendered ordered figures; saved HTML fallback |

## 4. Page Reconstruction Specification

The following section-order summaries and complete immutable HTML listings are normative. Every heading, paragraph, form control, button, link, image attribute, accessibility label and class is included. Apply section 5 styles in original order and section 8 scripts; section 6 JSON overrides determine runtime content. Do not “normalize” the different header styles across pages.

| Route | Exact section order / reconstruction rules |
|---|---|
| / | Skip link → sticky header (brand, desktop services/About/Booking, Book, details mobile menu) → occasion bar → light hero with eyebrow, two-line h1, intro, two buttons, three-image ribbon (portrait/wedding/event) → wedding panel → two-column event/portrait panels → About preview → contact CTA/email → footer with service anchors, credits details, client-gallery and management links. Preserve final CSS overrides: wedding copy is above a fully visible landscape image, not an overlaid dark-gradient image. |
| /about/ | Skip link → sticky header → about hero → two-column story text + wedding figure → black approach section with three numbered cards → two-column services list → light CTA → footer. Values order: Feel at ease / Notice everything / Tell the whole story. |
| /booking/ | Skip to form → sticky header → booking hero → two-column layout: sticky “What happens next” three steps / form card → black email questions band → footer. Two fieldsets (“About you”, “Your occasion”), acknowledgement, submit, fallback link. Keep required vs optional fields, autocomplete/types/options and every hidden Jotform name/value exactly as below. Dates are converted to Jotform parts and full name split on submit. |
| /events/ | Skip link → sticky header → gallery hero → CMS figures and number captions → “More moments are coming” note/booking CTA → other galleries (Weddings, Portraits, Back to home) → footer credits. |
| /portraits/ | Same gallery structure; “More portraits are coming”; CTA “Book a portrait session”; other galleries Weddings, Events, Back to home. |
| /weddings/ | Same gallery structure; “Your story belongs here”; CTA from exact HTML; other galleries Events, Portraits, Back to home. |
| /identify/ | Skip link → fixed decorative intro → minimal brand/header note → welcome with focus-frame decoration, title, intro, Get started, Replay intro and small note → focusable identification section with title, iframe, direct-link fallback, privacy copy → footer/contact/gallery/management links. No recreated Jotform fields; iframe owns them. Preserve no-JS intro suppression, reduced-motion welcome card and mobile uncropped form. |

Gallery figures have no public lightbox or authenticated access controls. They are rebuilt by cms-content.js with first image eager, later images lazy, ordered captions and padded “01 / 01” counts. Maintain native links rather than introduce SPA routing. The exact responsive spacing, backgrounds and typography are specified by the complete CSS in section 5.
### / — dist/index.html

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Wedding, event and portrait photography by ZAH Media. Every occasion. Every emotion. Beautifully captured.">
<meta name="theme-color" content="#f5f5f7">
<title>ZAH Media — Every moment. Worth keeping.</title>
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="global-header">
<nav class="navigation" aria-label="Main navigation">
<a class="brand" href="#" aria-label="ZAH Media home">ZAH<span>media</span></a>
<div class="nav-links"><a href="weddings/">Weddings</a><a href="events/">Events</a><a href="portraits/">Portraits</a><a href="about/">About</a><a href="booking/">Booking</a></div>
<a class="nav-enquire" href="booking/">Book</a>
<details class="mobile-menu"><summary aria-label="Open navigation"><span></span><span></span></summary><div><a href="weddings/">Weddings</a><a href="events/">Events</a><a href="portraits/">Portraits</a><a href="about/">About ZAH Media</a><a href="booking/">Book photography</a></div></details>
</nav>
</header>
<main id="main">
<div class="occasion-bar">Wedding days. Big celebrations. Just being you. <a href="#photography">Find your photography <span aria-hidden="true">›</span></a></div>
<section class="hero" aria-labelledby="hero-title">
<div class="hero-heading"><p class="eyebrow">ZAH Media Photography</p><h1 id="hero-title">Every moment.<br><span>Worth keeping.</span></h1><p class="hero-intro">For every occasion. And everything you feel.</p><div class="actions"><a class="button" href="#contact">Let’s make it happen</a><a class="button outline" href="#photography">Explore photography</a></div></div>
<div class="photo-ribbon" aria-label="Photography highlights">
<figure class="ribbon-photo ribbon-portrait"><img src="assets/portrait.jpg" alt="Photography by ZAH Media" width="1200" height="1800"><figcaption>Uniquely you.</figcaption></figure>
<figure class="ribbon-photo ribbon-wedding"><img src="assets/wedding.jpg?v=zah-0470" alt="Bride and groom sharing a moment on a staircase — ZAH Media wedding photography" width="2400" height="1637" fetchpriority="high"><figcaption>Beautifully together.</figcaption></figure>
<figure class="ribbon-photo ribbon-event"><img src="assets/event.jpg" alt="Photography by ZAH Media" width="1600" height="1068"><figcaption>Fully in the moment.</figcaption></figure>
</div>
</section>
<div id="photography" class="photography">
<section id="weddings" class="wedding-panel" aria-labelledby="wedding-title">
<img class="panel-image" src="assets/wedding.jpg?v=zah-0470" alt="Bride and groom seated together on a staircase — photographed by ZAH Media" width="2400" height="1637" loading="lazy">
<div class="wedding-content"><p class="eyebrow">Wedding photography</p><h2 id="wedding-title">One day.<br>A lifetime of feeling.</h2><p>From the first look to the last dance.<br>Hold on to what made it yours.</p><div class="actions"><a class="button" href="weddings/">View wedding gallery</a><a class="button outline" href="mailto:zahmediaofficial@gmail.com?subject=Wedding%20photography%20enquiry">Enquire</a></div></div><span class="image-label">ZAH Media</span>
</section>
<div class="service-pair">
<section id="events" class="service-panel event-panel" aria-labelledby="event-title"><img class="panel-image" src="assets/event.jpg" alt="Photography by ZAH Media" width="1600" height="1068" loading="lazy"><div class="service-content"><p class="eyebrow">Event photography</p><h2 id="event-title">You had to be there.<br>Now you always can.</h2><p>The people. The atmosphere. The energy.</p><a class="text-link" href="events/">View event gallery <span aria-hidden="true">›</span></a></div></section>
<section id="portraits" class="service-panel portrait-panel" aria-labelledby="portrait-title"><div class="service-content"><p class="eyebrow">Portrait photography</p><h2 id="portrait-title">All you.<br>Beautifully captured.</h2><p>A new chapter. A milestone. Or just because.</p><a class="text-link" href="portraits/">View portrait gallery <span aria-hidden="true">›</span></a></div><div class="portrait-image"><img src="assets/portrait.jpg" alt="Photography by ZAH Media" width="1200" height="1800" loading="lazy"></div></section>
</div>
</div>
<section id="about" class="about" aria-labelledby="about-title"><p class="eyebrow">This is ZAH Media.</p><h2 id="about-title">Life moves fast.<br><span>Keep the good parts.</span></h2><p>We photograph weddings, events, and portraits for every occasion. The milestones you plan for. The connections you cherish. The moments that make your story yours.</p><a class="text-link" href="about/">Meet ZAH Media <span aria-hidden="true">›</span></a></section>
<section id="contact" class="contact" aria-labelledby="contact-title"><p class="eyebrow">Your next moment starts here.</p><h2 id="contact-title">Something in mind?<br>We’re all ears.</h2><p>Tell us your occasion, preferred date, and location.<br>Let’s talk about what you have planned.</p><a class="button" href="booking/">Start a booking request</a><a class="email" href="mailto:zahmediaofficial@gmail.com">zahmediaofficial@gmail.com</a><p class="email-note">Choose your service and share the details in a few minutes.</p></section>
</main>
<footer><div class="footer-inner"><div class="footer-row"><a class="brand" href="#" aria-label="ZAH Media home">ZAH<span>media</span></a><nav aria-label="Footer navigation"><a href="#weddings">Weddings</a><a href="#events">Events</a><a href="#portraits">Portraits</a><a href="booking/">Booking</a><a href="#contact">Contact</a></nav></div><div class="footer-bottom"><p>Copyright © 2026 ZAH Media. All rights reserved.</p><details><summary>Photo credits</summary><p>All photography © ZAH Media. All rights reserved.</p></details></div></div><p><a href="https://zah-private-gallery.zahmediaofficial.workers.dev/">Client gallery</a> · <a href="https://zah-private-gallery.zahmediaofficial.workers.dev/manage/">Studio management</a></p></footer>
<script src="cms-content.js" defer></script></body>
</html>
```

### /about/ — dist/about/index.html

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Meet ZAH Media—photography for weddings, events, portraits, and every occasion worth remembering.">
<meta name="theme-color" content="#f5f5f7">
<title>About ZAH Media — Photography for Every Occasion</title>
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../about.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="global-header"><nav class="navigation" aria-label="Main navigation"><a class="brand" href="../">ZAH<span>media</span></a><div class="nav-links"><a href="../weddings/">Weddings</a><a href="../events/">Events</a><a href="../portraits/">Portraits</a><a href="../about/" aria-current="page">About</a></div><a class="nav-enquire" href="../booking/">Book</a></nav></header>
<main id="main">
<section class="about-hero"><p class="eyebrow">This is ZAH Media</p><h1>Life moves fast.<br><span>Keep the good parts.</span></h1><p class="lead">Photography for the people, connections, and occasions that make your story yours.</p></section>
<section class="story"><div class="story-copy"><p class="eyebrow">Our purpose</p><h2>More than how it looked.</h2><p>A photograph should bring you back to how a moment felt. ZAH Media documents weddings, events, and portraits with attention to the expressions, energy, and quiet details that make every occasion personal.</p><p>We create images made to be revisited, shared, and kept—not only for today, but for the people who will look back with you.</p></div><figure><img src="../assets/wedding.jpg?v=zah-0470" alt="A newly married couple sharing a quiet moment on a staircase, photographed by ZAH Media" width="2400" height="1637"><figcaption>A real ZAH Media wedding moment.</figcaption></figure></section>
<section class="approach"><p class="eyebrow">The ZAH approach</p><h2>Comfortable. Intentional.<br>True to you.</h2><div class="values"><article><span>01</span><h3>Feel at ease.</h3><p>Clear guidance helps you feel natural in front of the camera while leaving room for real moments to unfold.</p></article><article><span>02</span><h3>Notice everything.</h3><p>From the main celebration to the glances in between, the details that matter deserve to be remembered.</p></article><article><span>03</span><h3>Tell the whole story.</h3><p>Your finished gallery should feel connected, honest, and unmistakably yours.</p></article></div></section>
<section class="services"><div><p class="eyebrow">What we photograph</p><h2>Every occasion has a story.</h2></div><nav aria-label="Photography services"><a href="../weddings/"><span>Weddings</span><small>The ceremony, celebration, and everything between.</small><b aria-hidden="true">›</b></a><a href="../events/"><span>Events</span><small>The people, atmosphere, and energy in the room.</small><b aria-hidden="true">›</b></a><a href="../portraits/"><span>Portraits</span><small>Milestones, new chapters, or simply being you.</small><b aria-hidden="true">›</b></a></nav></section>
<section class="cta"><p class="eyebrow">Your story, beautifully kept</p><h2>Let’s create something<br>worth returning to.</h2><a class="button" href="../booking/">Start a booking request</a></section>
</main>
<footer><div class="footer-inner"><a class="brand" href="../">ZAH<span>media</span></a><nav aria-label="Footer navigation"><a href="../">Home</a><a href="../weddings/">Weddings</a><a href="../events/">Events</a><a href="../portraits/">Portraits</a><a href="../booking/">Booking</a></nav><p>Copyright © 2026 ZAH Media.</p></div></footer>
<script src="../cms-content.js" defer></script></body>
</html>
```

### /booking/ — dist/booking/index.html

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Request wedding, event, or portrait photography with ZAH Media.">
<meta name="theme-color" content="#f5f5f7">
<title>Book Photography — ZAH Media</title>
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../booking.css">
</head>
<body>
<a class="skip-link" href="#booking-form">Skip to booking form</a>
<header class="global-header"><nav class="navigation" aria-label="Main navigation"><a class="brand" href="../">ZAH<span>media</span></a><div class="nav-links"><a href="../weddings/">Weddings</a><a href="../events/">Events</a><a href="../portraits/">Portraits</a><a href="../about/">About</a></div><a class="nav-enquire" href="#booking-form" aria-current="page">Book</a></nav></header>
<main>
<section class="booking-hero"><p class="eyebrow">Booking request</p><h1>Tell us about<br><span>your moment.</span></h1><p>Share the details below and we’ll continue the conversation by email.</p></section>
<section class="booking-layout">
<aside class="booking-intro"><p class="eyebrow">What happens next</p><h2>A simple start.</h2><ol><li><strong>Send your request.</strong><span>Your details go directly to ZAH Media’s private booking inbox.</span></li><li><strong>We’ll get in touch.</strong><span>ZAH Media will reply to discuss availability, coverage, and pricing.</span></li><li><strong>Make it official.</strong><span>Your date is secured after the booking details and payment are agreed.</span></li></ol><p class="privacy-note">Your request is securely handled and stored by Jotform so ZAH Media can respond to you.</p></aside>
<div class="form-card">
<form id="booking-form" action="https://submit.jotform.com/submit/262545240735052" method="post" accept-charset="utf-8">
<input type="hidden" name="formID" value="262545240735052"><input type="hidden" name="simple_spc" value="262545240735052-262545240735052"><input type="hidden" name="website" value=""><input type="hidden" name="q2_q2_fullname0[first]" value=""><input type="hidden" name="q2_q2_fullname0[last]" value=""><input type="hidden" name="q7_preferredDate[month]" value=""><input type="hidden" name="q7_preferredDate[day]" value=""><input type="hidden" name="q7_preferredDate[year]" value=""><input type="hidden" name="q8_backupDate[month]" value=""><input type="hidden" name="q8_backupDate[day]" value=""><input type="hidden" name="q8_backupDate[year]" value=""><input type="hidden" name="q10_startTime[timeInput]" value=""><input type="hidden" name="q17_iUnderstand" value="Yes, I understand.">
<fieldset><legend>About you</legend><div class="field-grid"><label>Full name<span aria-hidden="true">*</span><input name="fullName" autocomplete="name" required></label><label>Email address<span aria-hidden="true">*</span><input name="q4_emailAddress" type="email" autocomplete="email" required></label><label>Phone or WhatsApp<input name="q5_phoneOr[full]" type="tel" autocomplete="tel" placeholder="Optional"></label><label>How did you hear about us?<select name="q15_howDid"><option value="">Choose one (optional)</option><option>Instagram</option><option>Facebook</option><option>Google</option><option>Friend or family</option><option>Previous client</option><option>Other</option></select></label></div></fieldset>
<fieldset><legend>Your occasion</legend><div class="field-grid"><label>Photography type<span aria-hidden="true">*</span><select name="q6_photographyType" required><option value="">Choose a service</option><option>Wedding</option><option>Event</option><option>Portrait</option></select></label><label>Preferred date<span aria-hidden="true">*</span><input name="preferredDateRaw" type="date" required></label><label>Backup date<input name="backupDateRaw" type="date"></label><label>Location<span aria-hidden="true">*</span><input name="q9_location" autocomplete="street-address" placeholder="Venue, city, or area" required></label><label>Start time<input name="startTimeRaw" type="time"></label><label>Coverage needed<select name="q11_coverageNeeded"><option value="">Not sure yet</option><option>1 hour</option><option>2 hours</option><option>4 hours</option><option>6 hours</option><option>8 hours</option><option>Full day</option></select></label><label>Estimated guests<input name="q12_estimatedGuests" type="number" min="1" inputmode="numeric" placeholder="For weddings and events"></label><label>Budget range<select name="q13_budgetRange"><option value="">Prefer to discuss</option><option>Under $1,500 TTD</option><option>$1,500–$3,000 TTD</option><option>$3,000–$6,000 TTD</option><option>$6,000–$10,000 TTD</option><option>$10,000+ TTD</option></select></label></div><label class="full-width">Tell us about your plans<span aria-hidden="true">*</span><textarea name="q14_tellUs" rows="6" placeholder="What are you celebrating? Tell us about the mood, people, and moments that matter to you." required></textarea></label></fieldset>
<label class="agreement"><input name="acknowledgement" type="checkbox" required><span>I understand this is a booking request. My date is confirmed only after ZAH Media replies and completes the booking with me.<span aria-hidden="true">*</span></span></label>
<button class="submit-button" type="submit">Send my booking request</button><p class="form-note">Jotform will show a confirmation after it accepts your request. If this page cannot submit, <a href="https://form.jotform.com/zahmediaofficial/zah-media-booking">use the direct booking form</a>.</p>
</form>
</div>
</section>
<section class="questions"><p class="eyebrow">Prefer to talk first?</p><h2>We’re all ears.</h2><a href="mailto:zahmediaofficial@gmail.com">zahmediaofficial@gmail.com</a></section>
</main>
<footer><div class="footer-inner"><a class="brand" href="../">ZAH<span>media</span></a><nav aria-label="Footer navigation"><a href="../">Home</a><a href="../weddings/">Weddings</a><a href="../events/">Events</a><a href="../portraits/">Portraits</a></nav><p>Copyright © 2026 ZAH Media. All rights reserved.</p></div></footer>
<script src="../booking.js"></script>
</body>
</html>
```

### /events/ — dist/events/index.html

```html
<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Explore event photography from ZAH Media."><title>Event Gallery — ZAH Media</title><link rel="icon" href="../assets/favicon.svg"><link rel="stylesheet" href="../gallery.css"></head><body><a class="skip-link" href="#gallery">Skip to gallery</a><header class="global-header"><nav class="navigation"><a class="brand" href="../">ZAH<span>media</span></a><div class="nav-links"><a href="../weddings/">Weddings</a><a href="../events/" aria-current="page">Events</a><a href="../portraits/">Portraits</a><a href="../about/">About</a></div><a class="nav-enquire" href="../booking/">Book</a></nav></header><main><section class="gallery-hero"><p class="kicker">Event photography</p><h1>Feel the energy.<br><span>Keep the memory.</span></h1><p>Celebrations, performances, and everything happening between the big moments.</p></section><section id="gallery" class="gallery"><figure><div class="gallery-feature"><img src="../assets/event.jpg" alt="Photography by ZAH Media" width="1600" height="1068"></div><figcaption class="photo-caption"><span>Photography by ZAH Media</span><span>01 / 01</span></figcaption></figure><div class="gallery-note"><h2>More moments are coming.</h2><p>Event photography by ZAH Media.</p><a class="button" href="../booking/">Book event photography</a></div></section><section class="other-galleries"><h2>Explore more photography.</h2><div class="gallery-links"><a href="../weddings/">Weddings</a><a href="../portraits/">Portraits</a><a href="../">Back to home</a></div></section></main><footer><div class="footer-inner"><div class="footer-links"><span>Copyright © 2026 ZAH Media.</span><nav><a href="../">Home</a><a href="mailto:zahmediaofficial@gmail.com">Contact</a></nav></div><p class="credit">All photography © ZAH Media. All rights reserved.</p></div></footer><script src="../cms-content.js" defer></script></body></html>
```

### /identify/ — dist/identify/index.html

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#090a0c">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="One quick step to help ZAH Media identify and organise your photographs.">
<title>Photo identification — ZAH Media</title>
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="identify.css?v=3">
<noscript><style>.intro{display:none}</style></noscript>
<script src="identify.js?v=3" defer></script>
</head>
<body>
<a class="skip-link" href="#identification">Skip to photo identification</a>
<div class="intro" aria-hidden="true"><div class="intro-content"><span class="intro-brand">ZAH<span>media</span></span><p>Your moments.<br>Beautifully captured.</p></div></div>
<header><a class="brand" href="../" aria-label="ZAH Media home">ZAH<span>media</span></a><span class="header-note">Made for your memories.</span></header>
<main>
<section class="welcome" aria-labelledby="welcome-title">
<div class="focus-frame" aria-hidden="true"><i></i><i></i><i></i><i></i><span></span></div>
<p class="eyebrow">Thank you for choosing ZAH Media</p>
<h1 id="welcome-title">Your moments.<br><span>A little closer.</span></h1>
<p class="welcome-copy">We just need one quick step to help us correctly identify and organise your photographs.</p>
<a class="button" href="#identification">Get started <span aria-hidden="true">↓</span></a>
<button class="replay-intro" type="button">Replay intro</button><p class="small-note">Your name. One clear photo. Then we’ll take it from here.</p>
</section>
<section class="identification" id="identification" aria-labelledby="form-title" tabindex="-1">
<div class="section-heading"><p class="eyebrow">Photo identification</p><h2 id="form-title">Let’s put a face<br>to your name.</h2><p>Please complete the short form below and upload a clear, recent photo of yourself.</p></div>
<div class="form-shell">
<iframe id="JotFormIFrame-262725740128053" title="ZAH Media photo identification form" src="https://form.jotform.com/262725740128053" allow="camera" style="width:100%;height:1500px;border:0;" loading="eager"></iframe>
</div>
<p class="form-help">Form not displaying? <a href="https://form.jotform.com/262725740128053" target="_blank" rel="noopener noreferrer">Open the identification form directly <span aria-hidden="true">↗</span></a></p>
<p class="privacy-note">Your details and reference photo are submitted directly to ZAH Media’s Jotform to help identify and organise photographs from your session. Please upload only a photo of yourself.</p>
</section>
</main>
<footer><a class="brand" href="../" aria-label="ZAH Media home">ZAH<span>media</span></a><p>Every moment. Worth keeping.</p><a href="mailto:zahmediaofficial@gmail.com">Need a hand? Contact ZAH Media</a><small>© 2026 ZAH Media</small><p><a href="https://zah-private-gallery.zahmediaofficial.workers.dev/">Client gallery</a> · <a href="https://zah-private-gallery.zahmediaofficial.workers.dev/manage/">Studio management</a></p></footer>
<script src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js" defer></script>
</body>
</html>
```

### /portraits/ — dist/portraits/index.html

```html
<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Explore portrait photography from ZAH Media."><title>Portrait Gallery — ZAH Media</title><link rel="icon" href="../assets/favicon.svg"><link rel="stylesheet" href="../gallery.css"></head><body><a class="skip-link" href="#gallery">Skip to gallery</a><header class="global-header"><nav class="navigation"><a class="brand" href="../">ZAH<span>media</span></a><div class="nav-links"><a href="../weddings/">Weddings</a><a href="../events/">Events</a><a href="../portraits/" aria-current="page">Portraits</a><a href="../about/">About</a></div><a class="nav-enquire" href="../booking/">Book</a></nav></header><main><section class="gallery-hero"><p class="kicker">Portrait photography</p><h1>All you.<br><span>Beautifully seen.</span></h1><p>Portraits for milestones, new chapters, and the simple pleasure of showing up as yourself.</p></section><section id="gallery" class="gallery"><figure><div class="gallery-feature"><img src="../assets/portrait.jpg" alt="Portrait photographed by ZAH Media" width="1200" height="1800"></div><figcaption class="photo-caption"><span>Photography by ZAH Media</span><span>01 / 01</span></figcaption></figure><div class="gallery-note"><h2>More portraits are coming.</h2><p>Portrait photography by ZAH Media.</p><a class="button" href="../booking/">Book a portrait session</a></div></section><section class="other-galleries"><h2>Explore more photography.</h2><div class="gallery-links"><a href="../weddings/">Weddings</a><a href="../events/">Events</a><a href="../">Back to home</a></div></section></main><footer><div class="footer-inner"><div class="footer-links"><span>Copyright © 2026 ZAH Media.</span><nav><a href="../">Home</a><a href="mailto:zahmediaofficial@gmail.com">Contact</a></nav></div><p class="credit">All photography © ZAH Media. All rights reserved.</p></div></footer><script src="../cms-content.js" defer></script></body></html>
```

### /weddings/ — dist/weddings/index.html

```html
<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Explore wedding photography by ZAH Media."><title>Wedding Gallery — ZAH Media</title><link rel="icon" href="../assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../gallery.css"></head><body><a class="skip-link" href="#gallery">Skip to gallery</a><header class="global-header"><nav class="navigation"><a class="brand" href="../">ZAH<span>media</span></a><div class="nav-links"><a href="../weddings/" aria-current="page">Weddings</a><a href="../events/">Events</a><a href="../portraits/">Portraits</a><a href="../about/">About</a></div><a class="nav-enquire" href="../booking/">Book</a></nav></header><main><section class="gallery-hero"><p class="kicker">Wedding photography</p><h1>One day.<br><span>Yours forever.</span></h1><p>The looks, laughter, and quiet moments that make the day unmistakably yours.</p></section><section id="gallery" class="gallery"><figure><div class="gallery-feature"><img src="../assets/wedding.jpg?v=zah-0470" alt="Bride and groom sharing a quiet moment on a staircase, photographed by ZAH Media" width="2400" height="1637"></div><figcaption class="photo-caption"><span>ZAH Media wedding photography</span><span>01 / 01</span></figcaption></figure><div class="gallery-note"><h2>Your story belongs here.</h2><p>This gallery will grow as more ZAH Media wedding work is added. Planning your day? Tell us what you have in mind.</p><a class="button" href="../booking/">Book wedding photography</a></div></section><section class="other-galleries"><h2>Explore more photography.</h2><div class="gallery-links"><a href="../events/">Events</a><a href="../portraits/">Portraits</a><a href="../">Back to home</a></div></section></main><footer><div class="footer-inner"><div class="footer-links"><span>Copyright © 2026 ZAH Media.</span><nav><a href="../">Home</a><a href="mailto:zahmediaofficial@gmail.com">Contact</a></nav></div><p class="credit">Wedding photograph by ZAH Media.</p></div></footer><script src="../cms-content.js" defer></script></body></html>
```


## 5. Global Design System

System fonts only; no downloaded font files or font CDN. Home/gallery/identify use -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif. About/booking use -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif. Appearance varies by installed system font; preserve the stacks.

| Token / component | Exact source values |
|---|---|
| Light ink / surface | #1d1d1f / #f5f5f7; white backgrounds |
| Muted | Home #626267; gallery/about/booking #6e6e73; identify #a6a6ae |
| Blues | Home/gallery/identify CTA #0071e3; link/about/booking #0066cc; hover #0077ed; focus #2997ff or identify #8dc7ff |
| Identify background / ink | #090a0c / #f5f5f7 |
| Home base text | 1rem; line-height 1.5; antialiasing; box-sizing border-box |
| Brand | Home/gallery/identify 1.6rem, weight 750; “media” .95rem weight 500; about/booking 1.05rem with lighter suffix |
| Hero titles | Home clamp(3.5rem,6.2vw,6.25rem), weight 720, line-height 1.02; gallery clamp(3.6rem,7vw,7rem), line-height 1; about clamp(3rem,8vw,6.4rem); booking clamp(3rem,8vw,6rem); identify clamp(3rem,7vw,6rem) |
| Secondary headings | Home clamp(2.7rem,4.5vw,4.75rem), weight 700; other route values in CSS below |
| Headers / containers | Home/gallery nav max 1060px min-height 3.6rem; about/booking nav 1040px height 48px; gallery width 1320px; home ribbon 1140px; about story 1160px; booking layout 1120px; identify section 1000px |
| Sticky navigation | top 0, z-index 10; translucent backgrounds with 20px/22px blur; styles differ by route |
| Pills | Buttons radius 99px/999px; blue fill, white text; home outline variant; visible keyboard focus |
| Corners | Home ribbon 24px; gallery frames/notes 28px; about image 30px/cards 24px; booking card 28px/input 12px; identify shell 20px |
| Image fitting | Home ribbon cover, service covers with exact focal positions; final wedding panel contain/height auto; public gallery contain/max-height 78vh, mobile 70vh. No enforced crop ratio for gallery images. |
| Spacing | Home section paddings 7.5rem About, 7rem contact; 12px service gutters / 8px mobile; about sections 8rem; booking layout 7rem and gap 6rem; identify welcome 4.5rem top/7rem bottom |
| Forms | 48px input/select height; .85rem .9rem padding; 2-column desktop grids; 1-column at <=760px; focus halo rgba(0,102,204,.15) |
| Motion | Native smooth scrolling; home button .2s transition; identify blur/opacity/scale intro, mobile transform/opacity intro, replay and timed dismissal. Reduced motion retained. |
| Shared components | Conceptually brand/nav/button/footer/skip link; implementation is per-page HTML/CSS, not an imported component library |

Exact CSS follows, including duplicate selectors and late overrides. Copying only early rules would change the wedding layout and identification crop/intro. No design unification is authorized.
### dist/about.css

```css
:root{--ink:#1d1d1f;--muted:#6e6e73;--blue:#0066cc;--wash:#f5f5f7;--line:#d2d2d7;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--ink);-webkit-font-smoothing:antialiased}.skip-link{position:fixed;top:-5rem;left:1rem;z-index:20;background:#fff;color:#000;padding:.7rem 1rem;border-radius:999px}.skip-link:focus{top:1rem}.global-header{position:sticky;top:0;z-index:10;background:rgba(250,250,252,.82);backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid rgba(0,0,0,.08)}.navigation{height:48px;max-width:1040px;margin:auto;padding:0 22px;display:flex;align-items:center;justify-content:space-between}.brand{color:var(--ink);text-decoration:none;font-weight:750;letter-spacing:-.04em;font-size:1.05rem}.brand span{font-weight:400;color:var(--muted)}.nav-links{display:flex;gap:2rem}.nav-links a,.nav-enquire{color:var(--ink);text-decoration:none;font-size:.78rem}.nav-links a:hover,.nav-links a[aria-current]{color:var(--blue)}.nav-enquire,.button{background:var(--blue);color:#fff;padding:.45rem .9rem;border-radius:999px;text-decoration:none}.about-hero{text-align:center;padding:8rem 1.5rem 7rem;background:var(--wash)}.eyebrow{font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}h1,h2,h3,p{margin-top:0}.about-hero h1{font-size:clamp(3rem,8vw,6.4rem);line-height:.93;letter-spacing:-.065em;margin:.65rem 0 1.7rem}.about-hero h1 span{color:#86868b}.lead{max-width:700px;margin:auto;color:var(--muted);font-size:clamp(1.1rem,2vw,1.45rem);line-height:1.5}.story{max-width:1160px;margin:auto;padding:8rem 2rem;display:grid;grid-template-columns:.85fr 1.15fr;gap:6rem;align-items:center}.story-copy h2,.approach h2,.services h2,.cta h2{font-size:clamp(2.5rem,5vw,4.8rem);line-height:1;letter-spacing:-.06em}.story-copy p:not(.eyebrow){font-size:1.08rem;line-height:1.7;color:var(--muted)}figure{margin:0}figure img{width:100%;height:auto;display:block;border-radius:30px}figcaption{font-size:.76rem;color:var(--muted);margin-top:.75rem}.approach{background:#000;color:#fff;text-align:center;padding:8rem 2rem}.approach .eyebrow{color:#a1a1a6}.approach>h2{margin:.6rem 0 4rem}.values{max-width:1100px;margin:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;text-align:left}.values article{background:#1d1d1f;border-radius:24px;padding:2rem}.values span{color:#86868b;font-size:.8rem}.values h3{font-size:1.5rem;margin:2.8rem 0 .7rem;letter-spacing:-.03em}.values p{color:#a1a1a6;line-height:1.6;margin:0}.services{max-width:1100px;margin:auto;padding:8rem 2rem;display:grid;grid-template-columns:.8fr 1.2fr;gap:6rem}.services nav{border-top:1px solid var(--line)}.services nav a{display:grid;grid-template-columns:1fr 2fr auto;gap:1.5rem;align-items:center;padding:1.6rem 0;border-bottom:1px solid var(--line);color:var(--ink);text-decoration:none}.services nav span{font-weight:700;font-size:1.2rem}.services nav small{color:var(--muted);font-size:.9rem;line-height:1.5}.services nav b{color:var(--blue);font-size:1.8rem}.cta{text-align:center;background:var(--wash);padding:8rem 1.5rem}.cta h2{margin:.6rem 0 2.3rem}.button{display:inline-block;padding:.8rem 1.25rem}.footer-inner{max-width:1040px;margin:auto;padding:2.3rem 22px;display:flex;gap:2rem;align-items:center;color:var(--muted);font-size:.78rem}.footer-inner nav{display:flex;gap:1.2rem;margin-left:auto}.footer-inner nav a{color:var(--muted);text-decoration:none}.footer-inner p{margin:0}@media(max-width:760px){.nav-links{display:none}.about-hero{padding:6rem 1.3rem 5rem}.story,.services{grid-template-columns:1fr;padding:5rem 1.25rem;gap:3rem}.values{grid-template-columns:1fr}.approach,.cta{padding:5rem 1.25rem}.services nav a{grid-template-columns:1fr auto}.services nav small{grid-column:1/3}.footer-inner{flex-wrap:wrap;align-items:flex-start}.footer-inner nav{order:3;width:100%;margin:0}.footer-inner p{margin-left:auto}}
```

### dist/booking.css

```css
:root{color-scheme:light;--ink:#1d1d1f;--muted:#6e6e73;--blue:#0066cc;--line:#d2d2d7;--paper:#fff;--wash:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--ink);background:var(--paper);-webkit-font-smoothing:antialiased}.skip-link{position:fixed;left:1rem;top:-5rem;z-index:20;padding:.7rem 1rem;background:#fff;color:#000;border-radius:999px}.skip-link:focus{top:1rem}.global-header{position:sticky;top:0;z-index:10;background:rgba(250,250,252,.82);backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid rgba(0,0,0,.08)}.navigation{height:48px;max-width:1040px;margin:auto;padding:0 22px;display:flex;align-items:center;justify-content:space-between}.brand{color:var(--ink);text-decoration:none;font-weight:750;letter-spacing:-.04em;font-size:1.05rem}.brand span{font-weight:400;color:var(--muted)}.nav-links{display:flex;gap:2rem}.nav-links a,.nav-enquire{color:var(--ink);text-decoration:none;font-size:.78rem}.nav-links a:hover{color:var(--blue)}.nav-enquire{background:var(--blue);color:#fff;padding:.4rem .85rem;border-radius:999px}.booking-hero{text-align:center;padding:8rem 1.5rem 6rem;background:var(--wash)}.eyebrow{font-size:.84rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}.booking-hero h1{font-size:clamp(3rem,8vw,6rem);line-height:.93;letter-spacing:-.065em;margin:.55rem 0 1.5rem}.booking-hero h1 span{color:#86868b}.booking-hero>p:last-child{font-size:clamp(1.05rem,2vw,1.35rem);color:var(--muted);margin:0}.booking-layout{max-width:1120px;margin:auto;padding:7rem 2rem;display:grid;grid-template-columns:minmax(230px,.7fr) minmax(0,1.5fr);gap:6rem;align-items:start}.booking-intro{position:sticky;top:90px}.booking-intro h2{font-size:2.5rem;letter-spacing:-.045em;margin:.4rem 0 2.5rem}.booking-intro ol{list-style:none;padding:0;margin:0;counter-reset:steps}.booking-intro li{counter-increment:steps;display:grid;grid-template-columns:2rem 1fr;column-gap:.7rem;margin:0 0 1.7rem}.booking-intro li:before{content:counter(steps);width:1.6rem;height:1.6rem;display:grid;place-items:center;background:var(--ink);color:#fff;border-radius:50%;font-size:.78rem;font-weight:700}.booking-intro li span{grid-column:2;color:var(--muted);line-height:1.5;margin-top:.3rem}.privacy-note{margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--line);color:var(--muted);font-size:.85rem;line-height:1.55}.form-card{border-radius:28px;background:var(--wash);padding:clamp(1.5rem,4vw,3.5rem)}fieldset{border:0;padding:0;margin:0 0 3rem}legend{width:100%;font-size:1.55rem;font-weight:700;letter-spacing:-.03em;padding:0 0 1.5rem;border-bottom:1px solid var(--line);margin-bottom:1.5rem}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.35rem}label{display:grid;gap:.55rem;font-size:.87rem;font-weight:650}label span[aria-hidden]{color:#bf4800;margin-left:.2rem}input,select,textarea{width:100%;font:inherit;font-weight:400;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:12px;padding:.85rem .9rem;outline:0}input,select{height:48px}textarea{resize:vertical;line-height:1.5}input:focus,select:focus,textarea:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(0,102,204,.15)}.full-width{margin-top:1.35rem}.agreement{grid-template-columns:auto 1fr;align-items:start;gap:.8rem;font-weight:400;line-height:1.5;color:var(--muted)}.agreement input{width:20px;height:20px;margin:.1rem 0}.submit-button{margin-top:2rem;border:0;border-radius:999px;padding:.9rem 1.25rem;background:var(--blue);color:#fff;font:inherit;font-weight:650;cursor:pointer}.submit-button:hover{background:#0077ed}.form-note{font-size:.82rem;color:var(--muted);margin:.9rem 0 0}.form-status{margin-top:1.75rem;padding:1.25rem;border-radius:16px;background:#e8f3ff;line-height:1.5}.form-status p{margin:.35rem 0 1rem}.form-status a{color:var(--blue)}.form-status button{border:1px solid var(--blue);color:var(--blue);background:transparent;border-radius:999px;padding:.55rem .85rem;font-weight:650;cursor:pointer}.questions{text-align:center;background:#000;color:#fff;padding:7rem 1.5rem}.questions .eyebrow{color:#a1a1a6}.questions h2{font-size:clamp(2.6rem,6vw,5rem);letter-spacing:-.06em;margin:.5rem 0 1.5rem}.questions a{color:#2997ff;text-decoration:none;font-size:1.1rem}footer{background:var(--wash);color:var(--muted);font-size:.78rem}.footer-inner{max-width:1040px;margin:auto;padding:2.3rem 22px;display:flex;align-items:center;gap:2rem}.footer-inner nav{display:flex;gap:1.2rem;margin-left:auto}.footer-inner nav a{color:var(--muted);text-decoration:none}.footer-inner p{margin:0}@media(max-width:760px){.nav-links{display:none}.booking-hero{padding:6rem 1.3rem 4rem}.booking-layout{grid-template-columns:1fr;padding:4rem 1.25rem;gap:3rem}.booking-intro{position:static}.field-grid{grid-template-columns:1fr}.form-card{border-radius:22px}.footer-inner{align-items:flex-start;flex-wrap:wrap}.footer-inner nav{order:3;width:100%;margin:0}.footer-inner p{margin-left:auto}}@media(max-width:430px){.booking-hero h1{font-size:3.2rem}.form-card{padding:1.3rem}.footer-inner p{width:100%;margin:0}}
```

### dist/gallery.css

```css
@charset "UTF-8";
.gallery figure{margin:0 0 12px}
:root{--ink:#1d1d1f;--muted:#6e6e73;--blue:#0071e3;--surface:#f5f5f7}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);background:#fff;-webkit-font-smoothing:antialiased}a{color:inherit;text-decoration:none}a:focus-visible{outline:3px solid #2997ff;outline-offset:5px}img{display:block;width:100%;height:auto}.skip-link{position:fixed;top:-5rem;left:1rem;background:#fff;padding:1rem;z-index:20}.skip-link:focus{top:.5rem}.global-header{position:sticky;top:0;z-index:10;background:rgba(250,250,252,.88);backdrop-filter:blur(22px);border-bottom:1px solid #0000000f}.navigation{max-width:1060px;min-height:3.6rem;margin:auto;padding:.65rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:2rem}.brand{display:inline-flex;align-items:baseline;gap:.35rem;font-weight:750;letter-spacing:-.07em;font-size:1.6rem}.brand span{font-size:.95rem;font-weight:500;letter-spacing:-.035em}.nav-links{display:flex;gap:2.8rem;font-size:.875rem}.nav-links a:hover,.footer-links a:hover{text-decoration:underline}.nav-enquire{background:var(--blue);color:#fff;border-radius:2rem;padding:.4rem 1rem;font-size:.875rem}.gallery-hero{text-align:center;background:var(--surface);padding:5.5rem 1.5rem 4rem}.kicker{font-weight:600;font-size:1.1rem;margin:0 0 .7rem}.gallery-hero h1{font-size:clamp(3.6rem,7vw,7rem);letter-spacing:-.065em;line-height:1;margin:0}.gallery-hero h1 span{color:var(--muted)}.gallery-hero>p:last-child{font-size:clamp(1.15rem,2vw,1.45rem);color:var(--muted);max-width:650px;margin:1.4rem auto 0;letter-spacing:-.02em}.gallery{max-width:1320px;margin:auto;padding:12px}.gallery-feature{background:#111;overflow:hidden;border-radius:28px}.gallery-feature img{max-height:78vh;object-fit:contain}.photo-caption{display:flex;justify-content:space-between;gap:1rem;padding:1rem .25rem 2.6rem;color:var(--muted);font-size:.8rem}.gallery-note{text-align:center;background:var(--surface);border-radius:28px;padding:4.5rem 1.5rem;margin-bottom:12px}.gallery-note h2,.other-galleries h2{font-size:clamp(2.4rem,4.5vw,4rem);line-height:1.05;letter-spacing:-.05em;margin:0}.gallery-note p{max-width:590px;margin:1.2rem auto;color:var(--muted);font-size:1.15rem}.button{display:inline-flex;background:var(--blue);color:#fff;border-radius:99px;padding:.75rem 1.4rem;margin-top:.5rem}.button:hover{background:#0077ed}.other-galleries{padding:5rem 1.5rem;text-align:center}.gallery-links{display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;margin-top:1.8rem}.gallery-links a{border:1px solid #86868b;color:#0066cc;border-radius:99px;padding:.7rem 1.2rem}.gallery-links a:hover{background:var(--blue);border-color:var(--blue);color:#fff}footer{background:var(--surface);padding:2rem 1.5rem;color:var(--muted);font-size:.8rem}.footer-inner{max-width:1000px;margin:auto}.footer-links{display:flex;justify-content:space-between;gap:1.5rem;flex-wrap:wrap}.footer-links nav{display:flex;gap:1.5rem;flex-wrap:wrap}.credit{border-top:1px solid #d2d2d7;margin-top:1.5rem;padding-top:1rem}.credit a{text-decoration:underline}@media(max-width:640px){.navigation{padding:.7rem 1rem}.nav-links{display:none}.gallery-hero{padding:4rem 1.2rem 3rem}.gallery-hero h1{font-size:3.8rem}.gallery{padding:8px}.gallery-feature,.gallery-note{border-radius:20px}.gallery-feature img{max-height:70vh}.photo-caption{padding:.8rem .2rem 2rem}.gallery-note{padding:3.5rem 1.2rem}.other-galleries{padding:4rem 1.2rem}.footer-links{display:block}.footer-links nav{margin-top:1rem;gap:1rem}}
```

### dist/identify/identify.css

```css
:root{color-scheme:dark;--ink:#f5f5f7;--muted:#a6a6ae;--blue:#0071e3}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:2rem}body{margin:0;background:#090a0c;color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased}a{color:inherit;text-decoration:none}h1,h2,p{margin:0}a:focus-visible{outline:3px solid #8dc7ff;outline-offset:6px}.skip-link{position:fixed;top:-5rem;left:1rem;z-index:30;padding:1rem;background:white;color:#111}.skip-link:focus{top:1rem}header{max-width:1120px;margin:auto;padding:1.5rem 2rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}.brand{display:inline-flex;align-items:baseline;gap:.35rem;font-size:1.6rem;font-weight:750;letter-spacing:-.07em}.brand span{font-size:.95rem;font-weight:500;letter-spacing:-.035em}.header-note{font-size:.78rem;color:var(--muted)}.welcome{text-align:center;max-width:960px;margin:auto;padding:4.5rem 1.5rem 7rem}.focus-frame{width:64px;height:64px;margin:0 auto 2.2rem;position:relative}.focus-frame i{position:absolute;width:16px;height:16px;border-color:#777980;border-style:solid;border-width:0}.focus-frame i:nth-child(1){top:0;left:0;border-top-width:1px;border-left-width:1px}.focus-frame i:nth-child(2){top:0;right:0;border-top-width:1px;border-right-width:1px}.focus-frame i:nth-child(3){bottom:0;left:0;border-bottom-width:1px;border-left-width:1px}.focus-frame i:nth-child(4){bottom:0;right:0;border-bottom-width:1px;border-right-width:1px}.focus-frame span{position:absolute;left:31px;top:31px;width:3px;height:3px;border-radius:50%;background:#a6a6ae}.eyebrow{text-transform:uppercase;letter-spacing:.16em;font-size:.72rem;font-weight:600;color:#b4b5bd}h1{font-size:clamp(3rem,7vw,6rem);line-height:1.04;letter-spacing:-.065em;margin:1.4rem 0}h1 span{color:#93949d}.welcome-copy{color:#b6b6be;font-size:1.15rem;max-width:440px;margin:1.8rem auto}.button{display:inline-flex;align-items:center;justify-content:center;gap:1.5rem;min-height:52px;background:var(--blue);border-radius:99px;padding:.85rem 1.75rem;font-weight:500}.button:hover{background:#0077ed}.small-note{color:var(--muted);font-size:.78rem;margin:1.2rem auto 0;max-width:300px}.identification{border-top:1px solid #25262b;max-width:1000px;margin:auto;padding:5rem 2rem 4rem;scroll-margin-top:1.5rem}.section-heading{text-align:center;max-width:550px;margin:0 auto 2.8rem}h2{font-size:clamp(2.5rem,5vw,4.2rem);line-height:1.08;letter-spacing:-.055em;margin:1rem 0 1.2rem}.section-heading>p:last-child{color:#b6b6be;font-size:1.05rem;max-width:400px;margin:auto}.form-shell{background:#090a0c;color:#f5f5f7;border:1px solid #34353b;border-radius:20px;overflow:hidden;box-shadow:0 24px 70px #0005}iframe{display:block;max-width:100%;color-scheme:light}.form-help{font-size:.82rem;color:var(--muted);text-align:center;margin:1.5rem 0}.form-help a{color:#8dc7ff;text-decoration:underline;text-underline-offset:3px}.privacy-note{max-width:570px;margin:1.2rem auto 0;text-align:center;font-size:.78rem;color:var(--muted);line-height:1.7}footer{padding:3rem 1.5rem;text-align:center;border-top:1px solid #25262b}footer p{color:var(--muted);font-size:.9rem;margin:.7rem 0 1.5rem}footer>a:last-of-type{display:block;color:#8dc7ff;font-size:.82rem}footer small{display:block;color:var(--muted);font-size:.7rem;margin-top:1.5rem}.intro{position:fixed;inset:0;z-index:20;background:#090a0c;display:grid;place-items:center;pointer-events:none;animation:intro-exit .45s ease 2s forwards}.intro-content{text-align:center}.intro-brand{display:inline-flex;align-items:baseline;gap:.5rem;font-size:clamp(3.5rem,12vw,6rem);font-weight:750;letter-spacing:-.07em;animation:focus-in 1.3s ease both}.intro-brand span{font-size:.5em;font-weight:500;letter-spacing:-.035em}.intro-content p{font-size:.72rem;text-transform:uppercase;letter-spacing:.19em;line-height:1.8;color:#b6b6be;margin-top:1.1rem;animation:line-in .6s ease .7s both}.intro::after{content:"";position:absolute;left:12%;right:12%;top:57%;height:1px;background:linear-gradient(90deg,transparent,#ffffff28,transparent);animation:line-in 1s ease .4s both}@keyframes focus-in{from{filter:blur(13px);opacity:0;transform:scale(1.03)}to{filter:blur(0);opacity:1;transform:scale(1)}}@keyframes line-in{from{opacity:0}to{opacity:1}}@keyframes intro-exit{to{opacity:0;visibility:hidden}}@media(max-width:600px){header{padding:1.2rem 1.25rem}.header-note{font-size:.7rem}.welcome{padding:3rem 1.25rem 4.5rem}.welcome-copy{font-size:1.05rem;max-width:320px}.eyebrow{font-size:.65rem;letter-spacing:.12em}.identification{padding:3.5rem 1rem 3rem}.form-shell{border-radius:14px}.section-heading{padding:0 .5rem}.form-help{line-height:1.8}.form-help a{display:block}.privacy-note{padding:0 .5rem}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.intro{display:none}*,*::before,*::after{animation:none!important;transition:none!important}}

/* Local presentation crop requested by the site owner. */
.form-shell iframe{clip-path:inset(0 0 76px 0);margin-bottom:-76px}

/* Preserve all native controls when the mobile form grows. */
@media(max-width:600px){.form-shell iframe{clip-path:none;margin-bottom:0}}

/* Hold the focus sequence until the local script sees a visible page. */
.intro,.intro-brand,.intro-content p,.intro::after{animation-play-state:paused}
.intro-playing,.intro-playing .intro-brand,.intro-playing .intro-content p,.intro-playing::after{animation-play-state:running}
/* Mobile intro uses only opacity and transform, avoiding expensive blur. */
.intro[hidden]{display:none}
.replay-intro{display:block;margin:1rem auto 0;padding:.6rem 1rem;min-height:44px;border:0;background:transparent;color:#a9cfff;font:inherit;font-size:.8rem;cursor:pointer}
.replay-intro:focus-visible{outline:3px solid #8dc7ff;outline-offset:3px;border-radius:8px}
@media(max-width:600px){.intro{height:100%;height:100dvh}.intro-content{padding:1.5rem;width:100%}.intro-brand{animation-name:mobile-brand;animation-duration:1s;filter:none;will-change:opacity,transform}.intro-content p{font-size:.7rem}.intro::after{top:calc(50% + 95px)}}
@keyframes mobile-brand{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
/* Reduced motion still shows the welcome card, without moving or flashing. */
@media(prefers-reduced-motion:reduce){.intro{display:grid}.intro-brand,.intro-content p,.intro::after{opacity:1;filter:none;transform:none}.intro[hidden]{display:none}}
```

### dist/styles.css

```css
@charset "UTF-8";
:root{color-scheme:light;--ink:#1d1d1f;--muted:#626267;--blue:#0071e3;--link:#0066cc;--surface:#f5f5f7}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:5rem}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;background:white;color:var(--ink);font-size:1rem;line-height:1.5;-webkit-font-smoothing:antialiased}h1,h2,p,figure{margin:0}a{color:inherit;text-decoration:none}a:focus-visible,summary:focus-visible{outline:3px solid #2997ff;outline-offset:5px}img{display:block;width:100%;max-width:100%;height:auto}a,summary{-webkit-tap-highlight-color:transparent}.skip-link{position:fixed;left:1rem;top:-5rem;background:white;color:var(--ink);padding:1rem;z-index:20}.skip-link:focus{top:.5rem}
.global-header{position:sticky;top:0;z-index:10;background:rgba(250,250,252,.88);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border-bottom:1px solid rgba(0,0,0,.06)}.navigation{max-width:1060px;min-height:3.6rem;margin:auto;padding:.65rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:2rem}.brand{display:inline-flex;align-items:baseline;gap:.35rem;font-weight:750;letter-spacing:-.07em;font-size:1.6rem;white-space:nowrap}.brand span{font-size:.95rem;font-weight:500;letter-spacing:-.035em}.nav-links{display:flex;gap:3.5rem;font-size:.875rem}.nav-links a:hover,.footer-row a:hover{text-decoration:underline}.nav-enquire{background:var(--blue);color:white;border-radius:2rem;padding:.38rem 1rem;font-size:.875rem}.nav-enquire:hover,.button:hover{background:#0077ed}.mobile-menu{display:none}.occasion-bar{padding:1rem 1.25rem;text-align:center;font-size:.875rem;background:#fff}.occasion-bar a{color:var(--link);display:inline-block;margin-left:.3rem}.occasion-bar a:hover{text-decoration:underline}.occasion-bar span{margin-left:.2rem}
.hero{background:var(--surface);padding:3.8rem 1.5rem 1.6rem;overflow:hidden;text-align:center}.hero-heading{max-width:900px;margin:auto}.eyebrow{font-size:1.15rem;font-weight:600;letter-spacing:-.015em;margin-bottom:.8rem}h1{font-size:clamp(3.5rem,6.2vw,6.25rem);font-weight:720;line-height:1.02;letter-spacing:-.058em}h1 span{color:#6e6e73}.hero-intro{font-size:clamp(1.15rem,2vw,1.65rem);letter-spacing:-.025em;margin-top:1.25rem}.actions{display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap;margin-top:1.8rem}.button{display:inline-flex;align-items:center;justify-content:center;min-height:2.9rem;padding:.72rem 1.5rem;border:1px solid transparent;border-radius:99px;background:var(--blue);color:white;font-size:1rem;line-height:1.4;transition:background .2s,transform .2s}.button:active{transform:scale(.98)}.button.outline{border-color:var(--blue);background:transparent;color:var(--link)}.button.outline:hover{color:white;background:var(--blue)}.photo-ribbon{display:grid;grid-template-columns:.82fr 1.1fr .82fr;align-items:center;gap:1.25rem;max-width:1140px;margin:3.1rem auto 1.2rem}.ribbon-photo{position:relative;overflow:hidden;border-radius:24px;background:#d2d2d7;height:350px}.ribbon-wedding{height:410px}.ribbon-photo img{height:100%;object-fit:cover}.ribbon-portrait img{object-position:50% 59%}.ribbon-wedding img{object-position:50% 40%}.ribbon-event img{object-position:58% 50%}.ribbon-photo figcaption{position:absolute;bottom:0;left:0;right:0;padding:3rem 1rem 1.35rem;color:white;background:linear-gradient(transparent,rgba(0,0,0,.65));font-weight:600;font-size:1rem;letter-spacing:-.02em}.sample-note{font-size:.75rem;color:var(--muted)}.photography{padding:12px;display:grid;gap:12px}.wedding-panel{position:relative;min-height:740px;isolation:isolate;overflow:hidden;background:#181c18;color:white;display:flex;align-items:center}.panel-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}.wedding-panel>.panel-image{object-position:75% 44%}.wedding-panel:after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(0,0,0,.83),rgba(0,0,0,.46) 45%,rgba(0,0,0,.03) 85%)}.wedding-content{max-width:650px;width:52%;text-align:center;padding:5rem 2rem;margin-left:3%}h2{font-size:clamp(2.7rem,4.5vw,4.75rem);font-weight:700;letter-spacing:-.05em;line-height:1.06}.wedding-content>p:not(.eyebrow){font-size:1.35rem;margin:1.25rem 0 1.8rem;letter-spacing:-.025em}.image-label{position:absolute;bottom:1.1rem;right:1.3rem;font-size:.75rem;padding:.2rem .5rem;background:rgba(0,0,0,.55);color:#fff;border-radius:4px}.service-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}.service-panel{position:relative;min-height:730px;overflow:hidden;isolation:isolate;text-align:center}.service-content{position:relative;z-index:1;padding:3.5rem 1.5rem 2rem}.service-content h2{font-size:clamp(2.2rem,3vw,3.5rem)}.service-content>p:not(.eyebrow){font-size:1.15rem;margin:1.15rem auto .7rem;max-width:25rem;letter-spacing:-.02em}.text-link{color:var(--link);display:inline-block;padding:.4rem 0;font-size:1.15rem}.text-link:hover{text-decoration:underline}.text-link span{display:inline-block;margin-left:.25rem}.event-panel{background:#050706;color:white}.event-panel:after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(#050706 3%,rgba(5,7,6,.91) 24%,rgba(5,7,6,.1) 65%)}.event-panel .panel-image{object-position:50% 90%}.event-panel .text-link{color:#8dc7ff}.portrait-panel{background:#e9eeea}.portrait-panel .service-content{background:linear-gradient(#e9eeea 80%,rgba(233,238,234,0));padding-bottom:4rem}.portrait-image{position:absolute;inset:30% 0 0;z-index:0}.portrait-image img{height:100%;object-fit:cover;object-position:50% 52%}.about{text-align:center;background:var(--surface);padding:7.5rem 1.5rem}.about h2{font-size:clamp(2.8rem,5vw,5rem)}.about h2 span{color:#6e6e73}.about>p:not(.eyebrow){font-size:clamp(1.2rem,2vw,1.5rem);line-height:1.5;letter-spacing:-.025em;color:var(--muted);max-width:690px;margin:1.7rem auto 1.2rem}.contact{text-align:center;padding:7rem 1.5rem}.contact>p:not(.eyebrow):not(.email-note){font-size:1.25rem;color:var(--muted);margin:1.5rem auto 1.7rem;max-width:600px}.contact .email{display:block;width:fit-content;max-width:100%;overflow-wrap:anywhere;margin:1.4rem auto 0;color:var(--link)}.email:hover{text-decoration:underline}.email-note{margin-top:.5rem;font-size:.8rem;color:var(--muted)}footer{background:var(--surface);padding:1.8rem 1.5rem;color:var(--muted)}.footer-inner{max-width:1000px;margin:auto}.stock-disclosure{font-size:.78rem;padding-bottom:1.5rem;border-bottom:1px solid #d2d2d7}.footer-row{display:flex;justify-content:space-between;align-items:center;gap:2rem;padding:1.6rem 0}.footer-row .brand{color:var(--ink)}.footer-row nav{display:flex;gap:1.8rem;font-size:.875rem}.footer-bottom{display:flex;justify-content:space-between;align-items:flex-start;gap:2rem;border-top:1px solid #d2d2d7;padding-top:1.2rem;font-size:.78rem}.footer-bottom details{max-width:24rem}.footer-bottom summary{cursor:pointer}.footer-bottom details p{margin-top:.8rem}.footer-bottom details a{text-decoration:underline}
@media(min-width:1700px){.wedding-panel{min-height:850px}.wedding-content{margin-left:10%}}
@media(max-width:850px){.nav-links{gap:1.7rem}.photo-ribbon{gap:.8rem}.ribbon-photo{height:280px}.ribbon-wedding{height:340px}.wedding-content{width:64%;margin-left:0}.wedding-panel{min-height:650px}.service-panel{min-height:640px}.service-content{padding-top:2.5rem}.service-content h2{font-size:2.5rem}.service-content>p:not(.eyebrow){font-size:1rem}}
@media(max-width:600px){html{scroll-padding-top:4.5rem}.navigation{padding:.65rem 1.1rem;gap:1rem;min-height:3.5rem}.brand{font-size:1.4rem}.nav-links{display:none}.nav-enquire{margin-left:auto}.mobile-menu{display:block}.mobile-menu summary{list-style:none;cursor:pointer;width:2rem;height:2rem;display:flex;flex-direction:column;justify-content:center;gap:5px;padding:5px}.mobile-menu summary::-webkit-details-marker{display:none}.mobile-menu summary span{display:block;width:20px;height:1.5px;background:var(--ink)}.mobile-menu>div{position:absolute;left:0;right:0;top:100%;padding:1rem 1.5rem 1.5rem;background:#fafafc;border-bottom:1px solid #d2d2d7;box-shadow:0 12px 20px #0000000a}.mobile-menu>div a{display:block;padding:.65rem 0;font-size:1.3rem;font-weight:600}.occasion-bar{font-size:.8rem;line-height:1.65;padding:.8rem 1.2rem}.hero{padding:3rem 1rem 1.2rem}.eyebrow{font-size:1rem}h1{font-size:clamp(3rem,11vw,4rem)}.hero-intro{font-size:1.2rem;max-width:19rem;margin:1rem auto 0}.actions{gap:.65rem;margin-top:1.5rem}.button{font-size:.9rem;padding:.7rem 1.15rem}.photo-ribbon{grid-template-columns:.6fr 1.25fr .6fr;gap:.55rem;width:calc(100% + 6rem);max-width:none;margin:2.4rem -3rem 1rem}.ribbon-photo{height:225px;border-radius:15px}.ribbon-wedding{height:280px}.ribbon-photo figcaption{font-size:.75rem;padding:2.5rem .5rem 1rem}.ribbon-portrait figcaption,.ribbon-event figcaption{display:none}.sample-note{font-size:.75rem;max-width:18rem;margin:auto}.photography{padding:8px;gap:8px}.wedding-panel{min-height:640px;align-items:start}.wedding-content{width:100%;padding:2.8rem 1.2rem;max-width:none}.wedding-content h2{font-size:2.9rem}.wedding-panel>.panel-image{object-position:50% 45%}.wedding-panel:after{background:linear-gradient(rgba(0,0,0,.82),rgba(0,0,0,.5) 35%,rgba(0,0,0,.04) 78%)}.wedding-content>p:not(.eyebrow){font-size:1.1rem;margin:1rem 0 1.3rem}.service-pair{grid-template-columns:1fr;gap:8px}.service-panel{min-height:660px}.service-content{padding:2.8rem 1rem 2rem}.service-content h2{font-size:2.65rem}.service-content>p:not(.eyebrow){font-size:1.05rem}.portrait-image{inset:29% 0 0}.text-link{font-size:1.05rem}.about,.contact{padding:4.5rem 1.3rem}.about h2,.contact h2{font-size:2.8rem}.about>p:not(.eyebrow),.contact>p:not(.eyebrow):not(.email-note){font-size:1.15rem}.footer-row{align-items:flex-start;gap:1rem}.footer-row nav{display:grid;grid-template-columns:1fr 1fr;gap:.7rem 1.4rem}.footer-bottom{flex-direction:column;gap:.9rem}.image-label{right:.8rem;bottom:.8rem}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}

/* Keep the supplied landscape wedding photograph clear of the headline. */
.ribbon-wedding img{object-position:42% 45%}
.wedding-panel{display:flex;flex-direction:column;min-height:0}
.wedding-panel>.panel-image{position:relative;inset:auto;order:2;z-index:0;width:100%;height:auto;object-fit:contain}
.wedding-panel:after{display:none}
.wedding-content{width:100%;max-width:none;margin:0;padding:4rem 1.5rem}
.wedding-panel>.image-label{z-index:1}
@media(max-width:600px){.wedding-content{padding:2.8rem 1.2rem}.ribbon-wedding img{object-position:42% 45%}}
```


## 6. Public Content Package

All static public copy is preserved in section 4 HTML, in DOM order. The following readable extracts are ordered text-bearing elements (nested parent text can repeat child labels), followed by exact JSON content. Preserve the HTML for exact link destinations, controls and line breaks. JSON content takes precedence only for the selectors described in section 8. No private registration, customer email, gallery code or uploaded identity photo is included.
### / — ordered text
- **a**: Skip to content
- **a**: ZAHmedia
- **a**: Weddings
- **a**: Events
- **a**: Portraits
- **a**: About
- **a**: Booking
- **a**: Book
- **a**: Weddings
- **a**: Events
- **a**: Portraits
- **a**: About ZAH Media
- **a**: Book photography
- **a**: Find your photography ›
- **p**: ZAH Media Photography
- **h1**: Every moment. / Worth keeping.
- **p**: For every occasion. And everything you feel.
- **a**: Let’s make it happen
- **a**: Explore photography
- **figcaption**: Uniquely you.
- **figcaption**: Beautifully together.
- **figcaption**: Fully in the moment.
- **p**: Wedding photography
- **h2**: One day. / A lifetime of feeling.
- **p**: From the first look to the last dance. / Hold on to what made it yours.
- **a**: View wedding gallery
- **a**: Enquire
- **span**: ZAH Media
- **p**: Event photography
- **h2**: You had to be there. / Now you always can.
- **p**: The people. The atmosphere. The energy.
- **a**: View event gallery ›
- **p**: Portrait photography
- **h2**: All you. / Beautifully captured.
- **p**: A new chapter. A milestone. Or just because.
- **a**: View portrait gallery ›
- **p**: This is ZAH Media.
- **h2**: Life moves fast. / Keep the good parts.
- **p**: We photograph weddings, events, and portraits for every occasion. The milestones you plan for. The connections you cherish. The moments that make your story yours.
- **a**: Meet ZAH Media ›
- **p**: Your next moment starts here.
- **h2**: Something in mind? / We’re all ears.
- **p**: Tell us your occasion, preferred date, and location. / Let’s talk about what you have planned.
- **a**: Start a booking request
- **a**: zahmediaofficial@gmail.com
- **p**: Choose your service and share the details in a few minutes.
- **a**: ZAHmedia
- **a**: Weddings
- **a**: Events
- **a**: Portraits
- **a**: Booking
- **a**: Contact
- **p**: Copyright © 2026 ZAH Media. All rights reserved.
- **summary**: Photo credits
- **p**: All photography © ZAH Media. All rights reserved.
- **p**: Client gallery · Studio management
### /about/ — ordered text
- **a**: Skip to content
- **a**: ZAHmedia
- **a**: Weddings
- **a**: Events
- **a**: Portraits
- **a**: About
- **a**: Book
- **p**: This is ZAH Media
- **h1**: Life moves fast. / Keep the good parts.
- **p**: Photography for the people, connections, and occasions that make your story yours.
- **p**: Our purpose
- **h2**: More than how it looked.
- **p**: A photograph should bring you back to how a moment felt. ZAH Media documents weddings, events, and portraits with attention to the expressions, energy, and quiet details that make every occasion personal.
- **p**: We create images made to be revisited, shared, and kept—not only for today, but for the people who will look back with you.
- **figcaption**: A real ZAH Media wedding moment.
- **p**: The ZAH approach
- **h2**: Comfortable. Intentional. / True to you.
- **span**: 01
- **h3**: Feel at ease.
- **p**: Clear guidance helps you feel natural in front of the camera while leaving room for real moments to unfold.
- **span**: 02
- **h3**: Notice everything.
- **p**: From the main celebration to the glances in between, the details that matter deserve to be remembered.
- **span**: 03
- **h3**: Tell the whole story.
- **p**: Your finished gallery should feel connected, honest, and unmistakably yours.
- **p**: What we photograph
- **h2**: Every occasion has a story.
- **a**: WeddingsThe ceremony, celebration, and everything between.›
- **a**: EventsThe people, atmosphere, and energy in the room.›
- **a**: PortraitsMilestones, new chapters, or simply being you.›
- **p**: Your story, beautifully kept
- **h2**: Let’s create something / worth returning to.
- **a**: Start a booking request
- **a**: ZAHmedia
- **a**: Home
- **a**: Weddings
- **a**: Events
- **a**: Portraits
- **a**: Booking
- **p**: Copyright © 2026 ZAH Media.
### /booking/ — ordered text
- **a**: Skip to booking form
- **a**: ZAHmedia
- **a**: Weddings
- **a**: Events
- **a**: Portraits
- **a**: About
- **a**: Book
- **p**: Booking request
- **h1**: Tell us about / your moment.
- **p**: Share the details below and we’ll continue the conversation by email.
- **p**: What happens next
- **h2**: A simple start.
- **li**: Send your request.Your details go directly to ZAH Media’s private booking inbox.
- **li**: We’ll get in touch.ZAH Media will reply to discuss availability, coverage, and pricing.
- **li**: Make it official.Your date is secured after the booking details and payment are agreed.
- **p**: Your request is securely handled and stored by Jotform so ZAH Media can respond to you.
- **legend**: About you
- **label**: Full name*
- **label**: Email address*
- **label**: Phone or WhatsApp
- **label**: How did you hear about us?Choose one (optional)InstagramFacebookGoogleFriend or familyPrevious clientOther
- **legend**: Your occasion
- **label**: Photography type*Choose a serviceWeddingEventPortrait
- **label**: Preferred date*
- **label**: Backup date
- **label**: Location*
- **label**: Start time
- **label**: Coverage neededNot sure yet1 hour2 hours4 hours6 hours8 hoursFull day
- **label**: Estimated guests
- **label**: Budget rangePrefer to discussUnder $1,500 TTD$1,500–$3,000 TTD$3,000–$6,000 TTD$6,000–$10,000 TTD$10,000+ TTD
- **label**: Tell us about your plans*
- **label**: I understand this is a booking request. My date is confirmed only after ZAH Media replies and completes the booking with me.*
- **button**: Send my booking request
- **p**: Jotform will show a confirmation after it accepts your request. If this page cannot submit, use the direct booking form.
- **p**: Prefer to talk first?
- **h2**: We’re all ears.
- **a**: zahmediaofficial@gmail.com
- **a**: ZAHmedia
- **a**: Home
- **a**: Weddings
- **a**: Events
- **a**: Portraits
- **p**: Copyright © 2026 ZAH Media. All rights reserved.
### /events/ — ordered text
- **a**: Skip to gallery
- **a**: ZAHmedia
- **a**: Weddings
- **a**: Events
- **a**: Portraits
- **a**: About
- **a**: Book
- **p**: Event photography
- **h1**: Feel the energy. / Keep the memory.
- **p**: Celebrations, performances, and everything happening between the big moments.
- **figcaption**: Photography by ZAH Media01 / 01
- **h2**: More moments are coming.
- **p**: Event photography by ZAH Media.
- **a**: Book event photography
- **h2**: Explore more photography.
- **a**: Weddings
- **a**: Portraits
- **a**: Back to home
- **span**: Copyright © 2026 ZAH Media.
- **a**: Home
- **a**: Contact
- **p**: All photography © ZAH Media. All rights reserved.
### /identify/ — ordered text
- **a**: Skip to photo identification
- **span**: ZAHmedia
- **p**: Your moments. / Beautifully captured.
- **a**: ZAHmedia
- **span**: Made for your memories.
- **p**: Thank you for choosing ZAH Media
- **h1**: Your moments. / A little closer.
- **p**: We just need one quick step to help us correctly identify and organise your photographs.
- **a**: Get started ↓
- **button**: Replay intro
- **p**: Your name. One clear photo. Then we’ll take it from here.
- **p**: Photo identification
- **h2**: Let’s put a face / to your name.
- **p**: Please complete the short form below and upload a clear, recent photo of yourself.
- **p**: Form not displaying? Open the identification form directly ↗
- **p**: Your details and reference photo are submitted directly to ZAH Media’s Jotform to help identify and organise photographs from your session. Please upload only a photo of yourself.
- **a**: ZAHmedia
- **p**: Every moment. Worth keeping.
- **a**: Need a hand? Contact ZAH Media
- **small**: © 2026 ZAH Media
- **p**: Client gallery · Studio management
### /portraits/ — ordered text
- **a**: Skip to gallery
- **a**: ZAHmedia
- **a**: Weddings
- **a**: Events
- **a**: Portraits
- **a**: About
- **a**: Book
- **p**: Portrait photography
- **h1**: All you. / Beautifully seen.
- **p**: Portraits for milestones, new chapters, and the simple pleasure of showing up as yourself.
- **figcaption**: Photography by ZAH Media01 / 01
- **h2**: More portraits are coming.
- **p**: Portrait photography by ZAH Media.
- **a**: Book a portrait session
- **h2**: Explore more photography.
- **a**: Weddings
- **a**: Events
- **a**: Back to home
- **span**: Copyright © 2026 ZAH Media.
- **a**: Home
- **a**: Contact
- **p**: All photography © ZAH Media. All rights reserved.
### /weddings/ — ordered text
- **a**: Skip to gallery
- **a**: ZAHmedia
- **a**: Weddings
- **a**: Events
- **a**: Portraits
- **a**: About
- **a**: Book
- **p**: Wedding photography
- **h1**: One day. / Yours forever.
- **p**: The looks, laughter, and quiet moments that make the day unmistakably yours.
- **figcaption**: ZAH Media wedding photography01 / 01
- **h2**: Your story belongs here.
- **p**: This gallery will grow as more ZAH Media wedding work is added. Planning your day? Tell us what you have in mind.
- **a**: Book wedding photography
- **h2**: Explore more photography.
- **a**: Events
- **a**: Portraits
- **a**: Back to home
- **span**: Copyright © 2026 ZAH Media.
- **a**: Home
- **a**: Contact
- **p**: Wedding photograph by ZAH Media.
### dist/content/about.json

```json
{
  "lead": "Photography for the people, connections, and occasions that make your story yours.",
  "story_one": "A photograph should bring you back to how a moment felt. ZAH Media documents weddings, events, and portraits with attention to the expressions, energy, and quiet details that make every occasion personal.",
  "story_two": "We create images made to be revisited, shared, and kept—not only for today, but for the people who will look back with you."
}
```

### dist/content/events.json

```json
{
  "introduction": "Celebrations, performances, and everything happening between the big moments.",
  "note": "Event photography by ZAH Media.",
  "photos": [
    {
      "image": "/assets/event.jpg",
      "alt": "Event photographed by ZAH Media",
      "caption": "Photography by ZAH Media",
      "credit": "ZAH Media",
      "illustrative": false
    }
  ]
}
```

### dist/content/home.json

```json
{
  "hero_intro": "For every occasion. And everything you feel.",
  "about_intro": "We photograph weddings, events, and portraits for every occasion. The milestones you plan for. The connections you cherish. The moments that make your story yours."
}
```

### dist/content/portraits.json

```json
{
  "introduction": "Portraits for milestones, new chapters, and the simple pleasure of showing up as yourself.",
  "note": "Portrait photography by ZAH Media.",
  "photos": [
    {
      "image": "/assets/portrait.jpg",
      "alt": "Portrait photographed by ZAH Media",
      "caption": "Photography by ZAH Media",
      "credit": "ZAH Media",
      "illustrative": false
    }
  ]
}
```

### dist/content/weddings.json

```json
{
  "introduction": "The looks, laughter, and quiet moments that make the day unmistakably yours.",
  "note": "This gallery will grow as more ZAH Media wedding work is added. Planning your day? Tell us what you have in mind.",
  "photos": [
    {
      "image": "/assets/wedding.jpg",
      "alt": "Bride and groom sharing a quiet moment on a staircase, photographed by ZAH Media",
      "caption": "ZAH Media wedding photography",
      "credit": "ZAH Media",
      "illustrative": false
    }
  ]
}
```

Runtime credit text: home Photo credits details becomes “Photography: ZAH Media.”; gallery footer credit becomes “Photography: ZAH Media.”. Current JSON illustrative values are all false. README stock statements are stale and must not override production JSON or the owner’s attribution.

## 7. Asset Manifest

Every published resource is listed below, including HTML, CSS, scripts and JSON. “Safe to copy YES” means within the authorized public frontend scope; it is not an independent copyright-license audit. Public JSON and current HTML attribute the photography to ZAH Media. Copy the immutable production bytes rather than differently sized local replacements. Git blob SHA identifies the exact bytes.

| File | Path | Type | Used on | Purpose | Dimensions | Bytes | Safe to copy | Git blob SHA |
|---|---|---|---|---|---|---:|---|---|
| about.css | dist/about.css | css | /about/ | Presentation | N/A | 3979 | YES | 232b5391e4c225677709047b4bb5949ffeba7674 |
| index.html | dist/about/index.html | html | /about/ | Route document | N/A | 3757 | YES | ac4e72c866fb70851c5ef499cfbabe44481e73c8 |
| event.jpg | dist/assets/event.jpg | jpg | /, /events/ | Portfolio photograph | Actual UNKNOWN — REQUIRES VERIFICATION; HTML declares 1600 × 1068 | 16171371 | YES | f3c0865f06e176d10f67fa59de047368a805f756 |
| favicon.svg | dist/assets/favicon.svg | svg | All seven routes | Favicon | 0 0 64 64 | 241 | YES | ae2153e1925f53543e8bc3c576c7f6ae5214c6bd |
| portrait.jpg | dist/assets/portrait.jpg | jpg | /, /portraits/ | Portfolio photograph | Actual UNKNOWN — REQUIRES VERIFICATION; HTML declares 1200 × 1800 | 4784930 | YES | d52ca721de53209ea7d7c8217a838ba2f1499116 |
| wedding.jpg | dist/assets/wedding.jpg | jpg | /, /about/, /weddings/ | Portfolio photograph | 2400 × 1637 verified on matching blob | 540510 | YES | 9377866b905595776003c2dafa47a22d42232d86 |
| booking.css | dist/booking.css | css | /booking/ | Presentation | N/A | 5195 | YES | 8a16c547fd8c6d7c5082942055722911026485c8 |
| booking.js | dist/booking.js | js | /booking/ | Browser behavior | N/A | 1034 | YES | 735d26d894fc3b12231487a870cf2a861cbfbc0a |
| index.html | dist/booking/index.html | html | /booking/ | Route document | N/A | 6204 | YES | b0d1b45ec3eff60cb52e96356242be2d9ebec73b |
| cms-content.js | dist/cms-content.js | js | /, /about/, /weddings/, /events/, /portraits/ | Browser behavior | N/A | 5545 | YES | b6cf05631b71b984d27e22f4161ef51f00439136 |
| about.json | dist/content/about.json | json | /about/ | CMS editable public copy/photo list | N/A | 468 | YES | 2394567771c0533e9801aa09515413364b3aff59 |
| events.json | dist/content/events.json | json | /, /events/ | CMS editable public copy/photo list | N/A | 364 | YES | 7081288e90ad37733fd34e79f844cfa212d20c0c |
| home.json | dist/content/home.json | json | / | CMS editable public copy/photo list | N/A | 253 | YES | 37740c38d70f04af5d920581b80a14e692223b73 |
| portraits.json | dist/content/portraits.json | json | /, /portraits/ | CMS editable public copy/photo list | N/A | 386 | YES | 6116c962dd1f3abfd3bf685645a37c7bd5092596 |
| weddings.json | dist/content/weddings.json | json | /, /about/, /weddings/ | CMS editable public copy/photo list | N/A | 503 | YES | 97a427d8cf7e94dc6299a1665a89e41be2f3a725 |
| index.html | dist/events/index.html | html | /events/ | Route document | N/A | 2015 | YES | d52e28ee14a9b482c6afeadeef74940fb8b2c38b |
| gallery.css | dist/gallery.css | css | /weddings/, /events/, /portraits/ | Presentation | N/A | 3646 | YES | c9c23dbd737b0f5d031ab8c3c21d439ab022a0ac |
| identify.css | dist/identify/identify.css | css | /identify/ | Presentation | N/A | 6527 | YES | df98df3ea9333ce065b1ba021ac3f684d9d4649d |
| identify.js | dist/identify/identify.js | js | /identify/ | Browser behavior | N/A | 1782 | YES | 5ad7be6df751ea43b83020ba8514bf103a45b5e5 |
| index.html | dist/identify/index.html | html | /identify/ | Route document | N/A | 3252 | YES | 1561104f56fa1c86ce12231093208bd535677025 |
| index.html | dist/index.html | html | / | Route document | N/A | 6253 | YES | 1d95bb4acd9ed9dacd3e45a6b2d49e1550955dde |
| index.html | dist/portraits/index.html | html | /portraits/ | Route document | N/A | 2045 | YES | 8d8d328f1d1ad3e6aec2851a388f7350f6318f05 |
| styles.css | dist/styles.css | css | / | Presentation | N/A | 10678 | YES | 1243980fcf298040b81afc7d754786a003d372fd |
| index.html | dist/weddings/index.html | html | /weddings/ | Route document | N/A | 2165 | YES | f560025918193ce4d9c6b044a2529059df00057a |
Oversized images: event.jpg 16,171,371 bytes (16.17 MB); portrait.jpg 4,784,930 bytes (4.78 MB). Existing README recommends 2000–2400 px and preferably <2 MB. Future optimization is a separate approved task; do not silently re-encode for parity. wedding.jpg is 540,510 bytes. Public reference dimensions for event/portrait are not proof of actual JPEG dimensions; GitHub text connector rejects binary downloads.

No font, icon library, source map, video, audio or public PDF asset is present. SVG favicon is the only icon asset:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#141414"/><text x="32" y="47" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="44" font-weight="bold">Z</text></svg>
```


Excluded assets: all gallery-app/public resources (private-system UI; SAFE TO COPY: NO under this scope), all Drive/private identity images (not in production Git tree; SAFE TO COPY: NO), local review PNGs and graduation preview assets (draft; SAFE TO COPY: NO for production parity), root wedding.jpg (2-byte non-published file; SAFE TO COPY: NO). Root gallery.html references six assets/gallery/photoN.jpg files absent from production; that unpublished prototype must not become a V2 route.

## 8. JavaScript Inventory

| File | Used by | Purpose / DOM dependencies | Network | Local storage | Session storage | URL assumptions | Rebuild requirement |
|---|---|---|---|---|---|---|---|
| dist/cms-content.js | Home/About/three galleries | Edits hero/story/introduction/notes/featured images/credits; replaces direct figure children in .gallery; requires exact selectors from HTML below | GET content/home.json, about.json, weddings.json, events.json, portraits.json as needed; cache no-cache | None | None | siteRoot is document.currentScript.src directory; strips optional zah-media/ from uploaded asset paths; dispatch from final pathname segment | Preserve selectors, ordering, JSON format, first-image selection, fallback and credit behavior |
| dist/booking.js | Booking | #booking-form, .submit-button, named inputs; validates, splits name into first/last, dates into month/day/year, copies start time, disables submit/Sending… | Native form.submit POST to Jotform, not fetch | None | None | Uses form action and exact Jotform question names | Preserve exact mapping; no invented backend |
| dist/identify/identify.js | Identify | .intro, .replay-intro, .button, #identification, iframe ID; visibility/pageshow start, double RAF, replay, key dismissal, focus + smooth scroll | Calls global jotformEmbedHandler; iframe network handled by Jotform | None | None | Absolute Jotform host; hash target; no persisted intro flag | Preserve animation and reduced-motion timings: 3000ms / 1600ms |
| Jotform CDN embed handler | Identify | JotFormIFrame-262725740128053, provider message/resize handling | https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js and iframe origin | Provider behavior UNKNOWN — REQUIRES VERIFICATION | Provider behavior UNKNOWN — REQUIRES VERIFICATION | Provider-owned version “latest” | Keep external script; do not copy or rewrite provider internals |

CMS failures: console warning “Using saved page content:” leaves saved HTML. Home Promise.all means one failed required content request prevents all home overrides. Empty gallery photo list keeps original figure. putPhoto removes width/height after replacement; retain that behavior for parity, including its layout-shift implications. Content sets textContent and DOM-created elements, not raw HTML. Public scripts contain no secrets.

Exact owned public scripts follow:
### dist/booking.js

```javascript
const form = document.querySelector('#booking-form');
const submitButton = form.querySelector('.submit-button');
const setHidden = (name, value) => { form.elements.namedItem(name).value = value || ''; };
const setDateParts = (prefix, value) => {
  const [year = '', month = '', day = ''] = value.split('-');
  setHidden(`q${prefix}[month]`, month);
  setHidden(`q${prefix}[day]`, day);
  setHidden(`q${prefix}[year]`, year);
};

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const fullName = form.elements.fullName.value.trim().split(/\s+/);
  setHidden('q2_q2_fullname0[first]', fullName.shift());
  setHidden('q2_q2_fullname0[last]', fullName.join(' '));
  setDateParts('7_preferredDate', form.elements.preferredDateRaw.value);
  setDateParts('8_backupDate', form.elements.backupDateRaw.value);
  setHidden('q10_startTime[timeInput]', form.elements.startTimeRaw.value);
  submitButton.disabled = true;
  submitButton.textContent = 'Sending…';
  form.submit();
});
```

### dist/cms-content.js

```javascript
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
```

### dist/identify/identify.js

```javascript
"use strict";
window.addEventListener("DOMContentLoaded", () => {
  if (typeof window.jotformEmbedHandler === "function") {
    window.jotformEmbedHandler("iframe[id='JotFormIFrame-262725740128053']", "https://form.jotform.com/");
  }
});
(() => {
  const intro = document.querySelector(".intro");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer;
  let started = false;
  let sequence = 0;
  const dismiss = () => {
    sequence++;
    clearTimeout(timer);
    intro.hidden = true;
    intro.classList.remove("intro-playing");
  };
  const play = () => {
    const current = ++sequence;
    clearTimeout(timer);
    intro.classList.remove("intro-playing");
    intro.hidden = false;
    // Two frames let mobile browsers paint the opening state before animating.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (current !== sequence) return;
      intro.classList.add("intro-playing");
      timer = setTimeout(dismiss, motion.matches ? 1600 : 3000);
    }));
  };
  const start = () => {
    if (started || document.visibilityState !== "visible") return;
    started = true;
    play();
  };
  start();
  document.addEventListener("visibilitychange", start);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) play();
    else start();
  });
  document.querySelector(".replay-intro").addEventListener("click", play);
  document.addEventListener("keydown", dismiss);
  document.querySelector(".button").addEventListener("click", (event) => {
    event.preventDefault();
    dismiss();
    const section = document.getElementById("identification");
    section.focus({preventScroll: true});
    section.scrollIntoView({behavior: motion.matches ? "instant" : "smooth", block: "start"});
  });
})();
```

Backend-hosted gallery.js and manage/manage.js are excluded from V2, have no localStorage/sessionStorage code, and use same-origin fetch with cookies. Their behavior includes modal/keyboard/swipe navigation, pagination, async errors, login/logout, admin search/sync/settings/code-copy/private links. Preserve them by leaving Cloudflare deployment untouched.

## 9. Cloudflare Integration Contract

### Public frontend boundary

| Purpose | Method | Endpoint | Request | Response | Auth | CORS | Calling page | Failure |
|---|---|---|---|---|---|---|---|---|
| Open client gallery | Browser navigation GET | https://zah-private-gallery.zahmediaofficial.workers.dev/ | None | Worker-hosted login/gallery HTML | Email + unique code inside destination | Navigation needs no API CORS | Home footer; identify footer | Destination handles configuration/login errors; public site has no API error widget |
| Open studio management | Browser navigation GET | https://zah-private-gallery.zahmediaofficial.workers.dev/manage/ | None | Worker-hosted admin HTML | Management key inside destination | Navigation needs no API CORS | Home footer; identify footer | Destination login fails closed |

No public dist/ script calls /api/*. Do not bring Worker UI/API paths onto Vercel, embed private UI in an iframe, proxy it, change cookies, or add backend migrations.

### Existing Worker API boundary — documentation only

All paths below are relative to the existing Worker origin, never to the new public origin. JSON responses carry no-store, nosniff, no-referrer, X-Frame-Options DENY and same-origin CSP. Client and admin session cookies are Secure, HttpOnly, SameSite=Strict, __Host-prefixed; tokens/codes are not persisted in browser storage. No cross-origin API permission is configured. Client POST and client logout require matching Origin; all admin non-GET requests require matching Origin. Keep these restrictions.

| Purpose | Method / endpoint | Request shape | Response shape | Auth / calling page | Failure |
|---|---|---|---|---|---|
| Client sign in | POST /api/session | JSON {email:string,code:string}, <=1024 bytes | {ok:true}, HttpOnly session cookie | Login on Worker /; paired normalized email + code | 400 malformed; 413 size; 415 non-JSON; 401 unavailable pair; 403 Origin; 429 after 10 attempts/600s; 503 setup missing |
| Client sign out | DELETE /api/session | Cookie; matching Origin | {ok:true}, clears cookie | Active client / | 401 inactive; 403 Origin |
| Gallery metadata | GET /api/gallery | Cookie | {name,created_at,allow_downloads:boolean} | Active client / | 401 locked; 403 outside authorized folder |
| Photo pagination | GET /api/photos?cursor=… | Cookie; optional opaque cursor <=2048 chars | {photos:[{id,name,thumbnail,full,download:null|string}],cursor:null|string} | Active client / | 400 invalid cursor; 401/403 auth/folder; upstream 502 |
| Image streaming | GET /api/photos/:id/thumbnail or /full or /download | Cookie; allowed file ID | Image bytes; jpeg/png/webp; attachment disposition for download | Active client /; file belongs to assigned folder; download permission for download | 401 no session; 403 disabled download; 404 unavailable/other-folder file; 502 unsupported/upstream |
| Admin sign in | POST /api/admin/session | JSON {key:string}; admin JSON bodies <=8192 bytes | {ok:true}, admin HttpOnly cookie | Worker /manage/; existing management key | 401 wrong key; 403 Origin; 429 attempts; 503 setup |
| Admin sign out | DELETE /api/admin/session | Cookie; matching Origin | {ok:true}, clears cookie | Admin /manage/ | 401/403 |
| Overview | GET /api/admin/overview | Cookie | {galleries:[metadata without code/hash],registrations:[minimal registration records],jotform_configured:boolean} | Admin /manage/ | 401; unexpected internal failure generic 502 |
| Registration sync | POST /api/admin/sync | JSON {offset?:integer}; 0..100000 | {imported,skipped,next_offset:null|integer} | Admin /manage/; server Jotform credential | 400 invalid offset; 503 missing key; 502 provider response |
| Create private gallery | POST /api/admin/galleries | JSON {name,client_name,email,folder,expires_at:null|future epoch seconds,allow_downloads:boolean,confirmed_private:true} | 201 {code,email,gallery_id}; code shown once | Admin /manage/; dedicated authorized child Drive folder | 400 missing confirmation/invalid folder/details; 409 reused folder; upstream 502 |
| Rotate code | POST /api/admin/galleries/:16hex/rotate | JSON {} from UI | {code}; revokes old sessions | Admin /manage/ | 404 missing gallery; 401/403 |
| Change settings | POST /api/admin/galleries/:16hex/settings | JSON {status:active|disabled,allow_downloads:boolean,expires_at:null|positive epoch seconds} | {ok:true}; revokes client sessions | Admin /manage/ | 400 invalid; 404 absent; 401/403 |
| Read private studio links | GET /api/admin/links | Cookie | {links:[{id,title,url}]} | Admin /manage/ | 401 |
| Add/remove private studio link | POST /api/admin/links | JSON {title,url} or {remove:id} | {links:[…]} | Admin /manage/ | 400 invalid ID/non-HTTPS/credentials in URL; 401/403 |

Sessions re-check active status/expiry; folder must be below the dedicated Drive root, never the root itself; ancestry is limited to six levels. Drive listing is 50 images per page, excludes trashed files and supports JPEG/PNG/WebP. No access codes or personal records are reproduced here.

Live Worker code/version, current D1 data, active bindings and live Google permissions: UNKNOWN — REQUIRES VERIFICATION. Source inspection and mocked tests prove implementation contracts, not live account state.

## 10. Jotform Integration

| Page / system | Public form | Method and dependencies |
|---|---|---|
| /booking/ | 262545240735052; direct https://form.jotform.com/zahmediaofficial/zah-media-booking | Styled native form POST https://submit.jotform.com/submit/262545240735052; booking.js maps name/date/time hidden fields; exact names in section 4 |
| /identify/ | 262725740128053; https://form.jotform.com/262725740128053 | iframe title/ID, camera permission, eager load, initial 1500px height; external embed handler called on DOMContentLoaded |
| Cloudflare management sync | Identification form 262725740128053 | Server GET https://api.jotform.com/form/262725740128053/submissions using APIKEY header; explicit admin action, up to 500 per request, offset continuation; imports active valid name/email/package-code/submission-id/registered-at only |

Booking redirects by native browser form navigation to provider response. No client-side callback, custom thank-you route, fetch submission handler or redirect URL is specified in repository code. Identify iframe resize/message handling is provider-owned. There is no repository-owned submission-complete callback.

Confirmation text, provider form field IDs/schema, email notifications, provider account limits, current upload rules, Jotform branding policy and host allowlists: UNKNOWN — REQUIRES VERIFICATION. Do not fabricate a success page or submit a real client form during discovery.

Desktop iframe presentation clips 76px from bottom with negative margin. At <=600px the crop is removed to protect controls as the form grows. Provider changes can alter geometry; preview verification must check submit controls and success state. Package labels/choices inside Jotform are not encoded in public repository and must be verified at provider; no unverified B1 mapping is invented.

## 11. Routing Compatibility

GitHub Pages artifact root is dist/, currently exposed under /zah-media/. HTML uses relative links (assets/ at home; ../assets/ and ../service/ on nested pages). Maintain directory index.html and trailing slashes so relative links resolve correctly.

CMS media output is /assets; cms-content.js deliberately resolves it relative to its script directory and strips an optional leading /zah-media/. Copying JSON into another app without that resolver would break image paths under a prefix. No public SPA router, route guard, Vite base, React import or Next configuration exists.

Worker and Jotform URLs are intentionally absolute and remain unchanged. Worker API paths are root-relative on its own origin and must not be moved to Vercel.

No public canonical, redirect file, CNAME, sitemap.xml, robots.txt, vercel.json, netlify.toml or client-side redirect is present in main. /identify/ has a page-level noindex,nofollow. Old /zah-media/ URLs can remain on GitHub Pages; future Vercel prefix alias is specified in section 16. Query versions ?v=3 and ?v=zah-0470 are cache hints, not duplicate page sources.

Root-level gallery.html and wedding.jpg are excluded by the Pages upload path. Vercel must publish dist/ only; publishing repository root risks exposing backend source and unpublished drafts.

## 12. SEO Inventory

| Route | Title | Meta description | Canonical | Open Graph | Twitter | Favicon | Structured data | Robots |
|---|---|---|---|---|---|---|---|---|
| / | ZAH Media — Every moment. Worth keeping. | Wedding, event and portrait photography by ZAH Media. Every occasion. Every emotion. Beautifully captured. | Absent | Absent | Absent | assets/favicon.svg (relative to site root) | Absent | No meta robots; no robots.txt |
| /about/ | About ZAH Media — Photography for Every Occasion | Meet ZAH Media—photography for weddings, events, portraits, and every occasion worth remembering. | Absent | Absent | Absent | assets/favicon.svg (relative to site root) | Absent | No meta robots; no robots.txt |
| /booking/ | Book Photography — ZAH Media | Request wedding, event, or portrait photography with ZAH Media. | Absent | Absent | Absent | assets/favicon.svg (relative to site root) | Absent | No meta robots; no robots.txt |
| /events/ | Event Gallery — ZAH Media | Explore event photography from ZAH Media. | Absent | Absent | Absent | assets/favicon.svg (relative to site root) | Absent | No meta robots; no robots.txt |
| /identify/ | Photo identification — ZAH Media | One quick step to help ZAH Media identify and organise your photographs. | Absent | Absent | Absent | assets/favicon.svg (relative to site root) | Absent | noindex, nofollow |
| /portraits/ | Portrait Gallery — ZAH Media | Explore portrait photography from ZAH Media. | Absent | Absent | Absent | assets/favicon.svg (relative to site root) | Absent | No meta robots; no robots.txt |
| /weddings/ | Wedding Gallery — ZAH Media | Explore wedding photography by ZAH Media. | Absent | Absent | Absent | assets/favicon.svg (relative to site root) | Absent | No meta robots; no robots.txt |
No page includes JSON-LD or a social share image. All seven pages specify viewport; HTML language is en. Theme colors: home/about/booking #f5f5f7; identify #090a0c; gallery pages none. Preserve current metadata during parity; canonical/social/sitemap enhancements require final-domain knowledge and separate scope. Current robots absence does not prove search engine indexing.

## 13. Responsive Specification

| CSS / routes | Desktop | Tablet | Mobile / reduced motion |
|---|---|---|---|
| styles.css / home | Default 3-image ribbon .82fr/1.1fr/.82fr, 350/410px heights; 2-column service pair. >=1700px early wedding rules exist but late wedding overrides remove min-height and left margin. | <=850px: nav gap 1.7rem, ribbon 280/340px, service min-height 640px; final wedding remains stacked. | <=600px: nav-links hidden, details menu shown, header 3.5rem; ribbon .6fr/1.25fr/.6fr extends 6rem beyond content, heights 225/280px; side captions hidden; service pair stacks, 8px gutters, 660px service min-height; footer stacks; final wedding copy padding 2.8rem 1.2rem. Reduced motion disables transitions/smooth scroll. |
| gallery.css / three galleries | Hero 5.5rem 1.5rem 4rem; gallery 1320px; contained image max-height 78vh; 28px frame radius | No independent tablet query; default until <=640px | <=640px: hide desktop nav; hero padding 4rem 1.2rem 3rem, h1 3.8rem; 8px gallery padding, 20px corners, 70vh images, footer block. No mobile drawer in these pages. |
| about.css | Story .85fr/1.15fr, gap 6rem; 3-column values; services .8fr/1.2fr | Default until <=760px | <=760px: nav hidden; story/services 1 column and 5rem 1.25rem padding/gap 3rem; values stack; services small copy spans row; footer wraps. |
| booking.css | Layout minmax(230px,.7fr)/minmax(0,1.5fr), gap 6rem; sticky sidebar top 90px; 2-column fields | Default until <=760px | <=760px: nav hidden; layout/fields stack, sidebar static, layout 4rem 1.25rem, gap 3rem, card radius 22px. <=430px h1 3.2rem, card padding 1.3rem, copyright full-width. |
| identify.css | Welcome 960px; identification 1000px; intro blur and fade; iframe crop 76px | Default until <=600px | <=600px: narrower header/welcome, smaller text, shell radius 14px, no iframe crop; intro 100dvh and transform/opacity without blur. Reduced-motion late override keeps static intro card, JS dismisses after 1600ms, avoids animated scroll. |

Suggested parity viewports: desktop 1440×900 and 1920×1080; tablet 768×1024; mobile 390×844 and 430×932; test exact breakpoint neighbors (600/601, 640/641, 760/761, 850/851, 1700). These are proposed test sizes, not claims of rendered verification. No GUI/browser was opened in this phase. Device-specific animation behavior is UNKNOWN — REQUIRES VERIFICATION.

## 14. Production vs Draft Inventory

### A. CURRENT PRODUCTION

main at d3a365f5a3655cd7cbd63c3c452c76e480f5fcfc, with successful Pages workflow at same SHA. Published public source: all 24 dist/ files listed in section 7. Deployment source: .github/workflows/pages.yml. Editing configuration: .pages.yml. README is documentation with stale stock attribution; dist/ HTML+JSON are authoritative.

### B. DRAFT / EXPERIMENTAL / NOT DEPLOYED

Graduation is NOT in main's dist/ tree. GitHub PR #1 (https://github.com/zahmediaofficial/zah-media/pull/1) remains open and draft, head codex/graduation-portraits at 48de52f8e2e9aff85ee4c3a0799c58cc41318d90, base main. Local graduation page/content/styles/scripts, GRADUATION.md, dev preview/config/verification and review screenshots are outside production scope. Do not include /graduation/ in reconstruction or navigation without separate approval. Absence from main plus artifact-only-dist workflow proves it is not part of current production source; live cache artifacts were not independently queried.

Root gallery.html is a tracked but unpublished prototype; missing photo1–photo6 references. Root wedding.jpg is 2 bytes and unpublished. Neither belongs in the new site's output.

### C. BACKEND / CLOUDFLARE

Every gallery-app/ file stays with Cloudflare; code, schemas, Wrangler settings, secret bindings and deployed assets remain untouched. Runtime production deployment version is UNKNOWN — REQUIRES VERIFICATION; repository main is the contract reference, not proof of the current Worker version.

### D. PUBLIC FRONTEND

dist/ and .pages.yml are the frontend-copy allowlist. .pages.yml belongs at the new repository root and retains dist/content and dist/assets paths if CMS parity is desired. Pages CMS authorization for a new repo is a later account setup step; no account action was taken.

### E. DEVELOPMENT / TESTING ONLY

gallery-app/tests/*, scripts/create-gallery.mjs, package.json dev/test/code scripts, both backend READMEs and .gitignore; local dev/* and review/*; workspace work/* audit tooling. These are not public browser assets and are not to be included in frontend output.

### Complete remote tree inventory

| File | Classification | Rebuild treatment |
|---|---|---|
| .github/workflows/pages.yml | A: production deployment configuration | Do not copy into public deployment |
| .gitignore | E: documentation / repository hygiene | Do not copy into public deployment |
| .pages.yml | A + D: CMS configuration | Copy configuration for future new-repo editor parity |
| README.md | E: documentation / repository hygiene | Do not copy into public deployment |
| dist/about.css | A + D: public production | Copy immutable public bytes |
| dist/about/index.html | A + D: public production | Copy immutable public bytes |
| dist/assets/event.jpg | A + D: public production | Copy immutable public bytes |
| dist/assets/favicon.svg | A + D: public production | Copy immutable public bytes |
| dist/assets/portrait.jpg | A + D: public production | Copy immutable public bytes |
| dist/assets/wedding.jpg | A + D: public production | Copy immutable public bytes |
| dist/booking.css | A + D: public production | Copy immutable public bytes |
| dist/booking.js | A + D: public production | Copy immutable public bytes |
| dist/booking/index.html | A + D: public production | Copy immutable public bytes |
| dist/cms-content.js | A + D: public production | Copy immutable public bytes |
| dist/content/about.json | A + D: public production | Copy immutable public bytes |
| dist/content/events.json | A + D: public production | Copy immutable public bytes |
| dist/content/home.json | A + D: public production | Copy immutable public bytes |
| dist/content/portraits.json | A + D: public production | Copy immutable public bytes |
| dist/content/weddings.json | A + D: public production | Copy immutable public bytes |
| dist/events/index.html | A + D: public production | Copy immutable public bytes |
| dist/gallery.css | A + D: public production | Copy immutable public bytes |
| dist/identify/identify.css | A + D: public production | Copy immutable public bytes |
| dist/identify/identify.js | A + D: public production | Copy immutable public bytes |
| dist/identify/index.html | A + D: public production | Copy immutable public bytes |
| dist/index.html | A + D: public production | Copy immutable public bytes |
| dist/portraits/index.html | A + D: public production | Copy immutable public bytes |
| dist/styles.css | A + D: public production | Copy immutable public bytes |
| dist/weddings/index.html | A + D: public production | Copy immutable public bytes |
| gallery-app/.gitignore | C + E: backend development/documentation | Do not copy into public deployment |
| gallery-app/MANAGEMENT.md | C + E: backend development/documentation | Do not copy into public deployment |
| gallery-app/README.md | C + E: backend development/documentation | Do not copy into public deployment |
| gallery-app/admin-schema.sql | C: backend / Cloudflare | Do not copy into public deployment |
| gallery-app/package.json | C + E: backend development/documentation | Do not copy into public deployment |
| gallery-app/public/gallery.css | C: backend / Cloudflare | Do not copy into public deployment |
| gallery-app/public/gallery.js | C: backend / Cloudflare | Do not copy into public deployment |
| gallery-app/public/index.html | C: backend / Cloudflare | Do not copy into public deployment |
| gallery-app/public/manage/index.html | C: backend / Cloudflare | Do not copy into public deployment |
| gallery-app/public/manage/manage.css | C: backend / Cloudflare | Do not copy into public deployment |
| gallery-app/public/manage/manage.js | C: backend / Cloudflare | Do not copy into public deployment |
| gallery-app/schema.sql | C: backend / Cloudflare | Do not copy into public deployment |
| gallery-app/scripts/create-gallery.mjs | C + E: backend development/documentation | Do not copy into public deployment |
| gallery-app/src/admin.mjs | C: backend / Cloudflare | Do not copy into public deployment |
| gallery-app/src/google-drive.mjs | C: backend / Cloudflare | Do not copy into public deployment |
| gallery-app/src/repository.mjs | C: backend / Cloudflare | Do not copy into public deployment |
| gallery-app/src/security.mjs | C: backend / Cloudflare | Do not copy into public deployment |
| gallery-app/src/storage.mjs | C: backend / Cloudflare | Do not copy into public deployment |
| gallery-app/src/worker.mjs | C: backend / Cloudflare | Do not copy into public deployment |
| gallery-app/tests/admin.test.mjs | C + E: backend development/documentation | Do not copy into public deployment |
| gallery-app/tests/gallery.test.mjs | C + E: backend development/documentation | Do not copy into public deployment |
| gallery-app/wrangler.jsonc | C: backend / Cloudflare | Do not copy into public deployment |
| gallery.html | B: unpublished prototype | Do not copy into public deployment |
| wedding.jpg | B: unpublished prototype | Do not copy into public deployment |

## 15. Recommended V2 Architecture

Static HTML + CSS + browser JavaScript is sufficient. No framework or bundler is technically required by seven directory pages, JSON content hydration or native form submission. Preserve the current public architecture before optional future improvements.

Recommended new repository (not created in this phase):

```text
zah-media-v2/
  README.md
  .gitignore
  .pages.yml
  vercel.json
  docs/
    ZAH_MEDIA_V2_REBUILD_PACKET.md
  dist/
    index.html
    styles.css
    gallery.css
    about.css
    booking.css
    booking.js
    cms-content.js
    assets/
      favicon.svg
      wedding.jpg
      event.jpg
      portrait.jpg
    content/
      home.json
      about.json
      weddings.json
      events.json
      portraits.json
    about/index.html
    booking/index.html
    events/index.html
    identify/
      index.html
      identify.css
      identify.js
    portraits/index.html
    weddings/index.html
```

No gallery-app/, SQL, credential JSON, .env, Drive/customer exports, draft graduation files or existing production deployment workflow. No root npm manifest needed. Optional future dev-only parity tooling can be introduced when building, without changing browser output.

CMS remains optional for public editing but is an existing capability: retain its exact configuration below, then later authorize only the new repository. No production CMS edits in this phase.

```yaml
media:
  - name: photos
    label: Website photos
    input: dist/assets
    output: /assets
    extensions: [jpg, jpeg, png, webp]
    rename: safe

content:
  - name: home
    label: Home page
    type: file
    path: dist/content/home.json
    format: json
    fields:
      - name: hero_intro
        label: Hero introduction
        type: text
        required: true
      - name: about_intro
        label: About preview
        type: text
        required: true

  - name: about
    label: About page
    type: file
    path: dist/content/about.json
    format: json
    fields:
      - name: lead
        label: Opening line
        type: text
        required: true
      - name: story_one
        label: Our purpose — first paragraph
        type: text
        required: true
      - name: story_two
        label: Our purpose — second paragraph
        type: text
        required: true

  - name: weddings
    label: Wedding gallery
    type: file
    path: dist/content/weddings.json
    format: json
    fields:
      - name: introduction
        label: Gallery introduction
        type: text
        required: true
      - name: note
        label: Gallery closing message
        type: text
        required: true
      - name: photos
        label: Photos (first photo also appears on Home)
        type: object
        list:
          min: 1
          collapsible:
            collapsed: true
            summary: "{caption} ({index})"
        fields:
          - name: image
            label: Photo
            type: image
            required: true
            options:
              media: photos
          - name: alt
            label: Description for visitors using a screen reader
            type: text
            required: true
          - name: caption
            label: Caption
            type: string
            required: true
          - name: credit
            label: Photographer credit
            type: string
            required: true
          - name: illustrative
            label: Illustrative or stock photo?
            type: boolean

  - name: events
    label: Event gallery
    type: file
    path: dist/content/events.json
    format: json
    fields:
      - name: introduction
        label: Gallery introduction
        type: text
        required: true
      - name: note
        label: Gallery closing message
        type: text
        required: true
      - name: photos
        label: Photos (first photo also appears on Home)
        type: object
        list:
          min: 1
          collapsible:
            collapsed: true
            summary: "{caption} ({index})"
        fields:
          - name: image
            label: Photo
            type: image
            required: true
            options:
              media: photos
          - name: alt
            label: Description for visitors using a screen reader
            type: text
            required: true
          - name: caption
            label: Caption
            type: string
            required: true
          - name: credit
            label: Photographer credit
            type: string
            required: true
          - name: illustrative
            label: Illustrative or stock photo?
            type: boolean

  - name: portraits
    label: Portrait gallery
    type: file
    path: dist/content/portraits.json
    format: json
    fields:
      - name: introduction
        label: Gallery introduction
        type: text
        required: true
      - name: note
        label: Gallery closing message
        type: text
        required: true
      - name: photos
        label: Photos (first photo also appears on Home)
        type: object
        list:
          min: 1
          collapsible:
            collapsed: true
            summary: "{caption} ({index})"
        fields:
          - name: image
            label: Photo
            type: image
            required: true
            options:
              media: photos
          - name: alt
            label: Description for visitors using a screen reader
            type: text
            required: true
          - name: caption
            label: Caption
            type: string
            required: true
          - name: credit
            label: Photographer credit
            type: string
            required: true
          - name: illustrative
            label: Illustrative or stock photo?
            type: boolean
```


## 16. Vercel Deployment Specification

These are recommendations for a future separate V2 project, not configuration changes performed now.

| Setting | Recommended |
|---|---|
| FRAMEWORK PRESET | Other |
| ROOT DIRECTORY | Repository root (.) |
| BUILD COMMAND | Empty / skip build; no npm run build |
| INSTALL COMMAND | Empty / skip install; no dependencies |
| OUTPUT DIRECTORY | dist |
| NODE REQUIREMENTS | None for public deployment; dev tests need Node >=22.13 only if deliberately copied as development tooling |
| TRAILING SLASH | true |
| REWRITES | /zah-media/:path* → /:path* to support old prefix path aliases on the new origin |
| REDIRECTS | No custom redirects initially; trailingSlash handles slashless page requests; preserve query strings |
| ENVIRONMENT VARIABLES | None for public frontend |
| SERVER FUNCTIONS / DB | None; Cloudflare untouched |
| SPA FALLBACK | None; missing paths should 404 rather than serve home |

Proposed root vercel.json:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "buildCommand": "",
  "installCommand": "",
  "outputDirectory": "dist",
  "trailingSlash": true,
  "rewrites": [
    {
      "source": "/zah-media/:path*",
      "destination": "/:path*"
    }
  ]
}
```

Explicit output prevents repository-root files being served. The prefix alias must include nested pages, assets and content; no Cloudflare API rewrite. Preview verification must check /zah-media/ itself as well as nested aliases and confirm there are no rewrite loops. This is a proposed, un-deployed configuration.

Vercel supports serving static HTML/CSS/JS with Other and no build; outputDirectory selects the static directory. Source: [Configure a Build](https://vercel.com/docs/builds/configure-a-build). trailingSlash true adds a slash to extensionless paths while files with extensions are excluded. Source: [vercel.json configuration](https://vercel.com/docs/project-configuration/vercel-json). Documentation checked 2026-10-04.

Plan selection: this is a business photography site. Vercel restricts Hobby to non-commercial personal use; commercial usage requires Pro or Enterprise. Verify the chosen account plan before eventual deployment. Source: [Vercel fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines). No plan purchase or project creation is authorized/performed here.

Current package status: root package.json NOT PRESENT; root lockfile NOT PRESENT; public dependencies NONE. gallery-app/package.json is valid JSON with Node >=22.13, type module, wrangler ^4.0.0 development dependency and test/dev/code scripts; its lockfile is NOT PRESENT. Those backend requirements do not become V2 frontend requirements. No clean npm install or build was needed or performed because public files are already the published output and backend dependencies must remain untouched.

## 17. Functional Parity Checklist

PASS below means a source/automated discovery check passed, not that V2 has been implemented or rendered. Preview-dependent checks remain unknown, never implied successful.

| Check | Discovery result | Future V2 acceptance requirement |
|---|---|---|
| Route / | PASS — source exists with valid local references | Same content, section order, metadata, controls and links; HTTP success at root and prefix alias |
| Route /about/ | PASS — source exists with valid local references | Same content, section order, metadata, controls and links; HTTP success at root and prefix alias |
| Route /booking/ | PASS — source exists with valid local references | Same content, section order, metadata, controls and links; HTTP success at root and prefix alias |
| Route /events/ | PASS — source exists with valid local references | Same content, section order, metadata, controls and links; HTTP success at root and prefix alias |
| Route /identify/ | PASS — source exists with valid local references | Same content, section order, metadata, controls and links; HTTP success at root and prefix alias |
| Route /portraits/ | PASS — source exists with valid local references | Same content, section order, metadata, controls and links; HTTP success at root and prefix alias |
| Route /weddings/ | PASS — source exists with valid local references | Same content, section order, metadata, controls and links; HTTP success at root and prefix alias |
| Desktop / tablet / mobile | UNKNOWN — REQUIRES VERIFICATION — CSS contracts captured, no browser opened | Screenshot/layout and interaction parity at section 13 widths and neighbors |
| Navigation | PASS — href targets found; home mobile details captured | Keyboard, focus, anchor scrolling, menu, current-page indicators |
| Forms | PASS — exact booking field map and iframe captured | Provider accepts genuine controlled test only with later authorization; native validation, required fields, duplicate-submit behavior |
| Jotform | PASS — source URLs/IDs proven; live delivery UNKNOWN — REQUIRES VERIFICATION | Submission confirmation, correct mappings, owner inbox and stored record verified |
| Private gallery links | PASS — existing absolute links preserved | Gallery origin unchanged, email/code gate, session/download/pagination work |
| Identify workflow | PASS — exact source and fallback captured | Form resizes, camera/upload and submit reachable, intro replay, reduced motion, no obscured mobile controls |
| Cloudflare calls | PASS — no public API coupling; 40 mocked backend tests passed | Same-origin destination portal works; no V2 proxy/CORS/cookie changes |
| External links | PASS — eight unique source URLs recorded, no network health assertion | Actual destinations/provider accessibility verified on preview |
| Images | PASS — all paths exist; wedding dimensions/hash verified | Same focal positions, ratios, CMS first-image selection, lazy loading and image errors |
| SEO | PASS — exact metadata inventory | Titles/descriptions/favicon retained; identify noindex retained; no accidental preview indexing changes |
| Redirects / aliases | UNKNOWN — REQUIRES VERIFICATION — Vercel project not created | Trailing-slash pages and /zah-media/ aliases work, no loops; missing routes 404 |
| Error handling | PASS — saved-HTML CMS fallback and provider direct links captured | Simulated JSON failure preserves useful pages; third-party unavailability and no-JS behavior reviewed |
| Backend separation | PASS — no migration/configuration mutation | No Worker/D1/private data copied; portal stays on existing origin |
| Public script syntax / JSON | PASS — 3 owned public scripts parse, 5 public JSON files parse | Rerun against rebuilt tree |
| Asset/link references | PASS — 112 internal reference checks; zero broken | Rerun against V2; validate prefix and root requests |
| Backend security tests | PASS — 40/40 using matching remote-source modules/tests, in-memory fixtures and mocked services | No live database mutation; rerun only if integration concerns warrant |
| Public install/build | PASS / not applicable — no dependency graph or compiler | Serve existing static output; no fabricated npm build pipeline |

Read-only tests executed using Node v24.19.0: node --test tests/admin.test.mjs tests/gallery.test.mjs in the local gallery-app copy; both tests and all six matching implementation modules have production Git blob SHA matches. Test services are mocked; no live credential access or client submission. No lint/typecheck scripts exist. No rebuild, dependency install or production asset write was performed.

Completed report validation: 20 required sections, seven routes, 24 published files, 112 internal references (zero missing), three script syntax checks, five public JSON parses, six CMS asset-resolution cases across root and /zah-media/ origins, and secret-pattern scans PASS. All 60 existing local source/draft files retain their snapshot hashes. Main and discovery refs were re-read and both still match the production SHA before publishing the report.

Validation rules before saving: all seven route source files present; 24 public resources inventoried; referenced local href/src/action and JSON image paths resolve; all external URLs come from exact source; HTML/script/style/JSON sources included verbatim; 20 required sections present; report secret-value scan required. After docs publication, compare main against discovery to require exactly one added Markdown file and verify main SHA unchanged.

## 18. Zero-Downtime Cutover Plan

1. CURRENT PRODUCTION: keep GitHub Pages and Cloudflare running at their existing origins; record main SHA, public URL, backend URL and current domain/DNS settings later without changing them.
2. BUILD V2 SEPARATELY: create a new frontend-only repo from the allowlisted immutable production files. Do not fork deployable Worker configuration into it. Preserve existing production branch and CMS.
3. VERCEL PREVIEW: after separate authorization, create a new appropriately planned Vercel project, with dist output and no production-domain attachment. Limit preview access and ensure it can load required external provider embeds.
4. PARITY TEST: run route/resource/JSON/syntax checks; compare desktop/tablet/mobile renderings, source text, layout and fallback states. Resolve all functional checklist unknowns relevant to launch.
5. INTEGRATION TEST: verify links to the unchanged Worker; verify controlled form delivery and identification upload with later authorization. Confirm that provider-origin rules and callback settings accept the new frontend hostname. Check CMS edits in the new repository only.
6. DOMAIN CUTOVER: only after explicit future authorization, document existing DNS and rollback target, then attach the owned domain to V2 and make the minimal required DNS change. Do not migrate Worker hostname, bindings, auth or D1.
7. POST-CUTOVER VERIFICATION: check HTTPS, every page, CSS/JSON/images, slash redirects, old prefix compatibility, forms, contact email links, gallery and management links. Confirm unchanged backend login/authorization. Monitor provider delivery and errors.
8. ROLLBACK: restore the previously recorded frontend DNS/hosting target if checks fail; original GitHub Pages remains available. Do not undo or reset backend data, rotate credentials, rewrite main history or delete existing deployment.

If no owned current domain exists, keeping the old GitHub Pages URL available and sharing the separate V2 URL is the first release; there is no DNS cutover to perform. Domain ownership/configuration is UNKNOWN — REQUIRES VERIFICATION. Changing a github.io hostname cannot be accomplished by changing DNS controlled by this operator; any future redirect on the old site requires a separately authorized frontend change.

## 19. Unknowns

Each unproven point is explicitly listed; none is a reason to guess or touch production.

- Live Worker deployment version vs repository main: UNKNOWN — REQUIRES VERIFICATION.
- Current D1 contents, configured secrets/bindings and Google Drive sharing/permissions: UNKNOWN — REQUIRES VERIFICATION. Not queried.
- Jotform field schema inside hosted identification form, package choices/codes, email routing, confirmations, account limits, branding and hostname restrictions: UNKNOWN — REQUIRES VERIFICATION.
- Live external endpoint availability and full provider browser behavior: UNKNOWN — REQUIRES VERIFICATION. URLs are proven from source only.
- Actual event.jpg and portrait.jpg dimensions and independent ownership/license evidence: UNKNOWN — REQUIRES VERIFICATION. Source attribution is ZAH Media; README is stale. Do not adopt old stock labels.
- Current domain ownership, DNS, Vercel project/account plan and preview protection: UNKNOWN — REQUIRES VERIFICATION.
- Pages CMS new-repository authorization and desired editing workflow: UNKNOWN — REQUIRES VERIFICATION. Existing YAML shape is proven.
- Real phone animation behavior, iframe success-state dimensions and keyboard/touch rendering: UNKNOWN — REQUIRES VERIFICATION.
- Proposed Vercel aliases, redirects, resource MIME types and preview parity: UNKNOWN — REQUIRES VERIFICATION; no V2 deployed.
- Local tracked/untracked change classification and local Git HEAD: UNKNOWN — REQUIRES VERIFICATION; no valid local Git checkout. Preserve all 60 local source/draft files.
- Whether private gallery management is operational against live production credentials: UNKNOWN — REQUIRES VERIFICATION; mocked tests alone cannot establish it.

Source conflicts resolved by evidence: graduation is an open draft PR and absent from production; root gallery prototype excluded by workflow; README event/portrait stock claim conflicts with current owner-attributed JSON/HTML and is not used as content authority.

## 20. Final Assessment

Discovery establishes a complete source-level rebuild package. Unknown live-provider/device/domain questions remain launch gates, not undisclosed assumptions. The public reconstruction can start safely in a separate repository without backend migration.

REBUILD PACKET STATUS:
COMPLETE

PUBLIC FRONTEND REBUILD FEASIBILITY:
MEDIUM RISK

BACKEND MIGRATION REQUIRED:
NO

CURRENT PRODUCTION MODIFIED:
NO

SAFE TO START V2 BUILD:
YES

NEXT RECOMMENDED ACTION:
Create a separate frontend-only V2 repository from the immutable dist/ allowlist and optional .pages.yml, then implement source parity. Do not deploy or change domains/backend until separately authorized.