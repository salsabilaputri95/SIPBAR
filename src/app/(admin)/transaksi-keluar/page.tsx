"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowUpRight, 
  Plus, 
  Search, 
  Calendar, 
  Trash2, 
  RefreshCw, 
  Boxes, 
  Building2, 
  Check, 
  X, 
  AlertCircle,
  PackageMinus,
  TrendingDown,
  UserCheck,
  FileCheck2,
  AlertTriangle,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  getTransaksiKeluarList, 
  getNextKodeKeluar, 
  getKeluarMetadata,
  createTransaksiKeluar, 
  deleteTransaksiKeluar 
} from "@/actions/keluar.actions";
import { getBarangList } from "@/actions/barang.actions";
import { TransaksiKeluarItem, BarangItem } from "@/types";
import { formatTanggal } from "@/lib/utils";

export default function TransaksiKeluarPage() {
  const [transactions, setTransactions] = useState<TransaksiKeluarItem[]>([]);
  const [barangList, setBarangList] = useState<BarangItem[]>([]);
  const [fungsis, setFungsis] = useState<Array<{ id: string; nama: string; kode: string }>>([]);
  const [penerimaList, setPenerimaList] = useState<string[]>([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTanggalAwal, setFilterTanggalAwal] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");
  const [selectedFungsiFilter, setSelectedFungsiFilter] = useState("ALL");
  const [selectedBarangFilter, setSelectedBarangFilter] = useState("ALL");
  const [selectedPenerimaFilter, setSelectedPenerimaFilter] = useState("ALL");

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransaksiKeluarItem | null>(null);
  const [nextCodePreview, setNextCodePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form State for Create
  const [createForm, setCreateForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    barangId: "",
    jumlahKeluar: 1,
    penerimaNama: "",
    penerimaNip: "",
    fungsiId: "",
    keterangan: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    const [resKeluar, resBarang, resMeta] = await Promise.all([
      getTransaksiKeluarList({
        search: searchQuery || undefined,
        tanggalAwal: filterTanggalAwal || undefined,
        tanggalAkhir: filterTanggalAkhir || undefined,
        fungsiId: selectedFungsiFilter !== "ALL" ? selectedFungsiFilter : undefined,
        barangId: selectedBarangFilter !== "ALL" ? selectedBarangFilter : undefined,
        penerimaNama: selectedPenerimaFilter !== "ALL" ? selectedPenerimaFilter : undefined,
      }),
      getBarangList(),
      getKeluarMetadata(),
    ]);

    if (resKeluar.success && resKeluar.data) {
      setTransactions(resKeluar.data.items);
      setTotalUnits(resKeluar.data.totalUnits);
    }
    if (resBarang.success && resBarang.data) {
      setBarangList(resBarang.data.items);
    }
    if (resMeta.success && resMeta.data) {
      setFungsis(resMeta.data.fungsis);
      setPenerimaList(resMeta.data.penerimas);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [filterTanggalAwal, filterTanggalAkhir, selectedFungsiFilter, selectedBarangFilter, selectedPenerimaFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenCreate = async () => {
    const resCode = await getNextKodeKeluar();
    if (resCode.success && resCode.data) {
      setNextCodePreview(resCode.data);
    }
    setCreateForm({
      tanggal: new Date().toISOString().split("T")[0],
      barangId: barangList[0]?.id || "",
      jumlahKeluar: 1,
      penerimaNama: "",
      penerimaNip: "",
      fungsiId: fungsis[0]?.id || "",
      keterangan: "",
    });
    setCreateDialogOpen(true);
  };

  const selectedBarangForCreate = useMemo(() => {
    return barangList.find((b) => b.id === createForm.barangId);
  }, [barangList, createForm.barangId]);

  const isStockInsufficient = useMemo(() => {
    if (!selectedBarangForCreate) return false;
    return Number(createForm.jumlahKeluar) > selectedBarangForCreate.stok;
  }, [selectedBarangForCreate, createForm.jumlahKeluar]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.barangId) {
      setActionMessage({ type: "error", text: "Silakan pilih barang persediaan." });
      return;
    }
    if (!createForm.fungsiId) {
      setActionMessage({ type: "error", text: "Silakan pilih seksi/fungsi penanggung jawab." });
      return;
    }
    if (!createForm.penerimaNama.trim()) {
      setActionMessage({ type: "error", text: "Silakan isi nama pegawai penerima." });
      return;
    }
    if (isStockInsufficient) {
      setActionMessage({ 
        type: "error", 
        text: `Stok tidak mencukupi! Saldo fisik saat ini hanya ${selectedBarangForCreate?.stok} ${selectedBarangForCreate?.satuanNama}.` 
      });
      return;
    }

    setSubmitting(true);
    setActionMessage(null);

    const res = await createTransaksiKeluar({
      tanggal: createForm.tanggal,
      barangId: createForm.barangId,
      jumlahKeluar: Number(createForm.jumlahKeluar),
      penerimaNama: createForm.penerimaNama.trim(),
      penerimaNip: createForm.penerimaNip.trim() || undefined,
      fungsiId: createForm.fungsiId,
      keterangan: createForm.keterangan.trim() || undefined,
    });

    setSubmitting(false);
    if (res.success) {
      setActionMessage({ type: "success", text: res.message || "Barang keluar berhasil dicatat." });
      setCreateDialogOpen(false);
      loadData();
    } else {
      setActionMessage({ type: "error", text: res.error || "Gagal mencatat pengeluaran barang." });
    }
  };

  const handleOpenDelete = (trx: TransaksiKeluarItem) => {
    setSelectedTransaction(trx);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedTransaction) return;
    setSubmitting(true);
    setActionMessage(null);

    const res = await deleteTransaksiKeluar(selectedTransaction.id);
    setSubmitting(false);
    if (res.success) {
      setActionMessage({ type: "success", text: res.message || "Transaksi berhasil dibatalkan dan stok dikembalikan." });
      setDeleteDialogOpen(false);
      loadData();
    } else {
      setActionMessage({ type: "error", text: res.error || "Gagal membatalkan transaksi." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Barang Keluar (Penyaluran)</h1>
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 font-bold">
              {transactions.length} Penyaluran
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pencatatan distribusi barang persediaan kepada pegawai/seksi BPS dengan validasi ketat anti-minus stok.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold gap-2 shadow-md shadow-orange-950/20 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Catat Barang Keluar
        </Button>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-medium">
            {actionMessage.type === "success" ? (
              <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Transaksi Keluar</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{transactions.length}</h3>
              <p className="text-[11px] text-slate-400">Log distribusi persediaan</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Unit Disalurkan</p>
              <h3 className="text-2xl font-black text-orange-600 mt-0.5">{totalUnits.toLocaleString("id-ID")}</h3>
              <p className="text-[11px] text-slate-400">Barang diserahkan ke pegawai</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <PackageMinus className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Proteksi Anti-Minus</p>
              <h3 className="text-sm font-bold text-emerald-700 mt-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Zero-Minus Guaranteed
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">ACID atomic transaction</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Check className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Cari kode BK-xxx, nama barang, penerima, atau seksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={filterTanggalAwal}
                  onChange={(e) => setFilterTanggalAwal(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 focus:outline-none"
                  title="Tanggal Awal"
                />
                <span className="text-slate-300">s/d</span>
                <input
                  type="date"
                  value={filterTanggalAkhir}
                  onChange={(e) => setFilterTanggalAkhir(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 focus:outline-none"
                  title="Tanggal Akhir"
                />
              </div>

              <select
                value={selectedFungsiFilter}
                onChange={(e) => setSelectedFungsiFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:bg-white max-w-xs truncate"
              >
                <option value="ALL">Semua Seksi/Fungsi</option>
                {fungsis.map((f) => (
                  <option key={f.id} value={f.id}>{f.nama}</option>
                ))}
              </select>

              <select
                value={selectedBarangFilter}
                onChange={(e) => setSelectedBarangFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:bg-white max-w-xs truncate"
              >
                <option value="ALL">Semua Barang</option>
                {barangList.map((b) => (
                  <option key={b.id} value={b.id}>{b.namaBarang}</option>
                ))}
              </select>

              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-10 px-3.5 rounded-xl border-slate-200 text-slate-700 font-semibold"
              >
                Terapkan
              </Button>

              {(filterTanggalAwal || filterTanggalAkhir || selectedFungsiFilter !== "ALL" || selectedBarangFilter !== "ALL" || selectedPenerimaFilter !== "ALL" || searchQuery) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterTanggalAwal("");
                    setFilterTanggalAkhir("");
                    setSelectedFungsiFilter("ALL");
                    setSelectedBarangFilter("ALL");
                    setSelectedPenerimaFilter("ALL");
                  }}
                  className="h-10 px-2.5 text-xs text-slate-500 hover:text-red-600"
                >
                  Reset
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadData}
                title="Muat Ulang"
                className="h-10 w-10 p-0 rounded-xl text-slate-500 hover:text-slate-900"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main Transactions Table */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Kode Transaksi</th>
                <th className="py-3.5 px-4">Tanggal Keluar</th>
                <th className="py-3.5 px-4">Nama Barang Persediaan</th>
                <th className="py-3.5 px-4 text-right">Jumlah Keluar</th>
                <th className="py-3.5 px-4">Penerima & Seksi / Fungsi</th>
                <th className="py-3.5 px-4">Tanda Terima</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-slate-300 border-t-[#F97316] rounded-full animate-spin" />
                      <p className="text-xs">Memuat data transaksi barang keluar...</p>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ArrowUpRight className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Tidak ada pengeluaran barang ditemukan</p>
                    <p className="text-xs text-slate-500">Sesuaikan filter atau catat barang keluar baru.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-orange-700">
                      {trx.kodeTransaksi}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {formatTanggal(trx.tanggal)}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 leading-snug">{trx.barangNama}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{trx.barangKode}</p>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-base font-black text-orange-600">
                        -{trx.jumlahKeluar}
                      </span>{" "}
                      <span className="text-xs text-slate-500 font-semibold">{trx.satuanNama}</span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <p className="font-bold text-slate-800">{trx.penerimaNama}</p>
                      <Badge variant="outline" className="text-[10px] mt-0.5 bg-slate-100 text-slate-700 border-slate-200">
                        {trx.fungsiNama}
                      </Badge>
                      {trx.keterangan && (
                        <p className="text-[11px] text-slate-400 italic truncate max-w-xs mt-0.5">{trx.keterangan}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      {trx.tandaTerimaNomor ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-mono text-[11px] gap-1">
                          <FileCheck2 className="w-3 h-3 text-emerald-600" />
                          {trx.tandaTerimaNomor}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Belum dibuatkan</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDelete(trx)}
                        title="Batalkan Transaksi Keluar"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DIALOG 1: CATAT BARANG KELUAR */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-orange-600" />
              Catat Penyaluran Barang Keluar
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Kode Otomatis: <strong className="text-orange-700 font-mono">{nextCodePreview}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Tanggal Pengeluaran *</label>
              <Input
                type="date"
                value={createForm.tanggal}
                onChange={(e) => setCreateForm({ ...createForm, tanggal: e.target.value })}
                required
                className="mt-1 h-10 rounded-xl bg-slate-50 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Pilih Barang Persediaan *</label>
              <select
                value={createForm.barangId}
                onChange={(e) => setCreateForm({ ...createForm, barangId: e.target.value })}
                required
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:bg-white"
              >
                <option value="">-- Pilih Barang --</option>
                {barangList.map((b) => (
                  <option key={b.id} value={b.id} disabled={b.stok <= 0}>
                    {b.namaBarang} ({b.kodeBarang}) - Stok: {b.stok} {b.satuanNama} {b.stok <= 0 ? "(HABIS)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Anti-Minus Real-Time Stock Calculation Banner */}
            {selectedBarangForCreate && (
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                isStockInsufficient 
                  ? "bg-red-50 border-red-300 text-red-900" 
                  : "bg-orange-50 border-orange-200 text-slate-800"
              }`}>
                <div>
                  <p className="text-slate-500 font-medium">Saldo Stok Fisik Saat Ini:</p>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {selectedBarangForCreate.stok} {selectedBarangForCreate.satuanNama}
                  </p>
                </div>
                <div className="text-right">
                  <p className={isStockInsufficient ? "text-red-700 font-bold" : "text-orange-800 font-semibold"}>
                    {isStockInsufficient ? "Status Validasi:" : "Sisa Stok Setelah Penyaluran:"}
                  </p>
                  {isStockInsufficient ? (
                    <div className="flex items-center gap-1 text-red-700 font-extrabold text-xs mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Stok Tidak Cukup! (Minus)</span>
                    </div>
                  ) : (
                    <p className="font-black text-emerald-700 text-sm">
                      {selectedBarangForCreate.stok - (Number(createForm.jumlahKeluar) || 0)} {selectedBarangForCreate.satuanNama}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700">Jumlah Keluar / Disalurkan *</label>
              <Input
                type="number"
                min="1"
                max={selectedBarangForCreate?.stok || 9999}
                value={createForm.jumlahKeluar}
                onChange={(e) => setCreateForm({ ...createForm, jumlahKeluar: parseInt(e.target.value, 10) || 1 })}
                required
                className={`mt-1 h-10 rounded-xl bg-slate-50 font-medium ${
                  isStockInsufficient ? "border-red-400 focus:ring-red-400 bg-red-50/30" : ""
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Nama Pegawai Penerima *</label>
                <input
                  list="penerima-options"
                  type="text"
                  placeholder="Ketik atau pilih nama pegawai..."
                  value={createForm.penerimaNama}
                  onChange={(e) => setCreateForm({ ...createForm, penerimaNama: e.target.value })}
                  required
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
                <datalist id="penerima-options">
                  {penerimaList.map((p, idx) => (
                    <option key={idx} value={p} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Seksi / Fungsi Penanggung Jawab *</label>
                <select
                  value={createForm.fungsiId}
                  onChange={(e) => setCreateForm({ ...createForm, fungsiId: e.target.value })}
                  required
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:bg-white"
                >
                  <option value="">-- Pilih Seksi/Fungsi --</option>
                  {fungsis.map((f) => (
                    <option key={f.id} value={f.id}>{f.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Keperluan / Keterangan Tambahan</label>
              <Input
                type="text"
                placeholder="Contoh: Kebutuhan Pencacahan Lapangan SAKERNAS 2026"
                value={createForm.keterangan}
                onChange={(e) => setCreateForm({ ...createForm, keterangan: e.target.value })}
                className="mt-1 h-10 rounded-xl bg-slate-50 font-medium"
              />
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || isStockInsufficient} 
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold"
              >
                {submitting ? "Memproses..." : "Simpan Barang Keluar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: BATALKAN TRANSAKSI */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Batalkan Penyaluran Barang Keluar
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin membatalkan transaksi <strong>{selectedTransaction?.kodeTransaksi}</strong> ({selectedTransaction?.jumlahKeluar} {selectedTransaction?.satuanNama} "{selectedTransaction?.barangNama}" kepada {selectedTransaction?.penerimaNama})?
              <br /><br />
              <span className="text-emerald-700 font-semibold">Pemulihan Stok Otomatis:</span> Saldo stok fisik barang ini akan otomatis dikembalikan (ditambah) sebanyak {selectedTransaction?.jumlahKeluar} unit ke inventaris persediaan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Tutup
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={handleDeleteSubmit}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {submitting ? "Membatalkan..." : "Ya, Batalkan & Kembalikan Stok"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
