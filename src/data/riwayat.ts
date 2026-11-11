'use client';

export interface RiwayatItem {
  attemptId: string;
  nama: string;
  selesaiAt: string;
  soal: number;
  skorTotal: number;
  skorMaks: number;
  persen: number;
  jumlahBenar?: number;
  kategori?: 'TWK' | 'TIU' | 'TKP';
  ujianMode?: 'interaktif' | 'pembahasan';
  jumlahTWK?: number;
  jumlahTIU?: number;
  jumlahTKP?: number;
}

/** Ambil seluruh hasil ujian yang tersimpan di perangkat ini. */
export function getRiwayat(): RiwayatItem[] {
  if (typeof window === 'undefined') return [];

  const items: RiwayatItem[] = [];

  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('hasil_attempt_')) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const data = JSON.parse(raw) as Partial<RiwayatItem> & {
          attemptId?: string;
          jumlahTWK?: number;
          jumlahTIU?: number;
          jumlahTKP?: number;
        };

        const soal = Number(data.soal) || 0;
        const jumlah =
          (Number(data.jumlahTWK) || 0) +
          (Number(data.jumlahTIU) || 0) +
          (Number(data.jumlahTKP) || 0);
        const skorMaks = (jumlah > 0 ? jumlah : soal) * 5;
        const skorTotal = Number(data.skorTotal) || 0;

        items.push({
          attemptId: data.attemptId ?? key.replace('hasil_attempt_', ''),
          nama: data.nama ?? '',
          selesaiAt: data.selesaiAt ?? '',
          soal,
          skorTotal,
          skorMaks,
          persen: skorMaks > 0 ? Math.round((skorTotal / skorMaks) * 100) : 0,
          jumlahBenar: data.jumlahBenar,
          kategori: data.kategori,
          ujianMode: data.ujianMode,
          jumlahTWK: data.jumlahTWK,
          jumlahTIU: data.jumlahTIU,
          jumlahTKP: data.jumlahTKP,
        });
      } catch {
        // Lewati data rusak.
      }
    }
  } catch {
    return [];
  }

  return items.sort(
    (a, b) => new Date(b.selesaiAt).getTime() - new Date(a.selesaiAt).getTime(),
  );
}

export function formatTanggal(iso: string): string {
  if (!iso) return '—';
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return '—';
  return tanggal.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
