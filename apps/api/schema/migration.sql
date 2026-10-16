-- Domain ownership verification
ALTER TABLE Domains ADD COLUMN is_verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE Domains ADD COLUMN verification_method TEXT;
ALTER TABLE Domains ADD COLUMN verified_email TEXT;
ALTER TABLE Domains ADD COLUMN verified_at DATETIME;

CREATE UNIQUE INDEX IF NOT EXISTS unique_account_domain ON Domains(account_id, domain);

-- Domains allowed for every account without ownership verification
CREATE TABLE IF NOT EXISTS WhitelistedDomains(
  domain VARCHAR(253) PRIMARY KEY,
  user_id INTEGER,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
