import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  PackageCheck, 
  Building2, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  FileCheck2,
  FileSpreadsheet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardData } from "@/actions/dashboard.actions";
import { formatTanggal } from "@/lib/utils";
import DashboardCharts from "@/components/dashboard/dashboard-charts";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  const res = await getDashboardData();
  const data = res.data;

  const stats = data?.stats || {
    totalVarianBarang: 0,
    totalSaldoFisik: 0,
    totalMasukBulanIni: 0,
    totalKeluarBulanIni: 0,
    criticalStockCount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0F2F64] via-[#0B2550] to-[#0284C7] p-6 md:p-8 text-white shadow-xl shadow-blue-950/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-sky-400/20 text-sky-200 border-sky-400/30 text-xs font-semibold">
                Sistem Informasi Persediaan Barang BPS Kab. Jeneponto
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {user?.name || "Petugas Persediaan"}! 👋
            </h1>
            <p className="text-blue-100 text-sm max-w-xl">
              Pantau posisi persediaan barang kantor, catat transaksi pengadaan & distribusi, serta terbitkan tanda terima penyerahan barang secara terpadu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/transaksi-masuk">
              <Button className="bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold gap-2 rounded-xl shadow-md">
                <ArrowDownLeft className="w-4 h-4" />
                Catat Barang Masuk
              </Button>
            </Link>
            <Link href="/transaksi-keluar">
              <Button className="bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold gap-2 rounded-xl shadow-md">
                <ArrowUpRight className="w-4 h-4" />
                Catat Barang Keluar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Varian Barang</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalVarianBarang}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Katalog master aktif</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0F2F64]">
              <Boxes className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Saldo Fisik</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalSaldoFisik.toLocaleString("id-ID")}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Unit persediaan riil</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <PackageCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mutasi Masuk Bulan Ini</p>
              <h3 className="text-2xl font-black text-sky-700 mt-1">+{stats.totalMasukBulanIni.toLocaleString("id-ID")}</h3>
              <p className="text-[11px] text-sky-600 font-semibold mt-1">Unit pengadaan</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mutasi Keluar Bulan Ini</p>
              <h3 className="text-2xl font-black text-orange-600 mt-1">-{stats.totalKeluarBulanIni.toLocaleString("id-ID")}</h3>
              <p className="text-[11px] text-orange-600 font-medium mt-1">Unit disalurkan</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warehouse Breakdown Widget (Gudang 1, 2, 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {data?.gudangBreakdown.map((g) => (
          <Card key={g.id} className="border-slate-200 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>{g.nama}</span>
                </div>
                <h4 className="text-xl font-black text-slate-900 mt-1">
                  {g.totalStok.toLocaleString("id-ID")} <span className="text-xs font-normal text-slate-500">Unit</span>
                </h4>
                <p className="text-[11px] text-slate-400">{g.totalItem} jenis barang</p>
              </div>
              <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">
                {g.totalStok > 0 ? "Aktif" : "Kosong"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section: Monthly Trends & Distribution */}
      {data && (
        <DashboardCharts
          monthlyTrends={data.monthlyTrends}
          fungsiDistribution={data.fungsiDistribution}
        />
      )}

      {/* Low-Stock Alert Table */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Peringatan Stok Kritis / Menipis (≤ 5 Unit)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Barang persediaan yang memerlukan pengadaan ulang segera agar operasional kantor tidak terhambat
            </CardDescription>
          </div>
          <Link href="/inventaris">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-sky-600 hover:text-sky-700 gap-1">
              Kelola Inventaris <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Kode Barang</th>
                <th className="py-2.5 px-4">Nama Barang Persediaan</th>
                <th className="py-2.5 px-4">Kategori & Lokasi</th>
                <th className="py-2.5 px-4 text-center">Status Stok</th>
                <th className="py-2.5 px-4 text-right">Saldo Saat Ini</th>
                <th className="py-2.5 px-4 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {!data?.criticalStockItems || data.criticalStockItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
                    <p className="font-semibold text-slate-700">Semua Stok Aman</p>
                    <p className="text-[11px] text-slate-500">Tidak ada barang dengan saldo kritis di bawah ambang batas.</p>
                  </td>
                </tr>
              ) : (
                data.criticalStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{item.kodeBarang}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{item.namaBarang}</td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {item.kategoriNama} • <span className="font-semibold text-slate-700">{item.gudangNama}</span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {item.stok === 0 ? (
                        <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold">
                          HABIS
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                          MENIPIS (≤ 5)
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-sm">
                      <span className={item.stok === 0 ? "text-red-600" : "text-amber-600"}>
                        {item.stok}
                      </span>{" "}
                      <span className="text-[11px] font-normal text-slate-500">{item.satuanNama}</span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Link href="/transaksi-masuk">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-[11px] font-semibold text-sky-700 border-sky-200 hover:bg-sky-50 rounded-lg gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Restock
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Two-Column Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Masuk */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-sky-600" />
                Pengadaan Masuk Terbaru
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                5 riwayat perolehan barang terakhir
              </CardDescription>
            </div>
            <Link href="/transaksi-masuk">
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
                Lihat Semua →
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {!data?.recentMasuk || data.recentMasuk.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">Belum ada transaksi masuk.</p>
            ) : (
              data.recentMasuk.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{m.barangNama}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {m.kodeTransaksi} • {formatTanggal(m.tanggal)}
                    </p>
                  </div>
                  <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-bold">
                    +{m.jumlahMasuk} {m.satuanNama}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Keluar */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-orange-600" />
                Distribusi Keluar Terbaru
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                5 riwayat penyaluran barang ke unit kerja
              </CardDescription>
            </div>
            <Link href="/transaksi-keluar">
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                Lihat Semua →
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {!data?.recentKeluar || data.recentKeluar.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">Belum ada transaksi keluar.</p>
            ) : (
              data.recentKeluar.map((k) => (
                <div key={k.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{k.barangNama}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Penerima: <strong className="text-slate-600">{k.penerimaNama}</strong> ({k.fungsiNama})
                    </p>
                  </div>
                  <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs font-bold">
                    -{k.jumlahKeluar} {k.satuanNama}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
