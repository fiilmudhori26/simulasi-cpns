'use server';

import { db } from '@/db/index';
import { questions } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getCurrentSession } from '@/lib/auth';

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return email ? adminEmails.includes(email.toLowerCase()) : false;
}

async function assertAdmin() {
  const session = await getCurrentSession();
  if (!session || !isAdmin(session.user?.email ?? null)) {
    return { ok: false, error: 'Akses hanya untuk administrator.' };
  }
  return { ok: true };
}

export async function adminVerify(formData: FormData) {
  const check = await assertAdmin();
  if (!check.ok) return { error: check.error };

  const id = String(formData.get('id') ?? '');
  await db.update(questions).set({ status: 'terverifikasi' }).where(eq(questions.id, id));
  return { success: true };
}

export async function adminDelete(formData: FormData) {
  const check = await assertAdmin();
  if (!check.ok) return { error: check.error };

  const id = String(formData.get('id') ?? '');
  await db.delete(questions).where(eq(questions.id, id));
  return { success: true };
}

export async function adminUpdate(formData: FormData) {
  const check = await assertAdmin();
  if (!check.ok) return { error: check.error };

  const id = String(formData.get('id') ?? '');
  const kategori = String(formData.get('kategori') ?? '');
  const subkategori = String(formData.get('subkategori') ?? '');
  const teks_soal = String(formData.get('teks_soal') ?? '');
  const kunci = String(formData.get('kunci') ?? '') || null;
  const pembahasan = String(formData.get('pembahasan') ?? '') || null;
  const tingkat_kesulitan = Number(formData.get('tingkat_kesulitan') ?? 1);

  let opsi: { kode: string; teks: string; poin: number }[] = [];
  try {
    opsi = JSON.parse(String(formData.get('opsi_json') ?? '[]'));
  } catch {
    return { error: 'Format opsi JSON tidak valid.' };
  }

  if (!kategori || !subkategori || !teks_soal) {
    return { error: 'Kategori, subkategori, dan teks soal harus diisi.' };
  }

  await db
    .update(questions)
    .set({
      kategori: kategori as unknown as typeof questions.$inferSelect.kategori,
      subkategori,
      teks_soal,
      opsi,
      kunci,
      pembahasan,
      tingkat_kesulitan,
    })
    .where(eq(questions.id, id));
  return { success: true };
}

export async function getDraftQuestions() {
  const check = await assertAdmin();
  if (!check.ok) return { error: check.error };

  const data = await db
    .select()
    .from(questions)
    .where(eq(questions.status, 'draft'))
    .orderBy(desc(questions.createdAt));

  return { data };
}