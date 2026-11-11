'use client';

import { useState, useEffect } from 'react';

export interface Statistik {
  besar: number;
  benar: number;
  salah: number;
  persen: number;
  streak: number;
  poin: number;
  kategori: {
    hukum: { besar: number; benar: number; persen: number };
    pamong: { besar: number; benar: number; persen: number };
    tatau: { besar: number; benar: number; persen: number };
    ipk: { besar: number; benar: number; persen: number };
  };
}

export const STATISTIK_DEFAULT: Statistik = {
  besar: 0,
  benar: 0,
  salah: 0,
  persen: 0,
  streak: 0,
  poin: 0,
  kategori: {
    hukum: { besar: 0, benar: 0, persen: 0 },
    pamong: { besar: 0, benar: 0, persen: 0 },
    tatau: { besar: 0, benar: 0, persen: 0 },
    ipk: { besar: 0, benar: 0, persen: 0 },
  },
};

export function getStatistik(): Statistik {
  if (typeof window === 'undefined') return STATISTIK_DEFAULT;
  try {
    const data = localStorage.getItem('statistik_cpns');
    if (!data) return STATISTIK_DEFAULT;
    return JSON.parse(data);
  } catch {
    return STATISTIK_DEFAULT;
  }
}

export function simpanStatistik(stat: Partial<Statistik>): void {
  if (typeof window === 'undefined') return;
  const current = getStatistik();
  const updated = { ...current, ...stat };
  localStorage.setItem('statistik_cpns', JSON.stringify(updated));
}

export function resetStatistik(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('statistik_cpns');
}

// Hook hook
export function useStatistik() {
  const [stat, setStat] = useState<Statistik>(STATISTIK_DEFAULT);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStat(getStatistik());
    }
  }, []);

  return stat;
}