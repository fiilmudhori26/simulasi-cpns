'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startAttempt } from '@/app/actions/ujian';

export default function MulaiUjianPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'penuh' | 'kategori'>('penuh');
  const [kategori, setKategori] = useState('TWK');
  const [jumlah, setJumlah] = useState(20);
  const [durasi, setDurasi] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.set('mode', mode);
    if (mode === 'kategori') {
      formData.set('kategori', kategori);
      formData.set('jumlah', String(jumlah));
      formData.set('durasi', String(durasi));
    }

    const result = await startAttempt(formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(`/ujian/${result.attemptId}`);
  }

  const isPenuh = mode === 'penuh';

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mulai Simulasi</h1>
        <p className="mt-1 text-slate-600">
          Pilih jenis simulasi yang ingin diikuti.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setMode('penuh')}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition
            ${isPenuh ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}
          `}
        >
          Simulasi Penuh SKD
        </button>
        <button
          onClick={() => setMode('kategori')}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition
            ${!isPenuh ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}
          `}
        >
          Latihan per Kategori
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        {!isPenuh && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kategori
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                >
                  <option value="TWK">TWK (Wawasan Kebangsaan)</option>
                  <option value="TIU">TIU (Intens Umum)</option>
                  <option value="TKP">TKP (Kepribadian & Potensi)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jumlah Soal
                </label>
                <input
                  type="number"
                  min="1"
                  value={jumlah}
                  onChange={(e) => setJumlah(Number(e.target.value) || 1)}
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Durasi (menit)
              </label>
              <input
                type="number"
                min="1"
                value={durasi}
                onChange={(e) => setDurasi(Number(e.target.value) || 1)}
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>
          </>
        )}

        {isPenuh && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 mb-4">
            <p className="font-semibold">Simulasi Penuh SKD CPNS</p>
            <p className="mt-1">
              30 TWK + 35 TIU + 45 TKP = 110 soal, waktu 100 menit.
            </p>
          </div>
        )}

        <button
          disabled={loading}
          className={cn(
            'w-full py-3 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50',
            'transition',
          )}
        >
          {loading ? 'Memulai...' : 'Mulai Ujian'}
        </button>
      </form>

      <p className="mt-6 text-xs text-slate-500 text-center">
        Soal diambil secara acak dari bank soal yang telah terverifikasi.
      </p>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}