"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  Plus, 
  Printer, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  Check, 
  X, 
  AlertCircle,
  FileCheck2,
  Users,
  Building2,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { getTandaTerimaList, deleteTandaTerima } from "@/actions/terima.actions";
import { formatTanggal } from "@/lib/utils";

export default function TandaTerimaPage() {
  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const res = await getTandaTerimaList();
    if (res.success && res.data) {
      setList(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDelete = (doc: any) => {
    setSelectedDoc(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedDoc) return;
    setSubmitting(true);
    setActionMessage(null);

    const res = await deleteTandaTerima(selectedDoc.id);
    setSubmitting(false);
    if (res.success) {
      setActionMessage({ type: "success", text: res.message || "Dokumen berhasil dihapus." });
      setDeleteDialogOpen(false);
      loadData();
    } else {
      setActionMessage({ type: "error", text: res.error || "Gagal menghapus dokumen." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dokumen Tanda Terima (Berita Acara)</h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold">
              {list.length} Dokumen Diterbitkan
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Kompilasi transaksi penyaluran barang menjadi Berita Acara resmi BPS Kabupaten Jeneponto siap cetak (F4/A4).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            title="Muat Ulang"
            className="h-10 px-3 rounded-xl border-slate-200 text-slate-600"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/tanda-terima/buat">
            <Button
              className="bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold gap-2 shadow-md shadow-sky-950/20 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Buat Tanda Terima Baru
            </Button>
          </Link>
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
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table of Tanda Terima */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Nomor Dokumen</th>
                <th className="py-3.5 px-4">Tanggal Dokumen</th>
                <th className="py-3.5 px-4">Ringkasan Penerima</th>
                <th className="py-3.5 px-4 text-center">Rincian Barang</th>
                <th className="py-3.5 px-4">Pengesahan (Kasubbag Umum)</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-slate-300 border-t-[#0284C7] rounded-full animate-spin" />
                      <p className="text-xs">Memuat dokumen tanda terima...</p>
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Belum ada Dokumen Tanda Terima</p>
                    <p className="text-xs text-slate-500">Klik "Buat Tanda Terima Baru" untuk mengompilasi transaksi keluar hari ini.</p>
                  </td>
                </tr>
              ) : (
                list.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-mono text-xs font-bold text-slate-900">{doc.nomorDokumen}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {formatTanggal(doc.tanggalDokumen)}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-700 max-w-xs truncate">
                      <span className="font-semibold text-slate-800">{doc.penerimaSummary || "-"}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="outline" className="bg-sky-50 text-sky-800 border-sky-200 font-bold text-[11px]">
                        {doc.totalItems} Item ({doc.totalUnits} Unit)
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{doc.kasubbagNama}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{doc.kasubbagJabatan}</p>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/tanda-terima/${doc.id}/cetak`} target="_blank">
                          <Button
                            variant="outline"
                            size="sm"
                            title="Cetak Berita Acara Penyerahan"
                            className="h-8 gap-1.5 text-xs text-[#0F2F64] border-slate-200 hover:bg-slate-100 rounded-lg font-semibold"
                          >
                            <Printer className="w-3.5 h-3.5 text-sky-600" />
                            Cetak
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDelete(doc)}
                          title="Hapus Dokumen"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DIALOG HAPUS TANDA TERIMA */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Hapus Dokumen Tanda Terima
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus dokumen <strong>{selectedDoc?.nomorDokumen}</strong>?
              <br /><br />
              <span className="text-slate-700 font-semibold">Catatan:</span> Transaksi pengeluaran barang yang tergabung di dalam dokumen ini <strong>tidak akan terhapus</strong>, melainkan hanya dilepas tautannya sehingga dapat dibuatkan tanda terima ulang jika dibutuhkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={handleDeleteSubmit}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {submitting ? "Menghapus..." : "Ya, Hapus Dokumen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
