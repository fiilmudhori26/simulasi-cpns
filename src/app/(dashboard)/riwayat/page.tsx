import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/db/index';
import { attempts } from '@/db/schema';
import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { getCurrentSession } from '@/lib/auth';
import GrafikSkor from '@/app/(dashboard)/components/GrafikSkor';

async function RiwayatPageBody() {
  const session = await getCurrentSession();
  if (!session) redirect('/masuk');

  const riwayat = await db
    .select()
    .from(attempts)
    .where(
      and(eq(attempts.userId, session.user.id), isNotNull(attempts.selesaiAt)),
    )
    .orderBy(desc(attempts.mulaiAt));

  const lulus = riwayat.filter((a) => a.lulusPg).length;

  const grafikData = [...riwayat]
    .sort((a, b) => new Date(a.mulaiAt).getTime() - new Date(b.mulaiAt).getTime())
    .map((a) => ({
      waktu: new Date(a.mulaiAt).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
      }),
      skor: a.skorTotal,
    }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Riwayat Percobaan</h1>
        <p className="mt-1 text-slate-600">
          Nilai hasil simulasi ujian Anda dari waktu ke waktu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KartuRingkasan label="Total Percobaan" value={riwayat.length} />
        <KartuRingkasan label="Lulus" value={lulus} accent="green" />
        <KartuRingkasan
          label="Skor Tertinggi"
          value={
            riwayat.reduce((m, a) => Math.max(m, a.skorTotal), 0)
          }
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Progres Skor Total
        </h2>
        {grafikData.length === 0 ? (
          <p className="text-slate-500 text-center py-10">
            Belum ada riwayat ujian. Mulai simulasi terlebih dahulu.
          </p>
        ) : (
          <GrafikSkor data={grafikData} />
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">TWK</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">TIU</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">TKP</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {riwayat.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700">
                  {new Date(a.mulaiAt).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3 text-slate-700">{a.skorTwk}</td>
                <td className="px-4 py-3 text-slate-700">{a.skorTiu}</td>
                <td className="px-4 py-3 text-slate-700">{a.skorTkp}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{a.skorTotal}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    a.lulusPg
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {a.lulusPg ? 'Lulus' : 'Belum lulus'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`/ujian/${a.id}/hasil`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Lihat pembahasan
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KartuRingkasan({
  label,
  value,
  accent = 'blue',
}: {
  label: string;
  value: number;
  accent?: 'blue' | 'green';
}) {
  return (
    <div className={`p-4 rounded-lg border bg-white ${
      accent === 'green' ? 'border-green-200' : 'border-slate-200'
    }`}>
      <div className={`text-xs font-semibold ${accent === 'green' ? 'text-green-700' : 'text-slate-500'} uppercase`}>
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-800 mt-1">{value}</div>
    </div>
  );
}

export default function RiwayatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-600 text-center">Memuat…</div>}>
      <RiwayatPageBody />
    </Suspense>
  );
}