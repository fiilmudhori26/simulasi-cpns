/**
 * Skrip CLI untuk impor soal dari file JSON ke database Neon melalui Drizzle ORM.
 * Soal yang diimpor akan masuk dengan status "draft" (belum terverifikasi).
 *
 * Usage:
 *   npx tsx scripts/import-questions.ts path/to/file.json
 *
 * Prasyarat:
 *   DATABASE_URL harus diisi di .env (koneksi Neon Postgres).
 */
import { db } from '@/db/index';
import { questions } from '@/db/schema';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

const SoalSchema = z.object({
  kategori: z.enum(['TWK', 'TIU', 'TKP']),
  subkategori: z.string().min(1),
  teks_soal: z.string().min(1),
  opsi: z
    .array(
      z.object({
        kode: z.string().min(1),
        teks: z.string().min(1),
        poin: z.number().int().min(1).max(5),
      }),
    )
    .min(2)
    .max(10),
  kunci: z.string().optional(),
  pembahasan: z.string().optional(),
  tingkat_kesulitan: z.number().int().min(1).max(5).optional(),
});

type SoalInput = z.infer<typeof SoalSchema>;

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: npx tsx scripts/import-questions.ts <file.json>');
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File tidak ditemukan: ${absolutePath}`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
  const daftar = Array.isArray(raw) ? raw : [raw];

  const valid: SoalInput[] = [];
  const gagal: { index: number; error: string }[] = [];

  daftar.forEach((item, i) => {
    const result = SoalSchema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      gagal.push({
        index: i,
        error: result.error.issues.map((e) => e.message).join('; '),
      });
    }
  });

  if (gagal.length > 0) {
    console.log('\nSoal gagal divalidasi:');
    gagal.forEach((g) => {
      console.log(`  [${g.index}] ${g.error}`);
    });
  }

  if (valid.length === 0) {
    console.log('\nTidak ada soal yang valid untuk diimpor.');
    process.exit(0);
  }

  const untukDisimpan = valid.map((s) => ({
    kategori: s.kategori,
    subkategori: s.subkategori,
    teks_soal: s.teks_soal,
    opsi: s.opsi,
    kunci: s.kunci ?? null,
    pembahasan: s.pembahasan ?? null,
    tingkat_kesulitan: s.tingkat_kesulitan ?? 1,
    status: 'draft' as typeof questions.$inferSelect.status, // draft, perlu diverifikasi admin
    createdAt: new Date(),
  }));

  await db.insert(questions).values(untukDisimpan);

  console.log(`\nBerhasil mengimpor ${valid.length} soal (status: draft).`);
  console.log(`Gagal divalidasi: ${gagal.length} soal.`);
}

main().catch((err: unknown) => {
  console.error('Terjadi kesalahan:', err);
  process.exit(1);
});