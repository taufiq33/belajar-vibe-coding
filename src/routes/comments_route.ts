import { Elysia, t } from 'elysia';
import { createCommentService } from '../services/comments_service';

/**
 * Route handler untuk resource Comments (Komentar).
 * Prefix: /api/comment
 *
 * Endpoints:
 * - POST / → Membuat komentar pada postingan
 */
export const commentsRoute = new Elysia({ prefix: '/api/comment' })
  /**
   * POST /api/comment
   * Membuat komentar pada postingan.
   *
   * Membuat komentar baru pada sebuah postingan. Bisa diisi oleh user terdaftar
   * (dengan userId) atau guest anonim (tanpa userId).
   *
   * @summary Buat komentar baru
   * @tags Comments
   */
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const result = await createCommentService(body);
        return result;
      } catch (error: any) {
        if (error?.message === 'Postingan tidak ditemukan') {
          set.status = 400;
          return { error: 'Postingan tidak ditemukan' };
        }
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
        postId: t.Number({ default: 1 }),
        content: t.String({ minLength: 1, default: 'Postingan yang bagus!' }),
        userId: t.Optional(t.Number()),
      }),
      response: {
        200: t.Object({
          data: t.String({ default: 'OK' }),
        }, { description: 'Komentar berhasil dibuat' }),
        400: t.Object({
          error: t.String({ default: 'Postingan tidak ditemukan' }),
        }, { description: 'Postingan atau user tidak ditemukan' }),
        422: t.Object({
          summary: t.String({ default: 'Expected property postId/content' }),
        }, { description: 'Validasi gagal — postId bukan number atau content kosong' }),
        500: t.Object({
          error: t.String({ default: 'Terjadi kesalahan pada server' }),
        }, { description: 'Kesalahan internal server' }),
      },
    }
  );
