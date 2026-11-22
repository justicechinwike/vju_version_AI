-- Rebuild VJU Vision AI database schema.
-- This script is safe to run again because objects are dropped first.

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS voice_preferences CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS analysis_reports CASCADE;
DROP TABLE IF EXISTS screen_sessions CASCADE;
DROP TABLE IF EXISTS recordings CASCADE;
DROP TABLE IF EXISTS learning_progress CASCADE;
DROP TABLE IF EXISTS learning_resources CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS app_config CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  country VARCHAR(100),
  preferred_language VARCHAR(20) DEFAULT 'en',
  role VARCHAR(30) DEFAULT 'registered',
  email_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  mfa_enabled BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE app_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(60) UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(12,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'NGN',
  features JSONB DEFAULT '{}'::jsonb,
  usage_limits JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id),
  provider VARCHAR(40),
  provider_reference VARCHAR(180) UNIQUE,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE learning_resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  content TEXT,
  objectives TEXT,
  illustration TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE learning_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id INTEGER NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'saved',
  progress_percent INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

CREATE TABLE recordings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(180) NOT NULL,
  mode VARCHAR(30) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  file_path TEXT,
  resolution VARCHAR(20),
  frame_rate INTEGER,
  audio_config JSONB DEFAULT '{}'::jsonb,
  duration_seconds INTEGER DEFAULT 0,
  file_size BIGINT DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE screen_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  capture_source VARCHAR(40),
  status VARCHAR(20) DEFAULT 'idle',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE analysis_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id INTEGER REFERENCES screen_sessions(id),
  platform VARCHAR(60),
  asset VARCHAR(80),
  timeframe VARCHAR(20),
  report_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  recognition_confidence NUMERIC(5,2),
  model_version VARCHAR(60),
  data_sources TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(180) DEFAULT 'New conversation',
  messages JSONB DEFAULT '[]'::jsonb,
  active_session_id INTEGER REFERENCES screen_sessions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE voice_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  voice_activation BOOLEAN DEFAULT TRUE,
  voice_response BOOLEAN DEFAULT TRUE,
  language VARCHAR(20) DEFAULT 'en',
  voice_name VARCHAR(80),
  playback_volume INTEGER DEFAULT 70
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(40),
  title VARCHAR(180),
  message TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  actor_user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100),
  entity_id VARCHAR(100),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(60),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the initial platform administrator account.
-- Email: admin@vjuvision.ai
-- Password: VjuAdmin@2026!
-- Change this password immediately after the first successful login.
INSERT INTO users (
  full_name,
  email,
  password_hash,
  country,
  preferred_language,
  role,
  email_verified,
  status,
  mfa_enabled
)
VALUES (
  'VJU Vision AI Administrator',
  'admin@vjuvision.ai',
  '$2b$12$D2BB0RWODoA7A7IyDH395.VWprAe/BYnJA37XVU/3Dn76n2iac6gm',
  'Nigeria',
  'en',
  'administrator',
  TRUE,
  'active',
  FALSE
);

INSERT INTO subscription_plans (name, description, price, currency, features, usage_limits)
VALUES
  ('Free', 'Basic educational access', 0, 'NGN',
   '{"ai_chat":"limited","screen_assistance":"limited","history":"basic"}',
   '{"ai_requests":20,"screenshots":10,"screen_sessions":5,"voice":0,"reports":10}'),
  ('Standard', 'Expanded educational analysis', 15000, 'NGN',
   '{"ai_chat":"expanded","screen_assistance":"included","history":"extended","voice":"included"}',
   '{"ai_requests":500,"screenshots":300,"screen_sessions":100,"voice":200,"reports":300}'),
  ('Professional', 'Higher allowance and advanced reports', 35000, 'NGN',
   '{"ai_chat":"higher","screen_assistance":"expanded","history":"extended","voice":"included","reports":"advanced"}',
   '{"ai_requests":3000,"screenshots":1500,"screen_sessions":500,"voice":1000,"reports":1500}');

INSERT INTO app_config (key, value)
VALUES
  ('platform_recognition', '{"supported":["MetaTrader 4","MetaTrader 5","TradingView","Binance","Bybit","Coinbase"]}'::jsonb),
  ('screen_retention', '{"days":7}'::jsonb),
  ('recording_retention', '{"days":30}'::jsonb);
