import { pgTable, uuid, text, jsonb, integer, boolean, timestamp, pgEnum, primaryKey } from 'drizzle-orm/pg-core';

export const kategoriEnum = pgEnum('kategori', ['TWK', 'TIU', 'TKP']);
export const statusEnum = pgEnum('status', ['draft', 'terverifikasi']);

/** Bank soal. */
export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  kategori: kategoriEnum('kategori').notNull(),
  subkategori: text('subkategori').notNull(),
  teks_soal: text('teks_soal').notNull(),
  opsi: jsonb('opsi').notNull().default([]), // [{kode, teks, poin}]
  kunci: text('kunci'), // kode opsi benar (TWK/TIU)
  pembahasan: text('pembahasan'),
  tingkat_kesulitan: integer('tingkat_kesulitan').notNull().default(1),
  status: statusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Percobaan ujian satu pengguna. */
export const attempts = pgTable('attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(), // id user dari Better Auth (text)
  soalIds: jsonb('soal_ids').notNull().default([]), // id soal dalam percobaan ini
  mulaiAt: timestamp('mulai_at', { withTimezone: true }).notNull().defaultNow(),
  selesaiAt: timestamp('selesai_at', { withTimezone: true }),
  skorTwk: integer('skor_twk').notNull().default(0),
  skorTiu: integer('skor_tiu').notNull().default(0),
  skorTkp: integer('skor_tkp').notNull().default(0),
  skorTotal: integer('skor_total').notNull().default(0),
  lulusPg: boolean('lulus_pg').notNull().default(false),
});

/** Jawaban per soal dalam satu percobaan. */
export const attemptAnswers = pgTable('attempt_answers', {
  attemptId: uuid('attempt_id').notNull().references(() => attempts.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  jawabanKode: text('jawaban_kode'),
  poinDidapat: integer('poin_didapat').notNull().default(0),
}, (table) => ({
  pk: primaryKey({ columns: [table.attemptId, table.questionId] }),
}));

/** Konfigurasi passing grade (satu baris). */
export const passingGradeConfig = pgTable('passing_grade_config', {
  id: integer('id').notNull().default(1).primaryKey(),
  twk: integer('twk').notNull().default(65),
  tiu: integer('tiu').notNull().default(80),
  tkp: integer('tkp').notNull().default(166),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;
export type AttemptAnswer = typeof attemptAnswers.$inferSelect;
export type NewAttemptAnswer = typeof attemptAnswers.$inferInsert;

/** User dari Better Auth (mengganti tabel profiles + auth.users lama). */
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('nama_tampil').notNull().default('Pengguna'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/** Session Better Auth. */
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

/** Akun OAuth / kredensial (diperlukan adapter Drizzle, juga menyimpan password hash email/password). */
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/** Verifikasi email (token). */
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;