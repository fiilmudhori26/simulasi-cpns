'use server';

import { cookies } from 'next/headers';
import { auth } from '@/app/api/auth/[...all]/route';

type AuthApi = {
  signInEmail: (opts: {
    body: { email: string; password: string; rememberMe?: boolean };
  }) => Promise<unknown>;
  signUpEmail: (opts: {
    body: { email: string; password: string; name: string; rememberMe?: boolean };
  }) => Promise<unknown>;
  signOut: (opts?: {
    headers: Record<string, string>;
  }) => Promise<unknown>;
};

const api = auth.api as unknown as AuthApi;

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Email dan kata sandi harus diisi.' };
  }

  try {
    await api.signInEmail({
      body: { email, password },
    });
    return { success: true };
  } catch {
    return { error: 'Email atau kata sandi salah.' };
  }
}

export async function signUp(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const namaTampil = String(formData.get('nama_tampil') ?? '').trim() || 'Pengguna';

  if (!email || !password) {
    return { error: 'Email dan kata sandi harus diisi.' };
  }

  try {
    const result = await api.signUpEmail({
      body: { email, password, name: namaTampil },
    });
    return { success: true, data: result };
  } catch (err: any) {
    // Better Auth v1.7+ returns error with reason property
    const errorMessage = err?.message || err?.reason || JSON.stringify(err);
    if (errorMessage.includes('USER_ALREADY_EXISTS') || err?.context?.reason === 'USER_ALREADY_EXISTS') {
      return { error: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.' };
    }
    console.error('[SIGNUP ERROR]', err);
    return { error: `Gagal mendaftar: ${errorMessage}` };
  }
}

export async function signOut() {
  const cookieStore = await cookies();
  // Invalidasi session di server (session record dihapus dari DB)
  await api.signOut({ headers: { cookie: cookieStore.toString() } });
  return { success: true };
}