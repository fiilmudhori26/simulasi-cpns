import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/db/index';
import { questions, attempts, attemptAnswers } from '@/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { getCurrentSession } from '@/lib/auth';
import ExamClient from '@/components/exam-client';
import { Attempt, Question } from '@/types';

async function ExamPageBody({
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
  if (attempt.selesaiAt) redirect(`/ujian/${attempt.id}/hasil`);

  const soalIds: string[] = (attempt.soalIds ?? []) as string[];

  const questionsList = await db
    .select({
      id: questions.id,
      kategori: questions.kategori,
      subkategori: questions.subkategori,
      teks_soal: questions.teks_soal,
      opsi: questions.opsi,
      tingkat_kesulitan: questions.tingkat_kesulitan,
    })
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

  return (
    <ExamClient
      attempt={attempt as unknown as Attempt}
      questions={questionsList as unknown as Question[]}
      initialAnswers={
        answers.map((a) => ({
          question_id: a.questionId,
          jawaban_kode: a.jawabanKode ?? undefined,
          poin_didapat: a.poinDidapat,
        }))
      }
      selesaiAt={
        attempt.selesaiAt ? new Date(attempt.selesaiAt).toISOString() : ''
      }
    />
  );
}

export default function ExamPage({
  params,
}: {
  params: { attemptId: string };
}) {
  return (
    <Suspense fallback={<div className="p-8 text-slate-600 text-center">Memuat…</div>}>
      <ExamPageBody params={params} />
    </Suspense>
  );
}