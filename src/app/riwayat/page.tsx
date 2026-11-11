'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { getRiwayat, formatTanggal, type RiwayatItem } from '@/data/riwayat';

export default function RiwayatPage() {
  const [nama, setNama] = useState('');
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedNama = localStorage.getItem('user_nama');
    if (!storedNama) {
      router.push('/nama');
      return;
    }
    setNama(storedNama);
    setRiwayat(getRiwayat());
  }, [router]);

  if (!nama) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-muted">Memuat…</span>
      </div>
    );
  }

  const totalSesi = riwayat.length;
  const rataPersen =
    totalSesi > 0
      ? Math.round(riwayat.reduce((total, item) => total + item.persen, 0) / totalSesi)
      : 0;
  const terbaik =
    totalSesi > 0 ? riwayat.reduce((a, b) => (b.skorTotal > a.skorTotal ? b : a)) : null;

  return (
    <div className="min-h-screen">
      <SiteHeader nama={nama} />

      <main className="mx-auto max-w-4xl px-4 pb-28 pt-6 sm:px-6 md:pb-14 md:pt-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Jejak latihan</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-[28px]">
              Riwayat simulasi
            </h1>
            <p className="mt-1 text-sm text-muted">
              Semua sesi yang diselesaikan di perangkat ini.
            </p>
          </div>
          <Link href="/ujian/mulai" className="btn btn-primary btn-sm">
            Sesi baru
          </Link>
        </div>

        {totalSesi === 0 ? (
          <div className="surface p-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3h9l5 5v13H6z" />
                <path d="M14 3v6h6" />
                <path d="M9 13h6" />
                <path d="M9 17h4" />
              </svg>
            </span>
            <h2 className="mt-4 font-display text-base font-bold text-ink">Belum ada riwayat</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
              Selesaikan satu sesi simulasi, lalu skor dan pembahasannya akan tersimpan di sini
              secara otomatis.
            </p>
            <Link href="/ujian/mulai" className="btn btn-primary mt-5">
              Mulai sesi pertama
            </Link>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-3 gap-3">
              {[
                { label: 'Sesi selesai', nilai: totalSesi, satuan: '' },
                { label: 'Rata-rata skor', nilai: rataPersen, satuan: '%' },
                {
                  label: 'Skor terbaik',
                  nilai: terbaik?.skorTotal ?? 0,
                  satuan: terbaik ? `/${terbaik.skorMaks}` : '',
                },
              ].map((item) => (
                <div key={item.label} className="surface p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-soft">
                    {item.label}
                  </p>
                  <p className="mt-1.5 font-display text-xl font-bold text-ink sm:text-2xl">
                    {item.nilai}
                    <span className="text-xs font-semibold text-muted-soft">{item.satuan}</span>
                  </p>
                </div>
              ))}
            </section>

            <section className="mt-5 space-y-2.5">
              {riwayat.map((item) => (
                <Link
                  key={item.attemptId}
                  href={`/ujian/${item.attemptId}/hasil`}
                  className="surface surface-hover block p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="chip chip-brand">
                          {item.kategori ? `Latihan ${item.kategori}` : 'Simulasi penuh'}
                        </span>
                        {item.ujianMode === 'pembahasan' && (
                          <span className="chip chip-gold">Pembahasan</span>
                        )}
                        <span className="text-[11px] text-muted-soft">
                          {formatTanggal(item.selesaiAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted">
                        {item.soal} soal
                        {typeof item.jumlahBenar === 'number' && (
                          <> · {item.jumlahBenar} benar</>
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-display text-xl font-bold leading-none text-ink">
                        {item.skorTotal}
                        <span className="text-xs font-semibold text-muted-soft">/{item.skorMaks}</span>
                      </p>
                      <p className="mt-1 text-[11px] font-semibold text-muted-soft">
                        {item.persen}% dari maks
                      </p>
                    </div>
                  </div>

                  <div className="progress mt-3 h-1.5">
                    <div
                      className={item.persen >= 65 ? 'progress-bar progress-bar-success' : 'progress-bar'}
                      style={{ width: `${Math.min(item.persen, 100)}%` }}
                    />
                  </div>
                </Link>
              ))}
            </section>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-soft">
              Riwayat disimpan di perangkat ini saja. Menghapus data browser akan menghapus
              riwayat.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
