import { Context } from 'hono';
import { generateToken } from './jwt';

interface OAuthUser {
  email: string;
  name: string;
  provider: string;
  providerId: string;
  avatar?: string;
}

// ===== GOOGLE OAUTH =====
export async function googleOAuthInit(c: Context) {
  const clientId = c.env.GOOGLE_CLIENT_ID;
  const redirectUri = c.env.OAUTH_REDIRECT_URI || 'https://ratelimitapi.pages.dev/auth/callback';
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${redirectUri}?provider=google`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent'
  });

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

export async function googleOAuthCallback(c: Context) {
  try {
    const code = c.req.query('code');
    const clientId = c.env.GOOGLE_CLIENT_ID;
    const clientSecret = c.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = c.env.OAUTH_REDIRECT_URI || 'https://ratelimitapi.pages.dev/auth/callback';

    if (!code) {
      return c.json({ error: 'Authorization code missing' }, 400);
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${redirectUri}?provider=google`,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return c.json({ error: 'Failed to get access token' }, 500);
    }

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const userData = await userResponse.json();

    return await handleOAuthLogin(c, {
      email: userData.email,
      name: userData.name,
      provider: 'google',
      providerId: userData.id,
      avatar: userData.picture
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return c.json({ error: 'OAuth authentication failed' }, 500);
  }
}

// ===== GITHUB OAUTH =====
export async function githubOAuthInit(c: Context) {
  const clientId = c.env.GITHUB_CLIENT_ID;
  const redirectUri = c.env.OAUTH_REDIRECT_URI || 'https://ratelimitapi.pages.dev/auth/callback';
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${redirectUri}?provider=github`,
    scope: 'read:user user:email'
  });

  return c.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}

export async function githubOAuthCallback(c: Context) {
  try {
    const code = c.req.query('code');
    const clientId = c.env.GITHUB_CLIENT_ID;
    const clientSecret = c.env.GITHUB_CLIENT_SECRET;

    if (!code) {
      return c.json({ error: 'Authorization code missing' }, 400);
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return c.json({ error: 'Failed to get access token' }, 500);
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'RateLimit-API'
      }
    });

    const userData = await userResponse.json();

    // Get primary email
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'RateLimit-API'
      }
    });

    const emails = await emailResponse.json();
    const primaryEmail = emails.find((e: any) => e.primary)?.email || userData.email;

    return await handleOAuthLogin(c, {
      email: primaryEmail,
      name: userData.name || userData.login,
      provider: 'github',
      providerId: userData.id.toString(),
      avatar: userData.avatar_url
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return c.json({ error: 'OAuth authentication failed' }, 500);
  }
}

// ===== FRAMESPHERE OAUTH =====
export async function framesphereOAuthInit(c: Context) {
  const clientId = c.env.FRAMESPHERE_CLIENT_ID;
  const authUrl = c.env.FRAMESPHERE_AUTH_URL || 'https://auth.framesphere.com/oauth/authorize';
  const redirectUri = c.env.OAUTH_REDIRECT_URI || 'https://ratelimitapi.pages.dev/auth/callback';
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${redirectUri}?provider=framesphere`,
    response_type: 'code',
    scope: 'openid email profile'
  });

  return c.redirect(`${authUrl}?${params.toString()}`);
}

export async function framesphereOAuthCallback(c: Context) {
  try {
    const code = c.req.query('code');
    const clientId = c.env.FRAMESPHERE_CLIENT_ID;
    const clientSecret = c.env.FRAMESPHERE_CLIENT_SECRET;
    const tokenUrl = c.env.FRAMESPHERE_TOKEN_URL || 'https://auth.framesphere.com/oauth/token';
    const userInfoUrl = c.env.FRAMESPHERE_USERINFO_URL || 'https://auth.framesphere.com/oauth/userinfo';
    const redirectUri = c.env.OAUTH_REDIRECT_URI || 'https://ratelimitapi.pages.dev/auth/callback';

    if (!code) {
      return c.json({ error: 'Authorization code missing' }, 400);
    }

    // Exchange code for token
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${redirectUri}?provider=framesphere`,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return c.json({ error: 'Failed to get access token' }, 500);
    }

    // Get user info
    const userResponse = await fetch(userInfoUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const userData = await userResponse.json();

    return await handleOAuthLogin(c, {
      email: userData.email,
      name: userData.name || userData.username,
      provider: 'framesphere',
      providerId: userData.id || userData.sub,
      avatar: userData.picture || userData.avatar
    });
  } catch (error) {
    console.error('FrameSphere OAuth error:', error);
    return c.json({ error: 'OAuth authentication failed' }, 500);
  }
}

// ===== COMMON HANDLER =====
async function handleOAuthLogin(c: Context, oauthUser: OAuthUser) {
  try {
    // Check if user exists
    let user = await c.env.DB.prepare(
      'SELECT id, email, name FROM users WHERE email = ?'
    ).bind(oauthUser.email).first();

    if (!user) {
      // Create new user (OAuth users don't need password)
      const result = await c.env.DB.prepare(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
      ).bind(
        oauthUser.email,
        'oauth_' + oauthUser.provider, // Placeholder password hash
        oauthUser.name
      ).run();

      if (!result.success) {
        return c.json({ error: 'Failed to create user' }, 500);
      }

      user = {
        id: result.meta.last_row_id,
        email: oauthUser.email,
        name: oauthUser.name
      };
    }

    // Generate JWT token
    const token = await generateToken(
      {
        id: user.id as number,
        email: user.email as string,
        name: user.name as string
      },
      c.env.JWT_SECRET
    );

    return c.json({
      message: 'OAuth login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('OAuth login error:', error);
    return c.json({ error: 'Failed to process OAuth login' }, 500);
  }
}
