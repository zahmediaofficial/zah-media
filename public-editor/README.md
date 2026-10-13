# ZAH Media visual studio

An isolated editor for public portfolio content. It does not use the private gallery Worker's credentials, D1 database, Drive folders, or client records.

## Deployment prerequisites

- A **new** Cloudflare Worker `zah-public-editor` and **new** KV namespace bound as `DRAFTS`. Replace the namespace placeholder in `wrangler.jsonc` after creation.
- `EDITOR_KEY`: a strong, independently generated editor sign-in key, entered as a Worker secret. Do not reuse the client management key.
- `GITHUB_TOKEN`: a fine-grained personal access token restricted to `zahmediaofficial/zah-media`, Contents read/write. Stored as a Worker secret, never in assets, source control or chat. Configure its expiry and renew before expiry.
- Install dependencies with `npm install`, then set secrets with `npx wrangler secret put EDITOR_KEY` and `npx wrangler secret put GITHUB_TOKEN` using their interactive secret prompts.
- Run `npm test`, then deploy this Worker only. Do not deploy `gallery-app/`.

## Behavior

Authenticated users can save a shared draft in KV, upload public photos, reorder photos and collections, change covers, choose carousel photos, edit public heading/paragraph text, and preview desktop/mobile pages. Uploads are converted in-browser to WebP at a maximum 2000px dimension; originals are never overwritten. Draft uploads expire after seven days. Publish before expiry or upload expired draft images again.

Publishing creates one Git tree and commit and updates `main` without forcing. Only allowlisted `dist/` content is written. If main changed after the draft's base commit, publishing refuses to overwrite it. Saved drafts remain available; reconciling a conflicting draft currently requires operator assistance. Successful GitHub publication starts GitHub Pages; it does not claim the deployment completed.

No photo deletion is offered. Replacing photos preserves old assets in Git history and storage. Cropping is not part of this first version. Client print cropping remains exclusively in the private system.

Preview is rendered from existing page templates. Scripts and form submission are disabled within a sandboxed iframe. Gallery previews show all photos; the live gallery retains its existing progressive loading and viewer.

The editor's shared drafts are intended for one operator. Do not simultaneously edit from multiple tabs. The sign-in key stays in memory only during login, and the server issues a secure HTTP-only session cookie valid for one hour. No GitHub token is sent to the browser.

## QA

`node --test tests/editor.test.mjs` covers anonymous access, CSRF rejection, login throttling, session flags, draft isolation, public-only atomic commits, stale-head blocking, escaped text and all gallery photograph counts.

`node preview-server.mjs` serves a local-only mock at port 4202. Its key is `local-preview-only`; it has no live GitHub credentials, and publishing is deliberately disabled.
