-- Create table
CREATE TABLE IF NOT EXISTS Accounts (
  account_id INTEGER PRIMARY KEY AUTOINCREMENT,
  status TEXT NOT NULL,
  plan TEXT NOT NULL,
  trial_end_at DATETIME NOT NULL,
  company_name TEXT,
  website TEXT,
  country TEXT,
  phone TEXT,
  billing_name TEXT,
  billing_address TEXT,
  tax_name TEXT,
  tax_number TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS Users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  password TEXT,
  role TEXT NOT NULL,
  level TEXT,
  is_verified INTEGER DEFAULT 0,
  is_subscribed INTEGER DEFAULT 1,
  guid TEXT NOT NULL,
  last_login_at DATETIME,
  status TEXT,
  avatar TEXT,
  ip_address TEXT,
  city TEXT,
  country TEXT,
  utm_tracker TEXT,
  password_reset_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_email ON Users(email);
CREATE INDEX IF NOT EXISTS idx_users_account ON Users(account_id);
CREATE INDEX IF NOT EXISTS idx_users_ip_created ON Users(ip_address, created_at);


CREATE TABLE IF NOT EXISTS ApiKeys (
  key_id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  name VARCHAR(64),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_apikeys_account_user ON ApiKeys(account_id, user_id);
CREATE INDEX IF NOT EXISTS idx_apikeys_user ON ApiKeys(user_id);

CREATE TABLE IF NOT EXISTS Projects(
  project_id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  user_id INTEGER,
  name VARCHAR(64) NOT NULL,
  color VARCHAR(7) NULL,
  icon VARCHAR(124) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_account_created ON Projects(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_projects_user ON Projects(user_id);

-- Account domains (type = user) and admin managed domains for every account
-- (type = whitelisted | blocked, account_id IS NULL) in one table for a single lookup
CREATE TABLE IF NOT EXISTS Domains(
  domain_id INTEGER PRIMARY KEY,
  account_id INTEGER,
  user_id INTEGER,
  domain VARCHAR(253) NOT NULL,
  type TEXT NOT NULL DEFAULT 'user',
  is_default INTEGER DEFAULT 0,
  is_verified INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  -- Removed domains are archived, never deleted, to keep an audit trail of
  -- every domain an account has verified (e.g. phishing domains rotated out)
  archived_at DATETIME,
  FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- Migration for existing databases:
-- ALTER TABLE Domains ADD COLUMN archived_at DATETIME;

CREATE UNIQUE INDEX IF NOT EXISTS unique_account_domain ON Domains(account_id, domain);
CREATE UNIQUE INDEX IF NOT EXISTS unique_global_domain ON Domains(domain) WHERE account_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_domains_domain ON Domains(domain);
CREATE INDEX IF NOT EXISTS idx_domains_user ON Domains(user_id);

CREATE TABLE IF NOT EXISTS Links(
  key VARCHAR(32) PRIMARY KEY,
  account_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  project_id INTEGER NULL,
  url TEXT NOT NULL,
  expire_at DATETIME,
  params TEXT,
  title TEXT,
  description TEXT,
  image TEXT,
  password TEXT,
  ios TEXT,
  android TEXT,
  geo TEXT,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_links_account_created ON Links(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_links_project ON Links(project_id);
CREATE INDEX IF NOT EXISTS idx_links_user ON Links(user_id);

CREATE TABLE IF NOT EXISTS Subscriptions (
  subscription_id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  user_id INTEGER,
  plan TEXT NOT NULL,
  plan_id TEXT,
  amount DECIMAL(13,4) NOT NULL,
  currency TEXT,
  frequency TEXT NOT NULL,
  payment_gateway TEXT,
  pg_subscr_id TEXT,
  pg_customer_id TEXT,
  status TEXT,
  start_date DATETIME NOT NULL,
  last_pay_date DATETIME,
  next_pay_date DATETIME,
  cancel_date DATETIME,
  is_recent INTEGER NOT NULL DEFAULT 0,
  cancel_reason TEXT,
  FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_account ON Subscriptions(account_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_gateway ON Subscriptions(pg_customer_id, pg_subscr_id);
