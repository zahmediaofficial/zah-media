PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS galleries (
 gallery_id TEXT PRIMARY KEY, gallery_name TEXT NOT NULL, client_name TEXT NOT NULL, client_email TEXT,
 drive_folder_id TEXT NOT NULL, access_code_hash TEXT NOT NULL,
 created_at INTEGER NOT NULL, expires_at INTEGER,
 status TEXT NOT NULL CHECK(status IN ('active','disabled')),
 allow_downloads INTEGER NOT NULL CHECK(allow_downloads IN (0,1))
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY, gallery_id TEXT NOT NULL REFERENCES galleries(gallery_id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS session_expiry ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS attempts (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
