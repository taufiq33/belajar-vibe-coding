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
   * @tag Users
   * @summary Registrasi user baru
   *
   * @description
   * Membuat akun user baru dengan nama, email, dan password.
   * Email harus unik. Password akan di-hash sebelum disimpan ke database.
   *
   * @requestBody
   * ```json
   * {
   *   "name": "Budi",
   *   "email": "budi@example.com",
   *   "password": "rahasia123"
   * }
   * ```
   *
   * @response 200 - Berhasil registrasi
   * ```json
   * { "data": "OK" }
   * ```
   *
   * @response 400 - Email sudah terdaftar
   * ```json
   * { "error": "Email sudah terdaftar" }
   * ```
   *
   * @response 422 - Validasi gagal (field kosong / format email salah)
   *
   * @response 500 - Kesalahan server
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
        name: t.String({ minLength: 1, maxLength: 255 }),
        email: t.String({ format: 'email', maxLength: 255 }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )
  /**
   * POST /api/users/login
   * Login user dan mendapatkan token sesi.
   *
   * @tag Users
   * @summary Login user
   *
   * @description
   * Verifikasi email dan password user. Jika valid, akan dibuat token UUID baru
   * dan disimpan ke tabel sessions. Token ini digunakan untuk autentikasi
   * pada request selanjutnya.
   *
   * @requestBody
   * ```json
   * {
   *   "email": "budi@example.com",
   *   "password": "rahasia123"
   * }
   * ```
   *
   * @response 200 - Login berhasil
   * ```json
   * { "data": "OK", "token": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d" }
   * ```
   *
   * @response 400 - Email atau password salah
   * ```json
   * { "error": "Email/password salah" }
   * ```
   *
   * @response 422 - Validasi gagal
   *
   * @response 500 - Kesalahan server
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
        email: t.String({ format: 'email', maxLength: 255 }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )
  /**
   * POST /api/users/logout
   * Logout user dengan menghapus token dari tabel sessions.
   *
   * @tag Users
   * @summary Logout user
   *
   * @description
   * Menghapus session/token dari database berdasarkan token yang dikirim.
   * Setelah logout, token tidak bisa digunakan lagi.
   *
   * @requestBody
   * ```json
   * {
   *   "token": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
   * }
   * ```
   *
   * @response 200 - Logout berhasil
   * ```json
   * { "data": "OK" }
   * ```
   *
   * @response 400 - Token tidak valid atau tidak ditemukan
   * ```json
   * { "error": "Token tidak valid" }
   * ```
   *
   * @response 422 - Validasi gagal (token kosong)
   *
   * @response 500 - Kesalahan server
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
        token: t.String({ minLength: 1 }),
      }),
    }
  );
