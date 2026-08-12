import { db } from '../db';
import { sessions } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Mengekstrak userId dari token session.
 *
 * Alur:
 * 1. Jika token kosong/falsy → return null
 * 2. Query tabel sessions WHERE token = token LIMIT 1
 * 3. Jika hasil KOSONG → return null (token tidak valid / sudah logout)
 * 4. Jika hasil ADA → return row.userId
 *
 * @param token - Token UUID dari header Authorization
 * @returns Promise<number | null> — userId jika token valid, null jika tidak
 */
export async function resolveUserIdFromToken(token: string): Promise<number | null> {
  if (!token) return null;

  const foundSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (foundSessions.length === 0) {
    return null;
  }

  return foundSessions[0].userId;
}
