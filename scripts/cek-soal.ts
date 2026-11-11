import 'dotenv/config';
import { db } from '@/db/index';
import { questions } from '@/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
  const rows = await db
    .select({ kategori: questions.kategori, status: questions.status, jumlah: sql<number>`count(*)::int` })
    .from(questions)
    .groupBy(questions.kategori, questions.status);
  console.table(rows);
}

main().then(() => process.exit(0));
