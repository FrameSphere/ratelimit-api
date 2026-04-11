import { Context } from 'hono';
import { generateToken } from './jwt';

interface OAuthUser {
  email: string;
  name: string;
  provider: string;
  providerId: string;
  framesphereUserId?: string;
}

// ===== GOOGLE OAUTH =====
export async function googleOAuthInit(c: Context) {
  const clientId = c.env.GOOGLE_CLIENT_ID;
  const redirectUri = c.env.OAUTH_REDIRECT_URI || 'https://ratelimit-api.pages.dev/auth/callback';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${redirectUri}?provider=google`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });
  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

export async function googleOAuthCallback(c: Context) {
  try {
    const code = c.req.query('code');
    const clientId = c.env.GOOGLE_CLIENT_ID;
    const clientSecret = c.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = c.env.OAUTH_REDIRECT_URI || 'https://ratelimit-api.pages.dev/auth/callback';
    if (!code) return c.json({ error: 'Authorization code missing' }, 400);

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: `${redirectUri}?provider=google`, grant_type: 'authorization_code' }),
    });
    const tokenData: any = await tokenRes.json();
    if (!tokenData.access_token) return c.json({ error: 'Failed to get access token', detail: tokenData.error }, 500);

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData: any = await userRes.json();

    return handleOAuthLogin(c, { email: userData.email, name: userData.name, provider: 'google', providerId: userData.id });
  } catch (err) {
    console.error('Google OAuth error:', err);
    return c.json({ error: 'OAuth authentication failed' }, 500);
  }
}

// ===== GITHUB OAUTH =====
export async function githubOAuthInit(c: Context) {
  const clientId = c.env.GITHUB_CLIENT_ID;
  const redirectUri = c.env.OAUTH_REDIRECT_URI || 'https://ratelimit-api.pages.dev/auth/callback';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${redirectUri}?provider=github`,
    scope: 'read:user user:email',
  });
  return c.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}

export async function githubOAuthCallback(c: Context) {
  try {
    const code = c.req.query('code');
    const clientId = c.env.GITHUB_CLIENT_ID;
    const clientSecret = c.env.GITHUB_CLIENT_SECRET;
    if (!code) return c.json({ error: 'Authorization code missing' }, 400);

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const tokenData: any = await tokenRes.json();
    if (!tokenData.access_token) return c.json({ error: 'Failed to get access token' }, 500);

    const [userRes, emailsRes] = await Promise.all([
      fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'RateLimit-API' } }),
      fetch('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'RateLimit-API' } }),
    ]);
    const userData: any = await userRes.json();
    const emails: any[] = await emailsRes.json();
    const primaryEmail = emails.find((e) => e.primary)?.email || userData.email;

    return handleOAuthLogin(c, { email: primaryEmail, name: userData.name || userData.login, provider: 'github', providerId: String(userData.id) });
  } catch (err) {
    console.error('GitHub OAuth error:', err);
    return c.json({ error: 'OAuth authentication failed' }, 500);
  }
}

// ===== FRAMESPHERE SSO =====
export async function framesphereOAuthInit(c: Context) {
  const framesphereUrl = c.env.FRAMESPHERE_URL || 'https://frame-sphere.vercel.app';
  const redirectUri   = c.env.OAUTH_REDIRECT_URI || 'https://ratelimit-api.pages.dev/auth/callback';
  const clientId      = c.env.FRAMESPHERE_CLIENT_ID || 'ratelimit-api';

  const params = new URLSearchParams({
    client_id:    clientId,
    redirect_uri: `${redirectUri}?provider=framesphere`,
  });
  return c.redirect(`${framesphereUrl}/sso/authorize?${params.toString()}`);
}

