'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Statistik as StatistikType, useStatistik } from '@/data/statistik';
import { motion, stagger, useInView } from 'framer-motion';
import { useWebAudio } from '@/hooks/useSound';
import { useToast } from '@/components/Toast';

interface Kategori {
  id: string;
  nama: string;
  persen: number;
  warna: string;
}

const KATEGORI_SKD: Kategori[] = [
  { id: 'hukum', nama: 'Hukum', persen: 0, warna: 'bg-blue-500' },
  { id: 'pamong', nama: 'Pamong', persen: 0, warna: 'bg-green-500' },
  { id: 'tatau', nama: 'Tata Uang', persen: 0, warna: 'bg-purple-500' },
  { id: 'ipk', nama: 'IPK', persen: 0, warna: 'bg-orange-500' },
];

// Counter animation component
function CountUp({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const startTime = Date.now();
    const endValue = value;
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * endValue));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <span className="font-semibold text-slate-800">{count}</span>;
}

// Progress Ring Component
function ProgressRing({ persen, warna = 'blue', size = 60, strokeWidth = 6 }: {
  persen: number;
  warna?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - persen / 100);

  const warnaMap: Record<string, string> = {
    blue: '#3b82f6',
    green: '#22c55e',
    purple: '#a855f7',
    orange: '#f97316',
  };

  const color = warnaMap[warna] || warnaMap.blue;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg style={{ width: size, height: size, transform: 'rotate(-90deg)' }}>
        <circle
          className="text-slate-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className={cn('transition-all', `text-${warna}-500`)}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <CountUp value={persen} duration={1} />
        <span className="text-xs font-medium text-slate-500 ml-1">%</span>
      </div>
    </div>
  );
}

// Skeleton Loader Components
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="h-5 w-3/12 bg-slate-200 rounded animate-pulse mb-4" />
      <div className="space-y-3">
        <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-1/4 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonKategori() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 bg-slate-200 rounded" />
          <div className="h-3 w-1/2 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// Scroll-triggered wrapper
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      {children}
    </motion.div>
  );
}

