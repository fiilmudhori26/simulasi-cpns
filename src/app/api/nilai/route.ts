import { NextResponse } from 'next/server';
import { inArray } from 'drizzle-orm';
import { db } from '@/db/index';
import { questions } from '@/db/schema';
import { SOAL_MOCK } from '@/data/soal';

export const dynamic = 'force-dynamic';

const POIN_BENAR_TWK_TIU = 5;

interface OpsiDb {
  kode: string;
  teks: string;
  poin: number;
}

interface SoalServer {
  kategori: string;
  kunci: string | null;
  opsi: OpsiDb[];
}

export async function POST(request: Request) {
  let body: { jawaban?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }

  const jawaban = body.jawaban && typeof body.jawaban === 'object' ? body.jawaban : {};
  const ids = Object.keys(jawaban);

  if (ids.length === 0) {
    return NextResponse.json({
      skorTWK: 0,
      skorTIU: 0,
      skorTKP: 0,
      skorTotal: 0,
      jumlahBenar: 0,
    });
  }

  // Soal dari database (hanya yang terverifikasi) + cadangan soal contoh.
  // Hanya ID berformat UUID yang boleh di-query ke kolom uuid.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const idUuid = ids.filter((id) => UUID_RE.test(id));

  let dariDb: Awaited<ReturnType<typeof ambilSoalDb>> = [];
  try {
    dariDb = idUuid.length > 0 ? await ambilSoalDb(idUuid) : [];
  } catch (error) {
    console.error('[api/nilai] gagal mengambil soal dari database:', error);
    return NextResponse.json(
      { error: 'Gagal menghitung nilai. Coba lagi.' },
      { status: 500 },
    );
  }

  const peta = new Map<string, SoalServer>();
  for (const q of dariDb) {
    peta.set(q.id, {
      kategori: q.kategori,
      kunci: q.kunci,
      opsi: (Array.isArray(q.opsi) ? q.opsi : []) as OpsiDb[],
    });
  }
  for (const q of SOAL_MOCK) {
    if (!peta.has(q.id)) {
      peta.set(q.id, {
        kategori: q.kategori,
        kunci: q.kunci,
        opsi: q.opsi as OpsiDb[],
      });
    }
  }

  let skorTWK = 0;
  let skorTIU = 0;
  let skorTKP = 0;
  let jumlahBenar = 0;

  for (const id of ids) {
    const soal = peta.get(id);
    const dipilih = jawaban[id];
    if (!soal || !dipilih) continue;

    if (soal.kategori === 'TWK' || soal.kategori === 'TIU') {
      if (dipilih === soal.kunci) {
        jumlahBenar += 1;
        if (soal.kategori === 'TWK') skorTWK += POIN_BENAR_TWK_TIU;
        else skorTIU += POIN_BENAR_TWK_TIU;
      }
    } else {
      const opsi = soal.opsi.find((o) => o.kode === dipilih);
      const poin = opsi?.poin ?? 0;
      skorTKP += poin;
      if (poin > 0) jumlahBenar += 1;
    }
  }

  return NextResponse.json({
    skorTWK,
    skorTIU,
    skorTKP,
    skorTotal: skorTWK + skorTIU + skorTKP,
    jumlahBenar,
  });
}

async function ambilSoalDb(ids: string[]) {
  return db.select().from(questions).where(inArray(questions.id, ids));
}
