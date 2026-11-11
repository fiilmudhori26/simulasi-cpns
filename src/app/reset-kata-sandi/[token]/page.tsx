'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ResetKataSandiPage() {
  const params = useParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const token = params.token as string;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ text: 'Kata sandi tidak cocok.', type: 'error' });
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setMessage({ text: 'Kata sandi minimal 8 karakter.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Kata sandi berhasil diubah. Mengalihkan ke halaman masuk…', type: 'success' });
        setTimeout(() => {
          router.push('/masuk');
        }, 2000);
      } else {
        setMessage({ text: data.message || 'Gagal mengubah kata sandi.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Terjadi kesalahan. Silakan coba lagi.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="surface p-6 sm:p-8">
          <p className="eyebrow">Keamanan akun</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink">Atur ulang kata sandi</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Buat kata sandi baru minimal 8 karakter.
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
              <label htmlFor="password" className="field-label">
                Kata sandi baru
              </label>
              <input
                id="password"
                className="field"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi baru"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="konfirmasi" className="field-label">
                Konfirmasi kata sandi
              </label>
              <input
                id="konfirmasi"
                className="field"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                autoComplete="new-password"
              />
            </div>

            <button disabled={loading} className="btn btn-primary btn-block">
              {loading ? 'Mengubah…' : 'Atur ulang kata sandi'}
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
