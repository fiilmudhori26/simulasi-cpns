import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...all]/route';

export async function GET(request: Request) {
  // Invalidasi session di server (session record dihapus dari DB)
  await auth.api.signOut({ headers: request.headers });
  redirect('/masuk');
}