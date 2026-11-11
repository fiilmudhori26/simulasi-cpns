'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
  const [nama, setNama] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedNama = localStorage.getItem('user_nama');
    if (!storedNama) {
      router.push('/nama');
    } else {
      setNama(storedNama);
    }
  }, [router]);

  if (!nama) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

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
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Leaderboard</h1>
        <p className="text-slate-600">Classified users will appear here.</p>
      </main>
    </div>
  );
}