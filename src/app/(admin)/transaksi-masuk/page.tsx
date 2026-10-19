"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowDownLeft, 
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
  PackageCheck,
  TrendingUp,
  Tag,
  FileText,
  Calculator
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
  getTransaksiMasukList, 
  getNextKodeMasuk, 
  createTransaksiMasuk, 
  deleteTransaksiMasuk 
} from "@/actions/masuk.actions";
import { getBarangList } from "@/actions/barang.actions";
import { TransaksiMasukItem, BarangItem } from "@/types";
import { formatTanggal, formatRupiah } from "@/lib/utils";

export default function TransaksiMasukPage() {
  const [transactions, setTransactions] = useState<TransaksiMasukItem[]>([]);
  const [barangList, setBarangList] = useState<BarangItem[]>([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTanggalAwal, setFilterTanggalAwal] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");
  const [selectedBarangFilter, setSelectedBarangFilter] = useState("ALL");

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransaksiMasukItem | null>(null);
  const [nextCodePreview, setNextCodePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form State for Create
  const [createForm, setCreateForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    barangId: "",
    jumlahMasuk: 1,
    hargaBeli: 0,
    sumberPengadaan: "",
    keterangan: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    const [resMasuk, resBarang] = await Promise.all([
      getTransaksiMasukList({
        search: searchQuery || undefined,
        tanggalAwal: filterTanggalAwal || undefined,
        tanggalAkhir: filterTanggalAkhir || undefined,
        barangId: selectedBarangFilter !== "ALL" ? selectedBarangFilter : undefined,
      }),
      getBarangList(),
    ]);

    if (resMasuk.success && resMasuk.data) {
      setTransactions(resMasuk.data.items);
      setTotalUnits(resMasuk.data.totalUnits);
    }
    if (resBarang.success && resBarang.data) {
      setBarangList(resBarang.data.items);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [filterTanggalAwal, filterTanggalAkhir, selectedBarangFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenCreate = async () => {
    const resCode = await getNextKodeMasuk();
    if (resCode.success && resCode.data) {
      setNextCodePreview(resCode.data);
    }
    setCreateForm({
      tanggal: new Date().toISOString().split("T")[0],
      barangId: barangList[0]?.id || "",
      jumlahMasuk: 1,
      hargaBeli: 0,
      sumberPengadaan: "",
      keterangan: "",
    });
    setCreateDialogOpen(true);
  };

  const selectedBarangForCreate = useMemo(() => {
    return barangList.find((b) => b.id === createForm.barangId);
  }, [barangList, createForm.barangId]);

  // Otomatis hitung Harga Satuan = Total Harga Beli / Jumlah Masuk
  const calculatedHargaSatuan = useMemo(() => {
    if (createForm.hargaBeli > 0 && createForm.jumlahMasuk > 0) {
      return Math.round(createForm.hargaBeli / createForm.jumlahMasuk);
    }
    return 0;
  }, [createForm.hargaBeli, createForm.jumlahMasuk]);

  // Total Nilai Pengadaan untuk Summary Card
  const totalNilaiPengadaan = useMemo(() => {
    return transactions.reduce((acc, curr) => acc + (curr.hargaBeli || 0), 0);
  }, [transactions]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.barangId) {
      setActionMessage({ type: "error", text: "Silakan pilih barang persediaan." });
      return;
    }

    setSubmitting(true);
    setActionMessage(null);

    const res = await createTransaksiMasuk({
      tanggal: createForm.tanggal,
      barangId: createForm.barangId,
      jumlahMasuk: Number(createForm.jumlahMasuk),
      hargaBeli: createForm.hargaBeli > 0 ? Number(createForm.hargaBeli) : null,
      sumberPengadaan: createForm.sumberPengadaan.trim() || null,
      keterangan: createForm.keterangan.trim() || null,
    });

    setSubmitting(false);
    if (res.success) {
      setActionMessage({ type: "success", text: res.message || "Barang masuk berhasil dicatat." });
      setCreateDialogOpen(false);
      loadData();
    } else {
      setActionMessage({ type: "error", text: res.error || "Gagal mencatat barang masuk." });
    }
  };

  const handleOpenDelete = (trx: TransaksiMasukItem) => {
    setSelectedTransaction(trx);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedTransaction) return;
    setSubmitting(true);
    setActionMessage(null);

    const res = await deleteTransaksiMasuk(selectedTransaction.id);
    setSubmitting(false);
    if (res.success) {
      setActionMessage({ type: "success", text: res.message || "Transaksi berhasil dibatalkan." });
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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Barang Masuk (Restocking)</h1>
            <Badge variant="outline" className="bg-sky-50 text-sky-800 border-sky-200 font-bold">
              {transactions.length} Transaksi Tercatat
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pencatatan perolehan dan pengadaan barang persediaan yang secara otomatis menambah saldo stok fisik.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold gap-2 shadow-md shadow-sky-950/20 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Catat Barang Masuk
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
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Transaksi Masuk</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{transactions.length}</h3>
              <p className="text-[11px] text-slate-400">Log pengadaan persediaan</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Kuantitas Masuk</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{totalUnits.toLocaleString("id-ID")}</h3>
              <p className="text-[11px] text-slate-400">Unit barang diterima</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <PackageCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Nilai Pengadaan</p>
              <h3 className="text-xl font-black text-[#0F2F64] mt-0.5">{formatRupiah(totalNilaiPengadaan)}</h3>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ACID Sync Real-time
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0F2F64]">
              <TrendingUp className="w-5 h-5" />
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
                placeholder="Cari kode transaksi BM-xxx, nama barang, atau vendor..."
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

              {(filterTanggalAwal || filterTanggalAkhir || selectedBarangFilter !== "ALL" || searchQuery) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterTanggalAwal("");
                    setFilterTanggalAkhir("");
                    setSelectedBarangFilter("ALL");
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
                <th className="py-3.5 px-4">Tanggal Masuk</th>
                <th className="py-3.5 px-4">Nama Barang Persediaan</th>
                <th className="py-3.5 px-4 text-right">Jumlah Masuk</th>
                <th className="py-3.5 px-4">Harga / Pengadaan</th>
                <th className="py-3.5 px-4">Petugas / Catatan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-slate-300 border-t-[#0284C7] rounded-full animate-spin" />
                      <p className="text-xs">Memuat data transaksi barang masuk...</p>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ArrowDownLeft className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Tidak ada transaksi masuk ditemukan</p>
                    <p className="text-xs text-slate-500">Sesuaikan filter atau catat barang masuk baru.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-sky-700">
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
                      <span className="text-base font-black text-emerald-600">
                        +{trx.jumlahMasuk}
                      </span>{" "}
                      <span className="text-xs text-slate-500 font-semibold">{trx.satuanNama}</span>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      {trx.hargaBeli ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 leading-snug">
                              {formatRupiah(trx.hargaBeli)}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              Total
                            </span>
                          </div>
                          {trx.jumlahMasuk > 0 && (
                            <p className="text-[11px] font-bold text-emerald-700">
                              @{formatRupiah(trx.hargaSatuan ?? Math.round(trx.hargaBeli / trx.jumlahMasuk))}{" "}
                              <span className="font-normal text-slate-400">/ {trx.satuanNama}</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                      {trx.sumberPengadaan && (
                        <p className="text-[11px] text-slate-500 truncate mt-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{trx.sumberPengadaan}</span>
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <p className="font-semibold text-slate-700">{trx.createdByName}</p>
                      {trx.keterangan && (
                        <p className="text-[11px] text-slate-400 italic truncate max-w-xs">{trx.keterangan}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDelete(trx)}
                        title="Batalkan Transaksi Masuk"
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

      {/* DIALOG 1: CATAT BARANG MASUK */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-sky-600" />
              Catat Penerimaan Barang Masuk
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Kode Otomatis: <strong className="text-sky-700 font-mono">{nextCodePreview}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Tanggal Penerimaan *</label>
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
                  <option key={b.id} value={b.id}>
                    {b.namaBarang} ({b.kodeBarang}) - Stok: {b.stok} {b.satuanNama}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Calculation Preview Banner */}
            {selectedBarangForCreate && (
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-500">Saldo Stok Saat Ini:</p>
                  <p className="font-bold text-slate-800">{selectedBarangForCreate.stok} {selectedBarangForCreate.satuanNama}</p>
                </div>
                <div className="text-right">
                  <p className="text-sky-700 font-semibold">Estimasi Stok Setelah Masuk:</p>
                  <p className="font-black text-emerald-600 text-sm">
                    {selectedBarangForCreate.stok + (Number(createForm.jumlahMasuk) || 0)} {selectedBarangForCreate.satuanNama}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Jumlah Masuk *</label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    min="1"
                    value={createForm.jumlahMasuk}
                    onChange={(e) => setCreateForm({ ...createForm, jumlahMasuk: parseInt(e.target.value, 10) || 1 })}
                    required
                    className="h-10 rounded-xl bg-slate-50 font-medium pr-14"
                  />
                  {selectedBarangForCreate && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      {selectedBarangForCreate.satuanNama}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Total Harga Beli (Rp)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Contoh: 250000"
                  value={createForm.hargaBeli || ""}
                  onChange={(e) => setCreateForm({ ...createForm, hargaBeli: parseFloat(e.target.value) || 0 })}
                  className="mt-1 h-10 rounded-xl bg-slate-50 font-medium"
                />
              </div>
            </div>

            {/* Field Harga Satuan (Otomatis Dihitung dari Total Harga Beli ÷ Jumlah Masuk) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-sky-600" />
                  Harga Satuan (Rp)
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Otomatis: Total ÷ Masuk
                </span>
              </label>
              <div className="relative mt-1">
                <Input
                  type="text"
                  readOnly
                  tabIndex={-1}
                  value={
                    calculatedHargaSatuan > 0
                      ? formatRupiah(calculatedHargaSatuan)
                      : "Rp 0"
                  }
                  className="h-10 rounded-xl bg-slate-100 font-bold text-emerald-800 cursor-default border-slate-200 pr-20 select-all"
                />
                {selectedBarangForCreate && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                    / {selectedBarangForCreate.satuanNama}
                  </span>
                )}
              </div>
            </div>

            {/* Rincian Kalkulasi Harga Satuan & Total */}
            {createForm.hargaBeli > 0 && createForm.jumlahMasuk > 0 && (
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-900 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Kalkulasi Harga Satuan:
                  </span>
                  <span className="font-black text-emerald-800">
                    {formatRupiah(calculatedHargaSatuan)} / {selectedBarangForCreate?.satuanNama || "unit"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono pt-1 border-t border-emerald-200/60">
                  <span>Rumus:</span>
                  <span>
                    {formatRupiah(createForm.hargaBeli)} ÷ {createForm.jumlahMasuk} {selectedBarangForCreate?.satuanNama || "unit"} = <strong className="text-emerald-700">{formatRupiah(calculatedHargaSatuan)}</strong>
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700">Sumber Pengadaan / Vendor (Opsional)</label>
              <Input
                type="text"
                placeholder="Contoh: Toko ATK Sejahtera / DIPA BPS 2026"
                value={createForm.sumberPengadaan}
                onChange={(e) => setCreateForm({ ...createForm, sumberPengadaan: e.target.value })}
                className="mt-1 h-10 rounded-xl bg-slate-50 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Keterangan / Catatan Tambahan</label>
              <Input
                type="text"
                placeholder="Contoh: Pengadaan persediaan Triwulan I"
                value={createForm.keterangan}
                onChange={(e) => setCreateForm({ ...createForm, keterangan: e.target.value })}
                className="mt-1 h-10 rounded-xl bg-slate-50 font-medium"
              />
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold">
                {submitting ? "Menyimpan..." : "Simpan Barang Masuk"}
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
              Batalkan Transaksi Barang Masuk
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin membatalkan transaksi <strong>{selectedTransaction?.kodeTransaksi}</strong> ({selectedTransaction?.jumlahMasuk} {selectedTransaction?.satuanNama} "{selectedTransaction?.barangNama}")?
              <br /><br />
              <span className="text-red-700 font-semibold">Perhatian:</span> Saldo stok fisik barang ini akan otomatis dikurangi kembali sebanyak {selectedTransaction?.jumlahMasuk} unit.
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
              {submitting ? "Membatalkan..." : "Ya, Batalkan Transaksi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
