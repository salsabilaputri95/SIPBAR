"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText, 
  Boxes,
  MapPin,
  Tag
} from "lucide-react";
import { BarangOpsiPengambilan, catatPengambilanMandiri } from "@/actions/pegawai.actions";

interface PengambilanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableItems: BarangOpsiPengambilan[];
  onSuccess: (message: string) => void;
}

export function PengambilanDialog({
  open,
  onOpenChange,
  availableItems,
  onSuccess,
}: PengambilanDialogProps) {
  const [searchBarang, setSearchBarang] = useState("");
  const [selectedBarangId, setSelectedBarangId] = useState<string>("");
  const [jumlah, setJumlah] = useState<number | "">(1);
  const [keterangan, setKeterangan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredBarang = availableItems.filter((item) => {
    if (!searchBarang.trim()) return true;
    const q = searchBarang.toLowerCase().trim();
    return (
      item.namaBarang.toLowerCase().includes(q) ||
      item.kodeBarang.toLowerCase().includes(q) ||
      item.kategoriNama.toLowerCase().includes(q)
    );
  });

  const selectedBarang = availableItems.find((b) => b.id === selectedBarangId);

  const handleBarangSelect = (b: BarangOpsiPengambilan) => {
    setSelectedBarangId(b.id);
    setJumlah(1);
    setErrorMessage("");
  };

  const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setJumlah("");
      return;
    }
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    setJumlah(num);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarang) {
      setErrorMessage("Silakan pilih barang yang ingin diambil.");
      return;
    }

    const numJumlah = typeof jumlah === "number" ? jumlah : parseInt(jumlah, 10);
    if (!numJumlah || numJumlah < 1) {
      setErrorMessage("Jumlah pengambilan minimal 1 unit.");
      return;
    }

    if (numJumlah > selectedBarang.stok) {
      setErrorMessage(
        `Jumlah yang diminta (${numJumlah} ${selectedBarang.satuanNama}) melebihi stok yang tersedia (${selectedBarang.stok} ${selectedBarang.satuanNama}).`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await catatPengambilanMandiri({
        barangId: selectedBarang.id,
        jumlah: numJumlah,
        keterangan: keterangan.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal mencatat transaksi.");
        setIsSubmitting(false);
        return;
      }

      // Reset form
      setSelectedBarangId("");
      setJumlah(1);
      setKeterangan("");
      setSearchBarang("");
      setIsSubmitting(false);
      onOpenChange(false);
      onSuccess(res.message || "Pengambilan barang berhasil dicatat.");
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan pada sistem.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl bg-white shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-[#0F2F64] via-[#0284C7] to-[#F97316]" />

        <DialogHeader className="p-6 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 text-[#0F2F64]">
            <Package className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
            Catat Pengambilan Barang Mandiri
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Pilih barang dari persediaan kantor, tentukan jumlah yang diambil, dan isi keterangan keperluan Anda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 animate-in fade-in-50 duration-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Perhatian</p>
                <p className="text-xs mt-0.5 text-red-600">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* 1. Pilih Barang */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-slate-400" />
                Pilih Barang Persediaan *
              </span>
              {selectedBarang && (
                <button
                  type="button"
                  onClick={() => setSelectedBarangId("")}
                  className="text-[11px] text-[#0284C7] hover:underline"
                >
                  Ganti Pilihan
                </button>
              )}
            </label>

            {!selectedBarang ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Ketik nama atau kode barang (contoh: Kertas A4, Tinta, Map)..."
                    value={searchBarang}
                    onChange={(e) => setSearchBarang(e.target.value)}
                    className="pl-9 h-10 rounded-xl bg-slate-50/70 border-slate-200 text-sm focus:bg-white"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                  {filteredBarang.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Tidak ada barang yang cocok atau semua stok kosong.
                    </div>
                  ) : (
                    filteredBarang.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleBarangSelect(b)}
                        className="w-full text-left p-2.5 hover:bg-sky-50/70 transition-colors flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-semibold text-slate-900 group-hover:text-[#0F2F64] truncate">
                            {b.namaBarang}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span className="font-mono">{b.kodeBarang}</span>
                            <span>•</span>
                            <span>{b.kategoriNama}</span>
                            <span>•</span>
                            <span>{b.gudangNama}</span>
                          </div>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold shrink-0">
                          Stok: {b.stok} {b.satuanNama}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-700">{selectedBarang.kodeBarang}</span>
                    <Badge variant="outline" className="text-[10px] bg-white border-blue-200 text-blue-800">
                      {selectedBarang.kategoriNama}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{selectedBarang.namaBarang}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {selectedBarang.gudangNama}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-medium">Stok Tersedia</p>
                  <p className="text-base font-black text-emerald-700">
                    {selectedBarang.stok} <span className="text-xs font-normal text-slate-600">{selectedBarang.satuanNama}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. Jumlah Pengambilan */}
          {selectedBarang && (
            <div className="space-y-1.5 animate-in fade-in-50 duration-150">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Jumlah yang Diambil ({selectedBarang.satuanNama}) *</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Maksimal: {selectedBarang.stok} {selectedBarang.satuanNama}
                </span>
              </label>

              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = typeof jumlah === "number" ? jumlah : 1;
                      if (cur > 1) setJumlah(cur - 1);
                    }}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-200 font-bold text-sm"
                  >
                    -
                  </button>
                  <Input
                    type="number"
                    min={1}
                    max={selectedBarang.stok}
                    value={jumlah}
                    onChange={handleJumlahChange}
                    className="w-20 text-center border-0 bg-white font-bold text-sm focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = typeof jumlah === "number" ? jumlah : 1;
                      if (cur < selectedBarang.stok) setJumlah(cur + 1);
                    }}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-200 font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                <span className="text-xs font-medium text-slate-600">
                  {selectedBarang.satuanNama}
                </span>

                {typeof jumlah === "number" && jumlah > selectedBarang.stok && (
                  <span className="text-xs font-semibold text-red-600 animate-pulse">
                    ⚠️ Melebihi stok!
                  </span>
                )}
              </div>

              {typeof jumlah === "number" && jumlah <= selectedBarang.stok && jumlah > 0 && (
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 Sisa stok di gudang setelah pengambilan:{" "}
                  <strong className="text-slate-800">
                    {selectedBarang.stok - jumlah} {selectedBarang.satuanNama}
                  </strong>
                </p>
              )}
            </div>
          )}

          {/* 3. Keperluan / Catatan */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Keperluan / Kegiatan (Opsional)
            </label>
            <Input
              type="text"
              placeholder="Contoh: Keperluan survei Sakernas / Publikasi BPS / Rapat tim..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="h-10 rounded-xl bg-slate-50/70 border-slate-200 text-sm focus:bg-white"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl border-slate-200 text-slate-600 text-xs h-10"
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !selectedBarang || !jumlah || (typeof jumlah === "number" && jumlah > (selectedBarang?.stok || 0))}
              className="bg-[#0F2F64] hover:bg-[#0A1F42] text-white font-semibold rounded-xl text-xs h-10 px-5 gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Pengambilan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Konfirmasi Pengambilan</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
