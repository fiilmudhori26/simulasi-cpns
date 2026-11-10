import { auth } from '@/app/api/auth/[...all]/route';
import { cookies } from 'next/headers';

type SessionData = {
  user: { id: string; email: string | null; name: string | null };
  session: { id: string };
} | null;

/** Ambil sesi user saat ini (Better Auth). Mengembalikan null jika tidak ada sesi. */
export async function getCurrentSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  return (await auth.api.getSession({
    headers: { cookie: cookieStore.toString() },
  })) as unknown as SessionData;
}