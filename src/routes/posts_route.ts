import { Elysia, t } from 'elysia';
import { createPostService } from '../services/posts_service';

/**
 * Route handler untuk resource Posts (Postingan).
 * Prefix: /api/posts
 *
 * Endpoints:
 * - POST / → Membuat postingan baru
 */
export const postsRoute = new Elysia({ prefix: '/api/posts' })
  /**
   * POST /api/posts
   * Membuat postingan baru.
   *
   * @tag Posts
   * @summary Buat postingan baru
   *
   * @description
   * Membuat postingan baru dengan title dan content.
   * User harus terdaftar di database (user_id valid).
   * Postingan akan disimpan ke tabel posts dengan created_at otomatis.
   *
   * @requestBody
   * ```json
   * {
   *   "userId": 1,
   *   "title": "Judul Postingan",
   *   "content": "Isi konten postingan saya di sini"
   * }
   * ```
   *
   * @response 200 - Berhasil membuat postingan
   * ```json
   * { "data": "OK" }
   * ```
   *
   * @response 400 - User tidak ditemukan
   * ```json
   * { "error": "User tidak ditemukan" }
   * ```
   *
   * @response 422 - Validasi gagal (userId bukan number, title/content kosong)
   *
   * @response 500 - Kesalahan server
   */
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const result = await createPostService(body);
        return result;
      } catch (error: any) {
        if (error?.message === 'User tidak ditemukan') {
          set.status = 400;
          return { error: 'User tidak ditemukan' };
        }
        set.status = 500;
        return { error: error?.message || 'Terjadi kesalahan pada server' };
      }
    },
    {
      body: t.Object({
        userId: t.Number(),
        title: t.String({ minLength: 1, maxLength: 255 }),
        content: t.String({ minLength: 1 }),
      }),
    }
  );
