/**
 * Impor paket soal CPNS dengan format "paket" (meta + questions).
 *
 * Format yang didukung:
 * {
 *   "meta": { ... },
 *   "questions": [
 *     {
 *       "subtest": "TWK" | "TIU" | "TKP",
 *       "topic": "pilar-negara",
 *       "difficulty": "mudah" | "sedang" | "sulit",
 *       "question": "teks soal",
 *       "options": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
 *       "answer": "C",                 // TWK/TIU
 *       "scores": { "A": 5, ... },     // TKP (1-5 per opsi)
 *       "explanation": "..."
 *     }
 *   ]
 * }
 *
 * Soal langsung diimpor dengan status "terverifikasi" sehingga bisa dipakai ujian.
 *
 * Usage:
 *   npx tsx scripts/import-paket.ts soal-paket-1.json
 *
 * Opsi:
 *   --draft   impor sebagai draft (belum terverifikasi)
 */
import 'dotenv/config';
import { db } from '@/db/index';
import { questions } from '@/db/schema';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

const OpsiSchema = z.record(z.string(), z.string().min(1));
const SkorSchema = z.record(z.string(), z.number().int().min(1).max(5));

const SoalSchema = z.object({
  id: z.string().optional(),
  subtest: z.enum(['TWK', 'TIU', 'TKP']),
  topic: z.string().min(1),
  difficulty: z.enum(['mudah', 'sedang', 'sulit']).optional(),
  question: z.string().min(1),
  options: OpsiSchema,
  answer: z.string().optional(),
  scores: SkorSchema.optional(),
  explanation: z.string().optional(),
});

const PaketSchema = z.object({
  meta: z.record(z.string(), z.unknown()).optional(),
  questions: z.array(SoalSchema).min(1),
});

type SoalInput = z.infer<typeof SoalSchema>;

const TINGKAT: Record<string, number> = { mudah: 1, sedang: 2, sulit: 3 };

/** "pilar-negara" -> "Pilar Negara" */
function rapiTopik(topik: string): string {
  return topik
    .split('-')
    .filter(Boolean)
    .map((kata) => kata.charAt(0).toUpperCase() + kata.slice(1))
    .join(' ');
}

function validasiSoal(soal: SoalInput): string | null {
  const kodeOpsi = Object.keys(soal.options);
  if (kodeOpsi.length < 2) return 'opsi kurang dari 2';

  if (soal.subtest === 'TWK' || soal.subtest === 'TIU') {
    if (!soal.answer) return `${soal.subtest} wajib punya "answer"`;
    if (!kodeOpsi.includes(soal.answer)) {
      return `"answer" (${soal.answer}) tidak ada di opsi`;
    }
  }

  if (soal.subtest === 'TKP') {
    if (!soal.scores) return 'TKP wajib punya "scores"';
    for (const kode of kodeOpsi) {
      if (typeof soal.scores[kode] !== 'number') {
        return `"scores" tidak memiliki nilai untuk opsi ${kode}`;
      }
    }
  }

  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const filePath = args.find((a) => !a.startsWith('--'));
  const sebagaiDraft = args.includes('--draft');

  if (!filePath) {
    console.error('Usage: npx tsx scripts/import-paket.ts <file.json> [--draft]');
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File tidak ditemukan: ${absolutePath}`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
  const paket = PaketSchema.parse(raw);

  const valid: SoalInput[] = [];
  const gagal: { index: number; error: string }[] = [];

  paket.questions.forEach((item, i) => {
    const pesan = validasiSoal(item);
    if (pesan) gagal.push({ index: i, error: pesan });
    else valid.push(item);
  });

  if (gagal.length > 0) {
    console.log('\nSoal gagal divalidasi:');
    gagal.forEach((g) => console.log(`  [${g.index}] ${g.error}`));
  }

  if (valid.length === 0) {
    console.log('\nTidak ada soal valid untuk diimpor.');
    process.exit(1);
  }

  const rows = valid.map((s) => ({
    kategori: s.subtest,
    subkategori: rapiTopik(s.topic),
    teks_soal: s.question,
    opsi: Object.entries(s.options).map(([kode, teks]) => ({
      kode,
      teks,
      poin: s.scores?.[kode] ?? (s.answer === kode ? 5 : 1),
    })),
    kunci: s.subtest === 'TKP' ? null : (s.answer ?? null),
    pembahasan: s.explanation ?? null,
    tingkat_kesulitan: TINGKAT[s.difficulty ?? 'sedang'] ?? 2,
    status: (sebagaiDraft ? 'draft' : 'terverifikasi') as
      | 'draft'
      | 'terverifikasi',
  }));

  // Hindari duplikasi: lewati soal yang teksnya sudah ada di database.
  const existing = await db
    .select({ teks: questions.teks_soal })
    .from(questions);
  const sudahAda = new Set(existing.map((e) => e.teks.trim()));
  const baru = rows.filter((r) => !sudahAda.has(r.teks_soal.trim()));
  const dilewati = rows.length - baru.length;

  if (baru.length > 0) {
    // Insert bertahap agar aman terhadap batas parameter query.
    const perBatch = 50;
    for (let i = 0; i < baru.length; i += perBatch) {
      await db.insert(questions).values(baru.slice(i, i + perBatch));
    }
  }

  const hitung = (kat: string) => baru.filter((r) => r.kategori === kat).length;
  console.log(`\nBerhasil mengimpor ${baru.length} soal (status: ${sebagaiDraft ? 'draft' : 'terverifikasi'}).`);
  console.log(`  TWK: ${hitung('TWK')} | TIU: ${hitung('TIU')} | TKP: ${hitung('TKP')}`);
  if (dilewati > 0) console.log(`Dilewati (duplikat): ${dilewati}`);
  if (gagal.length > 0) console.log(`Gagal divalidasi: ${gagal.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error('Terjadi kesalahan:', err);
    process.exit(1);
  });
