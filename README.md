# Simulasi SKD CPNS

Web aplikasi simulasi ujian CPNS (TWK, TIU, TKP) gratis untuk teman dan komunitas.
Dibuat dengan Next.js (App Router), TypeScript, Tailwind CSS, Drizzle ORM, Neon Postgres,
dan Better Auth. Tampilan mobile-first, seluruh teks antarmuka dalam Bahasa Indonesia.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Neon Postgres (connection string via `DATABASE_URL`)
- Drizzle ORM + drizzle-kit (migrasi)
- @neondatabase/serverless (driver)
- Better Auth (Auth email/sandi; adapter Drizzle)
- Vercel (deploy target)
- Recharts (grafik progres), Zod (validasi impor), Lucide (ikon)

## Struktur Fitur (7 Fase)

1. **Fondasi** — inisialisasi proyek, skema Drizzle, koneksi Neon.
2. **Autentikasi** — daftar, masuk, keluar, proteksi route, profil singkat.
3. **Mesin ujian** — mulai simulasi (penuh/kategori), timer akurat, auto-save jawaban,
   penilaian server-side, passing grade konfigurasi.
4. **Hasil dan pembahasan** — skor per sub-tes, status lulus, pembahasan tiap soal.
5. **Riwayat dan leaderboard** — grafik progres skor (Recharts), top 50 leaderboard.
6. **Impor soal dan admin** — skrip CLI impor JSON, halaman admin verifikasi/hapus draft.
7. **Finishing** — loading/empty/error state, aksesibilitas dasar, README.

## Langkah Setup

### 1. Siapkan database Neon
Buat project di [neon.tech](https://neon.tech) (atau via **Vercel Storage → Postgres**),
 lalu ambil connection string (`DATABASE_URL`).

### 2. Konfigurasi variabel lingkungan
Salin contoh dan isi nilai asli:

```bash
cp .env.example .env
```

Isi `.env`:
- `DATABASE_URL` — connection string Neon Postgres (`?sslmode=require`)
- `BETTER_AUTH_SECRET` — secret minimal 32 karakter (hasil `openssl rand -base64 32`)
- `BETTER_AUTH_URL` — URL aplikasi (contoh: `http://localhost:3000`)
- `NEXT_PUBLIC_ADMIN_EMAILS` — email admin, dipisahkan komma
- `PASSING_GRADE_TWK`, `PASSING_GRADE_TIU`, `PASSING_GRADE_TKP` — nilai minimum lulus
  (default: 65 / 80 / 166)

### 3. Install dan jalankan secara lokal

```bash
npm install
npm run db:generate   # generate migrasi Drizzle (perlu DATABASE_URL valid)
npm run db:migrate    # terapkan migrasi ke Neon
npm run dev
```

Buka `http://localhost:3000`.

### 4. Impor soal contoh
```bash
npx tsx scripts/import-questions.ts contoh-soal.json
```
Soal akan masuk dengan status `draft`. Lalu verifikasi melalui halaman `/admin`
(login sebagai admin terlebih dahulu).

Untuk migrasi dari file ekspor Supabase (CSV/JSON):
```bash
npx tsx scripts/import-from-supabase-export.ts file-ekspor.json
```

### 5. Buat akun admin
- Daftar akun via `/daftar` dengan email yang tercantum di `NEXT_PUBLIC_ADMIN_EMAILS`.
- Akses `/admin` untuk verifikasi soal draft.

### 6. Deploy ke Vercel
1. Push kode ke repository GitHub/GitLab.
2. Import project di [vercel.com](https://vercel.com).
3. Tambahkan semua variabel di `.env` ke **Project Settings → Environment Variables**.
   Untuk database, gunakan **Vercel Storage → Postgres** dan ambil `DATABASE_URL`-nya,
   atau isi manual connection string Neon.
4. Jalankan `npx drizzle-kit migrate` (via Vercel CLI / local dengan `DATABASE_URL`
   produksi) untuk membuat tabel, atau tambahkan sebagai step build.
5. Deploy. Pastikan migrasi sudah dijalankan di database produksi.

## Perintah Berguna

```bash
npm run db:generate   # generate file migrasi dari skema
npm run db:migrate    # terapkan migrasi ke database
npm run db:studio     # buka Drizzle Studio (inspect data)
npm run dev           # jalankan development server
npm run build         # build produksi
npm run start         # jalankan server produksi
npm run lint          # pengecekan kode
```

## Asumsi (Keputusan Desain Sederhana)

- `@neondatabase/serverless` + Drizzle ORM digantikan `@supabase/supabase-js`; RLS
  tidak digunakan lagi, aturan akses diberlakukan di kode server (user hanya bisa
  baca/tulis attempt dan jawabannya sendiri).
- Soal yang dikirim ke peserta hanya yang berstatus `terverifikasi`; kunci jawaban dan
  poin TIDAK dikirim ke klien selama ujian berlangsung. Penilaian dihitung di server.
- `passing_grade_config` menyimpan satu baris (id=1) sebagai sumber kualitas passing
  grade, dengan fallback ke env `PASSING_GRADE_*`.
- Better Auth menyimpan `nama_tampil` di tabel `user` (mengganti tabel `profiles` lama);
  email/password diaktifkan, Google Auth tidak digunakan (tidak ada di versi sebelumnya).
- Tabel `account` dan `verification` disediakan untuk kebutuhan adapter Drizzle Better Auth,
  meski hanya email/sandi yang digunakan.
- Root dan halaman admin menggunakan Partial Prerender (Suspense) karena `dynamic`
  config tidak kompatibel dengan `cacheComponents` di Next 16.
- Soal ujian disimpan sebagai array ID (`attempts.soalIds`) agar survive refresh.
- Leaderboard menampilkan hanya `nama_tampil` dan `skor_total` tertinggi per pengguna.

## Lisensi

Gratis untuk komunitas.