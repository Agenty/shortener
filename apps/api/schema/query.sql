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
  ip_address TEXT,
  is_verified INTEGER DEFAULT 0,
  is_subscribed INTEGER DEFAULT 1,
  guid TEXT NOT NULL,
  last_login_at DATETIME,
  status TEXT,
  avatar TEXT,
  password_reset_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_email ON Users(email);


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

CREATE TABLE IF NOT EXISTS Domains(
  domain_id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  user_id INTEGER,
  domain VARCHAR(64) NOT NULL,
  is_default INTEGER DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Links(
  key VARCHAR(32) PRIMARY KEY,
  account_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  project_id INTEGER NULL,
  url TEXT NOT NULL,
  short_url TEXT NULL,
  expire_at DATETIME,
  type TEXT,
  data TEXT,
  params TEXT,
  title TEXT,
  description TEXT,
  image TEXT,
  password TEXT,
  ios TEXT,
  android TEXT,
  geo TEXT,
  status TEXT DEFAULT 'active', 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE
);

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
  payment_gateway_subscr_id TEXT,
  payment_gateway_customer_id TEXT,
  status TEXT,
  start_date DATETIME NOT NULL,
  last_pay_date DATETIME,
  next_pay_date DATETIME,
  cancel_date DATETIME,
  is_recent INTEGER NOT NULL DEFAULT 0,
  cancel_reason TEXT,
  FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS Whitelist(
  id INTEGER PRIMARY KEY,
  url TEXT NOT NULL UNIQUE
);