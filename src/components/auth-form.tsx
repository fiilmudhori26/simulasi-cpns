'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {mode === 'masuk' ? 'Masuk' : 'Daftar Akun'}
          </h2>
          <p className="mt-1 text-slate-600">
            {mode === 'masuk'
              ? 'Selamat datang kembali ke Simulasi SKD CPNS.'
              : 'Buat akun baru untuk memulai simulasi ujian.'}
          </p>
        </div>

        {message.text && (
          <div
            className={`px-4 py-3 rounded-md text-sm ${
              message.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}
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
            />
          </div>

          {mode === 'daftar' && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Nama Tampil</label>
              <input
                className={cn(
                  'mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:ring-blue-500 focus:border-blue-500',
                )}
                type="text"
                required
                value={namaTampil}
                onChange={(e) => setNamaTampil(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">Kata Sandi</label>
            <input
              className={cn(
                'mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:ring-blue-500 focus:border-blue-500',
              )}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className={cn(
              'w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {loading ? 'Memproses...' : mode === 'masuk' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          {mode === 'masuk' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <a
            href={mode === 'masuk' ? '/daftar' : '/masuk'}
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            {mode === 'masuk' ? 'Daftar sekarang' : 'Masuk ke sini'}
          </a>
        </p>

        <p className="text-center text-xs text-slate-500">
          Simulasi SKD CPNS — gratis untuk komunitas
        </p>
      </div>
    </div>
  );
}