import { cookies } from 'next/headers';
import { db } from '@/db';
import { users, type User } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcrypt';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production'
);

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

// 创建会话 token
async function createSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SESSION_SECRET);
}

// 验证会话 token
async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return payload.user as SessionUser;
  } catch {
    return null;
  }
}

// 获取当前会话用户
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const sessionUser = await verifySessionToken(token);
    if (!sessionUser) return null;

    // 从数据库获取最新用户信息
    const user = await db.query.users.findFirst({
      where: eq(users.id, sessionUser.id),
    });

    if (!user || user.status !== 'active') return null;

    return {
      id: user.id,
      name: user.name || user.username,
      email: user.email || '',
      isAdmin: user.isAdmin,
    };
  } catch {
    return null;
  }
}

// 检查是否为管理员
export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    return null;
  }
  return user;
}

// 创建会话
export async function createSession(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 天
    path: '/',
  });
}

// 清除会话
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// 验证用户凭据
export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !user.password) return null;

  // 使用 bcrypt 验证密码哈希
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) return null;

  if (user.status !== 'active') return null;

  return user;
}
