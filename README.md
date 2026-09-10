# ZAH Media

Responsive static website for wedding, event and portrait photography. The publishable website is in `dist/`. No dependencies or build step are required.

## Contact

Enquiry links open the visitor's email application addressed to zahmediaofficial@gmail.com. This is not an online booking or form submission service.

## Photography

The initial photographs are licensed illustrative stock, explicitly labelled on the website. Replace `dist/assets/wedding.jpg`, `event.jpg` and `portrait.jpg` with approved ZAH Media work before representing them as a portfolio. Update the alt text, image labels and footer credits at the same time.

Stock sources (Unsplash License, https://unsplash.com/license):
- Lauren Mitchell: https://unsplash.com/photos/a-bride-and-groom-holding-hands-and-smiling-glouLzM1PMg
- Danny Howe: https://unsplash.com/photos/people-gathering-on-concert-field-bn-D2bCvpik
- Polina Kuzovkova: https://unsplash.com/photos/a-smiling-woman-poses-in-a-bright-studio-bu_boI0bycw

## GitHub Pages

The included workflow publishes `dist/` on pushes to `main` or manual dispatch. In the repository's Settings → Pages, select GitHub Actions as the source. The repository and Pages availability must support the account's plan. Do not add a custom domain until it is owned and its DNS has been configured.

The site uses relative asset URLs, so it can run at a GitHub project URL or a custom domain without changing the page paths.
