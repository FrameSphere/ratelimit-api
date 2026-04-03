-- Stripe & Plan migration
-- Ausführen mit:
--   npx wrangler d1 execute ratelimit-db --file=./schema-stripe.sql --remote
--
-- HINWEIS: SQLite/D1 unterstützt kein "ALTER TABLE ADD COLUMN IF NOT EXISTS".
-- Falls du Fehler bekommst weil die Spalten schon existieren, die betreffenden
-- ALTER-Zeilen einfach weglassen.

ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;

-- Index for fast Stripe lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription    ON users(stripe_subscription_id);
