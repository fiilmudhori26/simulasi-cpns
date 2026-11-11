import { NextResponse, type NextRequest } from 'next/server';

// Route yang boleh diakses tanpa proteksi - semua publik
// Proteksi nama pengguna di handle di client-side
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/riwayat/:path*',
    '/ujian/:path*',
    '/admin/:path*',
    '/masuk',
    '/daftar',
    '/lupa-kata-sandi',
    '/reset-kata-sandi/[...slug]',
  ],
};