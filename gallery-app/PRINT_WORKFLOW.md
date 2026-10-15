# Private gallery print workflow — restored 15 October 2026

The production Worker had reverted to code/assets without print tools. Existing D1 print records were intact: 31 orders, 41 slots (18 4x6 and 23 8x10). Before restoration there were no saved print outputs or configured print_folders entries.

The repair uses the downloaded current production source as the base. Existing source changes are limited to client/admin print route hooks and requesting image dimensions from Drive. Print handlers, owner OAuth writer, batch handler and public print/crop UI are restored separately. Authentication, client management and storage ownership are unchanged. No migrations were applied during restoration.

## Owner use
1. Sign in at https://zah-private-gallery.zahmediaofficial.workers.dev/manage/.
2. Find Print orders. Each row identifies the client, selected original, print size and save status.
3. Open crop editor. Choose orientation, drag the image and adjust zoom.
4. Save crop position saves the recipe only. Save print-ready copy to Drive creates/updates a separate JPEG in the size folder. Originals remain unchanged.
5. Open saved print copy opens that JPEG; Open print-ready photos in Google Drive opens the root.
6. Once every selected slot is prepared and reviewed, Prepare printer batch groups output by size and produces an order sheet. Review before sharing the restricted folder through Drive. The app does not automatically make files public or email the printery.

Saved-folder structure: ZAH Media Print Orders / 4x6 and / 8x10. The root mapping is persisted in print_folders. Existing owner Google OAuth secret is used; never commit OAuth credentials.

## Validation
54 backend tests cover authentication, isolated client access, exact package slots, duplicate submissions, crop bounds/ratios, owner-only writes, separate output files, and printer-batch retry behaviour. DOM references and JS syntax checked. Live owner login loaded all 41 slots. Private Drive root setup and saving one 4x6 and one 8x10 output succeeded; both saved flags verified in D1. The owner should review those crops before printing. No batches prepared, orders marked printed, client codes rotated or client messages sent.

## Deployment safety
Do not deploy an older gallery-app copy that lacks these print modules or assets. Before any future deployment compare the latest live version and the tracked source. The original pre-repair live version was 0526572d-338d-4ade-9783-79a5497e0938. Pre-repair code snapshots are kept outside the tracked application. Keep existing bindings/secrets using --keep-vars. Existing production database already has registration/client/print tables; do not rerun historical migrations blindly. tests/fixtures/print-schema.sql is a synthetic test schema, not an instruction to migrate production.
