'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveAnswer, submitAttempt } from '@/app/actions/ujian';
import { Question, Attempt } from '@/types';

type ClientAnswer = { kode: string; poin: number; flagged: boolean };

interface ExamClientProps {
  attempt: Attempt;
  questions: Question[];
  initialAnswers: { question_id: string; jawaban_kode?: string; poin_didapat: number }[];
  selesaiAt: string;
}

export default function ExamClient({
  attempt,
  questions,
  initialAnswers,
  selesaiAt,
}: ExamClientProps) {
  const router = useRouter();

  const [answers, setAnswers] = useState<Map<string, ClientAnswer>>(() => {
    const m = new Map<string, ClientAnswer>();
    for (const a of initialAnswers) {
      m.set(a.question_id, {
        kode: a.jawaban_kode ?? '',
        poin: a.poin_didapat ?? 0,
        flagged: false,
      });
    }
    return m;
  });

  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, new Date(selesaiAt).getTime() - Date.now()),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    const formData = new FormData();
    formData.set('attempt_id', attempt.id);
    const res = await submitAttempt(formData);
    setSubmitting(false);
    if ('error' in res && res.error) {
      setError(res.error);
      return;
    }
    router.push(`/ujian/${attempt.id}/hasil`);
  }, [attempt.id, router]);

  // Timer hitung mundur yang akurat meski halaman di-refresh.
  useEffect(() => {
    const end = new Date(selesaiAt).getTime();
    const intervalId = setInterval(() => {
      const rem = end - Date.now();
      if (rem <= 0) {
        setTimeLeft(0);
        void handleSubmit();
        return;
      }
      setTimeLeft(rem);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [selesaiAt, handleSubmit]);

  async function pilihJawaban(questionId: string, kode: string) {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, {
        kode,
        poin: 0,
        flagged: next.get(questionId)?.flagged ?? false,
      });
      return next;
    });

    const formData = new FormData();
    formData.set('attempt_id', attempt.id);
    formData.set('question_id', questionId);
    formData.set('jawaban_kode', kode);
    await saveAnswer(formData);
  }

  function toggleFlag(questionId: string) {
    setAnswers((prev) => {
      const next = new Map(prev);
      const cur = next.get(questionId);
      if (!cur) return next;
      next.set(questionId, { ...cur, flagged: !cur.flagged });
      return next;
    });
  }

  const total = questions.length;
  const dijawab = answers.size;
  const currentQuestion = questions[current];

  const mm = Math.floor(timeLeft / 60000);
  const ss = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Ujian</h1>
          <p className="text-sm text-slate-500">
            Percobaan #{attempt.id.slice(0, 8)} • {current + 1} dari {total}
          </p>
        </div>
        <div className={`text-right font-mono font-bold text-2xl ${
          timeLeft <= 60000 ? 'text-red-600' : 'text-slate-800'
        }`}>
          {mm.toString().padStart(2, '0')}:{ss.toString().padStart(2, '0')}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {currentQuestion && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="mb-4">
            <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700">
              {currentQuestion.kategori} • {currentQuestion.subkategori}
            </span>
            <p className="mt-2 text-lg text-slate-800 font-medium">
              {currentQuestion.teks_soal}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.opsi.map((o) => (
              <button
                key={o.kode}
                onClick={() => pilihJawaban(currentQuestion.id, o.kode)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border text-left transition
                  ${answers.get(currentQuestion.id)?.kode === o.kode
                    ? 'bg-blue-50 border-blue-300 text-blue-800 ring-2 ring-blue-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
                `}
              >
                <span className="font-bold">{o.kode}</span>
                <span>{o.teks}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => toggleFlag(currentQuestion.id)}
              className={`
                px-2 py-1 text-xs rounded border transition
                ${answers.get(currentQuestion.id)?.flagged
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}
              `}
            >
              {answers.get(currentQuestion.id)?.flagged ? 'Hapus tanda' : 'Tandai ragu-ragu'}
            </button>
            <p className="text-xs text-slate-500 ml-auto">
              {dijawab}/{total} dijawab
            </p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          Navigasi soal (biru = dijawab, kuning = ragu-ragu)
        </p>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => {
            const ans = answers.get(q.id);
            const status = ans ? (ans.flagged ? 'flagged' : 'answered') : 'empty';
            return (
              <button
                key={q.id}
                onClick={() => setCurrent(i)}
                className={`
                  w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center transition
                  ${status === 'answered'
                    ? 'bg-blue-600 text-white'
                    : status === 'flagged'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'}
                `}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-4 pt-4 border-t border-slate-200">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrent((c) => (c > 0 ? c - 1 : c))}
            disabled={current === 0 || submitting}
            className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-white border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Sebelumnya
          </button>
          <button
            onClick={() => setCurrent((c) => (c < total - 1 ? c + 1 : c))}
            disabled={current === total - 1 || submitting}
            className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-white border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Berikutnya
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`
            px-6 py-2.5 rounded-md text-sm font-semibold transition
            ${submitting ? 'opacity-50 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}
          `}
        >
          {submitting ? 'Mengumpulkan...' : 'Selesai & Kumpulkan'}
        </button>
        <p className="text-xs text-slate-400 md:ml-4">
          Kumpulkan otomatis saat waktu habis.
        </p>
      </div>
    </div>
  );
}

