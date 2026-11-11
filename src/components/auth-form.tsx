'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/app/actions/auth';

type Mode = 'masuk' | 'daftar';

interface AuthFormProps {
  mode: Mode;
  onSuccess: () => void;
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [namaTampil, setNamaTampil] = useState('');
  const [message, setMessage] = useState({ text: '', type: 'error' as const });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: 'error' });

    const formData = new FormData();
    formData.set('email', email);
    formData.set('password', password);
    if (mode === 'daftar') formData.set('nama_tampil', namaTampil);

    const result = await (mode === 'masuk' ? signIn(formData) : signUp(formData));

    if (result.error) {
      setMessage({ text: result.error, type: 'error' });
      setLoading(false);
      return;
    }

    onSuccess();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-xs font-extrabold text-white">
            SKD
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[15px] font-bold text-ink">
              Simulasi CPNS
            </span>
            <span className="block text-[11px] uppercase tracking-[0.16em] text-muted-soft">
              Akun admin &amp; pengelola
            </span>
          </span>
        </div>

        <div className="surface p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-ink">
            {mode === 'masuk' ? 'Masuk' : 'Daftar akun'}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            {mode === 'masuk'
              ? 'Halaman ini untuk admin dan pengelola soal. Peserta bisa langsung mulai tanpa akun.'
              : 'Buat akun pengelola untuk memverifikasi bank soal.'}
          </p>

          {message.text && (
            <div className="mt-4 rounded-xl border border-[#f6cfca] bg-danger-soft px-4 py-3 text-sm text-danger">
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="field-label">
                Email
              </label>
              <input
                id="email"
                className="field"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {mode === 'daftar' && (
              <div>
                <label htmlFor="nama-tampil" className="field-label">
                  Nama tampil
                </label>
                <input
                  id="nama-tampil"
                  className="field"
                  type="text"
                  required
                  value={namaTampil}
                  onChange={(e) => setNamaTampil(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="field-label">
                Kata sandi
              </label>
              <input
                id="password"
                className="field"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'masuk' ? 'current-password' : 'new-password'}
              />
            </div>

            <button disabled={loading} className="btn btn-primary btn-block">
              {loading ? 'Memproses…' : mode === 'masuk' ? 'Masuk' : 'Daftar'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            {mode === 'masuk' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <a
              href={mode === 'masuk' ? '/daftar' : '/masuk'}
              className="font-semibold text-brand hover:text-brand-600"
            >
              {mode === 'masuk' ? 'Daftar sekarang' : 'Masuk di sini'}
            </a>
          </p>

          {mode === 'masuk' && (
            <p className="mt-2 text-center text-sm text-muted">
              <a href="/lupa-kata-sandi" className="font-semibold text-brand hover:text-brand-600">
                Lupa kata sandi?
              </a>
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col items-center gap-1.5 text-center">
          <a href="/nama" className="text-sm font-semibold text-brand hover:text-brand-600">
            Ikut simulasi tanpa akun →
          </a>
          <p className="text-[11px] text-muted-soft">
            Simulasi SKD CPNS — gratis untuk komunitas
          </p>
        </div>
      </div>
    </div>
  );
}
