'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRandomSoal } from '@/data/soal';
import { cn } from '@/lib/utils';

type Kategori = 'TWK' | 'TIU' | 'TKP';

interface SoalUjian {
  id: string;
  kategori: Kategori;
  subkategori: string;
  teks_soal: string;
  opsi: { kode: string; teks: string; poin?: number }[];
  kunci?: string;
  pembahasan?: string;
  tingkat_kesulitan: number;
  sumber?: 'db' | 'mock';
}

interface AttemptLokal {
  mode?: 'penuh' | 'kategori';
  kategori?: Kategori;
  jumlah?: number;
  durasi?: number;
  mulaiAt?: string;
  ujianMode?: 'interaktif' | 'pembahasan';
}

// Template soal (hanya jika data attempt tidak lengkap)
const SAMPLE_SOAL: SoalUjian = {
  id: 'twk-001',
  kategori: 'TWK',
  subkategori: 'Pancasila',
  teks_soal: 'Nilai dasar yang paling menonjol dalam sila keempat Pancasila adalah ...',
  opsi: [
    { kode: 'A', teks: 'Ketuhanan Yang Maha Esa' },
    { kode: 'B', teks: 'Kemanusiaan yang adil dan beradab' },
    { kode: 'C', teks: 'Persatuan Indonesia' },
    { kode: 'D', teks: 'Kerakyatan yang dipimpin oleh hikmat' },
  ],
  kunci: 'A',
  tingkat_kesulitan: 1,
  pembahasan: 'Sila keempat Pancasila menekankan musyawarah untuk mufakat sebagai nilai dasar.',
};

const TINGKAT_LABEL = ['', 'Mudah', 'Sedang', 'Sulit'];

