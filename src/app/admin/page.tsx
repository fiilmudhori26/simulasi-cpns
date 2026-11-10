import { Suspense } from 'react';
import { getCurrentSession } from '@/lib/auth';
import { getDraftQuestions, adminVerify, adminDelete } from '@/app/actions/admin';

type DraftQuestion = {
  id: string;
  kategori: string;
  subkategori: string;
  teks_soal: string;
  createdAt: Date;
};

async function AdminPageBody() {
  const session = await getCurrentSession();
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin =
    session &&
    adminEmails.includes((session.user?.email ?? '').toLowerCase());

  if (!session || !isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h1 className="text-xl font-bold text-slate-800">Akses Ditolak</h1>
        <p className="mt-2 text-slate-600">
          Halaman admin hanya dapat diakses oleh administrator.
        </p>
      </div>
    );
  }

  const res = await getDraftQuestions();
  const drafts: DraftQuestion[] = 'error' in res
    ? (res.data as DraftQuestion[])
    : [];

  async function handleVerify(id: string) {
    const formData = new FormData();
    formData.set('id', id);
    await adminVerify(formData);
    location.reload();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Yakin ingin menghapus soal draft ini?')) return;
    const formData = new FormData();
    formData.set('id', id);
    await adminDelete(formData);
    location.reload();
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Soal</h1>
          <p className="text-slate-600">
            Kelola soal dengan status draft sebelum diverifikasi.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Kategori</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Subkategori</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Teks Soal</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Dibuat</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {drafts.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                  {q.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-slate-700">{q.kategori}</td>
                <td className="px-4 py-3 text-slate-700">{q.subkategori}</td>
                <td className="px-4 py-3 text-slate-700 truncate max-w-[300px]">
                  {q.teks_soal}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {new Date(q.createdAt).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleVerify(q.id as string)}
                    className="px-2 py-1 text-xs rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  >
                    Verifikasi
                  </button>
                  {' '}
                  <button
                    onClick={() => handleDelete(q.id as string)}
                    className="px-2 py-1 text-xs rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drafts.length === 0 && (
        <div className="mt-6 text-center text-slate-500 py-8">
          Tidak ada soal draft yang menunggu verifikasi.
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Petunjuk Admin</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Soal baru dari impor masuk dengan status <b>draft</b>.</li>
          <li>Klik <b>Verifikasi</b> untuk menyetujui soal agar bisa digunakan ujian.</li>
          <li>Klik <b>Hapus</b> untuk menanggalkan soal draft.</li>
          <li>Gunakan <code>scripts/import-questions.ts</code> untuk impor soal dari JSON.</li>
          <li>Contoh format: <code>contoh-soal.json</code>.</li>
          <li>Hanya email dalam <b>NEXT_PUBLIC_ADMIN_EMAILS</b> yang dapat mengakses halaman ini.</li>
        </ul>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-600 text-center">Memuat…</div>}>
      <AdminPageBody />
    </Suspense>
  );
}