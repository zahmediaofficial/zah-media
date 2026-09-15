# ZAH Media

Responsive static website for wedding, event and portrait photography. The publishable website is in `dist/`. No dependencies or build step are required.

## Booking

The booking page sends requests to ZAH Media's Jotform form. Jotform displays its own confirmation after accepting a request. Enquiry email links address zahmediaofficial@gmail.com.

## Editing with Pages CMS

Open https://app.pagescms.org/, sign in with the GitHub account that owns `zahmediaofficial/zah-media`, and open that repository on `main`. The root `.pages.yml` config gives you Home, About, Wedding gallery, Event gallery, and Portrait gallery editors plus a Website photos media library.

To add a gallery photo, open the relevant gallery, add a Photos item, select or upload the image, write a useful description, caption, and photographer credit, then save. The first photo in each gallery is also shown on the home page (and the wedding photo appears on About). Set “Illustrative or stock photo?” to **No** for your own work; if you replace a stock photo, update the gallery closing message too. Saving commits the JSON and image to GitHub; the existing Pages workflow publishes `dist/`. Allow the deployment to finish, then refresh the live site. For best speed, export photographs as JPG or WebP around 2000–2400 pixels wide and preferably under 2 MB.

The site reads `dist/content/*.json` in the browser. If a content file is temporarily unavailable, the original page content remains visible. Gallery descriptions and images are editable without touching HTML. The booking form layout and service page headlines remain fixed design elements.

## Photography

The wedding photograph is supplied by ZAH Media (DSC_0470.jpg), optimized to 2400 pixels wide for the website. Event and portrait photographs remain labelled illustrative stock. Replace their assets and update the corresponding alt text, labels and credits when adding approved ZAH Media work.

Stock sources (Unsplash License, https://unsplash.com/license):
- Danny Howe: https://unsplash.com/photos/people-gathering-on-concert-field-bn-D2bCvpik
- Polina Kuzovkova: https://unsplash.com/photos/a-smiling-woman-poses-in-a-bright-studio-bu_boI0bycw

## GitHub Pages

The included workflow publishes `dist/` on pushes to `main` or manual dispatch. In the repository's Settings → Pages, select GitHub Actions as the source. The repository and Pages availability must support the account's plan. Do not add a custom domain until it is owned and its DNS has been configured.

The site uses relative asset URLs, so it can run at a GitHub project URL or a custom domain without changing the page paths.

