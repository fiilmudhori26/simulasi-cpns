'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { simpanStatistik } from '@/data/statistik';
import { SiteHeader } from '@/components/SiteHeader';

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

function ScoreRing({ persen }: { persen: number }) {
  const ukuran = 132;
  const tebal = 10;
  const radius = (ukuran - tebal) / 2;
  const keliling = 2 * Math.PI * radius;
  const offset = keliling * (1 - Math.min(persen, 100) / 100);

  return (
    <div className="relative" style={{ width: ukuran, height: ukuran }}>
      <svg width={ukuran} height={ukuran} className="-rotate-90" aria-hidden="true">
        <circle
          cx={ukuran / 2}
          cy={ukuran / 2}
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth={tebal}
        />
        <circle
          cx={ukuran / 2}
          cy={ukuran / 2}
          r={radius}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={tebal}
          strokeLinecap="round"
          strokeDasharray={keliling}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[28px] font-extrabold leading-none text-ink">
          {persen}%
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
          dari maks
        </span>
      </div>
    </div>
  );
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
            ...(statLama?.kategori || {
              hukum: { besar: 0, benar: 0, persen: 0 },
              pamong: { besar: 0, benar: 0, persen: 0 },
              tatau: { besar: 0, benar: 0, persen: 0 },
              ipk: { besar: 0, benar: 0, persen: 0 },
            }),
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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-muted">Memuat hasil…</span>
      </div>
    );
  }

  if (!hasil) {
    return (
      <div className="min-h-screen">
        <SiteHeader nama={nama} />
        <main className="mx-auto max-w-3xl px-4 py-16">
          <div className="surface p-8 text-center">
            <p className="font-display text-base font-bold text-ink">Data hasil tidak ditemukan</p>
            <p className="mt-2 text-sm text-muted">
              Sesi ini mungkin dibuka di perangkat lain atau sudah dihapus.
            </p>
            <button onClick={() => router.push('/ujian/mulai')} className="btn btn-primary mt-5">
              Mulai ujian baru
            </button>
          </div>
        </main>
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

  const diAtasTarget = persentase >= 65;

  const rincian = [
    { kode: 'TWK', nama: 'Wawasan Kebangsaan', skor: hasil.skorTWK, maks: maxTWK },
    { kode: 'TIU', nama: 'Intelegensia Umum', skor: hasil.skorTIU, maks: maxTIU },
    { kode: 'TKP', nama: 'Karakteristik Pribadi', skor: hasil.skorTKP, maks: maxTKP },
  ].filter((item) => item.maks > 0);

  return (
    <div className="min-h-screen">
      <SiteHeader nama={nama} />

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6 md:pb-14 md:pt-10">
        <div className="mb-6">
          <p className="eyebrow">Hasil simulasi</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-[28px]">
            Ringkasan pengerjaanmu
          </h1>
          <p className="mt-1 text-sm text-muted">
            {hasil.selesaiAt
              ? `Diselesaikan ${new Date(hasil.selesaiAt).toLocaleString('id-ID', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}`
              : 'Sesi selesai.'}
          </p>
        </div>

        {/* Kartu skor utama */}
        <section className="surface overflow-hidden">
          <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
            <div className="flex justify-center sm:justify-start">
              <ScoreRing persen={persentase} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('chip', diAtasTarget ? 'chip-success' : 'chip-gold')}>
                  {diAtasTarget ? 'Di atas target 65%' : 'Perlu latihan lagi'}
                </span>
                {hasil.kategori && <span className="chip chip-muted">Latihan {hasil.kategori}</span>}
              </div>

              <p className="mt-4 font-display text-[34px] font-extrabold leading-none text-ink sm:text-[40px]">
                {hasil.skorTotal}
                <span className="ml-1 text-lg font-semibold text-muted-soft">/ {maxSkor}</span>
              </p>
              <p className="mt-1 text-sm text-muted">
                Skor total dari {hasil.soal} soal
                {typeof hasil.jumlahBenar === 'number' && (
                  <> · {hasil.jumlahBenar} jawaban benar</>
                )}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-surface-muted px-3 py-2">
                  <span className="block text-muted-soft">Peserta</span>
                  <span className="mt-0.5 block truncate font-semibold text-ink">{hasil.nama}</span>
                </div>
                <div className="rounded-xl bg-surface-muted px-3 py-2">
                  <span className="block text-muted-soft">Rata-rata per soal</span>
                  <span className="mt-0.5 block font-semibold text-ink">
                    {hasil.soal > 0 ? (hasil.skorTotal / hasil.soal).toFixed(1) : '0'} poin
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-line bg-surface-muted px-6 py-3 text-[11px] leading-relaxed text-muted-soft sm:px-8">
            Ambang 65% hanya acuan latihan, bukan keputusan kelulusan resmi. Passing grade
            ditetapkan pada pengumuman SSCASN.
          </div>
        </section>

        {/* Rincian per subtes */}
        {rincian.length > 0 && (
          <section className="mt-4 grid gap-3 sm:grid-cols-3">
            {rincian.map((item) => {
              const persen = item.maks > 0 ? Math.round((item.skor / item.maks) * 100) : 0;
              return (
                <div key={item.kode} className="surface p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-xs font-extrabold tracking-wide text-brand">
                      {item.kode}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-soft">{persen}%</span>
                  </div>
                  <p className="mt-2 font-display text-xl font-bold text-ink">
                    {item.skor}
                    <span className="text-xs font-semibold text-muted-soft"> / {item.maks}</span>
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-muted">{item.nama}</p>
                  <div className="progress mt-3 h-1.5">
                    <div className="progress-bar" style={{ width: `${persen}%` }} />
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Aksi */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => router.push('/riwayat')}
            className="btn btn-secondary flex-1"
          >
            Lihat riwayat
          </button>
          <button
            onClick={() => router.push('/ujian/mulai')}
            className="btn btn-primary flex-1"
          >
            Mulai sesi baru
          </button>
        </div>
      </main>
    </div>
  );
}
