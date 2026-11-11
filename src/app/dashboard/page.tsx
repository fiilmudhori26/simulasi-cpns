'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { useStatistik } from '@/data/statistik';

const SUBTES = [
  {
    kode: 'TWK',
    nama: 'Tes Wawasan Kebangsaan',
    jumlah: 30,
    waktu: '± 25 menit',
    deskripsi:
      'Pancasila, UUD 1945, sejarah kebangsaan, bela negara, hingga integritas ASN.',
  },
  {
    kode: 'TIU',
    nama: 'Tes Intelegensia Umum',
    jumlah: 35,
    waktu: '± 30 menit',
    deskripsi:
      'Verbal, numerik, deret, silogisme, dan penalaran analitis yang menuntut ketelitian.',
  },
  {
    kode: 'TKP',
    nama: 'Tes Karakteristik Pribadi',
    jumlah: 45,
    waktu: '± 45 menit',
    deskripsi:
      'Pelayanan publik, jejaring kerja, sosial budaya, teknologi informasi, dan profesionalisme.',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const statistik = useStatistik();

  useEffect(() => {
    const storedNama = localStorage.getItem('user_nama');
    if (!storedNama) {
      router.push('/nama');
      return;
    }
    setNama(storedNama);
  }, [router]);

  if (!nama) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-muted">Memuat…</span>
      </div>
    );
  }

  const akurasi =
    statistik.besar > 0 ? Math.round((statistik.benar / statistik.besar) * 100) : 0;

  const ringkasan = [
    { label: 'Soal dikerjakan', nilai: statistik.besar, satuan: 'soal', catatan: 'Total sepanjang latihan' },
    { label: 'Jawaban benar', nilai: statistik.benar, satuan: 'soal', catatan: 'Termasuk skor TKP' },
    { label: 'Akurasi', nilai: akurasi, satuan: '%', catatan: 'Rata-rata seluruh sesi' },
    { label: 'Streak', nilai: statistik.streak, satuan: 'hari', catatan: 'Jaga ritme belajarmu' },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader nama={nama} />

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-14 md:pt-10">
        {/* Sapaan */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Ruang latihan</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-[28px]">
              Halo, {nama}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Satu sesi lagi hari ini lebih baik daripada menunda sampai besok.
            </p>
          </div>
          <span className="chip chip-gold">Target SKD 2026</span>
        </div>

        {/* Hero simulasi penuh */}
        <section className="relative overflow-hidden rounded-[22px] bg-brand text-white shadow-[0_28px_70px_-40px_rgba(18,58,143,0.9)]">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(232,163,61,0.55), transparent 65%)' }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent 65%)' }}
            aria-hidden="true"
          />

          <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-[1.15fr_0.85fr] md:p-10">
            <div className="flex flex-col justify-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Simulasi penuh SKD
              </p>
              <h2 className="mt-3 max-w-md font-display text-[26px] font-bold leading-tight text-white sm:text-[34px]">
                Latih ritme ujian, bukan cuma hafal soal.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
                110 soal dari bank soal terverifikasi, disusun seperti ujian sebenarnya.
                Kerjakan sekali duduk, lalu lihat skor dan pembahasannya.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/ujian/mulai" className="btn btn-gold btn-lg">
                  Mulai simulasi
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </Link>
                <Link
                  href="/ujian/mulai?mode=kategori"
                  className="btn btn-lg border border-white/25 bg-white/10 text-white hover:bg-white/15"
                >
                  Latihan per subtes
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  110 soal
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  100 menit
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  Pembahasan lengkap
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                  Komposisi
                </p>
                <span className="chip border-white/20 bg-white/10 text-white">Total 550</span>
              </div>
              <ul className="mt-4 space-y-3.5">
                {[
                  { kode: 'TWK', jumlah: 30, maks: 150, lebar: '27%' },
                  { kode: 'TIU', jumlah: 35, maks: 175, lebar: '32%' },
                  { kode: 'TKP', jumlah: 45, maks: 225, lebar: '41%' },
                ].map((item) => (
                  <li key={item.kode}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-semibold text-white">{item.kode}</span>
                      <span className="text-xs text-white/60">
                        {item.jumlah} soal · maks {item.maks}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15">
                      <div className="h-full rounded-full bg-gold" style={{ width: item.lebar }} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-white/55">
                Skor TWK &amp; TIU: 5 poin per jawaban benar. TKP: 1–5 poin per opsi.
              </p>
            </div>
          </div>
        </section>

        {/* Ringkasan statistik */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {ringkasan.map((item) => (
            <div key={item.label} className="surface p-4 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
                {item.label}
              </p>
              <p className="mt-2 font-display text-[26px] font-bold leading-none text-ink">
                {item.nilai}
                <span className="ml-1 text-sm font-semibold text-muted-soft">{item.satuan}</span>
              </p>
              <p className="mt-2 text-[11px] leading-snug text-muted">{item.catatan}</p>
            </div>
          ))}
        </section>

        {/* Subtes */}
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Latihan terarah</p>
              <h2 className="mt-1.5 font-display text-xl font-bold text-ink">
                Pilih subtes
              </h2>
            </div>
            <Link href="/ujian/mulai?mode=kategori" className="text-sm font-semibold text-brand hover:text-brand-600">
              Atur sendiri →
            </Link>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            {SUBTES.map((subtes) => (
              <Link
                key={subtes.kode}
                href={`/ujian/mulai?kategori=${subtes.kode}`}
                className="surface surface-hover group flex flex-col p-5"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft font-display text-xs font-extrabold text-brand">
                    {subtes.kode}
                  </span>
                  <span className="chip chip-muted">{subtes.jumlah} soal</span>
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-ink">
                  {subtes.nama}
                </h3>
                <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">
                  {subtes.deskripsi}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-[11px] font-medium text-muted-soft">{subtes.waktu}</span>
                  <span className="text-sm font-semibold text-brand transition-transform group-hover:translate-x-0.5">
                    Mulai →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mt-8 grid gap-3 sm:gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="surface-muted p-5 sm:p-6">
            <p className="eyebrow">Cara kerja</p>
            <ol className="mt-3 grid gap-3 text-sm text-ink-soft sm:grid-cols-3">
              {[
                ['1', 'Pilih sesi', 'Simulasi penuh atau latihan per subtes.'],
                ['2', 'Kerjakan', 'Jawab soal satu per satu tanpa terburu-buru.'],
                ['3', 'Evaluasi', 'Lihat skor, kunci, dan pembahasan.'],
              ].map(([nomor, judul, isi]) => (
                <li key={nomor} className="flex gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white font-display text-[11px] font-bold text-brand shadow-sm">
                    {nomor}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{judul}</span>
                    <span className="block text-xs leading-relaxed text-muted">{isi}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[18px] border border-[#f7e3c2] bg-gold-soft p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-ink">
              Pengingat
            </p>
            <p className="mt-2 font-display text-[15px] font-bold leading-snug text-[#4a3108]">
              “Konsistensi mengalahkan intensitas.”
            </p>
            <p className="mt-2 text-xs leading-relaxed text-gold-ink">
              Cukup 30 menit sehari, tetapi dilakukan setiap hari. Skor akan mengikuti
              kebiasaanmu, bukan mood-mu.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
