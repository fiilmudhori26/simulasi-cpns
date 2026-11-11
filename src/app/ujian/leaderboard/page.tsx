'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { getRiwayat, formatTanggal, type RiwayatItem } from '@/data/riwayat';

export default function LeaderboardPage() {
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

  const peringkat = [...riwayat]
    .sort((a, b) => b.skorTotal - a.skorTotal || b.persen - a.persen)
    .slice(0, 10);

  const medali = ['#e8a33d', '#9aa6bb', '#c08355'];

  return (
    <div className="min-h-screen">
      <SiteHeader nama={nama} />

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6 md:pb-14 md:pt-10">
        <div className="mb-6">
          <p className="eyebrow">Papan skor</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-[28px]">
            Peringkatmu
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Sepuluh skor terbaikmu di perangkat ini. Peringkat komunitas daring akan hadir
            setelah fitur akun tersedia.
          </p>
        </div>

        {peringkat.length === 0 ? (
          <div className="surface p-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-soft text-gold-ink">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 21h8" />
                <path d="M12 17v4" />
                <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
                <path d="M17 5h3v2a3 3 0 0 1-3 3" />
                <path d="M7 5H4v2a3 3 0 0 0 3 3" />
              </svg>
            </span>
            <h2 className="mt-4 font-display text-base font-bold text-ink">
              Papan skor masih kosong
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
              Selesaikan satu simulasi untuk melihat namamu di sini.
            </p>
            <Link href="/ujian/mulai" className="btn btn-primary mt-5">
              Mulai simulasi
            </Link>
          </div>
        ) : (
          <div className="surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-line bg-surface-muted px-5 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
                Skor terbaik
              </span>
              <span className="text-[11px] text-muted-soft">{riwayat.length} sesi tercatat</span>
            </div>

            <ol className="divide-y divide-line">
              {peringkat.map((item, index) => (
                <li key={item.attemptId}>
                  <Link
                    href={`/ujian/${item.attemptId}/hasil`}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-muted sm:px-5"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-xs font-extrabold"
                      style={{
                        background: index < 3 ? medali[index] : 'var(--surface-muted)',
                        color: index < 3 ? '#1b1408' : 'var(--muted)',
                        border: index < 3 ? 'none' : '1px solid var(--line)',
                      }}
                    >
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{item.nama || nama}</p>
                      <p className="mt-0.5 text-[11px] text-muted-soft">
                        {item.kategori ? `Latihan ${item.kategori}` : 'Simulasi penuh'} ·{' '}
                        {formatTanggal(item.selesaiAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-display text-sm font-bold text-ink">
                        {item.skorTotal}
                        <span className="text-[10px] font-semibold text-muted-soft">
                          /{item.skorMaks}
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-soft">{item.persen}%</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}

        <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-soft">
          Peringkat dihitung dari skor total, lalu persentase skor. Data bersifat lokal di browser ini.
        </p>
      </main>
    </div>
  );
}
