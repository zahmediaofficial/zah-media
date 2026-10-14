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


## Client testimonials

The native public pages are `/leave-a-review/` and `/testimonials/`. Public forms send consented reviews to this Worker's `/api/testimonials`; they do not use a Jotform embed. A separate Jotform form (262865604707060) was created as a standalone alternative; it is not connected to this workflow. No client emails are sent.

Owner moderation is at `/reviews/`, using the existing editor key and session. The public editor links there. The owner can copy general or project-specific invitation links and approve, reject, or unpublish a review. Names and optional handles are self-reported; approval includes checking the client and photo. Only public collection images may be selected. Private client galleries and customer lists are never read.

KV keys `testimonial:record:<uuid>` contain private pending/approved records, including private email and explicit publication consent. `testimonial:public:<uuid>` contains only the consented public display fields. Public output excludes email. Approving writes the public record; rejecting or unpublishing removes that public record while retaining the private review. KV may take a short time to propagate. Existing `draft`, `original`, upload and login keys are untouched.

Submission protection includes an 8 KB streaming limit, server-side project/photo validation, explicit consent, honeypot and a best-effort KV limit of five submissions per IP per hour. Only the public website origin and localhost development origin may post. Moderation is authenticated and uses same-origin checks inherited from the editor. Client text is rendered as text, never HTML. Social handles are plain text, never clickable links or verification badges.

No private gallery Worker, D1, Drive folders, credentials or Cloudflare bindings change. Clean public assets are allowed by the editor's existing asset validator in the fixed `assets/clean/` subfolder.
