import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/db/index';
import { attempts, user } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { getCurrentSession } from '@/lib/auth';

async function LeaderboardPageBody() {
  const session = await getCurrentSession();
  if (!session) redirect('/masuk');

  const leaderboard = await db
    .select({
      namaTampil: user.name,
      skorTotal: sql<number>`max(${attempts.skorTotal})`.as('skor_total'),
    })
    .from(attempts)
    .innerJoin(user, eq(attempts.userId, user.id))
    .where(eq(attempts.lulusPg, true))
    .groupBy(user.id, user.name)
    .orderBy(desc(sql<number>`max(${attempts.skorTotal})`))
    .limit(50);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Leaderboard</h1>
        <p className="mt-1 text-slate-600">
          Peringkat skor total tertinggi (top 50), hanya menampilkan nama tampil.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Peringkat</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Nama Tampil</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Skor Tertinggi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(leaderboard ?? []).map((entry, i) => (
              <tr key={`${entry.namaTampil}-${i}`} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500 font-mono">#{i + 1}</td>
                <td className="px-4 py-3 text-slate-700 font-medium">
                  {entry.namaTampil}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">
                  {Number(entry.skorTotal)}
                </td>
              </tr>
            ))}
            {(leaderboard ?? []).length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  Belum ada data leaderboard.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Leaderboard diurutkan berdasarkan skor total tertinggi per pengguna.
      </p>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-600 text-center">Memuat…</div>}>
      <LeaderboardPageBody />
    </Suspense>
  );
}