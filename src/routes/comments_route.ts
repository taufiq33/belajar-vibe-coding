import { Elysia, t } from 'elysia';
import { createCommentService } from '../services/comments_service';
import { resolveUserIdFromToken } from '../lib/auth';

/**
 * Route handler untuk resource Comments (Komentar).
 * Prefix: /api/comment
 *
 * Endpoints:
 * - POST / → Membuat komentar pada postingan (token Authorization OPSIONAL, guest boleh)
 */
export const commentsRoute = new Elysia({ prefix: '/api/comment' })
  /**
   * POST /api/comment
   * Membuat komentar pada postingan.
   *
   * Membuat komentar baru pada sebuah postingan.
   * Jika mengirim header Authorization: Bearer <token> → userId diambil dari token.
   * Jika TIDAK mengirim header → komentar dianggap guest (user_id = NULL di DB).
   *
   * @summary Buat komentar baru (bisa guest)
   * @tags Comments
   */
  .post(
    '/',
    async ({ body, headers, set }) => {
      try {
        const authHeader = headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
        const userId = await resolveUserIdFromToken(token);

        const result = await createCommentService({
          ...body,
          userId: userId ?? null,
        });
        return result;
      } catch (error: any) {
        if (error?.message === 'Postingan tidak ditemukan') {
          set.status = 400;
          return { error: 'Postingan tidak ditemukan' };
        }
        set.status = 500;
        return { error: error?.message || 'Terjadi kesalahan pada server' };
      }
    },
    {
      body: t.Object({
        postId: t.Number({ default: 1 }),
        content: t.String({ minLength: 1, default: 'Postingan yang bagus!' }),
      }),
      response: {
        200: t.Object({
          data: t.String({ default: 'OK' }),
        }, { description: 'Komentar berhasil dibuat' }),
        400: t.Object({
          error: t.String({ default: 'Postingan tidak ditemukan' }),
        }, { description: 'Postingan tidak ditemukan' }),
        422: t.Object({
          summary: t.String({ default: 'Expected property postId/content' }),
        }, { description: 'Validasi gagal — postId bukan number atau content kosong' }),
        500: t.Object({
          error: t.String({ default: 'Terjadi kesalahan pada server' }),
        }, { description: 'Kesalahan internal server' }),
      },
    }
  );
