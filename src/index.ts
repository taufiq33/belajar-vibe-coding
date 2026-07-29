import { Elysia, t } from 'elysia';
import { db } from './db';
import { users } from './db/schema';

const app = new Elysia()
  .get('/', () => ({
    status: 'ok',
    message: 'ElysiaJS + Drizzle + MariaDB API is running!',
    timestamp: new Date().toISOString(),
  }))
  .get('/users', async ({ set }) => {
    try {
      const allUsers = await db.select().from(users);
      return { success: true, data: allUsers };
    } catch (error: any) {
      set.status = 500;
      return {
        success: false,
        message: 'Database query failed (check DATABASE_URL in .env)',
        error: error?.message || String(error),
      };
    }
  })
  .post(
    '/users',
    async ({ body, set }) => {
      try {
        await db.insert(users).values({
          name: body.name,
          email: body.email,
        });
        return { success: true, message: 'User created successfully' };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          message: 'Failed to create user',
          error: error?.message || String(error),
        };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
      }),
    }
  )
  .listen(process.env.PORT ? parseInt(process.env.PORT) : 3000);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
