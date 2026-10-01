# ZAH Media private gallery — Phase 1 foundation

Status: Deployed for an authorised test at https://zah-private-gallery.zahmediaofficial.workers.dev/. D1 is bound and one private test gallery is registered. Google authentication, listing all 18 uploaded photographs, all thumbnails, full-resolution viewing and downloading an original photograph are verified live. Physical mobile-browser checks remain pending. Google secrets are encrypted runtime settings. Offline tests cover authentication, authorization, expiry, revocation and Workers transport compatibility. No DNS changes.

## Existing project and decision

The public website is plain HTML/CSS/JS in `dist/`. `.github/workflows/pages.yml` publishes that directory on main pushes. Pages CMS edits public content via `.pages.yml`. There is no existing serverless configuration. Public styling uses system sans-serif, tight large headings, generous spacing, #0071e3 pill buttons and the ZAHmedia wordmark; the identification page provides the dark palette adopted here.

This standalone `gallery-app/` is outside `dist/`, so the public deployment does not include it. No existing files were modified. Proposed architecture: public site stays on GitHub Pages; gallery HTML, API and private photo proxy share a Cloudflare Worker origin; D1 stores metadata, hashed codes, sessions and rate-limit counters. Google Drive stores photographs privately. No cross-site cookies or CORS needed. Start on a workers.dev staging hostname; eventually use gallery.your-domain.com.

Cloudflare is recommended because Workers can stream originals without buffering them and host the small static frontend beside the API. D1 avoids introducing an independent database service. Free tiers can cover initial trials, but every image proxy request uses Worker capacity; Drive quotas and Workers CPU/request limits need measuring. This is not an unlimited free photo CDN. Vercel's documented 4.5MB function payload limit and Netlify's documented 20MB streaming response limit make large original delivery less straightforward for this design.

