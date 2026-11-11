'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRandomSoal, Soal } from '@/data/soal';
import { cn } from '@/lib/utils';

// Template soal
const SAMPLE_SOAL: Soal = {
  id: 'twk-001',
  kategori: 'TWK',
  subkategori: 'Pancasila',
  teks_soal: 'Nilai dasar yang paling menonjol dalam sila keempat Pancasila adalah ...',
  opsi: [
    { kode: 'A', teks: 'Ketuhanan Yang Maha Esa', poin: 1 },
    { kode: 'B', teks: 'Kemanusiaan yang adil dan beradab', poin: 1 },
    { kode: 'C', teks: 'Persatuan Indonesia', poin: 1 },
    { kode: 'D', teks: 'Kerakyatan yang dipimpin oleh hikmat', poin: 1 },
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
  const [attempt, setAttempt] = useState<any>(null);
  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [soalSaatIni, setSoalSaatIni] = useState(0);
  const [jawabanUser, setJawabanUser] = useState<Record<string, string>>({});
  const [showHasil, setShowHasil] = useState(false);

  // Redirect if no nama
  useEffect(() => {
    const storedNama = localStorage.getItem('user_nama');
    if (!storedNama) {
      router.push('/nama');
      return;
    }
    setNama(storedNama);
  }, [router]);

  // Load attempt data - useEffect #1
  useEffect(() => {
    const attemptData = localStorage.getItem(`current_attempt_${attemptId}`);
    if (!attemptData) {
      router.push('/ujian/mulai');
      return;
    }

    const parsed = JSON.parse(attemptData);
    setAttempt(parsed);

    // Generate soal
    let soal: Soal[] = [];
    if (!parsed.mode) {
      soal = [SAMPLE_SOAL];
    } else if (parsed.mode === 'kategori' && parsed.kategori) {
      soal = getRandomSoal(parsed.kategori as 'TWK' | 'TIU' | 'TKP', parsed.jumlah || 10);
    } else {
      const twkSoal = getRandomSoal('TWK', 10);
      const tiuSoal = getRandomSoal('TIU', 15);
      const tkpSoal = getRandomSoal('TKP', 15);
      soal = [...twkSoal, ...tiuSoal, ...tkpSoal];
    }

    setSoalList(soal);
    setLoading(false);
  }, [attemptId, router]);

  const handleLanjut = useCallback(() => {
    if (soalSaatIni < soalList.length - 1) {
      setSoalSaatIni((prev) => prev + 1);
    } else {
      // Hitung skor
      let skorTWK = 0, skorTIU = 0, skorTKP = 0;
      soalList.forEach((s) => {
        const userAns = jawabanUser[s.id];
        if (userAns && s.kunci === userAns) {
          if (s.kategori === 'TWK') skorTWK += s.opsi.find(o => o.kode === s.kunci)?.poin || 1;
          if (s.kategori === 'TIU') skorTIU += s.opsi.find(o => o.kode === s.kunci)?.poin || 1;
          if (s.kategori === 'TKP') skorTKP += s.opsi.find(o => o.kode === s.kunci)?.poin || 1;
        }
      });

      const hasilData = {
        attemptId,
        nama,
        mulaiAt: attempt?.mulaiAt,
        selesaiAt: new Date().toISOString(),
        soal: soalList.length,
        skorTWK,
        skorTIU,
        skorTKP,
        skorTotal: skorTWK + skorTIU + skorTKP,
        jawaban: jawabanUser,
        kategori: attempt?.kategori,
        ujianMode: attempt?.ujianMode,
      };
      localStorage.setItem(`hasil_attempt_${attemptId}`, JSON.stringify(hasilData));
      router.push(`/ujian/${attemptId}/hasil`);
    }
  }, [soalSaatIni, soalList.length, jawabanUser, soalList, attemptId, nama, attempt, router]);

  if (loading || !nama) {
    return <div className="min-h-screen flex items-center justify-center">Memuat soal...</div>;
  }

  if (soalList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Sedang memuat soal...</p>
      </div>
    );
  }

  const soal = soalList[soalSaatIni];
  const isPembahasan = attempt?.ujianMode === 'pembahasan';
  const showPembahasan = isPembahasan && jawabanUser[soal.id] && !showHasil;

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

  // Render soal
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Mode indicator untuk pembahasan */}
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
          <div className="text-base text-slate-700 mb-4">{soal.teks_soal}</div>

          {/* Pilihan Jawaban */}
          <div className="space-y-3">
            {soal.opsi.map((opsi) => {
              const isDipilih = jawabanUser[soal.id] === opsi.kode;
              const isBenar = (showHasil || showPembahasan) && opsi.kode === soal.kunci;
              // Di mode pembahasan, isSalah juga berlaku (warna merah lebih tajam)
              const isSalah = (showHasil || (showPembahasan && jawabanUser[soal.id])) && jawabanUser[soal.id] && opsi.kode === jawabanUser[soal.id] && !isBenar;

              return (
                <button
                  key={opsi.kode}
                  type="button"
                  onClick={() => !showHasil && jawabanUser[soal.id] !== opsi.kode && setJawabanUser(prev => ({ ...prev, [soal.id]: opsi.kode }))}
                  disabled={showHasil || !!jawabanUser[soal.id]}
                  className={`w-full text-left p-4 rounded-lg border transition-all flex items-start gap-3 ${
                    !showHasil
                      ? isDipilih
                        ? 'bg-blue-50 border-blue-300 text-blue-900'
                        : 'border-slate-300 hover:bg-slate-50'
                      : isBenar
                        ? 'bg-green-50 border-green-300 text-green-800 font-medium'
                        : isSalah
                          ? 'bg-red-50 border-red-300 text-red-800 font-semibold'
                          : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <span className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full border text-sm font-semibold',
                      isDipilih && !showHasil && 'border-blue-500 bg-blue-100 text-blue-800',
                      isBenar && 'border-green-500 bg-green-100 text-green-800',
                      isSalah && 'border-red-500 bg-red-100 text-red-800',
                      !isDipilih && !isBenar && !isSalah && 'border-slate-300 bg-slate-50 text-slate-600',
                    )}>
                    {opsi.kode}
                  </span>
                  <span className={cn(
                    'text-sm',
                    isDipilih && !showHasil ? 'text-slate-800' : 'text-slate-700',
                    isBenar && 'text-green-800 font-semibold',
                    isSalah && 'text-red-800 font-semibold',
                  )}>
                    {opsi.teks}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Info kunci (hanya di hasil) */}
          {(showHasil || showPembahasan) && (
            <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Kunci jawaban:</span> Pilihan {soal.kunci}
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
                <h3 className="text-sm font-semibold text-purple-900 mb-1">
                  Penjelasan Jawaban
                </h3>
                <p className="text-sm text-purple-800 leading-relaxed">
                  {soal.pembahasan}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Kembali
          </button>

          {soalSaatIni < soalList.length - 1 ? (
            <button
              onClick={handleLanjut}
              disabled={!jawabanUser[soal.id] && !isPembahasan}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white transition-all rounded-md ${
                (jawabanUser[soal.id] || isPembahasan)
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              {isPembahasan ? 'Lanjut' : 'Lanjut'}
            </button>
          ) : (
            <button
              onClick={() => setShowHasil(true)}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
            >
              Lihat Hasil
            </button>
          )}
        </div>
      </main>
    </div>
  );
}