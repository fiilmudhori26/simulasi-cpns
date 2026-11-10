import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db/index';
import { user, session, account, verification } from '@/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  emailAndPassword: {
    enabled: true,
    // Nonaktifkan requirement verifikasi email untuk penggunaan development
    // User dapat langsung login setelah daftar
    requireEmailVerification: false,
    // Reset password token expires in 1 hour
    resetPasswordTokenExpiresIn: 3600,
  },
  // Konfigurasi email untuk reset password
  // Untuk development, kita gunakan redirect ke frontend
  email: {
    // Send reset password email via redirect
    sendResetPasswordEmail: async (params: { email: string; token: string; url: string }) => {
      // Log URL reset untuk development
      console.log('[PASSWORD RESET]', { email: params.email, url: params.url });
      // Di production, kirim email melalui provider seperti nodemailer
      // Untuk now, redirect langsung ke frontend dengan token
      return { success: true };
    },
  },
});

const handler = auth.handler;

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}

export async function PUT(request: Request) {
  return handler(request);
}

export async function PATCH(request: Request) {
  return handler(request);
}

export async function DELETE(request: Request) {
  return handler(request);
}

export async function OPTIONS(request: Request) {
  return handler(request);
}