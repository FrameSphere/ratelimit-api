import { Context } from 'hono';

// ── SSE Live Log Stream ───────────────────────────────────────────────────────
// Cloudflare Workers unterstützen kein echter WebSocket-Server-Push, aber
// Server-Sent Events via TransformStream/ReadableStream funktionieren nativ.
//
// Strategie: Der Client hält eine SSE-Verbindung offen.
// Wir pollen alle 2s nach neuen Logs (seit letztem gesendeten timestamp)
// und pushen sie als SSE-Events. Keepalive-Ping alle 20s.
//
// Wegen D1-Latenz (global, ~50-200ms) ist 2s ein guter Kompromiss.

export async function streamLogs(c: Context) {
  const user = c.get('user');
  const isPro = user.plan === 'pro' || user.plan === 'enterprise';
  if (!isPro) {
    return c.json({ error: 'Pro plan required' }, 403);
  }

  const { apiKeyId } = c.req.param();

  const apiKey = await c.env.DB.prepare(
    'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
  ).bind(apiKeyId, user.id).first();
  if (!apiKey) return c.json({ error: 'API key not found' }, 404);

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const send = async (data: string) => {
    try {
      await writer.write(encoder.encode(data));
    } catch {
      // Client disconnected
    }
  };

  // SSE helper
  const sendEvent = async (event: string, data: object) => {
    await send(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const sendPing = async () => {
    await send(`: ping\n\n`);
  };

  // Start polling in background (Cloudflare Workers ctx.waitUntil not needed here,
  // the stream itself keeps the worker alive)
  let lastTimestamp = new Date(Date.now() - 5000).toISOString(); // start 5s ago for catchup
  let active = true;
  let iteration = 0;

  const poll = async () => {
    while (active) {
      try {
        // Fetch new logs since last timestamp
        const { results } = await c.env.DB.prepare(`
          SELECT ip_address, user_agent, endpoint, method, status_code,
                 blocked, block_reason, timestamp
          FROM request_logs
          WHERE api_key_id = ? AND timestamp > ?
          ORDER BY timestamp ASC
          LIMIT 20
        `).bind(apiKeyId, lastTimestamp).all() as any;

        if (results && results.length > 0) {
          for (const log of results) {
            await sendEvent('log', {
              ip: log.ip_address,
              ua: log.user_agent,
              endpoint: log.endpoint,
              method: log.method,
              status: log.status_code,
              blocked: !!log.blocked,
              reason: log.block_reason,
              ts: log.timestamp,
            });
            // Track latest timestamp to avoid duplicates
            if (log.timestamp > lastTimestamp) lastTimestamp = log.timestamp;
          }
        }

        iteration++;
        // Keepalive ping every ~20s (every 10 iterations at 2s interval)
        if (iteration % 10 === 0) {
          await sendPing();
        }

        // Wait 2s before next poll
        await new Promise(r => setTimeout(r, 2000));

      } catch (err) {
        // Stream closed or error — stop polling
        active = false;
        try { await writer.close(); } catch {}
        break;
      }
    }
  };

  // Fire-and-forget poll loop — Cloudflare will keep the worker alive
  // as long as the stream is open
  poll().catch(() => { active = false; });

  // Return SSE response
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
