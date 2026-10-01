# Private management dashboard

URL: https://zah-private-gallery.zahmediaofficial.workers.dev/manage/

The management UI and API are deployed with the gallery. Management data remains inaccessible until a separate encrypted `ADMIN_ACCESS_KEY` is configured. This is an owner credential, not a client gallery code. Use a generated random value of at least 32 bytes and keep it private.

Apply `admin-schema.sql` to the existing D1 database once. It adds administrator sessions and registrations, preserving existing galleries and client sessions. Store `ADMIN_ACCESS_KEY` as an encrypted runtime secret in Cloudflare, never as a public variable, build variable, repository file or client script. Changing this key immediately invalidates existing management sessions.

For Jotform sync, create a read-only Jotform API key and store it as encrypted runtime secret `JOTFORM_API_KEY`. Sync reads only the existing Photo Identification form `262725740128053`, using the APIKEY header. It stores submission ID, name, email, package code and registration date. Identity-photo uploads, phone numbers and other answers are not imported. Sync is explicit and supports paginated continuation; it updates existing records without creating duplicate submission IDs. It does not create client galleries, assign photographs, issue codes or send emails.

Workflow:
1. Sign in with the owner management key.
2. Sync registrations, or create a client gallery manually.
3. Sort the client's photographs into a dedicated private Drive folder under ZAH MEDIA CLIENT GALLERIES.
4. Select Assign gallery or Create client gallery. Enter the name, email, gallery title and private Drive folder link. Set optional expiry and download permission.
5. Confirm the folder contains only this client's photographs. The server checks its location under the dedicated root and refuses a folder already registered to another gallery.
6. Create the gallery and copy the displayed access details. Codes are shown once; only their HMAC hashes are stored. Share the details privately with that client yourself.
7. Save gallery settings to change access or expiry. Saving closes existing client sessions. Replace access code invalidates the old code and closes current client sessions.

Owner sessions use a separate Secure, HttpOnly, SameSite=Strict, host-only cookie, expire after one hour and are tied to the current management key. Client sessions cannot access management endpoints. Sign-in is rate limited. Mutations require same-origin requests; API responses are no-store. Browser content uses text nodes to avoid interpreting registration data as HTML. No management key or client codes are saved in browser storage. There is no automatic photo identification, client messaging, bulk ZIP or direct Drive upload/delete interface.

Tests run against disposable SQLite through a D1 adapter and include public access rejection, CSRF, rate limiting, owner-key rotation, session expiry, per-client email/code binding, folder checks, duplicate folder prevention, code rotation, revocation and idempotent Jotform sync. Node 22.13 or later is required for the SQLite test runtime; production code uses D1 bindings.

Jotform API reference: https://api.jotform.com/docs/
