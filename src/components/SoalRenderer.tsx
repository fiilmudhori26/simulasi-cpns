'use client';

import { useState, useEffect } from 'react';
import { Soal } from '@/data/soal';
import { cn } from '@/lib/utils';

interface SoalRendererProps {
  soal: Soal;
  soalKe: number;
  totalSoal: number;
  onJawab: (soalId: string, pilihan: string) => void;
  jawabanUser?: Record<string, string>;
  showHasil?: boolean;
}

export default function SoalRenderer({
  soal,
  soalKe,
  totalSoal,
  onJawab,
  jawabanUser,
  showHasil = false,
}: SoalRendererProps) {
  const [pilihanDipilih, setPilihanDipilih] = useState<string | null>(null);

  useEffect(() => {
    // Set jawaban user yang sudah ada
    setPilihanDipilih(jawabanUser?.[soal.id] || null);
  }, [jawabanUser, soal.id]);

  const handlePilih = (kode: string) => {
    if (showHasil) return;
    setPilihanDipilih(kode);
    onJawab(soal.id, kode);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-slate-600 mb-2">
          <span>Soal {soalKe} dari {totalSoal}</span>
          <span>{soal.kategori}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(soalKe / totalSoal) * 100}%` }}
          />
        </div>
      </div>

      {/* Soal */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Soal {soalKe}: {soal.subkategori}
        </h2>
        <div className="text-base text-slate-700">
          {soal.teks_soal}
        </div>
      </div>

      {/* Pilihan Jawaban */}
      <div className="space-y-3">
        {soal.opsi.map((opsi) => {
          const isDipilih = pilihanDipilih === opsi.kode;
          const isBenar = showHasil && opsi.kode === soal.kunci;
          const isSalah = showHasil && jawabanUser?.[soal.id] && opsi.kode === jawabanUser[soal.id] && !isBenar;

          return (
            <button
              key={opsi.kode}
              type="button"
              onClick={() => handlePilih(opsi.kode)}
              disabled={showHasil}
              className={cn(
                'w-full text-left p-4 rounded-lg border transition-all',
                'flex items-start gap-3',
                !showHasil
                  ? isDipilih
                    ? 'bg-blue-50 border-blue-400 shadow-sm'
                    : 'border-slate-300 hover:bg-slate-50'
                  : isBenar
                    ? 'bg-green-50 border-green-400'
                    : isSalah
                      ? 'bg-red-50 border-red-400'
                      : 'border-slate-200 bg-slate-50',
              )}
            >
              <div className="flex items-start gap-3">
                <span className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border text-sm font-semibold',
                  isDipilih ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-slate-300 bg-slate-50 text-slate-600',
                  isBenar && 'border-green-500 bg-green-100 text-green-800',
                  isSalah && 'border-red-500 bg-red-100 text-red-800',
                )}
                >
                  {opsi.kode}
                </span>
                <span className={cn(
                  'text-sm',
                  isDipilih && !showHasil ? 'text-slate-800' : 'text-slate-700',
                  isBenar ? 'text-green-800 font-semibold' : '',
                  isSalah ? 'text-red-800 font-semibold' : '',
                )}>
                  {opsi.teks}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info kunci (hanya di hasil) */}
      {showHasil && (
        <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Kunci jawaban:</span> Pilihan {soal.kunci}
          </p>
        </div>
      )}
    </div>
  );
}