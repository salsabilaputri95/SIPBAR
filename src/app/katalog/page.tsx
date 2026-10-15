"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { 
  Boxes, 
  Search, 
  Filter, 
  PackageCheck, 
  AlertTriangle, 
  XCircle, 
  Building2, 
  ArrowRight, 
  LogIn, 
  Layers, 
  LayoutGrid, 
  List, 
  RefreshCw,
  Info,
  Sparkles,
  MapPin,
  Tag,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getBarangList, getBarangMasterDropdowns } from "@/actions/barang.actions";
import { BarangItem, StatusStok } from "@/types";
import { GithubBadge } from "@/components/layout/github-badge";

export default function PublicCatalogPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<BarangItem[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; nama: string }>>([]);
  const [warehouses, setWarehouses] = useState<Array<{ id: string; nama: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | StatusStok>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const loadData = async () => {
    setIsLoading(true);
    const [resList, resDropdowns] = await Promise.all([
      getBarangList(),
      getBarangMasterDropdowns(),
    ]);

    if (resList.success && resList.data) {
      setItems(resList.data.items);
    }
    if (resDropdowns.success && resDropdowns.data) {
      setCategories(resDropdowns.data.kategori);
      setWarehouses(resDropdowns.data.gudang);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Items Memo
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.namaBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kodeBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kategoriNama.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === "ALL" || item.kategoriId === selectedCategory;

      const matchWarehouse =
        selectedWarehouse === "ALL" || item.gudangId === selectedWarehouse;

      const matchStatus =
        selectedStatus === "ALL" || item.statusStok === selectedStatus;

      return matchSearch && matchCategory && matchWarehouse && matchStatus;
    });
  }, [items, searchQuery, selectedCategory, selectedWarehouse, selectedStatus]);

  // Status Counts
  const stats = useMemo(() => {
    const total = items.length;
    const tersedia = items.filter((i) => i.statusStok === "TERSEDIA").length;
    const menipis = items.filter((i) => i.statusStok === "MENIPIS").length;
    const habis = items.filter((i) => i.statusStok === "HABIS").length;
    return { total, tersedia, menipis, habis };
  }, [items]);

  const getStatusBadge = (status: StatusStok) => {
    switch (status) {
      case "TERSEDIA":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-[11px] font-bold px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
            Tersedia
          </Badge>
        );
      case "MENIPIS":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 text-[11px] font-bold px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 inline-block animate-pulse" />
            Stok Menipis
          </Badge>
        );
      case "HABIS":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 text-[11px] font-bold px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 inline-block" />
            Stok Kosong
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-sky-100 selection:text-sky-900">
      {/* Header Publik */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F2F64] to-[#0284C7] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-[#0F2F64] tracking-tight">SIPBAR</span>
                <Badge variant="outline" className="text-[10px] font-bold text-sky-700 bg-sky-50 border-sky-200">
                  BPS 7304
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">Katalog Barang Persediaan Kantor</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-2">
                <Link href={session.user.role === "PEGAWAI" ? "/pegawai" : "/dashboard"}>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-9 px-3.5 rounded-xl bg-[#0F2F64] hover:bg-[#0A1F42] text-white font-semibold shadow-xs gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-400" />
                    <span>{session.user.role === "PEGAWAI" ? "Dashboard Pegawai" : "Dashboard Admin"}</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="h-9 px-3 rounded-xl border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 gap-1.5"
                  title="Keluar Akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs">Keluar</span>
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 rounded-xl border-slate-300 text-[#0F2F64] font-semibold hover:bg-slate-100 gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-[#0284C7]" />
                  <span>Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Hero Section */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0F2F64] via-[#0B2550] to-[#0284C7] p-6 sm:p-8 text-white shadow-xl shadow-blue-950/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-sky-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Monitoring Ketersediaan Stok Real-Time
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Katalog Barang Persediaan Kantor BPS Kabupaten Jeneponto
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Cek ketersediaan ATK, kertas, tinta printer, dan perlengkapan perkantoran secara transparan sebelum mengajukan kebutuhan unit kerja Anda ke bagian Tata Usaha.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <p className="text-xs text-blue-200 font-medium">Total Item Katalog</p>
              <p className="text-2xl font-black text-white mt-0.5">{stats.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <p className="text-xs text-emerald-200 font-medium">Stok Tersedia</p>
              <p className="text-2xl font-black text-emerald-300 mt-0.5">{stats.tersedia}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <p className="text-xs text-amber-200 font-medium">Stok Menipis (≤5)</p>
              <p className="text-2xl font-black text-amber-300 mt-0.5">{stats.menipis}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <p className="text-xs text-red-200 font-medium">Stok Kosong</p>
              <p className="text-2xl font-black text-red-300 mt-0.5">{stats.habis}</p>
            </div>
          </div>
        </div>

        {/* Filter Controls Card */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Top Row: Search & View Toggle */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Ketik nama barang (contoh: Kertas A4, Tinta Epson, Map, Binder Clips)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-sm font-medium"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Hapus
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      viewMode === "grid" ? "bg-white text-[#0F2F64] shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Kartu</span>
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      viewMode === "table" ? "bg-white text-[#0F2F64] shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">Tabel</span>
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  className="h-10 px-3 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900"
                  title="Muat ulang katalog"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Bottom Row: Category & Status Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Status:
              </span>

              {[
                { id: "ALL", label: "Semua Stok", count: stats.total },
                { id: "TERSEDIA", label: "Tersedia", count: stats.tersedia },
                { id: "MENIPIS", label: "Menipis (≤5)", count: stats.menipis },
                { id: "HABIS", label: "Habis", count: stats.habis },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStatus(s.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedStatus === s.id
                      ? "bg-[#0F2F64] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  <span>{s.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedStatus === s.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {s.count}
                  </span>
                </button>
              ))}

              {/* Kategori Dropdown */}
              <div className="ml-auto flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:bg-white w-full sm:w-48"
                >
                  <option value="ALL">Semua Kategori ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <p>
            Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> barang persediaan
            {searchQuery && ` untuk pencarian "${searchQuery}"`}
          </p>
          {(selectedCategory !== "ALL" || selectedStatus !== "ALL" || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setSelectedStatus("ALL");
              }}
              className="text-sky-600 hover:text-sky-700 font-semibold"
            >
              Reset Semua Filter
            </button>
          )}
        </div>

        {/* Items Display: Grid View */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-[#0F2F64] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Memuat Katalog Persediaan BPS...</p>
            <p className="text-xs text-slate-500 mt-1">Mengambil data posisi stok fisik terkini</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
              <Boxes className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Tidak ada barang yang cocok</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Barang yang Anda cari tidak ditemukan. Periksa ejaan atau bersihkan filter pencarian.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setSelectedStatus("ALL");
              }}
              className="mt-4 rounded-xl"
            >
              Reset Filter
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 bg-white rounded-2xl overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="p-4 pb-3 flex items-start justify-between gap-2 border-b border-slate-100 bg-slate-50/50">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                      {item.kodeBarang}
                    </span>
                    {getStatusBadge(item.statusStok)}
                  </div>

                  <div className="p-4 space-y-2.5">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-[#0F2F64] transition-colors">
                      {item.namaBarang}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{item.kategoriNama}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{item.gudangNama}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Sisa Saldo Stok</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className={`text-xl font-black ${
                        item.stok <= 0 ? "text-red-600" : item.stok <= item.minStok ? "text-amber-600" : "text-slate-900"
                      }`}>
                        {item.stok}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">{item.satuanNama}</span>
                    </div>
                  </div>

                  {item.stok <= item.minStok && item.stok > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                        Min: {item.minStok}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Table View */
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Kode</th>
                    <th className="py-3.5 px-4">Nama Barang Persediaan</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Lokasi Gudang</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Saldo Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-600">
                        {item.kodeBarang}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.namaBarang}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {item.kategoriNama}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {item.gudangNama}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(item.statusStok)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`text-base font-black ${
                          item.stok <= 0 ? "text-red-600" : item.stok <= item.minStok ? "text-amber-600" : "text-slate-900"
                        }`}>
                          {item.stok}
                        </span>{" "}
                        <span className="text-xs text-slate-500 font-semibold">{item.satuanNama}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Info Guide Card for Employees */}
        <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50/60 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">Informasi Permintaan Barang untuk Pegawai</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Untuk mengambil barang persediaan kantor, silakan koordinasikan dengan <strong>Pengelola Gudang (Nur Azizah Tajuddin, A.Md)</strong> atau <strong>Kepala Subbagian Umum BPS Kabupaten Jeneponto</strong>. Penyerahan barang resmi akan disertai bukti Berita Acara / Lembar Tanda Terima.
              </p>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer Minimalis */}
      <footer className="w-full border-t border-slate-200/60 py-5 px-6 mt-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Badan Pusat Statistik Kabupaten Jeneponto. Hak Cipta Dilindungi.</p>
          <GithubBadge />
        </div>
      </footer>
    </div>
  );
}
