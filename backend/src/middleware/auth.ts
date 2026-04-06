import { Context, Next } from 'hono';
import { verifyToken, extractToken } from '../auth/jwt';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const token = extractToken(authHeader);

  if (!token) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const user = await verifyToken(token, c.env.JWT_SECRET);
  if (!user) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  // Fetch plan from DB — JWT only carries id/email/name, plan lives in users table
  try {
    const dbUser = await c.env.DB.prepare(
      'SELECT plan FROM users WHERE id = ?'
    ).bind(user.id).first() as any;

    (user as any).plan = dbUser?.plan || 'free';
  } catch {
    (user as any).plan = 'free';
  }

  c.set('user', user);
  await next();
}
