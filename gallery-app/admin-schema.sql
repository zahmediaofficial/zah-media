CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL, key_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS registrations (submission_id TEXT PRIMARY KEY, client_name TEXT NOT NULL, client_email TEXT NOT NULL, package_code TEXT NOT NULL DEFAULT '', registered_at TEXT NOT NULL DEFAULT '');
CREATE INDEX IF NOT EXISTS registrations_email ON registrations(client_email);