export default function DashboardPage() {
  const [nama, setNama] = useState('');
  const [kategoris, setKategoris] = useState<Kategori[]>(KATEGORI_SKD);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const statistik = useStatistik();
  const { playClick, playSuccess, playWhoosh } = useWebAudio();
  const { toast } = useToast();

  useEffect(() => {
    const storedNama = localStorage.getItem('user_nama');
    if (!storedNama) {
      router.push('/nama');
    } else {
      setNama(storedNama);
    }
  }, [router]);

  // Sinkron kategori dari statistik
  useEffect(() => {
    if (statistik.kategori) {
      setKategoris([
        {
          id: 'hukum',
          nama: 'Hukum',
          persen: statistik.kategori.hukum.persen,
          warna: 'bg-blue-500',
        },
        {
          id: 'pamong',
          nama: 'Pamong',
          persen: statistik.kategori.pamong.persen,
          warna: 'bg-green-500',
        },
        {
          id: 'tatau',
          nama: 'Tata Uang',
          persen: statistik.kategori.tatau.persen,
          warna: 'bg-purple-500',
        },
        {
          id: 'ipk',
          nama: 'IPK',
          persen: statistik.kategori.ipk.persen,
          warna: 'bg-orange-500',
        },
      ]);
    }
    // Mark as loaded after first render
    setIsLoaded(true);
  }, [statistik]);

  const handleMulaiSimulasi = () => {
    playSuccess();
    toast('Memulai simulasi CPNS...', 'success');
    router.push('/ujian/mulai');
  };

  const handleKlikKategori = (idKategori: string) => {
    playClick();
    toast(`Membuka latihan ${kategoris.find(k => k.id === idKategori)?.nama || idKategori}...`, 'info');
    router.push(`/ujian/mulai?kategori=${idKategori}`);
  };

  if (!nama) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  const Poin = statistik.poin || (statistik.besar + Math.round(statistik.benar * 5));

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
    hover: {
      y: -4,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.98 },
  };

  const statItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-white border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="font-bold text-blue-700 text-2xl"
              >
                SKD
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="font-semibold text-slate-700"
              >
                CPNS
              </motion.span>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="hidden md:flex items-center gap-6"
            >
              <a
                href="/dashboard"
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-md transition-colors"
              >
                Beranda
              </a>
              <a
                href="/riwayat"
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-md transition-colors"
              >
                Riwayat
              </a>
              <a
                href="/ujian/leaderboard"
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-md transition-colors"
              >
                Leaderboard
              </a>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting & Poin */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.h1
            variants={itemVariants}
            className="text-2xl font-bold text-slate-800"
          >
            Selamat datang,
            <motion.span
              className="text-blue-600"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {' '}
              {nama}
            </motion.span>{' '}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4, type: 'spring', stiffness: 200 }}
            >
              🎉
            </motion.span>
          </motion.h1>
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-6 mt-2 text-sm text-slate-600"
          >
            <span>
              Poin:{' '}
              <motion.span
                className="font-semibold text-amber-500"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5, type: 'spring', stiffness: 200 }}
              >
                <CountUp value={Poin} duration={1.5} />
              </motion.span>
            </span>
            <span>
              Tingkat:{' '}
              <span className="font-medium text-slate-800">Pemula</span>
            </span>
            {statistik.streak > 0 && (
              <motion.span
                className="text-amber-600"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                🔥 Streak: {statistik.streak}h
              </motion.span>
            )}
          </motion.div>
        </motion.div>

        {/* Cards Utama - Statistik & Mulai Simulasi */}
        <ScrollReveal delay={0.1}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {/* Statistik Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            >
              <motion.h2
                variants={itemVariants}
                className="text-lg font-semibold text-slate-800 mb-4"
              >
                Statistik Anda
              </motion.h2>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                <motion.div variants={statItemVariants} className="flex justify-between items-center">
                  <span className="text-slate-600">Pertanyaan Besar</span>
                  <CountUp value={statistik.besar} duration={1.2} />
                </motion.div>
                <motion.div variants={statItemVariants} className="flex justify-between items-center">
                  <span className="text-slate-600">Benar</span>
                  <span className="font-semibold text-slate-800">
                    <CountUp value={statistik.benar} duration={1.2} /> ({statistik.persen}%)
                  </span>
                </motion.div>
                <motion.div variants={statItemVariants} className="flex justify-between items-center">
                  <span className="text-slate-600">Streak Hari</span>
                  <span className="text-amber-500"><CountUp value={statistik.streak} duration={1} /></span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Mulai Simulasi Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            >
              <motion.h2
                variants={itemVariants}
                className="text-lg font-semibold text-slate-800 mb-4"
              >
                Mulai Simulasi
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-slate-600 mb-4"
              >
                Ujian lengkap untuk mencapai kesiapan CPNS
              </motion.p>
              <motion.button
                onClick={handleMulaiSimulasi}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 rounded-md text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                <motion.span
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  🔥
                </motion.span>{' '}
                Mulai Sekarang
              </motion.button>
            </motion.div>
          </motion.div>
        </ScrollReveal>

        {/* Kategori SKD with Progress Ring */}
        <ScrollReveal delay={0.2}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              variants={itemVariants}
              className="text-xl font-bold text-slate-800 mb-4"
            >
              Kategori SKD
            </motion.h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {isLoaded ? (
                kategoris.map((kategori, index) => (
                  <motion.button
                    key={kategori.id}
                    onClick={() => handleKlikKategori(kategori.id)}
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap="tap"
                    style={{ transitionDelay: `${index * 0.1}s` } as React.CSSProperties}
                    className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col items-center"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2 + index * 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-16 h-16 mb-3 flex items-center justify-center"
                    >
                      <ProgressRing
                        persen={kategori.persen}
                        warna={kategori.warna.replace('bg-', '').replace('-500', '')}
                        size={64}
                        strokeWidth={6}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="text-center"
                    >
                      <p className="font-medium text-slate-800">{kategori.nama}</p>
                      <p className="text-sm text-slate-500">
                        {kategori.persen > 0 ? `${kategori.persen}% selesai` : 'Mulai belajar'}
                      </p>
                    </motion.div>
                  </motion.button>
                ))
              ) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonKategori key={i} />
                ))
              )}
            </motion.div>
          </motion.div>
        </ScrollReveal>

        {/* Motivational Quote Section */}
        <ScrollReveal delay={0.3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            className="mt-12 p-6 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl text-white"
          >
            <div className="max-w-2xl mx-auto text-center">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-lg font-medium mb-2"
              >
                "Kesuksesan adalah jumlah dari usaha kecil yang diulang hari demi hari."
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-blue-100 text-sm"
              >
                — Robert Collier
              </motion.p>
            </div>
          </motion.div>
        </ScrollReveal>
      </main>

      {/* Navigasi Bawah - Mobile */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden"
      >
        <div className="flex justify-around py-3">
          <a href="/dashboard" className="flex flex-col items-center text-blue-600">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Beranda</span>
          </a>
          <a href="/riwayat" className="flex flex-col items-center text-slate-500">
            <span className="text-xl">📚</span>
            <span className="text-xs">Riwayat</span>
          </a>
          <a href="/ujian/leaderboard" className="flex flex-col items-center text-slate-500">
            <span className="text-xl">🏆</span>
            <span className="text-xs">Leaderboard</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}