Sources: [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [static asset routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [Vercel limits](https://vercel.com/docs/functions/limitations), [Netlify functions](https://docs.netlify.com/build/functions/api/).

## Files and model

- `src/worker.mjs`: same-origin session endpoints, access checks, paginated listing and streamed images.
- `src/security.mjs`: code generation helpers, HMAC hashing, session hashing and status checks.
- `src/repository.mjs`, `schema.sql`: D1 persistence.
- `src/storage.mjs`, `src/google-drive.mjs`: provider contract and official Drive API adapter.
- `public/`: code entry, lazy thumbnail grid, modal lightbox, arrow keys, touch swipe, individual download, loading/error states.
- `scripts/create-gallery.mjs`: local code generation and private SQL import; no admin dashboard.
- `tests/gallery.test.mjs`: offline security and behaviour tests.
- `wrangler.jsonc`, `package.json`, `.gitignore`: Worker configuration with the real D1 binding. `keep_vars` preserves dashboard runtime variables; version preview URLs are disabled.

Gallery columns: gallery_id, gallery_name, client_name, drive_folder_id, access_code_hash, created_at (Unix seconds), expires_at (nullable Unix seconds), status (active/disabled), allow_downloads (0/1). Browser receives gallery display name, date, permissions and photo routes, never client_name or folder mapping. Sessions expire within one hour and are checked against current gallery status/expiry on every request.

Codes are generated as a random 64-bit gallery selector plus a random 192-bit secret. This is separate from B1/S1 graduation package codes: package codes must NEVER unlock galleries. Only HMAC-SHA256(code, server pepper) is persisted; this design depends on generated high-entropy codes, not human-chosen passwords. Raw codes are shown once by the local utility. Session tokens are random 192-bit values with only SHA256 hashes stored in D1. Cookies are Secure, HttpOnly, SameSite=Strict and host-only. Login is limited to 10 attempts per source IP per ten minutes using atomic D1 counters; IP keys are HMAC hashed. No code/token localStorage, analytics or request-body logs.

Photo requests derive the folder from the authenticated session. Adapter checks folder ancestry beneath the dedicated root and verifies direct file parent membership, MIME type and trash status. No arbitrary Drive URL endpoint. Only JPEG, PNG and WebP supported in Phase 1; SVG, RAW/NEF and Drive shortcuts are excluded. The read-only adapter uses service-account JWT exchange, a short-lived Google token, server-only thumbnail links and official files.list/files.get/alt=media. Upstream timeouts and failures return generic errors. Missing thumbnails do not fall back to originals automatically.

50 metadata entries per page; lazy thumbnails; full originals only on lightbox selection or download. Responses use no-store for privacy and immediate revocation. This is deliberately conservative; later internal image caching must still authenticate before serving cached content and use gallery/file/version keys. No shared CDN cache of private responses. Thumbnail availability/host redirects must be verified against real Drive responses; current proxy refuses redirects rather than forwarding credentials to an unverified host. Client downloads do not reveal Drive, but authenticated clients can save any displayed photo regardless of a hidden download button.

## Stop point: manual Google setup

Do not paste secrets in chat. Do not commit downloaded JSON keys or place them in `dist/`. Do not make folders public.

1. Open https://console.cloud.google.com/ and create/select a dedicated project named ZAH Media Galleries.
2. Go to APIs & Services → Library, search Google Drive API, click Enable.
3. Go to IAM & Admin → Service Accounts → Create service account; name it `zah-gallery-reader`. Do not grant project-wide roles. Skip optional user access and finish.
4. Copy the service account email. In your normal Google Drive account, create `ZAH MEDIA CLIENT GALLERIES`, then `2026`, then a single test-gallery folder with 20–30 JPEG/PNG/WebP photographs you are authorised to share.
5. Share ONLY that dedicated root with the service-account email as Viewer. Keep General access Restricted. No domain-wide delegation. The service account owns no photographs and cannot upload through this app. The Drive read-only OAuth scope is broad within that identity, but the identity only sees explicitly shared folders; root ancestry checks further constrain application use. Do not share other private folders with it.
6. Copy the root folder ID from its Drive URL. Copy the test gallery folder ID separately for database registration.
7. On the service account's Keys tab → Add key → Create new key → JSON. Save the file privately outside this repository. If organisation policy blocks key creation, STOP and report that restriction; do not disable protections to proceed. We can evaluate keyless federation or a folder-selected OAuth flow instead.
8. When you approve a staging deployment, store the COMPLETE JSON file content as the Worker secret `GOOGLE_SERVICE_ACCOUNT_JSON`. Store the root folder ID as `DRIVE_ROOT_FOLDER_ID`; store a generated random 32-byte or larger secret as `ACCESS_CODE_PEPPER`. Keep the pepper consistent when generating codes. Rotating it requires reissuing all gallery codes.

Official references: [Create service account](https://docs.cloud.google.com/iam/docs/service-accounts-create), [Create/manage keys](https://docs.cloud.google.com/iam/docs/keys-create-delete), [Drive scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth), [Drive thumbnail metadata](https://developers.google.com/workspace/drive/api/guides/file-metadata).

## Hosting setup AFTER your approval

No automated production deployment workflow is added. No account, database, key or DNS record was created by this task.

1. Create/sign in to Cloudflare. Use Workers & Pages for a separate `zah-private-gallery` Worker. Install the project's dev dependencies locally (`npm install`) and use Wrangler login interactively.
2. Create D1 `zah-gallery`, then add a `d1_databases` entry to wrangler.jsonc with binding `DB`, database_name `zah-gallery`, and its real database_id. Apply `schema.sql` first locally, then to staging after approval.
3. Use Cloudflare Worker Settings → Variables and Secrets to enter the three names above, or Wrangler's interactive secret prompts. `SESSION_TTL_SECONDS` is a nonsecret setting already set to 3600. `DB` and `ASSETS` are bindings, not secret strings. No Google client ID, client secret, refresh token, browser API key or custom session-signing key is needed for this service-account design.
4. For local authorised testing only, create an ignored `.dev.vars` containing those three actual values. Keep it on your computer. Never share it. Do not copy secrets to a browser file. First verify a local schema/mapping and generated code, then approve staging deployment.
5. Registration utility: securely set ACCESS_CODE_PEPPER in the local process, run `npm run code -- DRIVE_GALLERY_FOLDER_ID "Test gallery" "Client name"`. It prints a one-time client code and writes ignored `gallery.private.sql`. Apply that SQL to the chosen D1 database with Wrangler. Do not reuse fixtures as real credentials. The generated metadata file contains private client data and folder mapping: keep it out of Git.
6. Wrangler local commands: `npx wrangler d1 execute zah-gallery --local --file=schema.sql`, then `--local --file=gallery.private.sql`, then `npm run dev`. HTTPS staging is required to validate Secure cookies in a real browser. Some localhost environments treat localhost as secure, but never remove Secure for production.
7. Validate staging pipeline: log in with the generated code; confirm only 20–30 test images; thumbnail, lightbox and individual download; wrong code; revoke/expire gallery; confirm existing session stops; attempt a file from another folder; check mobile Safari/Chrome and desktop. Measure slow Drive responses, missing thumbnails, file sizes and quotas. No claimed live success until these pass.
8. Later connect GitHub using Cloudflare Workers Builds with root directory `gallery-app` and appropriate Wrangler deploy command, only after a separate deployment approval. Do not change the GitHub Pages workflow.
9. Future domain: after purchasing your domain, add it to Cloudflare DNS, then Workers → Settings → Domains & Routes → Add Custom Domain → `gallery.your-domain.com`. Cloudflare provisions the DNS record and HTTPS. Do not add random A records or change the main website's DNS. If the domain is managed elsewhere, review the supported routing arrangement before changing nameservers. No DNS action now.

## Tests / current limits

Run `npm test` in gallery-app (Node 22+). Tests do not require npm install, a database or credentials. 22 tests cover codes, missing/disabled/expired galleries, session revocation, cross-origin requests, rate limiting, listing, thumbnail/full/download responses, cross-gallery access, MIME/parent checks, unavailable thumbnails, storage errors and timeout handling. D1 SQL integration, actual Google JWT exchange, real thumbnails and end-to-end uploads/downloads remain unverified until authorisation. Unit tests use memory fixtures; they do not prove Google is connected.

For a UI-only preview: `python -m http.server 4190 --bind 127.0.0.1 --directory public`. Code entry renders, but API calls show unavailable: this server is NOT the Worker and NOT a working private gallery. Production must use the Worker, not GitHub Pages or Python static serving.

No public site changes; no production deployment; no DNS changes; no secrets committed. Client-upload UI, Jotform integration, payments, recognition, proofing and ZIP downloads remain out of scope.

Next request after manual setup: “I have created the service account and restricted Drive test folder, and stored the secrets privately. Configure the local D1 binding and verify the 20–30-photo pipeline. Do not deploy until I approve staging.” Share only nonsecret setup status, not key material or client codes.
