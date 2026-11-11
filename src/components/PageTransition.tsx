'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

/**
 * Transisi halaman yang tenang: hanya fade + geser tipis.
 * Tanpa scale dan tanpa animasi keluar agar tidak terasa "berat".
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-in min-h-screen">
      {children}
    </div>
  );
}
