'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LupaKataSandiPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Always show success message to prevent email enumeration
      setMessage({
        text: 'Jika email tersebut terdaftar, tautan reset kata sandi telah dikirim.',
        type: 'success',
      });
    } catch {
      setMessage({
        text: 'Terjadi kesalahan. Silakan coba lagi.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="surface p-6 sm:p-8">
          <p className="eyebrow">Pemulihan akun</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink">Lupa kata sandi?</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Masukkan email akunmu. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
          </p>

          {message && (
            <div
              className={
                message.type === 'error'
                  ? 'mt-4 rounded-xl border border-[#f6cfca] bg-danger-soft px-4 py-3 text-sm text-danger'
                  : 'mt-4 rounded-xl border border-[#c6ecdd] bg-success-soft px-4 py-3 text-sm text-success'
              }
            >
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
                placeholder="nama@email.com"
                autoComplete="email"
              />
            </div>

            <button disabled={loading} className="btn btn-primary btn-block">
              {loading ? 'Mengirim…' : 'Kirim tautan reset'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            <button
              type="button"
              onClick={() => router.push('/masuk')}
              className="font-semibold text-brand hover:text-brand-600"
            >
              Kembali ke halaman masuk
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
