import { Context } from 'hono';

// ── Schema detection ──────────────────────────────────────────────────────────

let _hasAutoBlockTables: boolean | null = null;
export async function hasAutoBlockTables(db: any): Promise<boolean> {
  if (_hasAutoBlockTables !== null) return _hasAutoBlockTables;
  try {
    await db.prepare('SELECT id FROM ip_violations LIMIT 0').run();
    _hasAutoBlockTables = true;
  } catch {
    _hasAutoBlockTables = false;
  }
  return _hasAutoBlockTables;
}

// ── Core auto-block logic (called from checker) ───────────────────────────────

/**
 * Check if an IP is currently auto-blocked for this API key.
 * Returns true if blocked, false if allowed.
 */
export async function checkAutoBlock(db: any, apiKeyId: number, ip: string): Promise<boolean> {
  if (!(await hasAutoBlockTables(db))) return false;

  try {
    const row = await db.prepare(
      `SELECT auto_blocked_until FROM ip_violations
       WHERE api_key_id = ? AND ip_address = ?
         AND auto_blocked_until IS NOT NULL
         AND auto_blocked_until > datetime('now')`
    ).bind(apiKeyId, ip).first() as any;

    return !!row;
  } catch {
    return false;
  }
}

/**
 * Record a violation for an IP. If threshold is reached, auto-block it.
 * Called after every blocked (429/403) request.
 */
export async function recordViolation(db: any, apiKeyId: number, ip: string): Promise<void> {
  if (!(await hasAutoBlockTables(db))) return;

  try {
    // Load auto-block settings for this key
    const settings = await db.prepare(
      'SELECT enabled, violations_threshold, violations_window_minutes, block_duration_minutes FROM auto_block_settings WHERE api_key_id = ?'
    ).bind(apiKeyId).first() as any;

    // Auto-block disabled or not configured
    if (!settings || !settings.enabled) return;

    const { violations_threshold, violations_window_minutes, block_duration_minutes } = settings;

    // Count violations in the rolling window
    const windowStart = new Date(Date.now() - violations_window_minutes * 60 * 1000).toISOString();

    // Upsert violation record
    await db.prepare(`
      INSERT INTO ip_violations (api_key_id, ip_address, violation_count, last_violation)
      VALUES (?, ?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(api_key_id, ip_address) DO UPDATE SET
        violation_count = CASE
          WHEN last_violation < datetime(?) THEN 1
          ELSE violation_count + 1
        END,
        last_violation = CURRENT_TIMESTAMP
    `).bind(apiKeyId, ip, windowStart).run();

    // Re-read to get current count
    const current = await db.prepare(
      'SELECT violation_count FROM ip_violations WHERE api_key_id = ? AND ip_address = ?'
    ).bind(apiKeyId, ip).first() as any;

    const count = current?.violation_count || 0;

    // Threshold reached — apply auto-block
    if (count >= violations_threshold) {
      const blockUntil = new Date(Date.now() + block_duration_minutes * 60 * 1000).toISOString();
      await db.prepare(
        'UPDATE ip_violations SET auto_blocked_until = ?, violation_count = 0 WHERE api_key_id = ? AND ip_address = ?'
      ).bind(blockUntil, apiKeyId, ip).run();
    }
  } catch (err) {
    console.error('recordViolation error:', err);
  }
}

// ── Settings CRUD ─────────────────────────────────────────────────────────────

