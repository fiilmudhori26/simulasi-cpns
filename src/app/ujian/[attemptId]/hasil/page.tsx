'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { simpanStatistik } from '@/data/statistik';

interface HasilUjian {
  attemptId: string;
  nama: string;
  mulaiAt: string;
  selesaiAt: string;
  soal: number;
  jumlahTWK?: number;
  jumlahTIU?: number;
  jumlahTKP?: number;
  skorTWK: number;
  skorTIU: number;
  skorTKP: number;
  skorTotal: number;
  jumlahBenar?: number;
  jawaban: Record<string, string>;
  kategori?: 'TWK' | 'TIU' | 'TKP';
}

export default function HasilPage() {
  const params = useParams();
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasil, setHasil] = useState<HasilUjian | null>(null);

  const attemptId = params.attemptId as string;

  useEffect(() => {
    const storedNama = localStorage.getItem('user_nama');
    if (!storedNama) {
      router.push('/nama');
      return;
    }
    setNama(storedNama);

    const hasilData = localStorage.getItem(`hasil_attempt_${attemptId}`);
    if (hasilData) {
      const parsedHasil = JSON.parse(hasilData);
      setHasil(parsedHasil);

      // Simpan statistik terbaru
      const totalSoal = parsedHasil.soal;
      const benar =
        typeof parsedHasil.jumlahBenar === 'number'
          ? parsedHasil.jumlahBenar
          : parsedHasil.skorTotal;
      const persen = totalSoal > 0 ? Math.round((benar / totalSoal) * 100) : 0;

      // Update statistik global
      const statLama = JSON.parse(localStorage.getItem('statistik_cpns') || '{}');
      simpanStatistik({
        besar: (statLama?.besar || 0) + totalSoal,
        benar: (statLama?.benar || 0) + benar,
        persen,
        // Update kategori jika ada info
        ...(parsedHasil.kategori && {
          kategori: {
            ...(statLama?.kategori || { hukum: { besar: 0, benar: 0, persen: 0 }, pamong: { besar: 0, benar: 0, persen: 0 }, tatau: { besar: 0, benar: 0, persen: 0 }, ipk: { besar: 0, benar: 0, persen: 0 } }),
            [parsedHasil.kategori.toLowerCase()]: {
              besar: totalSoal,
              benar,
              persen,
            },
          },
        }),
      });

      // Update streak (hari)
      const hariIni = new Date().toISOString().split('T')[0];
      const riwayatStreak = JSON.parse(localStorage.getItem('riwayat_streak') || '[]');
      if (!riwayatStreak.includes(hariIni)) {
        riwayatStreak.push(hariIni);
        localStorage.setItem('riwayat_streak', JSON.stringify(riwayatStreak));
        simpanStatistik({ streak: riwayatStreak.length });
      }
    }
    setLoading(false);
  }, [attemptId, router]);

  if (loading || !nama) {
    return <div className="min-h-screen flex items-center justify-center">Memuat hasil...</div>;
  }

  if (!hasil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Tidak ada data hasil untuk ujian ini.</p>
      </div>
    );
  }

  // Hitung persentase (skor maksimal: 5 poin per soal)
  const maxTWK = hasil.jumlahTWK != null ? hasil.jumlahTWK * 5 : hasil.skorTWK;
  const maxTIU = hasil.jumlahTIU != null ? hasil.jumlahTIU * 5 : hasil.skorTIU;
  const maxTKP = hasil.jumlahTKP != null ? hasil.jumlahTKP * 5 : hasil.skorTKP;
  const maxSkor =
    hasil.jumlahTWK != null || hasil.jumlahTIU != null || hasil.jumlahTKP != null
      ? maxTWK + maxTIU + maxTKP
      : hasil.soal * 5;
  const persentase = maxSkor > 0 ? Math.round((hasil.skorTotal / maxSkor) * 100) : 0;

  // Tentukan status
  const status = persentase >= 65 ? 'LULUS' : 'TIDAK LULUS';
  const statusColor = persentase >= 65 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Hasil Simulasi</h1>
          <div className={cn('inline-block px-4 py-2 rounded-full text-sm font-semibold', statusColor)}>
            {status} ({persentase}%)
          </div>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">TWK</p>
            <p className="text-2xl font-bold text-blue-600">{hasil.skorTWK}/{maxTWK}</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">TIU</p>
            <p className="text-2xl font-bold text-green-600">{hasil.skorTIU}/{maxTIU}</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">TKP</p>
            <p className="text-2xl font-bold text-purple-600">{hasil.skorTKP}/{maxTKP}</p>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Ringkasan</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Nama Pengguna:</span>
              <span className="font-medium text-slate-800">{hasil.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Jumlah Soal:</span>
              <span className="font-medium text-slate-800">{hasil.soal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Skor Total:</span>
              <span className="font-medium text-slate-800">{hasil.skorTotal} / {maxSkor}</span>
            </div>
            {typeof hasil.jumlahBenar === 'number' && (
              <div className="flex justify-between">
                <span className="text-slate-600">Jawaban Benar:</span>
                <span className="font-medium text-slate-800">{hasil.jumlahBenar} soal</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Waktu Penyelesian:</span>
              <span className="font-medium text-slate-800">
                {hasil.selesaiAt ? new Date(hasil.selesaiAt).toLocaleString('id-ID') : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 px-4 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Kembali ke Dashboard
          </button>
          <button
            onClick={() => router.push('/riwayat')}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Lihat Riwayat
          </button>
        </div>
      </main>
    </div>
  );
}