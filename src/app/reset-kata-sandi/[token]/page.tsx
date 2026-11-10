'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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
        body: JSON.stringify({
          token,
          newPassword: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Kata sandi berhasil diubah. Anda akan dialipasikan...', type: 'success' });
        setTimeout(() => {
          router.push('/masuk');
        }, 2000);
      } else {
        setMessage({ text: data.message || 'Gagal mengubah kata sandi.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Terjadi kesalahan. Silakan coba lagi.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Atur Ulang Kata Sandi</h2>
          <p className="mt-1 text-slate-600">
            Masukkan kata sandi baru Anda.
          </p>
        </div>

        {message && message.text && (
          <div
            className={cn(
              'px-4 py-3 rounded-md text-sm',
              message.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            )}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Kata Sandi Baru</label>
            <input
              className={cn(
                'mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:ring-blue-500 focus:border-blue-500',
              )}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi baru"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Konfirmasi Kata Sandi</label>
            <input
              className={cn(
                'mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:ring-blue-500 focus:border-blue-500',
              )}
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
            />
          </div>

          <button
            disabled={loading}
            className={cn(
              'w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {loading ? 'Mengubah...' : 'Atur Ulang Kata Sandi'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-600">
          <a
            href="/masuk"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Kembali ke Masuk
          </a>
        </div>
      </div>
    </div>
  );
}