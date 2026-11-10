export type KategoriSoal = 'TWK' | 'TIU' | 'TKP';
export type StatusSoal = 'draft' | 'terverifikasi';

export interface OpsiSoal {
  kode: string;
  teks: string;
  poin: number;
}

export interface Question {
  id: string;
  kategori: KategoriSoal;
  subkategori: string;
  teks_soal: string;
  opsi: OpsiSoal[];
  kunci?: string;
  pembahasan?: string;
  tingkat_kesulitan: number;
  status: StatusSoal;
  created_at: string;
}

export interface Attempt {
  id: string;
  user_id: string;
  soal_ids?: string[];
  mulai_at: string;
  selesai_at?: string;
  skor_twk: number;
  skor_tiu: number;
  skor_tkp: number;
  skor_total: number;
  lulus_pg: boolean;
}

export interface AttemptAnswer {
  attempt_id: string;
  question_id: string;
  jawaban_kode?: string;
  poin_didapat: number;
}

export interface Profile {
  id: string;
  nama_tampil: string;
  created_at: string;
}

export interface LeaderboardEntry {
  nama_tampil: string;
  skor_total: number;
}

export interface PassingGrade {
  TWK: number;
  TIU: number;
  TKP: number;
}

export interface SoalJsonInput {
  kategori: KategoriSoal;
  subkategori: string;
  teks_soal: string;
  opsi: OpsiSoal[];
  kunci?: string;
  pembahasan?: string;
  tingkat_kesulitan?: number;
}