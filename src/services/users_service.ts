import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserPayload {
  email: string;
  password: string;
}

export interface LogoutUserPayload {
  token: string;
}

export async function registerUserService(payload: RegisterUserPayload) {
  const { name, email, password } = payload;

  // Check if email already exists
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUsers.length > 0) {
    throw new Error('Email sudah terdaftar');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user into MariaDB
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { data: 'OK' };
}

export async function loginUserService(payload: LoginUserPayload) {
  const { email, password } = payload;

  const foundUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (foundUsers.length === 0) {
    throw new Error('Email/password salah');
  }

  const foundUser = foundUsers[0];
  const isValidPassword = await bcrypt.compare(password, foundUser.password);

  if (!isValidPassword) {
    throw new Error('Email/password salah');
  }

  const token = randomUUID();

  await db.insert(sessions).values({
    userId: foundUser.id,
    token,
  });

  return { data: 'OK', token };
}

export async function logoutUserService(payload: LogoutUserPayload) {
  const { token } = payload;

  const foundSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (foundSessions.length === 0) {
    throw new Error('Token tidak valid');
  }

  await db.delete(sessions).where(eq(sessions.id, foundSessions[0].id));

  return { data: 'OK' };
}
