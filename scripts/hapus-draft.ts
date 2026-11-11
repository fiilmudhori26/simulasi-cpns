/**
 * Hapus semua soal berstatus "draft" dari bank soal.
 *
 * Usage:
 *   npx tsx scripts/hapus-draft.ts          # tampilkan saja
 *   npx tsx scripts/hapus-draft.ts --force  # hapus permanen
 */
import 'dotenv/config';
import { db } from '@/db/index';
import { questions } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const draft = await db.select().from(questions).where(eq(questions.status, 'draft'));

  console.log(`Soal draft ditemukan: ${draft.length}`);
  for (const q of draft) {
    console.log(`- ${q.kategori} | ${q.subkategori} | ${q.teks_soal.slice(0, 70)}`);
  }

  if (!process.argv.includes('--force')) {
    console.log('\nMode tampilan saja. Jalankan dengan --force untuk menghapus.');
    return;
  }

  const dihapus = await db
    .delete(questions)
    .where(eq(questions.status, 'draft'))
    .returning({ id: questions.id });

  console.log(`\nTerhapus: ${dihapus.length} soal draft.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
