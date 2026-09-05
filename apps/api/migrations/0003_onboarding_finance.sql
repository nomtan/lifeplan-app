PRAGMA foreign_keys = ON;

ALTER TABLE profiles ADD COLUMN onboarding_completed_at TEXT;

CREATE TABLE plan_incomes (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  name TEXT NOT NULL,
  monthly_amount INTEGER NOT NULL DEFAULT 0,
  start_age INTEGER,
  end_age INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

CREATE TABLE plan_expenses (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  name TEXT NOT NULL,
  monthly_amount INTEGER NOT NULL DEFAULT 0,
  start_age INTEGER,
  end_age INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

CREATE INDEX idx_plan_incomes_plan ON plan_incomes(plan_id);
CREATE INDEX idx_plan_expenses_plan ON plan_expenses(plan_id);
