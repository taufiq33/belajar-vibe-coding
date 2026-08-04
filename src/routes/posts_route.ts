import { Elysia, t } from 'elysia';
import { createPostService } from '../services/posts_service';

export const postsRoute = new Elysia({ prefix: '/api/posts' })
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
