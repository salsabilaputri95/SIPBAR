"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  FileCheck2, 
  Calendar, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  Check, 
  Users, 
  Building2, 
  PackageMinus,
  RefreshCw,
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getUnassignedKeluarList, createTandaTerima } from "@/actions/terima.actions";
import { getKeluarMetadata } from "@/actions/keluar.actions";
import { TransaksiKeluarItem } from "@/types";
import { formatTanggal } from "@/lib/utils";

export default function BuatTandaTerimaPage() {
  const router = useRouter();
  const [unassignedItems, setUnassignedItems] = useState<TransaksiKeluarItem[]>([]);
  const [fungsis, setFungsis] = useState<Array<{ id: string; nama: string; kode: string }>>([]);
  const [penerimaList, setPenerimaList] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [filterTanggalAwal, setFilterTanggalAwal] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");
  const [selectedFungsiFilter, setSelectedFungsiFilter] = useState("ALL");
  const [selectedPenerimaFilter, setSelectedPenerimaFilter] = useState("ALL");

  // Signer Details
  const [signerForm, setSignerForm] = useState({
    kasubbagNama: "Imaniar Dwi Aryanti, S.T.P.",
    kasubbagNip: "199001012015012001",
    kasubbagJabatan: "Kepala Subbagian Umum BPS Kabupaten Jeneponto",
  });

  const loadData = async () => {
    setIsLoading(true);
    const [resItems, resMeta] = await Promise.all([
      getUnassignedKeluarList({
        fungsiId: selectedFungsiFilter !== "ALL" ? selectedFungsiFilter : undefined,
        penerimaNama: selectedPenerimaFilter !== "ALL" ? selectedPenerimaFilter : undefined,
        tanggalAwal: filterTanggalAwal || undefined,
        tanggalAkhir: filterTanggalAkhir || undefined,
      }),
      getKeluarMetadata(),
    ]);

    if (resItems.success && resItems.data) {
      setUnassignedItems(resItems.data);
      // Bersihkan selectedIds yang tidak ada di filtered items
      const validIds = new Set(resItems.data.map((i) => i.id));
      setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
    }
    if (resMeta.success && resMeta.data) {
      setFungsis(resMeta.data.fungsis);
      setPenerimaList(resMeta.data.penerimas);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [filterTanggalAwal, filterTanggalAkhir, selectedFungsiFilter, selectedPenerimaFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === unassignedItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unassignedItems.map((i) => i.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedStats = useMemo(() => {
    const items = unassignedItems.filter((i) => selectedIds.includes(i.id));
    const totalUnits = items.reduce((acc, curr) => acc + curr.jumlahKeluar, 0);
    const uniquePenerima = Array.from(new Set(items.map((i) => i.penerimaNama))).join(", ");
    return { count: items.length, totalUnits, uniquePenerima };
  }, [unassignedItems, selectedIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      setActionMessage({ type: "error", text: "Silakan pilih setidaknya satu transaksi barang keluar." });
      return;
    }

    setSubmitting(true);
    setActionMessage(null);

    const res = await createTandaTerima({
      transaksiKeluarIds: selectedIds,
      kasubbagNama: signerForm.kasubbagNama,
      kasubbagNip: signerForm.kasubbagNip || undefined,
      kasubbagJabatan: signerForm.kasubbagJabatan,
    });

    setSubmitting(false);
    if (res.success && res.data) {
      // Langsung arahkan ke halaman cetak
      router.push(`/tanda-terima/${res.data.id}/cetak`);
    } else {
      setActionMessage({ type: "error", text: res.error || "Gagal menerbitkan Tanda Terima." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/tanda-terima">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl">
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-emerald-600" />
              Kompilasi Dokumen Tanda Terima Baru
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Pilih satu atau beberapa transaksi pengeluaran barang untuk diterbitkan dalam satu Berita Acara resmi.
            </p>
          </div>
        </div>
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
        </div>
      )}

      {/* Main Grid: Item Selection & Signer Configuration */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Filter & Selection Table (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Bar */}
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
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
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:bg-white"
                  >
                    <option value="ALL">Semua Seksi/Fungsi</option>
                    {fungsis.map((f) => (
                      <option key={f.id} value={f.id}>{f.nama}</option>
                    ))}
                  </select>

                  <select
                    value={selectedPenerimaFilter}
                    onChange={(e) => setSelectedPenerimaFilter(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:bg-white max-w-xs truncate"
                  >
                    <option value="ALL">Semua Penerima</option>
                    {penerimaList.map((p, idx) => (
                      <option key={idx} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  className="h-10 px-3 rounded-xl border-slate-200 text-slate-600"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Table of Unassigned Transactions */}
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900"
              >
                {selectedIds.length > 0 && selectedIds.length === unassignedItems.length ? (
                  <CheckSquare className="w-4 h-4 text-[#0284C7]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Pilih Semua ({unassignedItems.length} Transaksi Tersedia)</span>
              </button>

              <span className="text-xs text-slate-500 font-semibold">
                Terpilih: <strong className="text-[#0284C7]">{selectedIds.length}</strong> item
              </span>
            </div>

            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase sticky top-0 bg-slate-50 z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">Pilih</th>
                    <th className="py-2.5 px-3">Kode / Tanggal</th>
                    <th className="py-2.5 px-3">Barang Persediaan</th>
                    <th className="py-2.5 px-3 text-right">Kuantitas</th>
                    <th className="py-2.5 px-3">Penerima & Seksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="w-5 h-5 border-2 border-slate-300 border-t-[#0284C7] rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs">Memuat transaksi pengeluaran...</p>
                      </td>
                    </tr>
                  ) : unassignedItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <PackageMinus className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-semibold text-slate-600">Semua transaksi keluar telah dibuatkan Tanda Terima.</p>
                      </td>
                    </tr>
                  ) : (
                    unassignedItems.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          onClick={() => toggleSelectItem(item.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-sky-50/70 hover:bg-sky-50" : "hover:bg-slate-50/60"
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#0284C7] mx-auto" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 mx-auto" />
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-mono text-xs font-bold text-orange-700">{item.kodeTransaksi}</p>
                            <p className="text-[11px] text-slate-400">{formatTanggal(item.tanggal)}</p>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="text-xs font-bold text-slate-800">{item.barangNama}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{item.barangKode}</p>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="text-sm font-black text-orange-600">{item.jumlahKeluar}</span>{" "}
                            <span className="text-[11px] text-slate-500 font-semibold">{item.satuanNama}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="text-xs font-bold text-slate-800">{item.penerimaNama}</p>
                            <Badge variant="outline" className="text-[9px] bg-slate-100 text-slate-700 border-slate-200">
                              {item.fungsiNama}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Signer Configuration & Summary (Span 1) */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">
                Ringkasan Berita Acara
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Detail kompilasi penyerahan barang
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Item Terpilih:</span>
                  <strong className="text-emerald-800 text-sm font-black">{selectedStats.count} Item</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Kuantitas:</span>
                  <strong className="text-emerald-800 text-sm font-black">{selectedStats.totalUnits} Unit</strong>
                </div>
                {selectedStats.uniquePenerima && (
                  <div className="pt-1 border-t border-emerald-200/60 mt-1">
                    <span className="text-[11px] text-slate-500">Penerima Barang:</span>
                    <p className="font-semibold text-slate-800 text-[11px] truncate">{selectedStats.uniquePenerima}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pengesahan Pejabat (Kasubbag Umum)
                </h4>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Nama Pejabat Penyetuju *</label>
                  <Input
                    type="text"
                    value={signerForm.kasubbagNama}
                    onChange={(e) => setSignerForm({ ...signerForm, kasubbagNama: e.target.value })}
                    required
                    className="mt-1 h-9 rounded-xl text-xs bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700">NIP Pejabat (Opsional)</label>
                  <Input
                    type="text"
                    placeholder="Contoh: 19900101 201501 2 001"
                    value={signerForm.kasubbagNip}
                    onChange={(e) => setSignerForm({ ...signerForm, kasubbagNip: e.target.value })}
                    className="mt-1 h-9 rounded-xl text-xs bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Jabatan Pengesahan *</label>
                  <Input
                    type="text"
                    value={signerForm.kasubbagJabatan}
                    onChange={(e) => setSignerForm({ ...signerForm, kasubbagJabatan: e.target.value })}
                    required
                    className="mt-1 h-9 rounded-xl text-xs bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={submitting || selectedIds.length === 0}
                  className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold h-11 rounded-xl shadow-md gap-2"
                >
                  <Printer className="w-4 h-4" />
                  {submitting ? "Menerbitkan Dokumen..." : "Terbitkan & Buka Lembar Cetak"}
                </Button>
                {selectedIds.length === 0 && (
                  <p className="text-[11px] text-amber-600 text-center mt-2">
                    * Centang minimal 1 item transaksi di tabel kiri
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
