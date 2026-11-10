'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LupaKataSandiPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.set('email', email);

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      // Always show success message to prevent email enumeration
      setMessage({
        text: 'Jika email tersebut terdaftar, tautan reset kata sandi telah dikirim.',
        type: 'success',
      });
    } catch (error) {
      setMessage({
        text: 'Terjadi kesalahan. Silakan coba lagi.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lupa Kata Sandi?</h2>
          <p className="mt-1 text-slate-600">
            Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
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
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              className={cn(
                'mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:ring-blue-500 focus:border-blue-500',
              )}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </div>

          <button
            disabled={loading}
            className={cn(
              'w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
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