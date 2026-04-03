import { Context } from 'hono';
import { hashPassword, verifyPassword, generateToken } from './jwt';

export async function register(c: Context) {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password and name are required' }, 400);
    }
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();
    if (existingUser) return c.json({ error: 'User already exists' }, 409);

    const passwordHash = await hashPassword(password);
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
    ).bind(email, passwordHash, name).run();
    if (!result.success) return c.json({ error: 'Failed to create user' }, 500);

    const userId = result.meta.last_row_id;
    const token = await generateToken({ id: userId, email, name }, c.env.JWT_SECRET);
    return c.json({
      message: 'User created successfully',
      token,
      user: { id: userId, email, name, plan: 'free' }
    }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function login(c: Context) {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: 'Email and password are required' }, 400);

    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash, name, plan FROM users WHERE email = ?'
    ).bind(email).first();
    if (!user) return c.json({ error: 'Invalid credentials' }, 401);

    const isValid = await verifyPassword(password, user.password_hash as string);
    if (!isValid) return c.json({ error: 'Invalid credentials' }, 401);

    const token = await generateToken(
      { id: user.id as number, email: user.email as string, name: user.name as string },
      c.env.JWT_SECRET
    );
    return c.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan || 'free' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function getProfile(c: Context) {
  const jwtUser = c.get('user');
  if (!jwtUser) return c.json({ error: 'Unauthorized' }, 401);

  const dbUser = await c.env.DB.prepare(
    'SELECT id, email, name, plan, created_at FROM users WHERE id = ?'
  ).bind(jwtUser.id).first();

  return c.json({ user: dbUser || jwtUser });
}

export async function updateProfile(c: Context) {
  try {
    const user = c.get('user');
    const { name } = await c.req.json();
    if (!name || !name.trim()) return c.json({ error: 'Name is required' }, 400);

    await c.env.DB.prepare(
      'UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name.trim(), user.id).run();

    return c.json({ user: { ...user, name: name.trim() } });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function changePassword(c: Context) {
  try {
    const user = c.get('user');
    const { currentPassword, newPassword } = await c.req.json();
    if (!currentPassword || !newPassword) return c.json({ error: 'All fields required' }, 400);
    if (newPassword.length < 8) return c.json({ error: 'Password must be at least 8 characters' }, 400);

    const dbUser = await c.env.DB.prepare(
      'SELECT password_hash FROM users WHERE id = ?'
    ).bind(user.id).first();
    if (!dbUser) return c.json({ error: 'User not found' }, 404);

    const isValid = await verifyPassword(currentPassword, dbUser.password_hash as string);
    if (!isValid) return c.json({ error: 'Current password is wrong' }, 400);

    const newHash = await hashPassword(newPassword);
    await c.env.DB.prepare(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(newHash, user.id).run();

    return c.json({ message: 'Password changed successfully' });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function deleteAccount(c: Context) {
  try {
    const user = c.get('user');
    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id).run();
    return c.json({ message: 'Account deleted' });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
}
