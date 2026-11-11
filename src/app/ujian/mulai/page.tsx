'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type UjianMode = 'interaktif' | 'pembahasan';

export default function MulaiUjianPage() {
  const [nama, setNama] = useState('');
  const router = useRouter();
  const [mode, setMode] = useState<'penuh' | 'kategori'>('penuh');
  const [kategori, setKategori] = useState('TWK');
  const [jumlah, setJumlah] = useState(20);
  const [durasi, setDurasi] = useState(30);
  const [ujianMode, setUjianMode] = useState<UjianMode>('interaktif');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedNama = localStorage.getItem('user_nama');
    if (!storedNama) {
      router.push('/nama');
      return;
    }
    setNama(storedNama);
  }, [router]);

  if (!nama) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const attemptId = `attempt_${Date.now()}`;
    localStorage.setItem(`current_attempt_${attemptId}`, JSON.stringify({
      mode,
      kategori: mode === 'kategori' ? kategori : undefined,
      jumlah: mode === 'kategori' ? jumlah : undefined,
      durasi,
      mulaiAt: new Date().toISOString(),
      ujianMode,
    }));

    router.push(`/ujian/${attemptId}`);
  }

  const isPenuh = mode === 'penuh';
  const isPembahasan = ujianMode === 'pembahasan';

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-700 text-lg">SKD</span>
              <span className="font-semibold text-slate-700">CPNS</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                Beranda
              </a>
              <a
                href="/riwayat"
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                Riwayat
              </a>
              <a
                href="/ujian/leaderboard"
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                Leaderboard
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {/* Mode Ujian Pilihan */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-slate-700 mb-2">Mode Ujian</h2>
          <div className="flex gap-2 rounded-lg bg-white p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setUjianMode('interaktif')}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium rounded-md transition',
                ujianMode === 'interaktif'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              Ujian Interaktif
            </button>
            <button
              type="button"
              onClick={() => setUjianMode('pembahasan')}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium rounded-md transition',
                ujianMode === 'pembahasan'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              Mode Pembahasan
            </button>
          </div>
          {isPembahasan && (
            <p className="mt-2 text-xs text-slate-500">
              Mode pembahasan: Pilih jawabanmu, lalu lihat kunci dan penjelasan.
            </p>
          )}
        </div>

        {/* Tipe Simulasi */}
        <div className="mb-6 flex gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setMode('penuh')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition',
              isPenuh ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            Simulasi Penuh SKD
          </button>
          <button
            type="button"
            onClick={() => setMode('kategori')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition',
              !isPenuh ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            Latihan per Kategori
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          {!isPenuh && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Soal</label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Durasi (menit)</label>
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

          {isPenuh && !isPembahasan && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 mb-4">
              <p className="font-semibold">Simulasi Penuh SKD CPNS</p>
              <p className="mt-1">30 TWK + 35 TIU + 45 TKP = 110 soal, waktu 100 menit.</p>
            </div>
          )}

          {isPembahasan && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-sm text-purple-800 mb-4">
              <p className="font-semibold">Mode Pembahasan Aktif</p>
              <p className="mt-1">Pilih jawabanmu, lalu jawaban benar dan penjelasan akan ditampilkan.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full py-3 rounded-md text-sm font-semibold text-white',
              isPembahasan ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              isPembahasan ? 'focus:ring-purple-500' : 'focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed transition',
            )}
          >
            {loading ? 'Memulai...' : isPembahasan ? 'Mulai Pembahasan' : 'Mulai Ujian'}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-500 text-center">
          Soal diambil secara acak dari bank soal yang telah terverifikasi.
        </p>
      </main>
    </div>
  );
}