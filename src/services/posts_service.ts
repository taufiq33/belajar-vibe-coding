import { db } from '../db';
import { posts, comments } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Payload untuk membuat postingan baru.
 *
 * @field userId  - ID user yang membuat postingan (dari token Authorization, bukan body)
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
 * 1. Insert postingan baru ke tabel posts (userId, title, content)
 * 2. Return { data: 'OK' }
 *
 * Catatan: userId sudah diverifikasi di layer route (dari token),
 * sehingga tidak perlu pengecekan user lagi di sini.
 *
 * @param payload - Data postingan baru (userId, title, content)
 * @returns Promise<{ data: string }>
 */
export async function createPostService(payload: CreatePostPayload) {
  const { userId, title, content } = payload;

  await db.insert(posts).values({
    userId,
    title,
    content,
  });

  return { data: 'OK' };
}

/**
 * Mendapatkan daftar postingan dengan pagination.
 *
 * Alur:
 * 1. Hitung offset = (page - 1) * limit
 * 2. Query semua postingan ORDER BY created_at DESC LIMIT limit OFFSET offset
 * 3. Return array postingan (bisa kosong)
 *
 * @param page  - Nomor halaman (default 1)
 * @param limit - Jumlah data per halaman (default 10)
 * @returns Promise<array postingan>
 */
export async function getPostsService(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;

  return await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Mendapatkan detail satu postingan berdasarkan id.
 *
 * Alur:
 * 1. Query postingan WHERE id = postId LIMIT 1
 * 2. Jika tidak ditemukan → lempar error "Postingan tidak ditemukan"
 * 3. Return object postingan
 *
 * @param postId - ID postingan
 * @returns Promise<object postingan>
 * @throws Error('Postingan tidak ditemukan') jika postingan tidak ada
 */
export async function getPostByIdService(postId: number) {
  const foundPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (foundPosts.length === 0) {
    throw new Error('Postingan tidak ditemukan');
  }

  return foundPosts[0];
}

/**
 * Mendapatkan daftar komentar untuk satu postingan.
 *
 * Alur:
 * 1. Validasi postingan ada → jika tidak, lempar error "Postingan tidak ditemukan"
 * 2. Query semua komentar WHERE post_id = postId ORDER BY created_at DESC
 * 3. Return array komentar (bisa kosong jika belum ada komentar)
 *
 * @param postId - ID postingan
 * @returns Promise<array komentar>
 * @throws Error('Postingan tidak ditemukan') jika postingan tidak ada
 */
export async function getCommentsByPostService(postId: number) {
  const foundPosts = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (foundPosts.length === 0) {
    throw new Error('Postingan tidak ditemukan');
  }

  return await db
    .select()
    .from(comments)
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt));
}
