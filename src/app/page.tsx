import Link from "next/link";
import { Package, LogIn, CheckCircle2, ShieldAlert, ArrowRight, BarChart3, Database } from "lucide-react";
import { GithubBadge } from "@/components/layout/github-badge";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0F2F64] flex items-center justify-center text-white shadow-sm">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-[#0F2F64] tracking-tight block">SIPBAR WEB</span>
              <span className="text-xs text-slate-500 font-medium block">BPS Kabupaten Jeneponto</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/katalog"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#0F2F64] hover:bg-slate-100 rounded-lg transition-colors"
            >
              Katalog Barang Kantor
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 bg-[#0F2F64] hover:bg-[#0A1F42] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF4FA] border border-blue-200 text-[#0F2F64] text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Sistem Informasi Persediaan Barang BPS Kabupaten Jeneponto
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Transparansi & Akurasi Pengelolaan Barang Persediaan Kantor
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl">
          Cek ketersediaan ATK dan perlengkapan kerja secara mandiri, serta pencatatan mutasi masuk dan keluar berbasis transaksi terintegrasi.
        </p>

        {/* Quick Action CTA */}
        <div className="mt-8 flex justify-center w-full sm:w-auto">
          <Link
            href="/katalog"
            className="flex items-center justify-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-7 py-3.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all text-base"
          >
            <Package className="w-5 h-5" />
            <span>Cek Stok Barang Sekarang</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl w-full text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Stok Real-Time Transparan</h3>
            <p className="text-sm text-slate-600 mt-2">
              Seluruh pegawai dapat mengecek sisa kuantitas barang fisik dan lokasi gudang secara mandiri kapan saja.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0F2F64] flex items-center justify-center mb-4">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Integritas Transaksi ACID</h3>
            <p className="text-sm text-slate-600 mt-2">
              Pencatatan barang masuk dan keluar langsung memotong saldo stok secara otomatis tanpa risiko selisih data.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Tanda Terima & Laporan Resmi</h3>
            <p className="text-sm text-slate-600 mt-2">
              Otomasi penerbitan Berita Acara Tanda Terima format BPS siap cetak serta ekspor rekap mutasi ke Excel.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Badan Pusat Statistik Kabupaten Jeneponto. SIPBAR Web v1.0.0.</p>
          <GithubBadge />
        </div>
      </footer>
    </main>
  );
}
