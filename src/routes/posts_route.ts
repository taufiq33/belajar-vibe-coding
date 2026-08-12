import { Elysia, t } from 'elysia';
import {
  createPostService,
  getPostsService,
  getPostByIdService,
  getCommentsByPostService,
} from '../services/posts_service';
import { resolveUserIdFromToken } from '../lib/auth';

/**
 * Route handler untuk resource Posts (Postingan).
 * Prefix: /api/posts
 *
 * Endpoints:
 * - POST /                    → Membuat postingan baru (butuh token Authorization)
 * - GET /                     → Daftar semua postingan (pagination)
 * - GET /:id                  → Detail satu postingan
 * - GET /:id/comments         → Daftar komentar untuk satu postingan
 */
export const postsRoute = new Elysia({ prefix: '/api/posts' })
  /**
   * POST /api/posts
   * Membuat postingan baru.
   *
   * Membuat postingan baru dengan title dan content.
   * Wajib mengirim token login di header Authorization: Bearer <token>.
   * userId diambil dari token, bukan dari body.
   *
   * @summary Buat postingan baru (perlu login)
   * @tags Posts
   */
  .post(
    '/',
    async ({ body, headers, set }) => {
      try {
        const authHeader = headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
        const userId = await resolveUserIdFromToken(token);

        if (userId === null) {
          set.status = 401;
          return { error: 'Token tidak valid, silakan login ulang' };
        }

        const result = await createPostService({ userId, ...body });
        return result;
      } catch (error: any) {
        set.status = 500;
        return { error: error?.message || 'Terjadi kesalahan pada server' };
      }
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 255, default: 'Halo Dunia' }),
        content: t.String({ minLength: 1, default: 'Ini adalah postingan pertama saya di platform ini.' }),
      }),
      response: {
        200: t.Object({
          data: t.String({ default: 'OK' }),
        }, { description: 'Postingan berhasil dibuat' }),
        401: t.Object({
          error: t.String({ default: 'Token tidak valid, silakan login ulang' }),
        }, { description: 'Token tidak valid atau tidak dikirim' }),
        422: t.Object({
          summary: t.String({ default: 'Expected property title/content' }),
        }, { description: 'Validasi gagal — title/content kosong' }),
        500: t.Object({
          error: t.String({ default: 'Terjadi kesalahan pada server' }),
        }, { description: 'Kesalahan internal server' }),
      },
    }
  )
  /**
   * GET /api/posts
   * Daftar semua postingan.
   *
   * Mengembalikan array postingan, diurutkan dari yang terbaru.
   * Mendukung pagination via query ?page=<n>&limit=<n>.
   *
   * @summary Daftar semua postingan
   * @tags Posts
   */
  .get(
    '/',
    async ({ query }) => {
      const page = query?.page ? parseInt(query.page) : 1;
      const limit = query?.limit ? parseInt(query.limit) : 10;
      return await getPostsService(page, limit);
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      response: {
        200: t.Array(
          t.Object({
            id: t.Number({ default: 1 }),
            title: t.String({ default: 'Halo Dunia' }),
            content: t.String({ default: 'Isi postingan...' }),
            userId: t.Number({ default: 1 }),
            createdAt: t.Date(),
          })
        , { description: 'Daftar semua postingan (terbaru dulu)' }),
        500: t.Object({
          error: t.String({ default: 'Terjadi kesalahan pada server' }),
        }, { description: 'Kesalahan internal server' }),
      },
    }
  )
  /**
   * GET /api/posts/:id
   * Detail satu postingan.
   *
   * @summary Detail postingan
   * @tags Posts
   */
  .get(
    '/:id',
    async ({ params, set }) => {
      try {
        const post = await getPostByIdService(parseInt(params.id));
        return post;
      } catch (error: any) {
        if (error?.message === 'Postingan tidak ditemukan') {
          set.status = 404;
          return { error: 'Postingan tidak ditemukan' };
        }
        set.status = 500;
        return { error: error?.message || 'Terjadi kesalahan pada server' };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({
          id: t.Number({ default: 1 }),
          title: t.String({ default: 'Halo Dunia' }),
          content: t.String({ default: 'Isi postingan...' }),
          userId: t.Number({ default: 1 }),
          createdAt: t.Date(),
        }, { description: 'Detail postingan' }),
        404: t.Object({
          error: t.String({ default: 'Postingan tidak ditemukan' }),
        }, { description: 'Postingan tidak ditemukan' }),
        500: t.Object({
          error: t.String({ default: 'Terjadi kesalahan pada server' }),
        }, { description: 'Kesalahan internal server' }),
      },
    }
  )
  /**
   * GET /api/posts/:id/comments
   * Daftar komentar untuk satu postingan.
   *
   * @summary Daftar komentar postingan
   * @tags Posts
   */
  .get(
    '/:id/comments',
    async ({ params, set }) => {
      try {
        const commentList = await getCommentsByPostService(parseInt(params.id));
        return commentList;
      } catch (error: any) {
        if (error?.message === 'Postingan tidak ditemukan') {
          set.status = 404;
          return { error: 'Postingan tidak ditemukan' };
        }
        set.status = 500;
        return { error: error?.message || 'Terjadi kesalahan pada server' };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Array(
          t.Object({
            id: t.Number({ default: 1 }),
            content: t.String({ default: 'Komentar yang bagus!' }),
            userId: t.Union([t.Number(), t.Null()]),
            postId: t.Number({ default: 1 }),
            createdAt: t.Date(),
          })
        , { description: 'Daftar komentar pada postingan (terbaru dulu)' }),
        404: t.Object({
          error: t.String({ default: 'Postingan tidak ditemukan' }),
        }, { description: 'Postingan tidak ditemukan' }),
        500: t.Object({
          error: t.String({ default: 'Terjadi kesalahan pada server' }),
        }, { description: 'Kesalahan internal server' }),
      },
    }
  );
