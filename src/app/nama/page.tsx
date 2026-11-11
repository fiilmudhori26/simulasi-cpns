'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function NamaPage() {
  const [nama, setNama] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    setLoading(true);
    try {
      localStorage.setItem('user_nama', nama.trim());
      // Pastikan refresh page setelah redirect
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Gagal menyimpan nama:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Selamat Datang!</h2>
          <p className="mt-1 text-slate-600">
            Silakan masukkan nama Anda sebelum mulai simulasi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nama lengkap</label>
            <input
              className={cn(
                'mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:ring-blue-500 focus:border-blue-500',
              )}
              type="text"
              placeholder="Masukkan nama Anda"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              autoFocus
              disabled={loading}
            />
          </div>

          <button
            disabled={loading || !nama.trim()}
            className={cn(
              'w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {loading ? 'Menyimpan...' : 'Lanjutkan ke Dashboard'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Simulasi SKD CPNS — gratis untuk komunitas
        </p>
      </div>
    </div>
  );
}