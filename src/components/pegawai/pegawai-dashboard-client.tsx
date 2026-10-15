"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { 
  Boxes, 
  Package, 
  PackageCheck, 
  Calendar, 
  Clock, 
  User, 
  ShieldCheck, 
  LogOut, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  FileText, 
  Building2, 
  Sparkles,
  TrendingDown,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  PegawaiDashboardData, 
  BarangOpsiPengambilan, 
  PegawaiRiwayatItem,
  getPegawaiDashboardData,
  getPegawaiRiwayatPengambilan
} from "@/actions/pegawai.actions";
import { PengambilanDialog } from "./pengambilan-dialog";
import { formatTanggal } from "@/lib/utils";
import { GithubBadge } from "@/components/layout/github-badge";

interface PegawaiDashboardClientProps {
  initialData: PegawaiDashboardData;
  availableItems: BarangOpsiPengambilan[];
}

export function PegawaiDashboardClient({
  initialData,
  availableItems,
}: PegawaiDashboardClientProps) {
  const [data, setData] = useState<PegawaiDashboardData>(initialData);
  const [historyItems, setHistoryItems] = useState<PegawaiRiwayatItem[]>(initialData.recentHistory);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const profile = data.profile;
  const stats = data.stats;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const res = await getPegawaiDashboardData();
    if (res.success && res.data) {
      setData(res.data);
      setHistoryItems(res.data.recentHistory);
    }
    setIsRefreshing(false);
  };

  const handleSuccessPengambilan = async (message: string) => {
    setSuccessNotice(message);
    await handleRefresh();
    // Auto hide success notice after 8 seconds
    setTimeout(() => {
      setSuccessNotice(null);
    }, 8000);
  };

  const filteredHistory = historyItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.barangNama.toLowerCase().includes(q) ||
      item.barangKode.toLowerCase().includes(q) ||
      item.kodeTransaksi.toLowerCase().includes(q) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(q)) ||
      (item.kategoriNama && item.kategoriNama.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-sky-100 selection:text-sky-900">
      {/* Top Navbar Khusus Pegawai */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/pegawai" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F2F64] to-[#0284C7] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-[#0F2F64] tracking-tight">SIPBAR</span>
                <Badge variant="outline" className="text-[10px] font-bold text-sky-700 bg-sky-50 border-sky-200">
                  Dashboard Pegawai
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">BPS Kabupaten Jeneponto</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/katalog">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3.5 rounded-xl border-slate-300 text-[#0F2F64] font-semibold hover:bg-slate-100 gap-1.5"
              >
                <Package className="w-4 h-4 text-[#0284C7]" />
                <span className="hidden sm:inline">Katalog Barang Persediaan Kantor</span>
                <span className="sm:hidden">Katalog</span>
              </Button>
            </Link>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">{profile.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{profile.nip ? `NIP. ${profile.nip}` : `@${profile.username}`}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="h-9 px-3 rounded-xl border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 gap-1.5"
                title="Keluar dari akun"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Sukses Notifikasi */}
        {successNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3 text-emerald-900 shadow-sm animate-in fade-in-50 duration-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-sm">Transaksi Berhasil Dicatat!</p>
                <p className="text-xs text-emerald-700 mt-0.5">{successNotice}</p>
              </div>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 px-2 py-1"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Hero Banner Pegawai */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0F2F64] via-[#0B2550] to-[#0284C7] p-6 sm:p-8 text-white shadow-xl shadow-blue-950/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-sky-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Layanan Persediaan Mandiri Pegawai
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Halo, {profile.name}! 👋
              </h1>
              <p className="text-blue-100 text-sm leading-relaxed">
                Catat pengambilan barang ATK dan sarana kerja kantor secara mandiri, pantau riwayat mutasi barang Anda, serta cek sisa stok terkini di gudang persediaan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold h-11 px-5 rounded-xl shadow-md gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Catat Pengambilan Barang</span>
              </Button>

              <Link href="/katalog">
                <Button
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-semibold h-11 px-4 rounded-xl shadow-xs gap-2"
                >
                  <Package className="w-4 h-4 text-sky-200" />
                  <span>Katalog Kantor</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 2 Kolom: Data Pribadi & Akun + KPI Aktivitas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Data Pribadi & Akun */}
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl lg:col-span-1">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0F2F64]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">Data Akun Pegawai</CardTitle>
                    <CardDescription className="text-xs">Informasi identitas kedinasan Anda</CardDescription>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                  Aktif
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3.5 text-xs">
              <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Nama Lengkap</span>
                <span className="font-bold text-slate-800 text-right max-w-[60%]">{profile.name}</span>
              </div>

              <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">NIP Pegawai</span>
                <span className="font-mono font-semibold text-slate-800 text-right">{profile.nip || "-"}</span>
              </div>

              <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Username Login</span>
                <span className="font-mono text-sky-700 font-semibold text-right">@{profile.username}</span>
              </div>

              <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Satuan Kerja / Unit</span>
                <span className="font-semibold text-slate-800 text-right">{profile.fungsiNama}</span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-slate-500 font-medium">Hak Akses Sistem</span>
                <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200 text-slate-700 font-semibold">
                  Pegawai BPS
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 3 KPI Metric Cards Ringkasan Saya */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl flex flex-col justify-between">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pengambilan</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0F2F64]">
                    <TrendingDown className="w-5 h-5 text-sky-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mt-2">{stats.totalTransaksi}</h3>
                <p className="text-[11px] text-slate-400 mt-1">Kali transaksi keluar</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl flex flex-col justify-between">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Fisik Diambil</span>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
                    <PackageCheck className="w-5 h-5 text-[#F97316]" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mt-2">{stats.totalUnitDiambil}</h3>
                <p className="text-[11px] text-orange-600 font-semibold mt-1">Total unit barang</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl flex flex-col justify-between">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Terakhir Diambil</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                {stats.transaksiTerakhir ? (
                  <div className="mt-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate" title={stats.transaksiTerakhir.barangNama}>
                      {stats.transaksiTerakhir.barangNama}
                    </h4>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      {stats.transaksiTerakhir.jumlah} {stats.transaksiTerakhir.satuan} • {formatTanggal(stats.transaksiTerakhir.tanggal)}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-slate-400">Belum ada transaksi</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Mulai dengan mencatat barang</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabel Riwayat Pengambilan Barang Milik Pegawai Ini */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0F2F64]" />
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Riwayat Pengambilan Barang Saya
                  </CardTitle>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Daftar seluruh transaksi pengambilan barang persediaan kantor yang Anda catat
                </CardDescription>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Cari transaksi / barang..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 rounded-xl bg-white border-slate-200 text-xs"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-9 px-3 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 gap-1.5"
                  title="Segarkan data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline text-xs">Segarkan</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredHistory.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-700">Belum Ada Riwayat Pengambilan</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {searchQuery ? "Tidak ditemukan transaksi yang cocok dengan kata kunci pencarian Anda." : "Anda belum pernah mencatat pengambilan barang dari persediaan kantor."}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setDialogOpen(true)}
                    className="mt-4 bg-[#0F2F64] hover:bg-[#0A1F42] text-white text-xs font-semibold rounded-xl gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Catat Pengambilan Pertama</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Kode Transaksi</th>
                      <th className="px-5 py-3.5">Waktu Pengambilan</th>
                      <th className="px-5 py-3.5">Nama & Jenis Barang</th>
                      <th className="px-5 py-3.5 text-center">Jumlah Diambil</th>
                      <th className="px-5 py-3.5">Keperluan / Keterangan</th>
                      <th className="px-5 py-3.5 text-center">Tanda Terima</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 font-mono font-semibold text-sky-700 whitespace-nowrap">
                          {item.kodeTransaksi}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                          <div className="font-medium text-slate-800">
                            {formatTanggal(item.tanggal)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(item.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WITA
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{item.barangNama}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                            <span className="font-mono text-slate-400">{item.barangKode}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-slate-50">
                              {item.kategoriNama}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-[#EA580C] font-bold text-xs">
                            {item.jumlahKeluar} {item.satuanNama}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600 max-w-xs">
                          <p className="line-clamp-2">{item.keterangan || "-"}</p>
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          {item.tandaTerimaNomor ? (
                            <Badge className="bg-blue-50 text-[#0F2F64] border-blue-200 font-mono text-[10px]">
                              {item.tandaTerimaNomor}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-[10px]">
                              Pengambilan Mandiri
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal / Dialog Catat Pengambilan Barang */}
      <PengambilanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        availableItems={availableItems}
        onSuccess={handleSuccessPengambilan}
      />

      {/* Footer Minimalis */}
      <footer className="w-full border-t border-slate-200/60 py-4 px-6 text-xs text-slate-400 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Badan Pusat Statistik Kabupaten Jeneponto. SIPBAR Web v1.0.0.</p>
          <GithubBadge />
        </div>
      </footer>
    </div>
  );
}
