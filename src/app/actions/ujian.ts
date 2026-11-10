'use server';

import { db } from '@/db/index';
import {
  questions,
  attempts,
  attemptAnswers,
  passingGradeConfig,
} from '@/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { getCurrentSession } from '@/lib/auth';

const POIN_BENAR_TWK_TIU = 5;

export interface SoalUjian {
  id: string;
  kategori: string;
  subkategori: string;
  teks_soal: string;
  opsi: { kode: string; teks: string; poin: number }[];
  tingkat_kesulitan: number;
}

export async function startAttempt(formData: FormData) {
  const session = await getCurrentSession();
  if (!session) return { error: 'Silakan masuk terlebih dahulu.' };
  const userId = session.user.id;

  const mode = String(formData.get('mode') ?? 'penuh');
  const kategori = String(formData.get('kategori') ?? '');
  const jumlah = Number(formData.get('jumlah') ?? 0);
  const durasiMenit = Number(formData.get('durasi') ?? 0);

  let pembagian: Record<string, number>;
  let totalDurasiMenit: number;

  if (mode === 'penuh') {
    pembagian = { TWK: 30, TIU: 35, TKP: 45 };
    totalDurasiMenit = 100;
  } else {
    if (!kategori || jumlah <= 0 || durasiMenit <= 0) {
      return { error: 'Kategori, jumlah soal, dan durasi harus diisi.' };
    }
    pembagian = { [kategori]: jumlah };
    totalDurasiMenit = durasiMenit;
  }

  // Ambil soal acak berstatus terverifikasi per kategori (tanpa kunci)
  const soalUjian: SoalUjian[] = [];
  for (const [kat, jumlahSoal] of Object.entries(pembagian)) {
    const soal = await db
      .select({
        id: questions.id,
        kategori: questions.kategori,
        subkategori: questions.subkategori,
        teks_soal: questions.teks_soal,
        opsi: questions.opsi,
        tingkat_kesulitan: questions.tingkat_kesulitan,
      })
      .from(questions)
      .where(
        and(
          eq(questions.status, 'terverifikasi'),
          eq(
            questions.kategori,
            kat as unknown as typeof questions.$inferSelect.kategori,
          ),
        ),
      )
      .limit(jumlahSoal);

    const acak = (soal as unknown as SoalUjian[])
      .sort(() => 0.5 - Math.random())
      .slice(0, jumlahSoal);
    soalUjian.push(...acak);
  }

  if (soalUjian.length === 0) {
    return { error: 'Soal belum cukup di bank soal terverifikasi.' };
  }

  // Acak urutan soal akhir
  soalUjian.sort(() => 0.5 - Math.random());

  const mulaiAt = new Date();
  const soalIdArray = soalUjian.map((s) => s.id);

  const [attempt] = await db
    .insert(attempts)
    .values({
      userId,
      soalIds: soalIdArray,
      mulaiAt,
      selesaiAt: null,
      skorTwk: 0,
      skorTiu: 0,
      skorTkp: 0,
      skorTotal: 0,
      lulusPg: false,
    })
    .returning();

  if (!attempt) return { error: 'Gagal memulai percobaan.' };

  const selesaiAt = new Date(mulaiAt.getTime() + totalDurasiMenit * 60000);

  return {
    success: true,
    attemptId: attempt.id,
    soal: soalUjian,
    mulaiAt: mulaiAt.toISOString(),
    selesaiAt: selesaiAt.toISOString(),
    totalDurasiMenit,
    jumlahSoal: soalUjian.length,
  };
}

