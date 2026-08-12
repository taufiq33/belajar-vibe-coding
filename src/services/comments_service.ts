import { db } from '../db';
import { comments, posts } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Payload untuk membuat komentar.
 *
 * @field userId - ID user yang mengomentari (opsional, guest jika undefined/null)
 * @field postId - ID postingan yang dikomentari (wajib, harus ada di tabel posts)
 * @field content - Isi komentar (minimal 1 karakter)
 */
export interface CreateCommentPayload {
  userId?: number | null;
  postId: number;
  content: string;
}

/**
 * Membuat komentar baru dan menyimpan ke database.
 *
 * Alur:
 * 1. Validasi postId ada di tabel posts → jika tidak ada, lempar error "Postingan tidak ditemukan"
 * 2. Insert komentar ke tabel comments (user_id bisa null untuk guest comment)
 * 3. Return { data: 'OK' }
 *
 * Catatan: userId sudah ditentukan di layer route (dari token Authorization).
 * Jika undefined/null → user_id = NULL di DB (guest comment).
 *
 * @param payload - Data komentar baru (postId, content, userId opsional)
 * @returns Promise<{ data: string }>
 * @throws Error('Postingan tidak ditemukan') jika postId tidak ada di database
 */
export async function createCommentService(payload: CreateCommentPayload) {
  const { userId, postId, content } = payload;

  const foundPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (foundPosts.length === 0) {
    throw new Error('Postingan tidak ditemukan');
  }

  await db.insert(comments).values({
    userId: userId ?? null,
    postId,
    content,
  });

  return { data: 'OK' };
}
