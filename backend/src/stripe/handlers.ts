import { Context } from 'hono';

// ─── Stripe raw API helper ────────────────────────────────────────────────────

async function stripePost(path: string, params: Record<string, string>, secretKey: string): Promise<any> {
  const body = new URLSearchParams(params).toString();
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  return res.json();
}

async function verifyStripeWebhook(payload: string, signature: string, secret: string): Promise<boolean> {
  const parts: Record<string, string> = {};
  for (const chunk of signature.split(',')) {
    const eq = chunk.indexOf('=');
    if (eq !== -1) parts[chunk.slice(0, eq)] = chunk.slice(eq + 1);
  }
  const ts = parts['t'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}.${payload}`));
  const expected = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('');
  return expected === v1;
}

// ─── Create checkout session ──────────────────────────────────────────────────

export async function createCheckoutSession(c: Context) {
  try {
    const user = c.get('user');
    const body = await c.req.json().catch(() => ({}));

    if (!c.env.STRIPE_SECRET_KEY || !c.env.STRIPE_PRO_PRICE_ID) {
      return c.json({ error: 'Stripe nicht konfiguriert' }, 500);
    }

    const dbUser = await c.env.DB.prepare(
      'SELECT plan, stripe_customer_id FROM users WHERE id = ?'
    ).bind(user.id).first();

    if (dbUser?.plan === 'pro') {
      return c.json({ error: 'Du hast bereits ein Pro-Abo' }, 400);
    }

    const baseUrl = 'https://ratelimit-api.pages.dev';
    const params: Record<string, string> = {
      'mode': 'subscription',
      'line_items[0][price]': c.env.STRIPE_PRO_PRICE_ID,
      'line_items[0][quantity]': '1',
      'success_url': body.successUrl || `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': body.cancelUrl || `${baseUrl}/pricing`,
      'metadata[user_id]': String(user.id),
      'subscription_data[metadata][user_id]': String(user.id),
      'customer_email': user.email,
    };

    if (dbUser?.stripe_customer_id) {
      params['customer'] = dbUser.stripe_customer_id as string;
      delete params['customer_email'];
    }

    const session = await stripePost('/checkout/sessions', params, c.env.STRIPE_SECRET_KEY);

    if (session.error) {
      console.error('Stripe checkout error:', session.error);
      return c.json({ error: session.error.message || 'Stripe-Fehler' }, 500);
    }

    return c.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Create checkout session error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// ─── Create billing portal session ───────────────────────────────────────────

export async function createPortalSession(c: Context) {
  try {
    const user = c.get('user');

    if (!c.env.STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe nicht konfiguriert' }, 500);
    }

    const dbUser = await c.env.DB.prepare(
      'SELECT stripe_customer_id FROM users WHERE id = ?'
    ).bind(user.id).first();

    if (!dbUser?.stripe_customer_id) {
      return c.json({ error: 'Kein Stripe-Kunde gefunden' }, 404);
    }

    const session = await stripePost('/billing_portal/sessions', {
      'customer': dbUser.stripe_customer_id as string,
      'return_url': 'https://ratelimit-api.pages.dev/dashboard',
    }, c.env.STRIPE_SECRET_KEY);

    if (session.error) return c.json({ error: session.error.message }, 500);

    return c.json({ url: session.url });
  } catch (err) {
    console.error('Portal session error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// ─── Stripe Webhook ───────────────────────────────────────────────────────────

export async function handleStripeWebhook(c: Context) {
  const signature = c.req.header('stripe-signature');
  if (!signature || !c.env.STRIPE_WEBHOOK_SECRET) {
    return c.json({ error: 'No signature' }, 400);
  }

  const rawBody = await c.req.text();
  const valid = await verifyStripeWebhook(rawBody, signature, c.env.STRIPE_WEBHOOK_SECRET);
  if (!valid) return c.json({ error: 'Invalid signature' }, 400);

  let event: any;
  try { event = JSON.parse(rawBody); } catch { return c.json({ error: 'Invalid JSON' }, 400); }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object;
        const userId = s.metadata?.user_id;
        if (!userId) break;
        await c.env.DB.prepare(`
          UPDATE users
          SET plan = 'pro', stripe_customer_id = ?, stripe_subscription_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(s.customer || null, s.subscription || null, parseInt(userId)).run();
        console.log('User', userId, 'upgraded to Pro');
        break;
      }
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused': {
        const sub = event.data.object;
        await c.env.DB.prepare(`
          UPDATE users SET plan = 'free', stripe_subscription_id = NULL, updated_at = CURRENT_TIMESTAMP
          WHERE stripe_subscription_id = ?
        `).bind(sub.id).run();
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const newPlan = sub.status === 'active' ? 'pro' : 'free';
        await c.env.DB.prepare(`
          UPDATE users SET plan = ?, updated_at = CURRENT_TIMESTAMP WHERE stripe_subscription_id = ?
        `).bind(newPlan, sub.id).run();
        break;
      }
      case 'invoice.payment_failed': {
        console.log('Payment failed for subscription:', event.data.object.subscription);
        break;
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }

  return c.json({ received: true });
}

// ─── Get subscription status ──────────────────────────────────────────────────

export async function getSubscriptionStatus(c: Context) {
  try {
    const user = c.get('user');
    const dbUser = await c.env.DB.prepare(
      'SELECT plan, stripe_customer_id, stripe_subscription_id FROM users WHERE id = ?'
    ).bind(user.id).first();

    return c.json({
      plan: dbUser?.plan || 'free',
      customerId: dbUser?.stripe_customer_id || null,
      subscriptionId: dbUser?.stripe_subscription_id || null,
    });
  } catch (err) {
    return c.json({ error: 'Internal server error' }, 500);
  }
}
