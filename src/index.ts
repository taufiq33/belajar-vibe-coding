import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { usersRoute } from './routes/users_route';
import { postsRoute } from './routes/posts_route';
import { commentsRoute } from './routes/comments_route';

const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'Belajar Vibe Coding API',
        version: '1.0.0',
        description: 'Backend API built with ElysiaJS + Drizzle ORM + MariaDB',
      },
      tags: [
        { name: 'Users', description: 'Registrasi, login, dan logout user' },
        { name: 'Posts', description: 'Manajemen postingan' },
        { name: 'Comments', description: 'Komentar pada postingan' },
      ],
    },
  }))
  .get('/', () => ({
    status: 'ok',
    message: 'ElysiaJS + Drizzle + MariaDB API is running!',
    timestamp: new Date().toISOString(),
  }))
  .use(usersRoute)
  .use(postsRoute)
  .use(commentsRoute)
  .listen(process.env.PORT ? parseInt(process.env.PORT) : 3000);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`📖 Swagger UI: http://${app.server?.hostname}:${app.server?.port}/swagger`);
