import { redirect } from 'next/navigation';
import { db } from '@/db/index';
import { attempts } from '@/db/schema';
import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { getCurrentSession } from '@/lib/auth';

import RiwayatClientWrapper from './RiwayatClientWrapper';

export default async function RiwayatPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/masuk');

  const riwayat = await db
    .select()
    .from(attempts)
    .where(
      and(eq(attempts.userId, session.user.id), isNotNull(attempts.selesaiAt)),
    )
    .orderBy(desc(attempts.mulaiAt));

  // Transform data for client component
  const riwayatData = riwayat.map((a) => ({
    id: a.id,
    mulaiAt: a.mulaiAt instanceof Date ? a.mulaiAt.toISOString() : a.mulaiAt,
    skorTwk: a.skorTwk,
    skorTiu: a.skorTiu,
    skorTkp: a.skorTkp,
    skorTotal: a.skorTotal,
    lulusPg: a.lulusPg,
    selesaiAt: a.selesaiAt instanceof Date ? a.selesaiAt.toISOString() : a.selesaiAt,
  }));

  return <RiwayatClientWrapper initialRiwayat={riwayatData} />;
}