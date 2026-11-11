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
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return null;
}