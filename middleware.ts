import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getCurrentSession();

  // Proteksi route dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/masuk', request.url));
    }
  }

  // Arahkan user yang sudah login halaman auth ke dashboard
  if (
    (request.nextUrl.pathname === '/masuk' ||
      request.nextUrl.pathname === '/daftar') &&
    session
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/masuk', '/daftar'],
};