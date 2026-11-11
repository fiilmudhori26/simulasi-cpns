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
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="surface max-w-md p-8 text-center">
          <p className="eyebrow">Area terbatas</p>
          <h1 className="mt-2 font-display text-xl font-bold text-ink">Akses ditolak</h1>
          <p className="mt-2 text-sm text-muted">
            Halaman admin hanya dapat diakses oleh administrator.
          </p>
        </div>
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
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="eyebrow">Pengelolaan bank soal</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink">Admin soal</h1>
          <p className="mt-1 text-sm text-muted">
            Kelola soal dengan status draft sebelum diverifikasi.
          </p>
        </div>
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-soft">ID</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-soft">Kategori</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-soft">Subkategori</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-soft">Teks soal</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-soft">Dibuat</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-soft">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {drafts.map((q) => (
              <tr key={q.id} className="transition-colors hover:bg-surface-muted">
                <td className="px-4 py-3 font-mono text-xs text-muted-soft">
                  {q.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3"><span className="chip chip-brand">{q.kategori}</span></td>
                <td className="px-4 py-3 text-ink-soft">{q.subkategori}</td>
                <td className="max-w-[300px] truncate px-4 py-3 text-ink-soft">
                  {q.teks_soal}
                </td>
                <td className="px-4 py-3 text-xs text-muted-soft">
                  {new Date(q.createdAt).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleVerify(q.id as string)}
                    className="rounded-md border border-[#c6ecdd] bg-success-soft px-2 py-1 text-xs font-semibold text-success transition-colors hover:bg-[#d9f3e8]"
                  >
                    Verifikasi
                  </button>
                  {' '}
                  <button
                    onClick={() => handleDelete(q.id as string)}
                    className="rounded-md border border-[#f6cfca] bg-danger-soft px-2 py-1 text-xs font-semibold text-danger transition-colors hover:bg-[#fbdcd7]"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {drafts.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-muted">
          Tidak ada soal draft yang menunggu verifikasi.
        </div>
      )}

      <div className="mt-8 rounded-[18px] border border-[#dbe6ff] bg-brand-soft p-5">
        <h3 className="font-display text-sm font-bold text-brand">Petunjuk admin</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-brand/80">
          <li>Soal baru dari impor masuk dengan status <b>draft</b>.</li>
          <li>Klik <b>Verifikasi</b> untuk menyetujui soal agar bisa digunakan ujian.</li>
          <li>Klik <b>Hapus</b> untuk menanggalkan soal draft.</li>
          <li>Gunakan <code>scripts/import-questions.ts</code> untuk impor soal dari JSON.</li>
          <li>Hanya email dalam <b>NEXT_PUBLIC_ADMIN_EMAILS</b> yang dapat mengakses halaman ini.</li>
        </ul>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Memuat…</div>}>
      <AdminPageBody />
    </Suspense>
  );
}