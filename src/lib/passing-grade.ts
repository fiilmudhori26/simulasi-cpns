/**
 * Konfigurasi passing grade per sub-tes.
 * Nilai default diambil dari env agar dapat diubah tanpa mengubah kode.
 */
export function getPassingGrade() {
  return {
    TWK: Number(process.env.PASSING_GRADE_TWK ?? 65),
    TIU: Number(process.env.PASSING_GRADE_TIU ?? 80),
    TKP: Number(process.env.PASSING_GRADE_TKP ?? 166),
  } as const;
}