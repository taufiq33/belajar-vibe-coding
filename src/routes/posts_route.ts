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
   * Membuat postingan baru dengan title dan content.
   * User harus terdaftar di database (user_id valid).
   * Postingan akan disimpan ke tabel posts dengan created_at otomatis.
   *
   * @summary Buat postingan baru
   * @tags Posts
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
        userId: t.Number({ default: 1 }),
        title: t.String({ minLength: 1, maxLength: 255, default: 'Halo Dunia' }),
        content: t.String({ minLength: 1, default: 'Ini adalah postingan pertama saya di platform ini.' }),
      }),
      response: {
        200: t.Object({
          data: t.String({ default: 'OK' }),
        }, { description: 'Postingan berhasil dibuat' }),
        400: t.Object({
          error: t.String({ default: 'User tidak ditemukan' }),
        }, { description: 'User ID tidak ditemukan di database' }),
        422: t.Object({
          summary: t.String({ default: 'Expected property userId/title/content' }),
        }, { description: 'Validasi gagal — userId bukan number, atau title/content kosong' }),
        500: t.Object({
          error: t.String({ default: 'Terjadi kesalahan pada server' }),
        }, { description: 'Kesalahan internal server' }),
      },
    }
  );
