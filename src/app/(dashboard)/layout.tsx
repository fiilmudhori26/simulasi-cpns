export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-700 text-lg">SKD</span>
              <span className="font-semibold text-slate-700">CPNS</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                Beranda
              </a>
              <a
                href="/riwayat"
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                Riwayat
              </a>
              <a
                href="/ujian/leaderboard"
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                Leaderboard
              </a>
              <a href="/logout" className="text-sm font-medium text-red-600 hover:underline">
                Keluar
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  );
}