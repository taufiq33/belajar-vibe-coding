import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { usersRoute } from './routes/users_route';
import { postsRoute } from './routes/posts_route';
import { commentsRoute } from './routes/comments_route';

const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'Belajar Vibe Coding API',
        version: '1.0.0',
        description: 'Backend API built with ElysiaJS + Drizzle ORM + MariaDB',
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Local development server' },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'UUID',
            description: 'Masukkan token UUID dari endpoint login',
          },
        },
      },
      tags: [
        { name: 'Users', description: 'Registrasi, login, dan logout user' },
        { name: 'Posts', description: 'Buat, lihat, dan baca detail postingan' },
        { name: 'Comments', description: 'Buat dan lihat komentar pada postingan' },
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
