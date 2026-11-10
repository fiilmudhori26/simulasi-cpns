import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/db/index';
import { questions, attempts, attemptAnswers } from '@/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { getCurrentSession } from '@/lib/auth';
import { getPassingGrade } from '@/lib/passing-grade';

async function HasilPageBody({
  params,
}: {
  params: { attemptId: string };
}) {
  const session = await getCurrentSession();
  if (!session) redirect('/masuk');

  const [attemptRaw] = await db
    .select()
    .from(attempts)
    .where(
      and(eq(attempts.id, params.attemptId), eq(attempts.userId, session.user.id)),
    );

  type AttemptRow = {
    id: string;
    soalIds?: unknown;
    selesaiAt: Date | null;
    skorTwk: number;
    skorTiu: number;
    skorTkp: number;
    skorTotal: number;
    lulusPg: boolean;
  };
  const attempt = attemptRaw as AttemptRow;

  if (!attempt) redirect('/dashboard');
  if (!attempt.selesaiAt) redirect(`/ujian/${attempt.id}`);

  const passing = getPassingGrade();
  const soalIds: string[] = (attempt.soalIds ?? []) as string[];

  const questionsList = await db
    .select()
    .from(questions)
    .where(inArray(questions.id, soalIds))
    .orderBy(questions.kategori);

  const answers = await db
    .select({
      questionId: attemptAnswers.questionId,
      jawabanKode: attemptAnswers.jawabanKode,
      poinDidapat: attemptAnswers.poinDidapat,
    })
    .from(attemptAnswers)
    .where(eq(attemptAnswers.attemptId, attempt.id));

  const ansMap = new Map(
    answers.map((a) => [a.questionId, a] as [string, { jawabanKode?: string | null; poinDidapat: number }]),
  );

  const lulusPg =
    attempt.skorTwk >= passing.TWK &&
    attempt.skorTiu >= passing.TIU &&
    attempt.skorTkp >= passing.TKP;

  return (
    <div className="max-w-3xl mx-auto py-6">
      <nav className="flex gap-2 mb-6">
        <a
          href="/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Kembali ke Beranda
        </a>
      </nav>

      <h1 className="text-2xl font-bold text-slate-800 mb-2">Hasil Ujian</h1>
      <p className="text-slate-600 mb-6">
        Percobaan #{attempt.id.slice(0, 8)} •
        Selesai {new Date(attempt.selesaiAt).toLocaleString('id-ID')}
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Skor per Sub-Tes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SkorKartu label="TWK" value={attempt.skorTwk} target={passing.TWK} />
          <SkorKartu label="TIU" value={attempt.skorTiu} target={passing.TIU} />
          <SkorKartu label="TKP" value={attempt.skorTkp} target={passing.TKP} />
          <SkorKartu label="Total" value={attempt.skorTotal} target={null} />
        </div>

        <div
          className={`mt-4 p-3 rounded-lg font-semibold ${
            lulusPg
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {lulusPg
            ? 'Selamat, Anda LULUS ujian pada semua sub-tes.'
            : 'Anda belum lulus. Perbaiki sub-tes yang belum mencapai nilai minimum.'}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider p-6 border-b border-slate-200 flex justify-between items-center">
          <span>Pembahasan Soal</span>
          <span className="text-xs text-slate-400 font-normal">
            {questionsList.length} soal
          </span>
        </h2>
        <div className="divide-y divide-slate-100">
          {questionsList.map((q) => {
            const jawaban = ansMap.get(q.id);
            const kat = q.kategori as string;
            const benar =
              kat === 'TWK' || kat === 'TIU'
                ? (jawaban?.jawabanKode ?? '') === q.kunci
                : !!jawaban;
            return (
              <div key={q.id} className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {q.kategori}
                  </span>
                  <span className={`text-xs font-bold ${
                    benar ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {benar ? 'Benar' : 'Salah'}
                  </span>
                </div>
                <p className="text-sm text-slate-800 mb-2">
                  {q.teks_soal}
                </p>
                <div className="text-sm text-slate-600 mb-1">
                  Jawaban Anda:{' '}
                  <span className="font-mono">
                    {jawaban?.jawabanKode ?? '—'}
                  </span>
                  {q.kunci && (
                    <span className="ml-2 text-xs text-slate-400 font-normal">
                      (kunci: {q.kunci})
                    </span>
                  )}
                </div>
                {q.pembahasan && (
                  <div className="text-sm text-slate-700 bg-amber-50 p-3 rounded border border-amber-100">
                    <span className="text-xs font-semibold text-amber-700 uppercase mb-1 block">
                      Pembahasan
                    </span>
                    {q.pembahasan}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SkorKartu({
  label,
  value,
  target,
}: {
  label: string;
  value: number;
  target: number | null;
}) {
  const status = target != null ? value >= target : null;
  return (
    <div className="p-3 rounded-lg border text-center bg-white">
      <div className="text-xs font-semibold text-slate-500 uppercase">{label}</div>
      <div className="text-2xl font-bold mt-1">
        {value}{target != null ? ` / ${target}` : ''}
      </div>
      {target != null && (
        <div className={`text-xs mt-1 ${status ? 'text-green-600' : 'text-red-600'}`}>
          {status ? 'Lulus' : 'Belum lulus'}
        </div>
      )}
    </div>
  );
}

export default function HasilPage({
  params,
}: {
  params: { attemptId: string };
}) {
  return (
    <Suspense fallback={<div className="p-8 text-slate-600 text-center">Memuat…</div>}>
      <HasilPageBody params={params} />
    </Suspense>
  );
}