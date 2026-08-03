import { Elysia } from 'elysia';
import { usersRoute } from './routes/users_route';

const app = new Elysia()
  .get('/', () => ({
    status: 'ok',
    message: 'ElysiaJS + Drizzle + MariaDB API is running!',
    timestamp: new Date().toISOString(),
  }))
  .use(usersRoute)
  .listen(process.env.PORT ? parseInt(process.env.PORT) : 3000);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
