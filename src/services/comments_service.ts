import { db } from '../db';
import { comments, posts, users } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Payload untuk membuat komentar.
 *
 * @field userId - ID user yang mengomentari (opsional, guest jika tidak dikirim)
 * @field postId - ID postingan yang dikomentari (wajib, harus ada di tabel posts)
 * @field content - Isi komentar (minimal 1 karakter)
 */
export interface CreateCommentPayload {
  userId?: number;
  postId: number;
  content: string;
}

/**
 * Membuat komentar baru dan menyimpan ke database.
 *
 * Alur:
 * 1. Validasi postId ada di tabel posts → jika tidak ada, lempar error "Postingan tidak ditemukan"
 * 2. JIKA userId dikirim: validasi user ada di tabel users → jika tidak ada, lempar error "User tidak ditemukan"
 * 3. Insert komentar ke tabel comments (user_id bisa null untuk guest comment)
 * 4. Return { data: 'OK' }
 *
 * Catatan: Pengecekan postingan wajib selalu dilakukan. Pengecekan user hanya
 * dilakukan jika userId dikirim (guest comment tanpa userId = user_id null di DB).
 *
 * @param payload - Data komentar baru (postId, content, userId opsional)
 * @returns Promise<{ data: string }>
 * @throws Error('Postingan tidak ditemukan') jika postId tidak ada di database
 * @throws Error('User tidak ditemukan') jika userId dikirim tapi tidak ada di database
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

  if (userId !== undefined) {
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (foundUsers.length === 0) {
      throw new Error('User tidak ditemukan');
    }
  }

  await db.insert(comments).values({
    userId,
    postId,
    content,
  });

  return { data: 'OK' };
}
