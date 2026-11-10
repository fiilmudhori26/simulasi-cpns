export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Beranda</h1>
        <p className="mt-1 text-slate-600">
          Selamat datang kembali. Mulai simulasi ujian CPNS Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <a
          href="/ujian/mulai"
          className="block bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-blue-300 transition"
        >
          <h3 className="font-semibold text-slate-800 mb-1">Mulai Simulasi</h3>
          <p className="text-sm text-slate-500">Ujian lengkap atau latihan per kategori</p>
        </a>
      </div>
    </div>
  );
}