CREATE TABLE IF NOT EXISTS daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE UNIQUE NOT NULL,
  tokens_sold NUMERIC,
  payments_count INTEGER,
  generated_at TIMESTAMP DEFAULT NOW()
);