export async function saveAnswer(formData: FormData) {
  const session = await getCurrentSession();
  if (!session) return { error: 'Sesi tidak valid.' };
  const userId = session.user.id;

  const attemptId = String(formData.get('attempt_id') ?? '');
  const questionId = String(formData.get('question_id') ?? '');
  const jawabanKode = String(formData.get('jawaban_kode') ?? '');

  // Verifikasi attempt milik user
  const [attempt] = await db
    .select()
    .from(attempts)
    .where(
      and(eq(attempts.id, attemptId), eq(attempts.userId, userId)),
    );

  if (!attempt) return { error: 'Percobaan tidak ditemukan.' };

  // Ambil soal untuk menghitung poin di sisi server (klien tidak dipercayai)
  const [question] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, questionId));

  if (!question) return { error: 'Soal tidak ditemukan.' };

  let poinDidapat = 0;
  if (jawabanKode) {
    const kat = question.kategori as string;
    if (kat === 'TWK' || kat === 'TIU') {
      poinDidapat = jawabanKode === question.kunci ? POIN_BENAR_TWK_TIU : 0;
    } else {
      const opsi = (question.opsi as
        | { kode: string; poin: number }[]
        | null)?.find((o) => o.kode === jawabanKode);
      poinDidapat = opsi ? opsi.poin : 0;
    }
  }

  await db
    .insert(attemptAnswers)
    .values({
      attemptId,
      questionId,
      jawabanKode: jawabanKode || null,
      poinDidapat,
    })
    .onConflictDoUpdate({
      target: [attemptAnswers.attemptId, attemptAnswers.questionId],
      set: { jawabanKode: jawabanKode || null, poinDidapat },
    });

  return { success: true };
}

export async function submitAttempt(formData: FormData) {
  const session = await getCurrentSession();
  if (!session) return { error: 'Sesi tidak valid.' };
  const userId = session.user.id;

  const attemptId = String(formData.get('attempt_id') ?? '');

  const [attempt] = await db
    .select()
    .from(attempts)
    .where(
      and(eq(attempts.id, attemptId), eq(attempts.userId, userId)),
    );

  if (!attempt) return { error: 'Percobaan tidak ditemukan.' };
  if (attempt.selesaiAt) return { error: 'Percobaan telah selesai.' };

  const answers = await db
    .select()
    .from(attemptAnswers)
    .where(eq(attemptAnswers.attemptId, attemptId));

  const questionIds = answers.map((a) => a.questionId);
  const questionsList =
    questionIds.length > 0
      ? await db.select().from(questions).where(inArray(questions.id, questionIds))
      : [];

  const qMap = new Map(questionsList.map((q) => [q.id, q]));

  // Passing grade dari konfigurasi (bukan hardcode)
  const [config] = await db.select().from(passingGradeConfig).limit(1);
  const passing = {
    TWK: config?.twk ?? 65,
    TIU: config?.tiu ?? 80,
    TKP: config?.tkp ?? 166,
  };

  let skorTwk = 0;
  let skorTiu = 0;
  let skorTkp = 0;

  for (const ans of answers) {
    const q = qMap.get(ans.questionId);
    if (!q) continue;

    let poin = 0;
    const kat = q.kategori as string;
    if (kat === 'TWK' || kat === 'TIU') {
      poin = ans.jawabanKode === q.kunci ? POIN_BENAR_TWK_TIU : 0;
    } else {
      poin = ans.poinDidapat ?? 0;
    }

    if (kat === 'TWK') skorTwk += poin;
    else if (kat === 'TIU') skorTiu += poin;
    else if (kat === 'TKP') skorTkp += poin;
  }

  const skorTotal = skorTwk + skorTiu + skorTkp;
  const lulusPg =
    skorTwk >= passing.TWK && skorTiu >= passing.TIU && skorTkp >= passing.TKP;
  const selesaiAt = new Date();

  await db
    .update(attempts)
    .set({
      selesaiAt,
      skorTwk,
      skorTiu,
      skorTkp,
      skorTotal,
      lulusPg,
    })
    .where(eq(attempts.id, attemptId));

  return {
    success: true,
    skorTwk,
    skorTiu,
    skorTkp,
    skorTotal,
    lulusPg,
    passing,
    selesaiAt: selesaiAt.toISOString(),
  };
}