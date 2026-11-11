'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type IconProps = { className?: string };

function IconBeranda({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function IconUjian({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h9l5 5v13H6z" />
      <path d="M14 3v6h6" />
      <path d="m9.5 14.5 2 2 3.5-4" />
    </svg>
  );
}

function IconRiwayat({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function IconPeringkat({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3" />
    </svg>
  );
}

const NAV = [
  { href: '/dashboard', label: 'Beranda', icon: IconBeranda },
  { href: '/ujian/mulai', label: 'Mulai Ujian', icon: IconUjian },
  { href: '/riwayat', label: 'Riwayat', icon: IconRiwayat },
  { href: '/ujian/leaderboard', label: 'Peringkat', icon: IconPeringkat },
];

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ nama }: { nama?: string }) {
  const pathname = usePathname();
  const inisial = nama?.trim().charAt(0).toUpperCase() || '?';

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="Beranda Simulasi SKD CPNS">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand text-[11px] font-extrabold tracking-tight text-white shadow-sm">
              SKD
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-bold tracking-tight text-ink">
                Simulasi CPNS
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-soft">
                Seleksi Kompetensi Dasar
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn('nav-link', isActive(pathname, item.href) && 'nav-link-active')}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {nama ? (
            <div className="flex items-center gap-2.5">
              <span className="hidden text-right text-xs leading-tight sm:block">
                <span className="block font-semibold text-ink">{nama}</span>
                <span className="block text-muted-soft">Peserta</span>
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-muted font-display text-sm font-bold text-brand">
                {inisial}
              </span>
            </div>
          ) : (
            <Link href="/nama" className="btn btn-primary btn-sm hidden sm:inline-flex">
              Mulai
            </Link>
          )}
        </div>
      </header>

      {/* Navigasi bawah khusus mobile */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Navigasi mobile"
      >
        <div className="mx-auto grid max-w-md grid-cols-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-1 pb-2.5 pt-2 text-[11px] font-medium transition-colors',
                  active ? 'text-brand' : 'text-muted-soft hover:text-ink',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-12 items-center justify-center rounded-full transition-colors',
                    active && 'bg-brand-soft',
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
