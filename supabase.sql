CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  wallet_address TEXT UNIQUE,
  kyc_status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  method TEXT,
  amount NUMERIC,
  currency TEXT,
  tx_hash TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  pdf_url TEXT,
  signed_at TIMESTAMP
);

CREATE TABLE tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  drn_amount NUMERIC,
  phase TEXT,
  lockup_until TIMESTAMP,
  vesting_end TIMESTAMP
);

CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT,
  data_json JSONB,
  generated_at TIMESTAMP DEFAULT NOW()
);
