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
  // Email plugin untuk development
  email: {
    // Send email via console for development
    sendEmail: async (params: { to: string; subject: string; body: string }) => {
      console.log('[EMAIL]', params);
      return true;
    },
    // Send reset password email - log URL untuk development
    sendResetPasswordEmail: async (params: { email: string; token: string; url: string }) => {
      console.log('[PASSWORD RESET]', params);
      return true;
    },
    // Send sign up email - skip requirement since requireEmailVerification is false
    sendSignUpEmail: async () => {
      console.log('[SIGNUP EMAIL] - Skipped (email verification not required)');
      return true;
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