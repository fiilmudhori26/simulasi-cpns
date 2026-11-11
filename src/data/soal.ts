export interface Soal {
  id: string;
  kategori: 'TWK' | 'TIU' | 'TKP';
  subkategori: string;
  teks_soal: string;
  opsi: { kode: string; teks: string; poin: number }[];
  kunci: string; // kode opsi benar
  tingkat_kesulitan: 1 | 2 | 3;
  pembahasan?: string; // penjelasan jawaban
  kunciTeks?: string; // penjelasan kunci jawaban
}

// Mock soal untuk development/testing - TWK
export const SOAL_TWK: Soal[] = [
  {
    id: 'twk-001',
    kategori: 'TWK',
    subkategori: 'Hukum dan Pemerintahan',
    teks_soal: 'Apa tujuan utama Undang-Undang Dasar 1945?',
    opsi: [
      { kode: 'A', teks: 'Menyelesaikan perbedaan dini antara bangsa dan agama', poin: 1 },
      { kode: 'B', teks: 'Memberikan ketertenan hukum bagi seluruh rakyat Indonesia', poin: 1 },
      { kode: 'C', teks: 'Mengentaskan kolonialisme', poin: 1 },
      { kode: 'D', teks: 'Memperkuat persatuan Indonesia', poin: 1 },
    ],
    kunci: 'B',
    tingkat_kesulitan: 1,
  },
  {
    id: 'twk-002',
    kategori: 'TWK',
    subkategori: 'Bendera dan Bahasa',
    teks_soal: 'Warna merah pada Bendera Indonesia mewakili dari mana?',
    opsi: [
      { kode: 'A', teks: 'Darah dan keberanian rakyat', poin: 1 },
      { kode: 'B', teks: 'Keberanian Benda', poin: 1 },
      { kode: 'C', teks: 'Keberanian Jawi', poin: 1 },
      { kode: 'D', teks: 'Keberanian Pahlawan', poin: 1 },
    ],
    kunci: 'A',
    tingkat_kesulitan: 1,
  },
  {
    id: 'twk-003',
    kategori: 'TWK',
    subkategori: 'Pancasila',
    teks_soal: 'Silanya Pancasila pertama adalah?',
    opsi: [
      { kode: 'A', teks: 'Ketuhanan Yang Maha Esa', poin: 1 },
      { kode: 'B', teks: 'Kemanusiaan yang Adil dan Beradab', poin: 1 },
      { kode: 'C', teks: 'Persatuan Indonesia', poin: 1 },
      { kode: 'D', teks: 'Kerakyatan yang Dipimpin oleh Hikmat', poin: 1 },
    ],
    kunci: 'A',
    tingkat_kesulitan: 1,
  },
  {
    id: 'twk-004',
    kategori: 'TWK',
    subkategori: 'Sejarah',
    teks_soal: 'Tahun berkuasa Pakubandi Sonoboyo adalah?',
    opsi: [
      { kode: 'A', teks: '1575-1620', poin: 1 },
      { kode: 'B', teks: '1613-1629', poin: 1 },
      { kode: 'C', teks: '1650-1675', poin: 1 },
      { kode: 'D', teks: '1680-1700', poin: 1 },
    ],
    kunci: 'B',
    tingkat_kesulitan: 2,
  },
  {
    id: 'twk-005',
    kategori: 'TWK',
    subkategori: 'Agama',
    teks_soal: 'Dewi Kali memerayakan hari apa yang paling penting?',
    opsi: [
      { kode: 'A', teks: 'Galungan dan Kuningan', poin: 1 },
      { kode: 'B', teks: 'Nyepi dan Ogoh-ogoh', poin: 1 },
      { kode: 'C', teks: 'Galungan dan Galunger', poin: 1 },
      { kode: 'D', teks: 'Ngaben dan Odalan', poin: 1 },
    ],
    kunci: 'A',
    tingkat_kesulitan: 2,
  },
  {
    id: 'twk-006',
    kategori: 'TWK',
    subkategori: 'Geografi',
    teks_soal: 'Gunung Kerinci terletak pada provinsi mana?',
    opsi: [
      { kode: 'A', teks: 'Sumatera Utara', poin: 1 },
      { kode: 'B', teks: 'Jambi', poin: 1 },
      { kode: 'C', teks: 'Riau', poin: 1 },
      { kode: 'D', teks: 'Sumateri Selatan', poin: 1 },
    ],
    kunci: 'B',
    tingkat_kesulitan: 1,
  },
  {
    id: 'twk-007',
    kategori: 'TWK',
    subkategori: 'Ekonomi',
    teks_soal: 'Program Buku Masak adalah kebijakan apa?',
    opsi: [
      { kode: 'A', teks: 'Menyelesaikan kemiskinan', poin: 1 },
      { kode: 'B', teks: 'Meningkatkan gereja', poin: 1 },
      { kode: 'C', teks: 'Mengembangkan pariwisata', poin: 1 },
      { kode: 'D', teks: 'Memperbaiki infrastruktur', poin: 1 },
    ],
    kunci: 'A',
    tingkat_kesulitan: 2,
  },
  {
    id: 'twk-008',
    kategori: 'TWK',
    subkategori: 'Sosial',
    teks_soal: 'Apa tujuan utama program KIP/KKS?',
    opsi: [
      { kode: 'A', teks: 'Memberikan bantuan sosial untuk pendidikan', poin: 1 },
      { kode: 'B', teks: 'Meningkatkan produktivitas petani', poin: 1 },
      { kode: 'C', teks: 'Mengurangi pengangguran', poin: 1 },
      { kode: 'D', teks: 'Meningkatkan kesehatan', poin: 1 },
    ],
    kunci: 'A',
    tingkat_kesulitan: 1,
  },
  {
    id: 'twk-009',
    kategori: 'TWK',
    subkategori: 'Menengah',
    teks_soal: 'Apa yang disebut dengan "Silaturahmi"?',
    opsi: [
      { kode: 'A', teks: 'Kegiatan sosial keagamaan', poin: 1 },
      { kode: 'B', teks: 'Sistem pemerintahan desa', poin: 1 },
      { kode: 'C', teks: 'Metode pengajaran', poin: 1 },
      { kode: 'D', teks: 'Judicial review', poin: 1 },
    ],
    kunci: 'A',
    tingkat_kesulitan: 1,
  },
  {
    id: 'twk-010',
    kategori: 'TWK',
    subkategori: 'Pancasila',
    teks_soal: 'Pancasila ketiga adalah Kerakyatan yang Dipimpin oleh Hikmat Kemakmuran Bersama. Ini berarti?',
    opsi: [
      { kode: 'A', teks: 'Demokrasi yang dipimpin oleh rakyat', poin: 1 },
      { kode: 'B', teks: 'Kekuasaan dipusatkan pada pemerintah', poin: 1 },
      { kode: 'C', teks: 'Desentralisasi pemerintahan', poin: 1 },
      { kode: 'D', teks: 'Monarki resmi', poin: 1 },
    ],
    kunci: 'A',
    tingkat_kesulitan: 2,
  },
];

