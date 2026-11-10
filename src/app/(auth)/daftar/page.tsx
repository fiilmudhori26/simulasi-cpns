'use client';

import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth-form';

export default function DaftarPage() {
  const router = useRouter();
  return <AuthForm mode="daftar" onSuccess={() => router.push('/dashboard')} />;
}