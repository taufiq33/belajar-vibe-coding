import { db } from '../db';
import { posts, users } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface CreatePostPayload {
  userId: number;
  title: string;
  content: string;
}

export async function createPostService(payload: CreatePostPayload) {
  const { userId, title, content } = payload;

  const foundUsers = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (foundUsers.length === 0) {
    throw new Error('User tidak ditemukan');
  }

  await db.insert(posts).values({
    userId,
    title,
    content,
  });

  return { data: 'OK' };
}
