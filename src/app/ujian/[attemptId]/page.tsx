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
    return <div className="min-h-screen flex items-center justify-center">Memuat soal...</div>;
  }

  if (soalList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <p className="text-slate-700 font-medium mb-2">Bank soal belum tersedia.</p>
          <p className="text-sm text-slate-500 mb-4">
            Belum ada soal terverifikasi. Hubungi admin untuk mengimpor dan memverifikasi soal.
          </p>
          <button
            onClick={() => router.push('/ujian/mulai')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
          >
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
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div>
          <p className="text-red-600 mb-2">Error: Soal tidak valid</p>
          <button
            onClick={() => router.push('/ujian/mulai')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Kembali ke Mulai Ujian
          </button>
        </div>
      </div>
    );
  }

  const jawabanSoalIni = jawabanUser[soal.id];
  const showPembahasan = isPembahasan && !!jawabanSoalIni;
  // Di mode pembahasan, jawaban dikunci setelah dipilih (agar kunci bisa ditampilkan).
  const terkunci = isPembahasan && !!jawabanSoalIni;
  const isTerakhir = soalSaatIni >= soalList.length - 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 py-6">
        {isPembahasan && (
          <div className="mb-4 p-3 bg-purple-100 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span className="text-sm font-medium text-purple-800">Mode Pembahasan Aktif</span>
            </div>
            <p className="mt-1 text-xs text-purple-700">Pilih jawabanmu untuk melihat kunci dan penjelasan</p>
          </div>
        )}

        {sumber === 'contoh' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Catatan:</span> bank soal terverifikasi masih kosong,
              sehingga ditampilkan soal contoh. Soal asli akan tampil setelah diimpor dan diverifikasi admin.
            </p>
          </div>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Soal {soalSaatIni + 1} dari {soalList.length}</span>
            <span>{soal.kategori}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((soalSaatIni + 1) / soalList.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Soal */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Soal {soalSaatIni + 1}: {soal.subkategori}
          </h2>
          <div className="text-base text-slate-700 mb-4 whitespace-pre-line">{soal.teks_soal}</div>

          {/* Pilihan Jawaban */}
          <div className="space-y-3">
            {soal.opsi.map((opsi) => {
              const isDipilih = jawabanSoalIni === opsi.kode;
              const isBenar = showPembahasan && opsi.kode === soal.kunci;
              const isSalah =
                showPembahasan && isDipilih && opsi.kode !== soal.kunci;

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
                    'w-full text-left p-4 rounded-lg border transition-all flex items-start gap-3',
                    showPembahasan
                      ? isBenar
                        ? 'bg-green-50 border-green-300 text-green-800 font-medium'
                        : isSalah
                          ? 'bg-red-50 border-red-300 text-red-800 font-semibold'
                          : 'border-slate-200 bg-slate-50'
                      : isDipilih
                        ? 'bg-blue-50 border-blue-300 text-blue-900'
                        : 'border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <span className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border text-sm font-semibold shrink-0',
                    showPembahasan
                      ? isBenar
                        ? 'border-green-500 bg-green-100 text-green-800'
                        : isSalah
                          ? 'border-red-500 bg-red-100 text-red-800'
                          : 'border-slate-300 bg-slate-50 text-slate-600'
                      : isDipilih
                        ? 'border-blue-500 bg-blue-100 text-blue-800'
                        : 'border-slate-300 bg-slate-50 text-slate-600',
                  )}>
                    {opsi.kode}
                  </span>
                  <span className={cn(
                    'text-sm',
                    showPembahasan && isBenar && 'text-green-800 font-semibold',
                    showPembahasan && isSalah && 'text-red-800 font-semibold',
                    !showPembahasan && 'text-slate-700',
                  )}>
                    {opsi.teks}
                    {showPembahasan && soal.kategori === 'TKP' && typeof opsi.poin === 'number' && (
                      <span className="ml-2 inline-block rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                        skor {opsi.poin}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {showPembahasan && soal.kategori !== 'TKP' && (
            <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Kunci jawaban:</span> Pilihan {soal.kunci}
              </p>
            </div>
          )}

          {showPembahasan && soal.kategori === 'TKP' && (
            <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Skor jawabanmu:</span>{' '}
                {soal.opsi.find((o) => o.kode === jawabanSoalIni)?.poin ?? 0} poin.
                Soal TKP tidak memiliki satu kunci; setiap opsi bernilai 1–5.
              </p>
            </div>
          )}
        </div>

        {/* Info pembahasan */}
        {showPembahasan && soal.pembahasan && (
          <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 text-sm font-bold">
                  💡
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-purple-900 mb-1">Penjelasan Jawaban</h3>
                <p className="text-sm text-purple-800 leading-relaxed whitespace-pre-line">
                  {soal.pembahasan}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Keluar
          </button>

          {!isTerakhir ? (
            <button
              onClick={() => setSoalSaatIni((prev) => prev + 1)}
              disabled={!jawabanSoalIni && !isPembahasan}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium text-white transition-all rounded-md',
                jawabanSoalIni || isPembahasan
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-slate-300 cursor-not-allowed',
              )}
            >
              Lanjut
            </button>
          ) : (
            <button
              onClick={selesaikanUjian}
              disabled={menyelesaikan || (!jawabanSoalIni && !isPembahasan)}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium text-white rounded-md transition-all',
                menyelesaikan || (!jawabanSoalIni && !isPembahasan)
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700',
              )}
            >
              {menyelesaikan ? 'Menghitung nilai...' : 'Selesai & Lihat Hasil'}
            </button>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-500 text-center">
          Terjawab: {Object.keys(jawabanUser).length} dari {soalList.length} soal
        </p>
      </main>
    </div>
  );
}