export async function framesphereOAuthCallback(c: Context) {
  const code  = c.req.query('code');
  const error = c.req.query('error');

  if (error || !code) return c.json({ error: 'FrameSphere SSO abgebrochen' }, 400);

  const framesphereApiUrl = c.env.FRAMESPHERE_API_URL || 'https://framesphere-backend.vercel.app/api';
  const clientId          = c.env.FRAMESPHERE_CLIENT_ID || 'ratelimit-api';
  const clientSecret      = c.env.FRAMESPHERE_CLIENT_SECRET;

  if (!clientSecret) {
    console.error('FRAMESPHERE_CLIENT_SECRET not set');
    return c.json({ error: 'FrameSphere SSO ist nicht konfiguriert' }, 500);
  }

  try {
    const tokenRes = await fetch(`${framesphereApiUrl}/sso/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, client_id: clientId, client_secret: clientSecret }),
    });

    if (!tokenRes.ok) {
      const err: any = await tokenRes.json().catch(() => ({}));
      console.error('FrameSphere SSO token exchange failed:', err);
      return c.json({ error: 'FrameSphere SSO fehlgeschlagen' }, 500);
    }

    const { user: fsUser }: any = await tokenRes.json();
    if (!fsUser?.email) return c.json({ error: 'Keine E-Mail von FrameSphere erhalten' }, 400);

    return handleOAuthLogin(c, {
      email:             fsUser.email,
      name:              fsUser.name || fsUser.email,
      provider:          'framesphere',
      providerId:        fsUser.id,
      framesphereUserId: fsUser.id,
    });
  } catch (err) {
    console.error('FrameSphere SSO callback error:', err);
    return c.json({ error: 'FrameSphere SSO Fehler' }, 500);
  }
}

// ===== COMMON HANDLER =====
async function handleOAuthLogin(c: Context, oauthUser: OAuthUser) {
  try {
    let user: any = null;

    // 1. Try lookup by framesphere_user_id (safe – column may not exist yet)
    if (oauthUser.framesphereUserId) {
      try {
        user = await c.env.DB.prepare(
          'SELECT id, email, name FROM users WHERE framesphere_user_id = ?'
        ).bind(oauthUser.framesphereUserId).first();
      } catch {
        // Column might not exist yet – fall through to email lookup
      }
    }

    // 2. Fallback: email lookup
    if (!user) {
      user = await c.env.DB.prepare(
        'SELECT id, email, name FROM users WHERE email = ?'
      ).bind(oauthUser.email).first();
    }

    if (!user) {
      // 3. Create new user — try with framesphere_user_id first, fall back without it
      let result: any = null;
      try {
        result = await c.env.DB.prepare(
          `INSERT INTO users (email, password_hash, name, framesphere_user_id)
           VALUES (?, ?, ?, ?)`
        ).bind(
          oauthUser.email,
          'oauth_' + oauthUser.provider,
          oauthUser.name,
          oauthUser.framesphereUserId || null,
        ).run();
      } catch {
        // framesphere_user_id column doesn't exist yet — insert without it
        result = await c.env.DB.prepare(
          `INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)`
        ).bind(oauthUser.email, 'oauth_' + oauthUser.provider, oauthUser.name).run();
      }

      if (!result?.success) return c.json({ error: 'Failed to create user' }, 500);

      user = { id: result.meta.last_row_id, email: oauthUser.email, name: oauthUser.name };
      const token = await generateToken({ id: user.id, email: user.email, name: user.name }, c.env.JWT_SECRET);
      return c.json({ message: 'OAuth login successful', token, isNewUser: true, provider: oauthUser.provider, user: { id: user.id, email: user.email, name: user.name } });
    }

    // 4. Link FrameSphere ID to existing user if not linked yet
    if (oauthUser.framesphereUserId) {
      try {
        await c.env.DB.prepare(
          'UPDATE users SET framesphere_user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND (framesphere_user_id IS NULL OR framesphere_user_id = "")'
        ).bind(oauthUser.framesphereUserId, user.id).run();
      } catch {
        // Column doesn't exist yet — ignore, will work after migration
      }
    }

    const token = await generateToken({ id: user.id, email: user.email, name: user.name }, c.env.JWT_SECRET);
    return c.json({ message: 'OAuth login successful', token, isNewUser: false, provider: oauthUser.provider, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('OAuth login error:', err);
    return c.json({ error: 'Failed to process OAuth login' }, 500);
  }
}
