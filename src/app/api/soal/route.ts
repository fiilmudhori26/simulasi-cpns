import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db/index';
import { questions } from '@/db/schema';
import { SOAL_TWK, SOAL_TIU, SOAL_TKP, type Soal } from '@/data/soal';

export const dynamic = 'force-dynamic';

type Kategori = 'TWK' | 'TIU' | 'TKP';

const MOCK: Record<Kategori, Soal[]> = {
  TWK: SOAL_TWK,
  TIU: SOAL_TIU,
  TKP: SOAL_TKP,
};

const PEMBAGIAN_PENUH: Record<Kategori, number> = { TWK: 30, TIU: 35, TKP: 45 };

interface OpsiDb {
  kode: string;
  teks: string;
  poin: number;
}

interface SoalPublik {
  id: string;
  kategori: Kategori;
  subkategori: string;
  teks_soal: string;
  opsi: { kode: string; teks: string; poin?: number }[];
  kunci?: string;
  pembahasan?: string;
  tingkat_kesulitan: number;
  sumber: 'db' | 'mock';
}

function acak<T>(arr: T[]): T[] {
  const hasil = [...arr];
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
  }
  return hasil;
}

async function ambilDariDb(kategori: Kategori, limit: number) {
  if (limit <= 0) return [];
  const rows = await db
    .select()
    .from(questions)
    .where(
      and(
        eq(questions.status, 'terverifikasi'),
        eq(questions.kategori, kategori),
      ),
    );
  return acak(rows).slice(0, limit);
}

function formatSoal(
  soal: {
    id: string;
    kategori: string;
    subkategori: string;
    teks_soal: string;
    opsi: unknown;
    kunci?: string | null;
    pembahasan?: string | null;
    tingkat_kesulitan: number;
  },
  sumber: 'db' | 'mock',
  mode: 'interaktif' | 'pembahasan',
): SoalPublik {
  const opsi = (Array.isArray(soal.opsi) ? soal.opsi : []) as OpsiDb[];
  return {
    id: soal.id,
    kategori: soal.kategori as Kategori,
    subkategori: soal.subkategori,
    teks_soal: soal.teks_soal,
    opsi: opsi.map((o) => ({
      kode: o.kode,
      teks: o.teks,
      ...(mode === 'pembahasan' ? { poin: o.poin } : {}),
    })),
    ...(mode === 'pembahasan'
      ? { kunci: soal.kunci ?? undefined, pembahasan: soal.pembahasan ?? undefined }
      : {}),
    tingkat_kesulitan: soal.tingkat_kesulitan,
    sumber,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('mode') === 'pembahasan' ? 'pembahasan' : 'interaktif';
  const modeUjian = searchParams.get('mode_ujian') === 'kategori' ? 'kategori' : 'penuh';
  const kategoriParam = searchParams.get('kategori') as Kategori | null;
  const jumlahParam = Number(searchParams.get('jumlah') ?? 0);

  let target: Record<Kategori, number>;
  if (modeUjian === 'kategori') {
    if (!kategoriParam || !['TWK', 'TIU', 'TKP'].includes(kategoriParam)) {
      return NextResponse.json(
        { error: 'Kategori tidak valid. Gunakan TWK, TIU, atau TKP.' },
        { status: 400 },
      );
    }
    const jumlah = jumlahParam > 0 ? Math.min(jumlahParam, 150) : 10;
    target = { TWK: 0, TIU: 0, TKP: 0, [kategoriParam]: jumlah } as Record<Kategori, number>;
  } else {
    target = { ...PEMBAGIAN_PENUH };
  }

  let adaDb = false;

  try {
    const soal: SoalPublik[] = [];
    for (const kategori of ['TWK', 'TIU', 'TKP'] as Kategori[]) {
      const butuh = target[kategori];
      if (butuh <= 0) continue;

      const dariDb = await ambilDariDb(kategori, butuh);
      if (dariDb.length > 0) adaDb = true;
      soal.push(...dariDb.map((s) => formatSoal(s, 'db', mode)));

      const sisa = butuh - dariDb.length;
      if (sisa > 0) {
        const cadangan = acak(MOCK[kategori]).slice(0, sisa);
        soal.push(...cadangan.map((s) => formatSoal(s, 'mock', mode)));
      }
    }

    if (modeUjian === 'penuh') {
      // Kelompokkan urutan per kategori seperti ujian sebenarnya
      const urutKategori: Record<Kategori, number> = { TWK: 0, TIU: 1, TKP: 2 };
      soal.sort((a, b) => urutKategori[a.kategori] - urutKategori[b.kategori]);
    }

    return NextResponse.json({
      sumber: adaDb ? 'db+contoh' : 'contoh',
      jumlah: soal.length,
      soal,
    });
  } catch (error) {
    console.error('[api/soal] gagal mengambil soal dari database:', error);

    // Fallback: tetap bisa ujian walau database bermasalah
    const soal: SoalPublik[] = [];
    for (const kategori of ['TWK', 'TIU', 'TKP'] as Kategori[]) {
      const butuh = target[kategori];
      if (butuh <= 0) continue;
      const cadangan = acak(MOCK[kategori]).slice(0, butuh);
      soal.push(...cadangan.map((s) => formatSoal(s, 'mock', mode)));
    }

    return NextResponse.json({ sumber: 'contoh', jumlah: soal.length, soal });
  }
}
