/**
 * Skrip OPSIONAL untuk memasukkan soal dari hasil ekspor Supabase (CSV/JSON)
 * ke database Neon melalui Drizzle ORM. Soal masuk dengan status "draft".
 *
 * Format JSON yang didukung: array objek dengan kunci sesuai skema soal
 * (lihat scripts/import-questions.ts).
 *
 * Format CSV yang didukung (header wajib):
 *   kategori,subkategori,teks_soal,opsi,kunci,pembahasan,tingkat_kesulitan
 *   kolom `opsi` berisi JSON array: [{"kode":"A","teks":"...","poin":5},...]
 *
 * Usage:
 *   npx tsx scripts/import-from-supabase-export.ts path/to/file.json
 *   npx tsx scripts/import-from-supabase-export.ts path/to/file.csv
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

function parseCsvOpsi(opsiJson: string): SoalInput['opsi'] {
  try {
    const parsed = JSON.parse(opsiJson);
    return z
      .array(
        z.object({
          kode: z.string().min(1),
          teks: z.string().min(1),
          poin: z.number().int().min(1).max(5),
        }),
      )
      .parse(parsed);
  } catch {
    return [];
  }
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error(
      'Usage: npx tsx scripts/import-from-supabase-export.ts <file.json|csv>',
    );
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File tidak ditemukan: ${absolutePath}`);
    process.exit(1);
  }

  const ext = path.extname(absolutePath).toLowerCase();
  const input: unknown =
    ext === '.json'
      ? JSON.parse(fs.readFileSync(absolutePath, 'utf-8'))
      : ext === '.csv'
      ? parseCsv(fs.readFileSync(absolutePath, 'utf-8'))
      : null;

  if (!input) {
    console.error('Format file tidak didukung. Gunakan .json atau .csv.');
    process.exit(1);
  }

  const daftar = Array.isArray(input) ? input : [input];
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
    gagal.forEach((g) => console.log(`  [${g.index}] ${g.error}`));
  }

  if (valid.length === 0) {
    console.log('\nTidak ada soal yang valid untuk diimpor.');
    process.exit(0);
  }

  await db
    .insert(questions)
    .values(
      valid.map((s) => ({
        kategori: s.kategori,
        subkategori: s.subkategori,
        teks_soal: s.teks_soal,
        opsi: s.opsi,
        kunci: s.kunci ?? null,
        pembahasan: s.pembahasan ?? null,
        tingkat_kesulitan: s.tingkat_kesulitan ?? 1,
        status: 'draft' as typeof questions.$inferSelect.status,
        createdAt: new Date(),
      })),
    );

  console.log(`\nBerhasil mengimpor ${valid.length} soal (status: draft).`);
  console.log(`Gagal divalidasi: ${gagal.length} soal.`);
}

function parseCsv(csvText: string): unknown[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);

  const rows: unknown[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const get = (name: string) => {
      const j = idx(name);
      return j >= 0 ? (cols[j] ?? '').trim() : '';
    };
    const opsiStr = get('opsi');
    let opsi: SoalInput['opsi'] = [];
    try {
      opsi = parseCsvOpsi(opsiStr);
    } catch {
      opsi = [];
    }
    const tingkat = Number(get('tingkat_kesulitan') || 1);
    rows.push({
      kategori: get('kategori'),
      subkategori: get('subkategori'),
      teks_soal: get('teks_soal'),
      opsi,
      kunci: get('kunci') || undefined,
      pembahasan: get('pembahasan') || undefined,
      tingkat_kesulitan: Number.isFinite(tingkat) ? tingkat : 1,
    });
  }
  return rows;
}

main().catch((err: unknown) => {
  console.error('Terjadi kesalahan:', err);
  process.exit(1);
});