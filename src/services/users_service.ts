import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
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