export async function getAutoBlockSettings(c: Context) {
  try {
    const user = c.get('user');
    const { apiKeyId } = c.req.param();

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    if (!(await hasAutoBlockTables(c.env.DB))) {
      return c.json({ settings: null, migrationRequired: true });
    }

    const settings = await c.env.DB.prepare(
      'SELECT * FROM auto_block_settings WHERE api_key_id = ?'
    ).bind(apiKeyId).first();

    // Return defaults if not configured yet
    const defaults = {
      api_key_id: parseInt(apiKeyId),
      enabled: 0,
      violations_threshold: 10,
      violations_window_minutes: 5,
      block_duration_minutes: 30,
    };

    return c.json({ settings: settings ?? defaults });
  } catch (error: any) {
    console.error('getAutoBlockSettings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function upsertAutoBlockSettings(c: Context) {
  try {
    const user = c.get('user');
    const isPro = user.plan === 'pro' || user.plan === 'enterprise';
    if (!isPro) return c.json({ error: 'Pro plan required' }, 403);

    const { apiKeyId } = c.req.param();
    const body = await c.req.json();
    const {
      enabled,
      violations_threshold,
      violations_window_minutes,
      block_duration_minutes,
    } = body;

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    if (!(await hasAutoBlockTables(c.env.DB))) {
      return c.json({ error: 'Migration required. Run: npx wrangler d1 execute ratelimit-db --remote --command "..."' }, 503);
    }

    await c.env.DB.prepare(`
      INSERT INTO auto_block_settings
        (api_key_id, enabled, violations_threshold, violations_window_minutes, block_duration_minutes, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(api_key_id) DO UPDATE SET
        enabled = excluded.enabled,
        violations_threshold = excluded.violations_threshold,
        violations_window_minutes = excluded.violations_window_minutes,
        block_duration_minutes = excluded.block_duration_minutes,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      apiKeyId,
      enabled ? 1 : 0,
      violations_threshold ?? 10,
      violations_window_minutes ?? 5,
      block_duration_minutes ?? 30,
    ).run();

    return c.json({ message: 'Auto-block settings saved' });
  } catch (error: any) {
    console.error('upsertAutoBlockSettings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// ── Blocked IP list ───────────────────────────────────────────────────────────

export async function getBlockedIPs(c: Context) {
  try {
    const user = c.get('user');
    const { apiKeyId } = c.req.param();

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    if (!(await hasAutoBlockTables(c.env.DB))) {
      return c.json({ blocked: [], violations: [] });
    }

    // Currently auto-blocked IPs
    const { results: blocked } = await c.env.DB.prepare(`
      SELECT ip_address, auto_blocked_until, last_violation, violation_count
      FROM ip_violations
      WHERE api_key_id = ?
        AND auto_blocked_until IS NOT NULL
        AND auto_blocked_until > datetime('now')
      ORDER BY auto_blocked_until DESC
    `).bind(apiKeyId).all();

    // Top violators (not currently blocked but with recent violations)
    const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // last hour
    const { results: violations } = await c.env.DB.prepare(`
      SELECT ip_address, violation_count, last_violation
      FROM ip_violations
      WHERE api_key_id = ?
        AND (auto_blocked_until IS NULL OR auto_blocked_until <= datetime('now'))
        AND last_violation > ?
        AND violation_count > 0
      ORDER BY violation_count DESC
      LIMIT 20
    `).bind(apiKeyId, windowStart).all();

    return c.json({ blocked, violations });
  } catch (error: any) {
    console.error('getBlockedIPs error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function unblockIP(c: Context) {
  try {
    const user = c.get('user');
    const { apiKeyId, ip } = c.req.param();

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    await c.env.DB.prepare(
      'UPDATE ip_violations SET auto_blocked_until = NULL, violation_count = 0 WHERE api_key_id = ? AND ip_address = ?'
    ).bind(apiKeyId, decodeURIComponent(ip)).run();

    return c.json({ message: 'IP unblocked' });
  } catch (error: any) {
    console.error('unblockIP error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function clearExpiredBlocks(c: Context) {
  try {
    const user = c.get('user');
    const { apiKeyId } = c.req.param();

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    const result = await c.env.DB.prepare(
      `UPDATE ip_violations SET auto_blocked_until = NULL, violation_count = 0
       WHERE api_key_id = ? AND auto_blocked_until <= datetime('now')`
    ).bind(apiKeyId).run();

    return c.json({ message: 'Expired blocks cleared', cleared: (result as any).meta?.changes ?? 0 });
  } catch (error: any) {
    console.error('clearExpiredBlocks error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// ── Manual block ──────────────────────────────────────────────────────────────

export async function manualBlockIP(c: Context) {
  try {
    const user = c.get('user');
    const isPro = user.plan === 'pro' || user.plan === 'enterprise';
    if (!isPro) return c.json({ error: 'Pro plan required' }, 403);

    const { apiKeyId } = c.req.param();
    const { ip, durationMinutes = 60 } = await c.req.json();

    if (!ip) return c.json({ error: 'ip required' }, 400);

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    const blockUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

    await c.env.DB.prepare(`
      INSERT INTO ip_violations (api_key_id, ip_address, violation_count, auto_blocked_until)
      VALUES (?, ?, 0, ?)
      ON CONFLICT(api_key_id, ip_address) DO UPDATE SET
        auto_blocked_until = excluded.auto_blocked_until
    `).bind(apiKeyId, ip, blockUntil).run();

    return c.json({ message: `IP ${ip} blocked until ${blockUntil}` });
  } catch (error: any) {
    console.error('manualBlockIP error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
