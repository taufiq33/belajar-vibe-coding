import { Elysia, t } from 'elysia';
import { registerUserService, loginUserService } from '../services/users_service';

export const usersRoute = new Elysia({ prefix: '/api/users' })
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
  );
