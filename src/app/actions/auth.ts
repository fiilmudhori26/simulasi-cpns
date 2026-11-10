'use server';

import { cookies } from 'next/headers';
import { auth } from '@/app/api/auth/[...all]/route';

type AuthApi = {
  signInEmailPassword: (opts: {
    body: { email: string; password: string };
  }) => Promise<unknown>;
  signUpEmailPassword: (opts: {
    body: { email: string; password: string; name: string };
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
    await api.signInEmailPassword({
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
    await api.signUpEmailPassword({
      body: { email, password, name: namaTampil },
    });
    return { success: true };
  } catch {
    return { error: 'Gagal mendaftar. Email mungkin sudah terdaftar.' };
  }
}

export async function signOut() {
  const cookieStore = await cookies();
  // Invalidasi session di server (session record dihapus dari DB)
  await api.signOut({ headers: { cookie: cookieStore.toString() } });
  return { success: true };
}