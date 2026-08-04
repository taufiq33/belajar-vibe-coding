import { db } from '../db';
import { posts, users } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Payload untuk membuat postingan baru.
 *
 * @field userId  - ID user yang membuat postingan (harus ada di tabel users)
 * @field title   - Judul postingan (1-255 karakter)
 * @field content - Isi konten postingan (minimal 1 karakter)
 */
export interface CreatePostPayload {
  userId: number;
  title: string;
  content: string;
}

/**
 * Membuat postingan baru dan menyimpan ke database.
 *
 * Alur:
 * 1. Cek apakah user_id valid di tabel users → jika tidak ada, lempar error "User tidak ditemukan"
 * 2. Insert postingan baru ke tabel posts (userId, title, content)
 * 3. Return { data: 'OK' }
 *
 * Catatan: Pengecekan user_id wajib dilakukan SEBELUM insert
 * untuk menjaga integritas data asing (foreign key).
 *
 * @param payload - Data postingan baru (userId, title, content)
 * @returns Promise<{ data: string }>
 * @throws Error('User tidak ditemukan') jika user_id tidak ada di database
 */
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
