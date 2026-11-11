import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/Toast';
import { PageTransition } from '@/components/PageTransition';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Simulasi SKD CPNS',
  description: 'Simulasi ujian CPNS gratis untuk teman dan komunitas.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ToastProvider>
          <PageTransition>{children}</PageTransition>
        </ToastProvider>
      </body>
    </html>
  );
}