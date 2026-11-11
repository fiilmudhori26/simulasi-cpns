'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/SiteHeader';

type UjianMode = 'interaktif' | 'pembahasan';
type TipeUjian = 'penuh' | 'kategori';
type Kategori = 'TWK' | 'TIU' | 'TKP';

const SUBTES: { kode: Kategori; nama: string; jumlah: number }[] = [
  { kode: 'TWK', nama: 'Wawasan Kebangsaan', jumlah: 30 },
  { kode: 'TIU', nama: 'Intelegensia Umum', jumlah: 35 },
  { kode: 'TKP', nama: 'Karakteristik Pribadi', jumlah: 45 },
];

export default function MulaiUjianPage() {
  const [nama, setNama] = useState('');
  const router = useRouter();
  const [mode, setMode] = useState<TipeUjian>('penuh');
  const [kategori, setKategori] = useState<Kategori>('TWK');
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

  // Baca preferensi dari query string tanpa useSearchParams (aman untuk prerender).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const kategoriParam = params.get('kategori')?.toUpperCase();
    const modeParam = params.get('mode');

    if (kategoriParam === 'TWK' || kategoriParam === 'TIU' || kategoriParam === 'TKP') {
      setMode('kategori');
      setKategori(kategoriParam);
      const maks = SUBTES.find((s) => s.kode === kategoriParam)?.jumlah ?? 30;
      setJumlah(Math.min(20, maks));
    } else if (modeParam === 'kategori') {
      setMode('kategori');
    }
  }, []);

  if (!nama) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-muted">Memuat…</span>
      </div>
    );
  }

  const isPenuh = mode === 'penuh';
  const isPembahasan = ujianMode === 'pembahasan';
  const subtesAktif = SUBTES.find((s) => s.kode === kategori) ?? SUBTES[0];
  const maxJumlah = subtesAktif.jumlah;
  const jumlahFinal = Math.min(Math.max(jumlah || 1, 1), maxJumlah);
  const totalSoal = isPenuh ? 110 : jumlahFinal;
  const totalMenit = isPenuh ? 100 : Math.max(durasi || 1, 1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const attemptId = `attempt_${Date.now()}`;
    localStorage.setItem(
      `current_attempt_${attemptId}`,
      JSON.stringify({
        mode,
        kategori: isPenuh ? undefined : kategori,
        jumlah: isPenuh ? undefined : jumlahFinal,
        durasi: totalMenit,
        mulaiAt: new Date().toISOString(),
        ujianMode,
      }),
    );

    router.push(`/ujian/${attemptId}`);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader nama={nama} />

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-14 md:pt-10">
        <div className="mb-7">
          <p className="eyebrow">Siapkan sesi</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-[28px]">
            Mulai simulasi
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Pilih format dan mode pengerjaan. Soal diambil acak dari bank soal
            terverifikasi, jadi setiap sesi bisa berbeda.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-[#f6cfca] bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_320px] md:items-start">
          <div className="space-y-4">
            {/* Mode pengerjaan */}
            <section className="surface p-5 sm:p-6">
              <div className="mb-3">
                <h2 className="font-display text-base font-bold text-ink">Mode pengerjaan</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Mode pembahasan menampilkan kunci dan penjelasan setelah kamu menjawab.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    {
                      value: 'interaktif' as UjianMode,
                      judul: 'Ujian interaktif',
                      isi: 'Fokus mengerjakan. Nilai dan pembahasan muncul di akhir.',
                    },
                    {
                      value: 'pembahasan' as UjianMode,
                      judul: 'Mode pembahasan',
                      isi: 'Belajar sambil jalan. Kunci tampil setiap kali menjawab.',
                    },
                  ]
                ).map((opsi) => {
                  const aktif = ujianMode === opsi.value;
                  return (
                    <button
                      key={opsi.value}
                      type="button"
                      onClick={() => setUjianMode(opsi.value)}
                      className={cn(
                        'rounded-xl border p-4 text-left transition-colors',
                        aktif
                          ? 'border-brand bg-brand-soft'
                          : 'border-line bg-surface hover:border-line-strong',
                      )}
                      aria-pressed={aktif}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className={cn('text-sm font-semibold', aktif ? 'text-brand' : 'text-ink')}>
                          {opsi.judul}
                        </span>
                        <span
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded-full border',
                            aktif ? 'border-brand bg-brand' : 'border-line-strong bg-white',
                          )}
                        >
                          {aktif && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                      </span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-muted">
                        {opsi.isi}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Tipe sesi */}
            <section className="surface p-5 sm:p-6">
              <div className="mb-3">
                <h2 className="font-display text-base font-bold text-ink">Format sesi</h2>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    {
                      value: 'penuh' as TipeUjian,
                      judul: 'Simulasi penuh',
                      isi: '110 soal · 30 TWK, 35 TIU, 45 TKP',
                    },
                    {
                      value: 'kategori' as TipeUjian,
                      judul: 'Per subtes',
                      isi: 'Pilih satu subtes dan jumlah soal',
                    },
                  ]
                ).map((opsi) => {
                  const aktif = mode === opsi.value;
                  return (
                    <button
                      key={opsi.value}
                      type="button"
                      onClick={() => setMode(opsi.value)}
                      className={cn(
                        'rounded-xl border p-4 text-left transition-colors',
                        aktif
                          ? 'border-brand bg-brand-soft'
                          : 'border-line bg-surface hover:border-line-strong',
                      )}
                      aria-pressed={aktif}
                    >
                      <span className={cn('text-sm font-semibold', aktif ? 'text-brand' : 'text-ink')}>
                        {opsi.judul}
                      </span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-muted">
                        {opsi.isi}
                      </span>
                    </button>
                  );
                })}
              </div>

              {!isPenuh && (
                <div className="mt-5 space-y-4 border-t border-line pt-5">
                  <div>
                    <span className="field-label">Subtes</span>
                    <div className="grid grid-cols-3 gap-2">
                      {SUBTES.map((s) => {
                        const aktif = kategori === s.kode;
                        return (
                          <button
                            key={s.kode}
                            type="button"
                            onClick={() => {
                              setKategori(s.kode);
                              setJumlah((prev) => Math.min(prev, s.jumlah));
                            }}
                            className={cn(
                              'rounded-xl border px-2 py-3 text-center transition-colors',
                              aktif
                                ? 'border-brand bg-brand text-white'
                                : 'border-line bg-surface text-ink hover:border-line-strong',
                            )}
                            aria-pressed={aktif}
                          >
                            <span className="block font-display text-sm font-bold">{s.kode}</span>
                            <span
                              className={cn(
                                'mt-0.5 block text-[10px]',
                                aktif ? 'text-white/70' : 'text-muted-soft',
                              )}
                            >
                              {s.jumlah} soal
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="jumlah" className="field-label">
                        Jumlah soal
                      </label>
                      <input
                        id="jumlah"
                        type="number"
                        min={1}
                        max={maxJumlah}
                        value={jumlah}
                        onChange={(e) => setJumlah(Number(e.target.value) || 1)}
                        onBlur={() => setJumlah(jumlahFinal)}
                        className="field"
                      />
                      <p className="mt-1 text-[11px] text-muted-soft">
                        Maksimal {maxJumlah} soal untuk {kategori}.
                      </p>
                    </div>
                    <div>
                      <label htmlFor="durasi" className="field-label">
                        Durasi (menit)
                      </label>
                      <input
                        id="durasi"
                        type="number"
                        min={1}
                        value={durasi}
                        onChange={(e) => setDurasi(Number(e.target.value) || 1)}
                        className="field"
                      />
                      <p className="mt-1 text-[11px] text-muted-soft">
                        Timer belum menghentikan ujian otomatis.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isPenuh && (
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-4 text-xs text-muted">
                  <span>30 TWK</span>
                  <span className="text-line-strong">·</span>
                  <span>35 TIU</span>
                  <span className="text-line-strong">·</span>
                  <span>45 TKP</span>
                  <span className="text-line-strong">·</span>
                  <span>100 menit</span>
                </div>
              )}
            </section>
          </div>

          {/* Ringkasan */}
          <aside className="surface overflow-hidden md:sticky md:top-20">
            <div className="border-b border-line bg-surface-muted px-5 py-4">
              <p className="eyebrow">Ringkasan sesi</p>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Format</span>
                <span className="font-semibold text-ink">
                  {isPenuh ? 'Simulasi penuh' : `Latihan ${kategori}`}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Jumlah soal</span>
                <span className="font-semibold text-ink">{totalSoal} soal</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Durasi</span>
                <span className="font-semibold text-ink">{totalMenit} menit</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Mode</span>
                <span className={cn('chip', isPembahasan ? 'chip-gold' : 'chip-brand')}>
                  {isPembahasan ? 'Pembahasan' : 'Interaktif'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Skor maksimal</span>
                <span className="font-semibold text-ink">{totalSoal * 5}</span>
              </div>
            </div>

            <div className="border-t border-line px-5 py-4">
              <button
                type="submit"
                disabled={loading}
                className={cn('btn btn-block btn-lg', isPembahasan ? 'btn-gold' : 'btn-primary')}
              >
                {loading ? 'Memulai…' : isPembahasan ? 'Mulai pembahasan' : 'Mulai ujian'}
              </button>
              <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted-soft">
                Pastikan koneksi stabil. Jawaban dinilai di server.
              </p>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}
