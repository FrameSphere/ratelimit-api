-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    key_name TEXT NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Rate Limit Configurations
-- algorithm: 'sliding_window' | 'token_bucket'
-- endpoint_pattern: NULL = global, '/api/users' = exact, '/api/*' = wildcard prefix
-- burst_size: token bucket burst capacity (token_bucket only)
-- refill_rate: tokens added per second (token_bucket only)
CREATE TABLE IF NOT EXISTS ratelimit_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    max_requests INTEGER NOT NULL DEFAULT 100,
    window_seconds INTEGER NOT NULL DEFAULT 3600,
    enabled INTEGER DEFAULT 1,
    endpoint_pattern TEXT DEFAULT NULL,
    algorithm TEXT NOT NULL DEFAULT 'sliding_window',
    burst_size INTEGER DEFAULT NULL,
    refill_rate INTEGER DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

-- Filter Rules
CREATE TABLE IF NOT EXISTS filter_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_id INTEGER NOT NULL,
    rule_type TEXT NOT NULL, -- 'ip_whitelist', 'ip_blacklist', 'user_agent', 'header'
    rule_value TEXT NOT NULL,
    action TEXT NOT NULL, -- 'allow', 'block'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (config_id) REFERENCES ratelimit_configs(id) ON DELETE CASCADE
);

-- Request Logs
CREATE TABLE IF NOT EXISTS request_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    endpoint TEXT,
    method TEXT,
    status_code INTEGER,
    blocked INTEGER DEFAULT 0,
    block_reason TEXT DEFAULT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

-- Analytics Summary (hourly aggregates)
CREATE TABLE IF NOT EXISTS analytics_hourly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER NOT NULL,
    hour DATETIME NOT NULL,
    total_requests INTEGER DEFAULT 0,
    blocked_requests INTEGER DEFAULT 0,
    unique_ips INTEGER DEFAULT 0,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

-- Alert Configurations (Pro Feature)
-- webhook_type: 'slack' | 'discord' | 'custom' | 'email'
CREATE TABLE IF NOT EXISTS alert_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER NOT NULL,
    name TEXT NOT NULL DEFAULT 'Alert',
    webhook_url TEXT DEFAULT NULL,
    webhook_type TEXT NOT NULL DEFAULT 'custom',
    email TEXT DEFAULT NULL,
    email_enabled INTEGER DEFAULT 0,
    threshold_429_pct INTEGER DEFAULT 10,
    threshold_spike_pct INTEGER DEFAULT 200,
    threshold_near_limit_pct INTEGER DEFAULT 80,
    enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

-- Token Bucket State (for token_bucket algorithm, keyed by api_key_id + config_id)
-- Stored in D1 for persistence across Workers
CREATE TABLE IF NOT EXISTS token_bucket_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER NOT NULL,
    config_id INTEGER NOT NULL,
    ip_address TEXT NOT NULL DEFAULT 'global',
    tokens REAL NOT NULL DEFAULT 0,
    last_refill REAL NOT NULL DEFAULT 0,
    UNIQUE(api_key_id, config_id, ip_address),
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

-- Adaptive Rate Limit Suggestions (Pro)
CREATE TABLE IF NOT EXISTS adaptive_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER NOT NULL,
    config_id INTEGER NOT NULL,
    suggested_max_requests INTEGER NOT NULL,
    current_max_requests INTEGER NOT NULL,
    reason TEXT NOT NULL,
    avg_rph REAL DEFAULT 0,
    block_rate_pct REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    applied INTEGER DEFAULT 0,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alert_configs_api_key ON alert_configs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_ratelimit_configs_api_key ON ratelimit_configs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_filter_rules_config ON filter_rules(config_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_api_key ON request_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_timestamp ON request_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_hourly_api_key ON analytics_hourly(api_key_id);
CREATE INDEX IF NOT EXISTS idx_token_bucket_state ON token_bucket_state(api_key_id, config_id, ip_address);
