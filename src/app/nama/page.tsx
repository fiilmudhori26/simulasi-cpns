'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Gagal menyimpan nama:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Panel kiri: identitas */}
      <aside className="relative hidden overflow-hidden bg-brand text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(232,163,61,0.6), transparent 65%)' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent 65%)' }}
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/12 text-xs font-extrabold tracking-tight text-white ring-1 ring-white/20">
            SKD
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[15px] font-bold">Simulasi CPNS</span>
            <span className="block text-[11px] uppercase tracking-[0.16em] text-white/55">
              Seleksi Kompetensi Dasar
            </span>
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
            Gratis · Tanpa akun
          </p>
          <h1 className="mt-4 font-display text-[34px] font-bold leading-[1.15] text-white xl:text-[40px]">
            Ukur kesiapanmu sebelum hari-H.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            110 soal terverifikasi dengan komposisi resmi SKD. Kerjakan, lihat skor, lalu
            pelajari pembahasannya. Cukup isi nama untuk memulai.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              ['110 soal', '30 TWK · 35 TIU · 45 TKP'],
              ['100 menit', 'Ritme ujian yang realistis'],
              ['Pembahasan', 'Kunci dan alasan di setiap soal'],
            ].map(([judul, isi]) => (
              <li key={judul} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span className="text-sm text-white/75">
                  <span className="font-semibold text-white">{judul}</span> — {isi}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[11px] text-white/40">
          Dibuat untuk teman dan komunitas pejuang CPNS.
        </p>
      </aside>

      {/* Panel kanan: form */}
      <main className="flex items-center justify-center bg-canvas px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-xs font-extrabold text-white">
              SKD
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-bold text-ink">
                Simulasi CPNS
              </span>
              <span className="block text-[11px] uppercase tracking-[0.16em] text-muted-soft">
                Seleksi Kompetensi Dasar
              </span>
            </span>
          </div>

          <p className="eyebrow">Selamat datang</p>
          <h2 className="mt-2 font-display text-[26px] font-bold text-ink">
            Siapa nama kamu?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Nama dipakai untuk menandai hasil dan riwayat latihan. Tidak perlu email atau kata
            sandi.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="nama" className="field-label">
                Nama lengkap
              </label>
              <input
                id="nama"
                className="field"
                type="text"
                placeholder="Contoh: Fiil Mudhori"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                autoFocus
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !nama.trim()}
              className="btn btn-primary btn-block btn-lg"
            >
              {loading ? 'Menyimpan…' : 'Masuk ke ruang latihan'}
              {!loading && (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-line bg-surface px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-muted-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <p className="text-[11px] leading-relaxed text-muted">
              Nama dan hasil latihan hanya disimpan di perangkat ini (localStorage), bukan di
              server. Kamu bisa memulai ulang kapan saja.
            </p>
          </div>

          <p className="mt-8 text-center text-[11px] text-muted-soft">
            Dengan melanjutkan, kamu siap mengerjakan simulasi secara jujur.
          </p>
        </div>
      </main>
    </div>
  );
}
