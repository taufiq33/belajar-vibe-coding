import { Elysia, t } from 'elysia';
import { registerUserService, loginUserService, logoutUserService } from '../services/users_service';

/**
 * Route handler untuk resource Users.
 * Prefix: /api/users
 *
 * Endpoints:
 * - POST /         → Registrasi user baru
 * - POST /login    → Login user, mengembalikan token
 * - POST /logout   → Logout user, menghapus token dari sessions
 */
export const usersRoute = new Elysia({ prefix: '/api/users' })
  /**
   * POST /api/users
   * Registrasi user baru.
   *
   * Membuat akun user baru dengan nama, email, dan password.
   * Email harus unik. Password akan di-hash sebelum disimpan ke database.
   *
   * @summary Registrasi user baru
   * @tags Users
   */
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const result = await registerUserService(body);
        return result;
      } catch (error: any) {
        if (error?.message === 'Email sudah terdaftar') {
          set.status = 400;
          return { error: 'Email sudah terdaftar' };
        }
        set.status = 500;
        return { error: error?.message || 'Terjadi kesalahan pada server' };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255, default: 'Budi' }),
        email: t.String({ format: 'email', maxLength: 255, default: 'budi@example.com' }),
        password: t.String({ minLength: 1, default: 'rahasia123' }),
      }),
      response: {
        200: t.Object({
          data: t.String({ default: 'OK' }),
        }, { description: 'Registrasi berhasil' }),
        400: t.Object({
          error: t.String({ default: 'Email sudah terdaftar' }),
        }, { description: 'Email sudah terdaftar' }),
        422: t.Object({
          summary: t.String({ default: 'Expected property name/email/password' }),
        }, { description: 'Validasi gagal — field kosong atau format salah' }),
        500: t.Object({
          error: t.String({ default: 'Terjadi kesalahan pada server' }),
        }, { description: 'Kesalahan internal server' }),
      },
    }
  )
  /**
   * POST /api/users/login
   * Login user dan mendapatkan token sesi.
   *
   * Verifikasi email dan password user. Jika valid, akan dibuat token UUID baru
   * dan disimpan ke tabel sessions. Token ini digunakan untuk autentikasi
   * pada request selanjutnya.
   *
   * @summary Login user
   * @tags Users
   */
  .post(
    '/login',
    async ({ body, set }) => {
      try {
        const result = await loginUserService(body);
        return result;
      } catch (error: any) {
        if (error?.message === 'Email/password salah') {
          set.status = 400;
          return { error: 'Email/password salah' };
        }
        set.status = 500;
        return { error: error?.message || 'Terjadi kesalahan pada server' };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email', maxLength: 255, default: 'budi@example.com' }),
        password: t.String({ minLength: 1, default: 'rahasia123' }),
      }),
      response: {
        200: t.Object({
          data: t.String({ default: 'OK' }),
          token: t.String({ default: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' }),
        }, { description: 'Login berhasil — mengembalikan token UUID' }),
        400: t.Object({
          error: t.String({ default: 'Email/password salah' }),
        }, { description: 'Email atau password salah' }),
        422: t.Object({
          summary: t.String({ default: 'Expected property email/password' }),
        }, { description: 'Validasi gagal — format email salah atau field kosong' }),
        500: t.Object({
          error: t.String({ default: 'Terjadi kesalahan pada server' }),
        }, { description: 'Kesalahan internal server' }),
      },
    }
  )
  /**
   * POST /api/users/logout
   * Logout user dengan menghapus token dari tabel sessions.
   *
   * Menghapus session/token dari database berdasarkan token yang dikirim.
   * Setelah logout, token tidak bisa digunakan lagi.
   *
   * @summary Logout user
   * @tags Users
   */
  .post(
    '/logout',
    async ({ body, set }) => {
      try {
        const result = await logoutUserService(body);
        return result;
      } catch (error: any) {
        if (error?.message === 'Token tidak valid') {
          set.status = 400;
          return { error: 'Token tidak valid' };
        }
        set.status = 500;
        return { error: error?.message || 'Terjadi kesalahan pada server' };
      }
    },
    {
      body: t.Object({
        token: t.String({ minLength: 1, default: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' }),
      }),
      response: {
        200: t.Object({
          data: t.String({ default: 'OK' }),
        }, { description: 'Logout berhasil — token dihapus dari database' }),
        400: t.Object({
          error: t.String({ default: 'Token tidak valid' }),
        }, { description: 'Token tidak ditemukan atau sudah tidak berlaku' }),
        422: t.Object({
          summary: t.String({ default: 'Expected property token' }),
        }, { description: 'Validasi gagal — token kosong' }),
        500: t.Object({
          error: t.String({ default: 'Terjadi kesalahan pada server' }),
        }, { description: 'Kesalahan internal server' }),
      },
    }
  );