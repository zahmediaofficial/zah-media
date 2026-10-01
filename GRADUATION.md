# Graduation portraits — draft

The new route is `/zah-media/graduation/`. It follows the existing static `dist` architecture, fonts, colours, navigation and booking flow. The draft includes the supplied packages and add-ons, an editorial gallery with a keyboard-accessible native lightbox, eleven FAQs and responsive layouts. There is no new backend or dependency.

## Preview

Run `node dev/preview.mjs` from this repository. Open `http://127.0.0.1:4193/zah-media/graduation/`.

The local server merges `dev/graduation-preview.json` into the image configuration. This file is outside `dist`, never uploaded by the Pages workflow, and its images are also rejected by the page outside localhost. Third-party photographs are development references only and are not ZAH Media portfolio work. No visible photo credits appear in the design.

Use `node dev/preview.mjs --originals-only` to preview exactly the production image configuration. Do not merge/publish this draft with empty photographs.

## Replace photographs without editing HTML

In Pages CMS, open **Graduation portraits**. Upload ZAH Media's authorised original graduation photographs using **Website photos**, then select the photograph for each of the nine named slots. Add accurate screen-reader descriptions and adjust crop positions if needed. `50% 30%` means horizontally centred, focused toward the upper third.

All production image references live in `dist/content/graduation.json`. Paths produced by the existing editor, such as `/assets/graduation-hero.webp`, work on GitHub Pages under `/zah-media/`.

Export compressed WebP/JPEG files rather than full camera originals. Aim for a 1440–1920px hero, 960–1440px gallery photographs and sensible compression. For responsive original variants, add `variants: [{"src":"/assets/example-640.webp","width":640},{"src":"/assets/example-1440.webp","width":1440}]` to an image entry. Main images reserve layout space; below-the-fold photographs are lazy loaded.

## Business settings

In the same editor, fill in the deposit requirement, session locations/service area, travel policy and normal editing turnaround. Blank settings retain neutral responses saying the details will be confirmed when booking; no payment amount or normal turnaround has been invented.

Enter your real WhatsApp number with its country code and digits only, e.g. country code followed by your actual number. Until supplied, the page uses the existing `zahmediaofficial@gmail.com` contact instead.

The booking destination defaults to `booking/`. Package buttons prefill the existing booking form's **Portrait** service and describe the graduation package in **Tell us about your plans**. This preserves the existing Jotform field values and form ID. A request is not a confirmed reservation. No live booking submission was sent during development.

## Before publishing

1. Replace all nine development references with authorised ZAH Media originals through the production configuration. Verify image crops on phones and desktop, and give each photograph an accurate description.
2. Confirm the supplied pricing, print sizes, family allowances and availability statement. Supply the four policy answers and WhatsApp number if desired.
3. Select an original social-sharing image. Add a static `og:image` tag to `dist/graduation/index.html` with its full public URL (social crawlers do not reliably run JavaScript). Remove the draft `noindex,nofollow` tag or change it to `index,follow`, and set `production_ready` true in the configuration only at release.
4. Review `/graduation/`, each package-to-booking handoff, the FAQ and lightbox on mobile. Have the studio perform a labelled test booking and confirm its receipt in Jotform.
5. Merge the draft branch when approved. The existing GitHub Pages workflow publishes `dist` from `main`; the local development reference configuration is excluded automatically.

The Home footer and mobile menu link to Graduation portraits. The desktop top navigation is left at its existing size; the new page has its own Graduation navigation item.

## Development reference sources — never production portfolio

The revised preview uses professionally lit studio portraits, formalwear, family portraits, university steps, cap-toss movement and tassel details from [Royal Line Photography](https://www.royallinephotography.com/graduation-photography-dallas), plus a male graduate portrait from [Ardent Aesthetics Photography](https://www.ardentaestheticsphotography.com/).

These photographers' images are local design references, not licensed production assets or ZAH Media work. They remain outside dist and must be replaced with authorised ZAH Media photographs before publication. Source URLs are kept in dev/graduation-preview.json for traceability. No visible image credits appear in the design.

## Verification

Run `node dev/verify-graduation.mjs`. It checks all three booking handoffs, protects the existing non-graduation flow and restored message text, rejects unknown packages, and checks that reference imagery stays out of production data. Browser checks cover 320, 375, 390, 430, 768 and desktop widths, image loading, the FAQ and lightbox. JavaScript syntax can also be checked with `node --check dist/graduation/graduation.js` and `node --check dist/booking.js`.
