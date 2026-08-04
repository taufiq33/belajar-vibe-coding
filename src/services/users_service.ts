import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';

/**
 * Payload untuk registrasi user baru.
 *
 * @field name     - Nama lengkap user (1-255 karakter)
 * @field email    - Email unik user (format email valid, max 255 karakter)
 * @field password - Password user (minimal 1 karakter, akan di-hash dengan bcrypt)
 */
export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
}

/**
 * Payload untuk login user.
 *
 * @field email    - Email yang terdaftar
 * @field password - Password plaintext (akan dibandingkan dengan hash di DB)
 */
export interface LoginUserPayload {
  email: string;
  password: string;
}

/**
 * Payload untuk logout user.
 *
 * @field token - Token UUID yang didapat saat login (akan dihapus dari tabel sessions)
 */
export interface LogoutUserPayload {
  token: string;
}

/**
 * Registrasi user baru ke database.
 *
 * Alur:
 * 1. Cek apakah email sudah ada di tabel users → jika ya, lempar error "Email sudah terdaftar"
 * 2. Hash password dengan bcrypt (10 rounds)
 * 3. Insert user baru ke tabel users
 * 4. Return { data: 'OK' }
 *
 * @param payload - Data user baru (name, email, password)
 * @returns Promise<{ data: string }>
 * @throws Error('Email sudah terdaftar') jika email duplikat
 */
export async function registerUserService(payload: RegisterUserPayload) {
  const { name, email, password } = payload;

  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUsers.length > 0) {
    throw new Error('Email sudah terdaftar');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { data: 'OK' };
}

/**
 * Login user dan buat session token.
 *
 * Alur:
 * 1. Cari user berdasarkan email → jika tidak ada, lempar error "Email/password salah"
 * 2. Bandingkan password input dengan hash di DB → jika tidak cocok, lempar error "Email/password salah"
 * 3. Generate token UUID baru
 * 4. Simpan token ke tabel sessions (user_id, token)
 * 5. Return { data: 'OK', token }
 *
 * Catatan: Pesan error SAMA untuk email tidak ditemukan dan password salah (anti user-enumeration).
 *
 * @param payload - Email dan password user
 * @returns Promise<{ data: string, token: string }>
 * @throws Error('Email/password salah') jika email atau password invalid
 */
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

/**
 * Logout user dengan menghapus token dari tabel sessions.
 *
 * Alur:
 * 1. Cari session berdasarkan token → jika tidak ada, lempar error "Token tidak valid"
 * 2. Hapus baris session yang ditemukan berdasarkan id
 * 3. Return { data: 'OK' }
 *
 * Catatan: Hanya menghapus 1 session (berdasarkan id), bukan semua session user.
 * Ini agar logout dari 1 device tidak menghapus session device lain.
 *
 * @param payload - Token UUID dari user
 * @returns Promise<{ data: string }>
 * @throws Error('Token tidak valid') jika token tidak ada di database
 */
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