export default function AttemptPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [nama, setNama] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<AttemptLokal | null>(null);
  const [soalList, setSoalList] = useState<SoalUjian[]>([]);
  const [soalSaatIni, setSoalSaatIni] = useState(0);
  const [jawabanUser, setJawabanUser] = useState<Record<string, string>>({});
  const [sumber, setSumber] = useState<'db' | 'contoh'>('contoh');
  const [menyelesaikan, setMenyelesaikan] = useState(false);
  const [error, setError] = useState('');

  // Redirect if no nama
  useEffect(() => {
    const storedNama = localStorage.getItem('user_nama');
    if (!storedNama) {
      router.push('/nama');
      return;
    }
    setNama(storedNama);
  }, [router]);

  // Muat attempt + soal
  useEffect(() => {
    let batal = false;

    async function muat() {
      const attemptData = localStorage.getItem(`current_attempt_${attemptId}`);
      if (!attemptData) {
        router.push('/ujian/mulai');
        return;
      }

      let parsed: AttemptLokal;
      try {
        parsed = JSON.parse(attemptData) as AttemptLokal;
      } catch {
        router.push('/ujian/mulai');
        return;
      }
      if (batal) return;
      setAttempt(parsed);

      // Tanpa konfigurasi mode: tampilkan contoh
      if (!parsed.mode) {
        setSoalList([SAMPLE_SOAL]);
        setLoading(false);
        return;
      }

      const query = new URLSearchParams();
      query.set('mode', parsed.ujianMode === 'pembahasan' ? 'pembahasan' : 'interaktif');
      if (parsed.mode === 'kategori' && parsed.kategori) {
        query.set('mode_ujian', 'kategori');
        query.set('kategori', parsed.kategori);
        query.set('jumlah', String(parsed.jumlah ?? 10));
      } else {
        query.set('mode_ujian', 'penuh');
      }

      try {
        const res = await fetch(`/api/soal?${query.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          sumber?: 'db+contoh' | 'contoh';
          soal?: SoalUjian[];
        };
        if (!data.soal || data.soal.length === 0) {
          throw new Error('Bank soal kosong');
        }
        if (batal) return;
        setSoalList(data.soal);
        setSumber(data.sumber === 'db+contoh' ? 'db' : 'contoh');
      } catch (err) {
        if (batal) return;
        console.warn('Gagal memuat soal dari bank soal, memakai contoh:', err);
        // Fallback terakhir: soal contoh lokal
        let cadangan: SoalUjian[] = [];
        if (parsed.mode === 'kategori' && parsed.kategori) {
          cadangan = getRandomSoal(parsed.kategori, parsed.jumlah || 10);
        } else {
          cadangan = [
            ...getRandomSoal('TWK', 10),
            ...getRandomSoal('TIU', 15),
            ...getRandomSoal('TKP', 15),
          ];
        }
        setSoalList(cadangan as SoalUjian[]);
        setSumber('contoh');
      } finally {
        if (!batal) setLoading(false);
      }
    }

    muat();
    return () => {
      batal = true;
    };
  }, [attemptId, router]);

  const hitungSkorLokal = useCallback(() => {
    let skorTWK = 0;
    let skorTIU = 0;
    let skorTKP = 0;
    let jumlahBenar = 0;

    soalList.forEach((s) => {
      const dipilih = jawabanUser[s.id];
      if (!dipilih) return;
      if (s.kategori === 'TWK' || s.kategori === 'TIU') {
        if (s.kunci && dipilih === s.kunci) {
          jumlahBenar += 1;
          if (s.kategori === 'TWK') skorTWK += 5;
          else skorTIU += 5;
        }
      } else {
        const poin = s.opsi.find((o) => o.kode === dipilih)?.poin ?? 0;
        skorTKP += poin;
        if (poin > 0) jumlahBenar += 1;
      }
    });

    return { skorTWK, skorTIU, skorTKP, skorTotal: skorTWK + skorTIU + skorTKP, jumlahBenar };
  }, [soalList, jawabanUser]);

  const selesaikanUjian = useCallback(async () => {
    if (menyelesaikan) return;
    setMenyelesaikan(true);
    setError('');

    let nilai = hitungSkorLokal();
    try {
      const res = await fetch('/api/nilai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jawaban: jawabanUser }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      nilai = (await res.json()) as typeof nilai;
    } catch (err) {
      console.warn('Gagal menilai di server:', err);
      // Tanpa kunci di klien (mode ujian), skor lokal tidak bisa dihitung.
      if (soalList.some((s) => !s.kunci)) {
        setMenyelesaikan(false);
        setError('Gagal menghitung nilai. Periksa koneksi lalu coba lagi.');
        return;
      }
    }

    const jumlah = (kategori: Kategori) =>
      soalList.filter((s) => s.kategori === kategori).length;

    const hasilData = {
      attemptId,
      nama,
      mulaiAt: attempt?.mulaiAt,
      selesaiAt: new Date().toISOString(),
      soal: soalList.length,
      jumlahTWK: jumlah('TWK'),
      jumlahTIU: jumlah('TIU'),
      jumlahTKP: jumlah('TKP'),
      skorTWK: nilai.skorTWK,
      skorTIU: nilai.skorTIU,
      skorTKP: nilai.skorTKP,
      skorTotal: nilai.skorTotal,
      jumlahBenar: nilai.jumlahBenar,
      jawaban: jawabanUser,
      kategori: attempt?.kategori,
      ujianMode: attempt?.ujianMode,
    };

    localStorage.setItem(`hasil_attempt_${attemptId}`, JSON.stringify(hasilData));
    router.push(`/ujian/${attemptId}/hasil`);
  }, [menyelesaikan, hitungSkorLokal, jawabanUser, soalList, attemptId, nama, attempt, router]);

  if (loading || !nama) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-muted">Memuat soal…</span>
      </div>
    );
  }

  if (soalList.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="surface max-w-md p-8 text-center">
          <p className="font-display text-base font-bold text-ink">Bank soal belum tersedia</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Belum ada soal terverifikasi. Hubungi admin untuk mengimpor dan memverifikasi soal.
          </p>
          <button onClick={() => router.push('/ujian/mulai')} className="btn btn-primary mt-5">
            Kembali ke Mulai Ujian
          </button>
        </div>
      </div>
    );
  }

  const soal = soalList[soalSaatIni];
  const isPembahasan = attempt?.ujianMode === 'pembahasan';

  if (!soal || !soal.opsi?.length) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="surface max-w-md p-8 text-center">
          <p className="font-display text-base font-bold text-ink">Soal tidak valid</p>
          <button onClick={() => router.push('/ujian/mulai')} className="btn btn-primary mt-5">
            Kembali ke Mulai Ujian
          </button>
        </div>
      </div>
    );
  }

  const jawabanSoalIni = jawabanUser[soal.id];
  const showPembahasan = isPembahasan && !!jawabanSoalIni;
  // TKP tidak punya satu kunci: setiap opsi bernilai 1–5.
  const isTKP = soal.kategori === 'TKP';
  // Di mode pembahasan, jawaban dikunci setelah dipilih (agar kunci bisa ditampilkan).
  const terkunci = isPembahasan && !!jawabanSoalIni;
  const isTerakhir = soalSaatIni >= soalList.length - 1;
  const jumlahTerjawab = Object.keys(jawabanUser).length;
  const progres = ((soalSaatIni + 1) / soalList.length) * 100;

  return (
    <div className="min-h-screen bg-canvas">
      {/* Bilah atas ringkas */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 sm:px-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-ink"
            aria-label="Keluar dari ujian"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-brand text-[10px] font-extrabold text-white">
              SKD
            </span>
            <span className="hidden sm:inline">Keluar</span>
          </button>

          <div className="flex flex-1 items-center gap-3">
            <div className="progress flex-1">
              <div className="progress-bar" style={{ width: `${progres}%` }} />
            </div>
            <span className="shrink-0 font-display text-xs font-bold tabular-nums text-ink">
              {soalSaatIni + 1}
              <span className="font-medium text-muted-soft">/{soalList.length}</span>
            </span>
          </div>

          <span className={cn('chip', isPembahasan ? 'chip-gold' : 'chip-brand')}>
            {isPembahasan ? 'Pembahasan' : soal.kategori}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-36 pt-5 sm:px-6 sm:pt-8">
        {isPembahasan && (
          <div className="mb-4 rounded-xl border border-[#f7e3c2] bg-gold-soft px-4 py-3 text-xs text-gold-ink">
            <span className="font-semibold">Mode pembahasan aktif.</span> Kunci dan penjelasan
            muncul setelah kamu memilih jawaban.
          </div>
        )}

        {sumber === 'contoh' && (
          <div className="mb-4 rounded-xl border border-[#f7e3c2] bg-warning-soft px-4 py-3 text-xs leading-relaxed text-warning">
            <span className="font-semibold">Catatan:</span> bank soal terverifikasi belum
            tersedia, sehingga ditampilkan soal contoh.
          </div>
        )}

        {/* Kartu soal */}
        <article className="surface p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip chip-brand">{soal.kategori}</span>
            <span className="chip chip-muted">{soal.subkategori}</span>
            {soal.tingkat_kesulitan > 0 && (
              <span className="chip chip-muted">
                {TINGKAT_LABEL[soal.tingkat_kesulitan] ?? 'Sedang'}
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-lg font-semibold leading-relaxed text-ink sm:text-xl">
            <span className="mr-2 text-muted-soft">{soalSaatIni + 1}.</span>
            <span className="whitespace-pre-line">{soal.teks_soal}</span>
          </h1>

          {/* Pilihan jawaban */}
          <div className="mt-5 space-y-2.5">
            {soal.opsi.map((opsi) => {
              const isDipilih = jawabanSoalIni === opsi.kode;
              const isBenar = showPembahasan && !isTKP && opsi.kode === soal.kunci;
              const isSalah = showPembahasan && !isTKP && isDipilih && opsi.kode !== soal.kunci;

              return (
                <button
                  key={opsi.kode}
                  type="button"
                  onClick={() => {
                    if (terkunci) return;
                    setJawabanUser((prev) => ({ ...prev, [soal.id]: opsi.kode }));
                  }}
                  disabled={terkunci}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors sm:p-4',
                    showPembahasan
                      ? isBenar
                        ? 'border-[#c6ecdd] bg-success-soft'
                        : isSalah
                          ? 'border-[#f6cfca] bg-danger-soft'
                          : isDipilih
                            ? 'border-brand bg-brand-soft'
                            : 'border-line bg-surface-muted'
                      : isDipilih
                        ? 'border-brand bg-brand-soft'
                        : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted',
                    terkunci && 'cursor-default',
                  )}
                  aria-pressed={isDipilih}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold',
                      showPembahasan
                        ? isBenar
                          ? 'border-success bg-success text-white'
                          : isSalah
                            ? 'border-danger bg-danger text-white'
                            : isDipilih
                              ? 'border-brand bg-brand text-white'
                              : 'border-line-strong bg-white text-muted'
                        : isDipilih
                          ? 'border-brand bg-brand text-white'
                          : 'border-line-strong bg-white text-muted',
                    )}
                  >
                    {opsi.kode}
                  </span>
                  <span className="flex-1 pt-0.5 text-sm leading-relaxed text-ink-soft">
                    {opsi.teks}
                    {showPembahasan && soal.kategori === 'TKP' && typeof opsi.poin === 'number' && (
                      <span className="ml-2 inline-block rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold text-muted ring-1 ring-line">
                        skor {opsi.poin}
                      </span>
                    )}
                  </span>
                  {showPembahasan && isBenar && (
                    <span className="mt-0.5 shrink-0 text-[11px] font-semibold text-success">
                      Benar
                    </span>
                  )}
                  {isTKP && isDipilih && (
                    <span className="mt-0.5 shrink-0 text-[11px] font-semibold text-brand">
                      Dipilih
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {showPembahasan && soal.kategori !== 'TKP' && (
            <div className="mt-4 rounded-xl border border-line bg-surface-muted px-4 py-3 text-xs text-muted">
              <span className="font-semibold text-ink">Kunci jawaban:</span> Pilihan {soal.kunci}
            </div>
          )}

          {showPembahasan && soal.kategori === 'TKP' && (
            <div className="mt-4 rounded-xl border border-line bg-surface-muted px-4 py-3 text-xs leading-relaxed text-muted">
              <span className="font-semibold text-ink">Skor jawabanmu:</span>{' '}
              {soal.opsi.find((o) => o.kode === jawabanSoalIni)?.poin ?? 0} poin. Soal TKP tidak
              memiliki satu kunci; setiap opsi bernilai 1–5.
            </div>
          )}
        </article>

        {/* Pembahasan */}
        {showPembahasan && soal.pembahasan && (
          <div className="mt-4 rounded-[18px] border border-line bg-surface p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-soft text-gold-ink">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18h6" />
                  <path d="M10 21h4" />
                  <path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" />
                </svg>
              </span>
              <div>
                <h2 className="font-display text-sm font-bold text-ink">Pembahasan</h2>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {soal.pembahasan}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-[#f6cfca] bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Bilah aksi */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <span className="hidden text-xs text-muted sm:block">
              Terjawab <span className="font-semibold text-ink">{jumlahTerjawab}</span> dari{' '}
              {soalList.length}
            </span>

            <div className="ml-auto flex flex-1 items-center gap-2 sm:flex-none">
              <button
                type="button"
                onClick={() => setSoalSaatIni((prev) => Math.max(0, prev - 1))}
                disabled={soalSaatIni === 0}
                className="btn btn-secondary"
              >
                Sebelumnya
              </button>

              {!isTerakhir ? (
                <button
                  type="button"
                  onClick={() => setSoalSaatIni((prev) => prev + 1)}
                  disabled={!jawabanSoalIni && !isPembahasan}
                  className="btn btn-primary flex-1 sm:flex-none"
                >
                  Lanjut
                </button>
              ) : (
                <button
                  type="button"
                  onClick={selesaikanUjian}
                  disabled={menyelesaikan || (!jawabanSoalIni && !isPembahasan)}
                  className="btn btn-primary flex-1 sm:flex-none"
                >
                  {menyelesaikan ? 'Menghitung nilai…' : 'Selesai & lihat hasil'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
