'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const nama = localStorage.getItem('user_nama');
    if (nama) {
      router.push('/dashboard');
    } else {
      router.push('/nama');
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-muted">Memuat…</span>
      </div>
    );
  }

  return null;
}