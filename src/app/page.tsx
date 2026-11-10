import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';

async function HomeBody() {
  const session = await getCurrentSession();

  if (session) {
    redirect('/dashboard');
  }

  redirect('/masuk');
  return null;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-600">Memuat…</div>}>
      <HomeBody />
    </Suspense>
  );
}