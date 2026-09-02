PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  life_expectancy INTEGER NOT NULL DEFAULT 90,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scenario',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE family_members (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  life_expectancy INTEGER NOT NULL DEFAULT 90,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

CREATE TABLE asset_snapshots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  recorded_on TEXT NOT NULL,
  cash INTEGER NOT NULL DEFAULT 0,
  stocks INTEGER NOT NULL DEFAULT 0,
  funds INTEGER NOT NULL DEFAULT 0,
  nisa INTEGER NOT NULL DEFAULT 0,
  ideco INTEGER NOT NULL DEFAULT 0,
  other_investment INTEGER NOT NULL DEFAULT 0,
  real_estate INTEGER NOT NULL DEFAULT 0,
  liabilities INTEGER NOT NULL DEFAULT 0,
  memo TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_plans_owner ON plans(owner_user_id);
CREATE INDEX idx_family_plan ON family_members(plan_id);
CREATE INDEX idx_asset_snapshots_user_date ON asset_snapshots(user_id, recorded_on);