// Mock soal untuk development/testing - TIU
// Tambahkan pembahasan ke tiap soal

// Mock soal untuk development/testing - TWK
export const SOAL_TIU: Soal[] = [
  {
    id: 'tiu-001',
    kategori: 'TIU',
    subkategori: 'Akuntansi',
    teks_soal: 'Seorang pedagang membeli barang dengan harga Rp 150.000 dan menjualnya dengan profit sebesar 20%. Harga jualnya adalah?',
    opsi: [
      { kode: 'A', teks: 'Rp 170.000', poin: 1 },
      { kode: 'B', teks: 'Rp 180.000', poin: 1 },
      { kode: 'C', teks: 'Rp 190.000', poin: 1 },
      { kode: 'D', teks: 'Rp 200.000', poin: 1 },
    ],
    kunci: 'B',
    tingkat_kesulitan: 1,
  },
  {
    id: 'tiu-002',
    kategori: 'TIU',
    subkategori: 'Matematika',
    teks_soal: 'Jika x + 3 = 10, maka nilai x adalah?',
    opsi: [
      { kode: 'A', teks: '5', poin: 1 },
      { kode: 'B', teks: '7', poin: 1 },
      { kode: 'C', teks: '8', poin: 1 },
      { kode: 'D', teks: '13', poin: 1 },
    ],
    kunci: 'B',
    tingkat_kesulitan: 1,
  },
  {
    id: 'tiu-003',
    kategori: 'TIU',
    subkategori: 'Logika',
    teks_soal: 'Semua buku adalah alat baca. Beberapa alat baca adalah buku. Kesimpulan yang dapat ditarik adalah?',
    opsi: [
      { kode: 'A', teks: 'Semua alat baca adalah buku', poin: 1 },
      { kode: 'B', teks: 'Tidak ada yang dapat ditarik', poin: 1 },
      { kode: 'C', teks: 'Beberapa buku adalah alat baca', poin: 1 },
      { kode: 'D', teks: 'Semua buku adalah buku', poin: 1 },
    ],
    kunci: 'C',
    tingkat_kesulitan: 2,
  },
  {
    id: 'tiu-004',
    kategori: 'TIU',
    subkategori: 'Statistika',
    teks_soal: 'Dari data: 2, 4, 4, 5, 6, 6, 6, 8, maka mediannya adalah?',
    opsi: [
      { kode: 'A', teks: '5', poin: 1 },
      { kode: 'B', teks: '5.5', poin: 1 },
      { kode: 'C', teks: '6', poin: 1 },
      { kode: 'D', teks: '4', poin: 1 },
    ],
    kunci: 'C',
    tingkat_kesulitan: 2,
  },
  {
    id: 'tiu-005',
    kategori: 'TIU',
    subkategori: 'Sejarah Ekonomi',
    teks_soal: 'Tahun berapa kemerdekaan Republik Indonesia?',
    opsi: [
      { kode: 'A', teks: '1942', poin: 1 },
      { kode: 'B', teks: '1944', poin: 1 },
      { kode: 'C', teks: '1945', poin: 1 },
      { kode: 'D', teks: '1946', poin: 1 },
    ],
    kunci: 'C',
    tingkat_kesulitan: 1,
  },
  {
    id: 'tiu-006',
    kategori: 'TIU',
    subkategori: 'Pengadilan',
    teks_soal: 'Hakim majemukanya adalah hakim yang...',
    opsi: [
      { kode: 'A', teks: 'Memiliki dua pendidikan', poin: 1 },
      { kode: 'B', teks: 'Punya dua profesi', poin: 1 },
      { kode: 'C', teks: 'Sudah menikah', poin: 1 },
      { kode: 'D', teks: 'Berusia tua', poin: 1 },
    ],
    kunci: 'D',
    tingkat_kesulitan: 2,
  },
  {
    id: 'tiu-007',
    kategori: 'TIU',
    subkategori: 'Pendidikan',
    teks_soal: 'Metode pengajaran yang memberi kesempatan belajar aktif disebut...',
    opsi: [
      { kode: 'A', teks: 'Metode ceracap', poin: 1 },
      { kode: 'B', teks: 'Metode demonstrasi', poin: 1 },
      { kode: 'C', teks: 'Metode tindak-tanam', poin: 1 },
      { kode: 'D', teks: 'Metode kerajinan', poin: 1 },
    ],
    kunci: 'C',
    tingkat_kesulitan: 1,
  },
  {
    id: 'tiu-008',
    kategori: 'TIU',
    subkategori: 'Bahasa',
    teks_soal: 'Silakan isi dengan kata yang tepat: "___ adalah langkah awal dalam pembelajaran."',
    opsi: [
      { kode: 'A', teks: 'Mengingat', poin: 1 },
      { kode: 'B', teks: 'Mengerti', poin: 1 },
      { kode: 'C', teks: 'Menerapkan', poin: 1 },
      { kode: 'D', teks: 'Menganalisis', poin: 1 },
    ],
    kunci: 'A',
    tingkat_kesulitan: 1,
  },
  {
    id: 'tiu-009',
    kategori: 'TIU',
    subkategori: 'Geografi',
    teks_soal: 'IBUKOTA Provinsi Jawa Barat adalah?',
    opsi: [
      { kode: 'A', teks: 'Bandung', poin: 1 },
      { kode: 'B', teks: 'Bogor', poin: 1 },
      { kode: 'C', teks: 'Depok', poin: 1 },
      { kode: 'D', teks: 'Cirebon', poin: 1 },
    ],
    kunci: 'A',
    tingkat_kesulitan: 1,
  },
  {
    id: 'tiu-010',
    kategori: 'TIU',
    subkategori: 'Statistika',
    teks_soal: 'Dalam diagram garis, Garis datar menunjukkan...',
    opsi: [
      { kode: 'A', teks: 'Tren meningkat', poin: 1 },
      { kode: 'B', teks: 'Tren menurun', poin: 1 },
      { kode: 'C', teks: 'Tidak ada perubahan', poin: 1 },
      { kode: 'D', teks: 'Data tidak lengkap', poin: 1 },
    ],
    kunci: 'C',
    tingkat_kesulitan: 2,
  },
];

