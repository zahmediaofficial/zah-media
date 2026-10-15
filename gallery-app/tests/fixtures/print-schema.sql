PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS galleries (
 gallery_id TEXT PRIMARY KEY, gallery_name TEXT NOT NULL, client_name TEXT NOT NULL, client_email TEXT,
 drive_folder_id TEXT NOT NULL, access_code_hash TEXT NOT NULL,
 created_at INTEGER NOT NULL, expires_at INTEGER, registration_id TEXT,
 status TEXT NOT NULL CHECK(status IN ('active','disabled')),
 allow_downloads INTEGER NOT NULL CHECK(allow_downloads IN (0,1))
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY, gallery_id TEXT NOT NULL REFERENCES galleries(gallery_id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS session_expiry ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS attempts (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS gallery_registration ON galleries(registration_id) WHERE registration_id IS NOT NULL;
CREATE TABLE IF NOT EXISTS clients (
 client_id TEXT PRIMARY KEY, client_name TEXT NOT NULL, client_email TEXT NOT NULL,
 package_code TEXT NOT NULL DEFAULT '', drive_folder_id TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS client_identity ON clients(lower(client_name),client_email);

CREATE TABLE IF NOT EXISTS print_orders (
 gallery_id TEXT PRIMARY KEY REFERENCES galleries(gallery_id),
 package_code TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','ready','printed')),
 submitted_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS print_items (
 gallery_id TEXT NOT NULL REFERENCES print_orders(gallery_id), slot INTEGER NOT NULL,
 size TEXT NOT NULL CHECK(size IN ('4x6','8x10')), source_file_id TEXT NOT NULL, source_name TEXT NOT NULL,
 crop_json TEXT, output_file_id TEXT, output_saved INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(gallery_id,slot)
);
CREATE TABLE IF NOT EXISTS print_folders (size TEXT PRIMARY KEY, folder_id TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS print_batches(batch_id TEXT PRIMARY KEY,folder_id TEXT,manifest_id TEXT,status TEXT NOT NULL,created_at INTEGER NOT NULL,lease_until INTEGER NOT NULL DEFAULT 0);
CREATE UNIQUE INDEX IF NOT EXISTS one_preparing_batch ON print_batches(status) WHERE status='preparing';
CREATE TABLE IF NOT EXISTS print_batch_items(batch_id TEXT NOT NULL REFERENCES print_batches(batch_id),gallery_id TEXT NOT NULL,slot INTEGER NOT NULL,size TEXT NOT NULL,source_id TEXT NOT NULL,filename TEXT NOT NULL,copied_id TEXT,PRIMARY KEY(batch_id,gallery_id,slot));
CREATE TABLE IF NOT EXISTS print_batch_folders(batch_id TEXT NOT NULL REFERENCES print_batches(batch_id),size TEXT NOT NULL,folder_id TEXT NOT NULL,PRIMARY KEY(batch_id,size));