// Mock soal untuk development/testing - TKP
export const SOAL_TKP: Soal[] = [
  {
    id: 'tkp-001',
    kategori: 'TKP',
    subkategori: 'Etika',
    teks_soal: 'Melaporkan pelanggaran disiplin guru kepada atasannya adalah...',
    opsi: [
      { kode: 'A', teks: 'Penghinaan', poin: 1 },
      { kode: 'B', teks: 'Pengkhianatan', poin: 1 },
      { kode: 'C', teks: 'Penunjukan tanggung jawab', poin: 1 },
      { kode: 'D', teks: 'Penghinaan guru', poin: 1 },
    ],
    kunci: 'C',
    tingkat_kesulitan: 2,
  },
  {
    id: 'tkp-002',
    kategori: 'TKP',
    subkategori: 'Kepribadian',
    teks_soal: 'Seorang yang sibuk mengatur urakan harian dan disiplin disebut...',
    opsi: [
      { kode: 'A', teks: 'Kurang disiplin', poin: 1 },
      { kode: 'B', teks: 'Sibuk urakan', poin: 1 },
      { kode: 'C', teks: 'Disiplin', poin: 1 },
      { kode: 'D', teks: 'Semangat', poin: 1 },
    ],
    kunci: 'C',
    tingkat_kesulitan: 1,
  },
  {
    id: 'tkp-003',
    kategori: 'TKP',
    subkategori: 'Motivasi',
    teks_soal: 'Yang manfaat untuk mencapai tujuan adalah...',
    opsi: [
      { kode: 'A', teks: 'Inisiatif', poin: 1 },
      { kode: 'B', teks: 'Tekun', poin: 1 },
      { kode: 'C', teks: 'Semangat', poin: 1 },
      { kode: 'D', teks: 'Kerja keras', poin: 1 },
    ],
    kunci: 'C',
    tingkat_kesulitan: 1,
  },
  {
    id: 'tkp-004',
    kategori: 'TKP',
    subkategori: 'Kepemimpinan',
    teks_soal: 'Kepemimpinan yang baik didefinisikan sebagai...',
    opsi: [
      { kode: 'A', teks: 'Mendiskriminasi', poin: 1 },
      { kode: 'B', teks: 'Mendukung hak asasi', poin: 1 },
      { kode: 'C', teks: 'Memaksa keputusan', poin: 1 },
      { kode: 'D', teks: 'Mengabaikan pendapat', poin: 1 },
    ],
    kunci: 'B',
    tingkat_kesulitan: 2,
  },
  {
    id: 'tkp-005',
    kategori: 'TKP',
    subkategori: 'Tim',
    teks_soal: 'Kemampuan bekerja dalam tim disebut...',
    opsi: [
      { kode: 'A', teks: 'Individual', poin: 1 },
      { kode: 'B', teks: 'Kompetitif', poin: 1 },
      { kode: 'C', teks: 'Kolaboratif', poin: 1 },
      { kode: 'D', teks: 'Konsentris', poin: 1 },
    ],
    kunci: 'C',
    tingkat_kesulitan: 1,
  },
  {
    id: 'tkp-006',
    kategori: 'TKP',
    subkategori: 'Etika',
    teks_soal: 'Menyelisiki rekening orang lain tanpa izin adalah...',
    opsi: [
      { kode: 'A', teks: 'Sah', poin: 1 },
      { kode: 'B', teks: 'Tidak sah', poin: 1 },
      { kode: 'C', teks: 'Boleh', poin: 1 },
      { kode: 'D', teks: 'Wajib', poin: 1 },
    ],
    kunci: 'B',
    tingkat_kesulitan: 2,
  },
  {
    id: 'tkp-007',
    kategori: 'TKP',
    subkategori: 'Kepribadian',
    teks_soal: 'Berani mengambil risiko untuk demensi pribadi adalah sifat...',
    opsi: [
      { kode: 'A', teks: 'Rele', poin: 1 },
      { kode: 'B', teks: 'Cemas', poin: 1 },
      { kode: 'C', teks: 'Malu', poin: 1 },
      { kode: 'D', teks: 'Bebas', poin: 1 },
    ],
    kunci: 'A',
    tingkat_kesulitan: 1,
  },
  {
    id: 'tkp-008',
    kategori: 'TKP',
    subkategori: 'Etika',
    teks_soal: 'Jika bertemu bocah curang dan tidak memberi tahu guru, maka kata sifatnya adalah...',
    opsi: [
      { kode: 'A', teks: 'Setia', poin: 1 },
      { kode: 'B', teks: 'Peduli', poin: 1 },
      { kode: 'C', teks: 'Kurang setia', poin: 1 },
      { kode: 'D', teks: 'Rasah', poin: 1 },
    ],
    kunci: 'C',
    tingkat_kesulitan: 2,
  },
  {
    id: 'tkp-009',
    kategori: 'TKP',
    subkategori: 'Kepribadian',
    teks_soal: 'Orang yang senang membantu orang lain tanpa di balas adalah...',
    opsi: [
      { kode: 'A', teks: 'Kasih sayang', poin: 1 },
      { kode: 'B', teks: 'Peduli', poin: 1 },
      { kode: 'C', teks: 'Ramah', poin: 1 },
      { kode: 'D', teks: 'Setia', poin: 1 },
    ],
    kunci: 'A',
    tingkat_kesulitan: 1,
  },
  {
    id: 'tkp-010',
    kategori: 'TKP',
    subkategori: 'Motivasi',
    teks_soal: 'Hanya dengan disiplin kita dapat mencapai tujuan yang...',
    opsi: [
      { kode: 'A', teks: 'Besar', poin: 1 },
      { kode: 'B', teks: 'Kecil', poin: 1 },
      { kode: 'C', teks: 'Tidak penting', poin: 1 },
      { kode: 'D', teks: 'Tidak relevan', poin: 1 },
    ],
    kunci: 'A',
    tingkat_kesulitan: 1,
  },
];

// Gabungkan semua soal
export const SOAL_MOCK: Soal[] = [...SOAL_TWK, ...SOAL_TIU, ...SOAL_TKP];

// Helper: Random soal by category
export function getRandomSoal(kategori: 'TWK' | 'TIU' | 'TKP', count = 10): Soal[] {
  const list = { TWK: SOAL_TWK, TIU: SOAL_TIU, TKP: SOAL_TKP };
  const filtered = [...list[kategori]];
  // Fisher-Yates shuffle
  filtered.sort(() => 0.5 - Math.random());
  return filtered.slice(0, count);
}

// Get all categories
export const KATEGORI = ['TWK', 'TIU', 'TKP'] as const;