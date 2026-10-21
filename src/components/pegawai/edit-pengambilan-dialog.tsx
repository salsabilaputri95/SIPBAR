"use client";

import React, { useState, useEffect } from "react";
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
  Pencil, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Boxes,
  MapPin,
  Trash2,
  Lock
} from "lucide-react";
import { 
  PegawaiRiwayatItem, 
  BarangOpsiPengambilan, 
  updatePengambilanMandiri,
  hapusPengambilanMandiri 
} from "@/actions/pegawai.actions";
import { formatTanggal } from "@/lib/utils";

interface EditPengambilanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PegawaiRiwayatItem | null;
  availableItems: BarangOpsiPengambilan[];
  onSuccess: (message: string) => void;
}

export function EditPengambilanDialog({
  open,
  onOpenChange,
  item,
  availableItems,
  onSuccess,
}: EditPengambilanDialogProps) {
  const [searchBarang, setSearchBarang] = useState("");
  const [isChangingBarang, setIsChangingBarang] = useState(false);
  const [selectedBarangId, setSelectedBarangId] = useState<string>("");
  const [jumlah, setJumlah] = useState<number | "">(1);
  const [keterangan, setKeterangan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Sinkronisasi data saat item yang diedit dibuka
  useEffect(() => {
    if (item && open) {
      setSelectedBarangId(item.barangId);
      setJumlah(item.jumlahKeluar);
      setKeterangan(item.keterangan || "");
      setIsChangingBarang(false);
      setIsConfirmingDelete(false);
      setErrorMessage("");
      setSearchBarang("");
    }
  }, [item, open]);

  if (!item) return null;

  const isLockedByTandaTerima = !!item.tandaTerimaNomor;

  // Temukan objek barang yang sedang dipilih dari availableItems atau referensi item riwayat
  const matchedAvailable = availableItems.find((b) => b.id === selectedBarangId);

  // Hitung batas maksimal stok yang bisa diambil:
  // Jika barang sama dengan yang saat ini tercatat di transaksi, stok maksimal = stok saat ini + jumlah awal transaksi
  let maxStok = 0;
  let satuanDisplay = item.satuanNama;
  let namaDisplay = item.barangNama;
  let kodeDisplay = item.barangKode;
  let kategoriDisplay = item.kategoriNama;
  let gudangDisplay = "Gudang BPS";

  if (selectedBarangId === item.barangId) {
    const currentWarehouseStock = matchedAvailable ? matchedAvailable.stok : 0;
    maxStok = currentWarehouseStock + item.jumlahKeluar;
    if (matchedAvailable) {
      satuanDisplay = matchedAvailable.satuanNama;
      gudangDisplay = matchedAvailable.gudangNama;
    }
  } else if (matchedAvailable) {
    maxStok = matchedAvailable.stok;
    satuanDisplay = matchedAvailable.satuanNama;
    namaDisplay = matchedAvailable.namaBarang;
    kodeDisplay = matchedAvailable.kodeBarang;
    kategoriDisplay = matchedAvailable.kategoriNama;
    gudangDisplay = matchedAvailable.gudangNama;
  }

  const filteredBarang = availableItems.filter((b) => {
    if (!searchBarang.trim()) return true;
    const q = searchBarang.toLowerCase().trim();
    return (
      b.namaBarang.toLowerCase().includes(q) ||
      b.kodeBarang.toLowerCase().includes(q) ||
      b.kategoriNama.toLowerCase().includes(q)
    );
  });

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
    if (!selectedBarangId) {
      setErrorMessage("Silakan tentukan barang yang diambil.");
      return;
    }

    const numJumlah = typeof jumlah === "number" ? jumlah : parseInt(jumlah, 10);
    if (!numJumlah || numJumlah < 1) {
      setErrorMessage("Jumlah pengambilan minimal 1 unit.");
      return;
    }

    if (!isLockedByTandaTerima && numJumlah > maxStok) {
      setErrorMessage(
        `Jumlah yang dimasukkan (${numJumlah} ${satuanDisplay}) melebihi kuota stok yang tersedia (${maxStok} ${satuanDisplay}).`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await updatePengambilanMandiri({
        transaksiId: item.id,
        barangId: selectedBarangId,
        jumlah: numJumlah,
        keterangan: keterangan.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal memperbarui transaksi.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onOpenChange(false);
      onSuccess(res.message || "Perubahan transaksi berhasil disimpan.");
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan pada sistem.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage("");
    try {
      const res = await hapusPengambilanMandiri(item.id);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal membatalkan transaksi.");
        setIsDeleting(false);
        return;
      }

      setIsDeleting(false);
      setIsConfirmingDelete(false);
      onOpenChange(false);
      onSuccess(res.message || "Transaksi berhasil dibatalkan dan stok dikembalikan.");
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal membatalkan transaksi.");
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl bg-white shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-sky-500 via-[#0F2F64] to-emerald-500" />

        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
              <Pencil className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                {item.kodeTransaksi}
              </span>
              {isLockedByTandaTerima && (
                <Badge className="bg-amber-50 text-amber-800 border-amber-200 gap-1 text-[10px]">
                  <Lock className="w-3 h-3" />
                  Tanda Terima
                </Badge>
              )}
            </div>
          </div>

          <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight mt-3">
            Edit Riwayat Pengambilan Barang
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Waktu pencatatan awal: {formatTanggal(item.tanggal)} • {new Date(item.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WITA
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 animate-in fade-in-50 duration-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-xs">Perhatian</p>
                <p className="text-xs mt-0.5 text-red-600">{errorMessage}</p>
              </div>
            </div>
          )}

          {isLockedByTandaTerima && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800">
              <Lock className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold">Terkunci Surat Tanda Terima</p>
                <p className="text-[11px] mt-0.5 text-amber-700">
                  Transaksi ini telah terbit dalam Tanda Terima resmi (<strong>{item.tandaTerimaNomor}</strong>). Kuantitas dan jenis barang tidak dapat diubah agar data inventaris sinkron, namun Anda dapat memperbarui catatan keperluan di bawah.
                </p>
              </div>
            </div>
          )}

          {/* 1. Barang yang Diambil */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-slate-400" />
                Barang yang Diambil
              </span>
              {!isLockedByTandaTerima && !isChangingBarang && (
                <button
                  type="button"
                  onClick={() => setIsChangingBarang(true)}
                  className="text-[11px] text-[#0284C7] hover:underline font-medium"
                >
                  Ganti Jenis Barang
                </button>
              )}
            </label>

            {isChangingBarang ? (
              <div className="space-y-2 animate-in fade-in-50 duration-150">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Cari nama atau kode barang pengganti..."
                    value={searchBarang}
                    onChange={(e) => setSearchBarang(e.target.value)}
                    className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
                    autoFocus
                  />
                </div>

                <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                  {filteredBarang.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      Tidak ada barang yang cocok.
                    </div>
                  ) : (
                    filteredBarang.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBarangId(b.id);
                          setIsChangingBarang(false);
                          setJumlah(1);
                          setErrorMessage("");
                        }}
                        className={`w-full text-left p-2.5 hover:bg-sky-50 transition-colors flex items-center justify-between ${
                          b.id === selectedBarangId ? "bg-sky-50/70 border-l-4 border-sky-600" : ""
                        }`}
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {b.namaBarang}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span className="font-mono">{b.kodeBarang}</span>
                            <span>•</span>
                            <span>{b.kategoriNama}</span>
                          </div>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] shrink-0 font-semibold">
                          Stok: {b.stok} {b.satuanNama}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChangingBarang(false)}
                    className="text-xs h-7 text-slate-500"
                  >
                    Batal Ganti
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/40 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-800">{kodeDisplay}</span>
                    <Badge variant="outline" className="text-[10px] bg-white border-sky-200 text-sky-800">
                      {kategoriDisplay}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{namaDisplay}</h4>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{gudangDisplay}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-500 font-medium">Batas Maksimal Pengambilan</p>
                  <p className="text-base font-black text-emerald-700">
                    {maxStok} <span className="text-xs font-normal text-slate-600">{satuanDisplay}</span>
                  </p>
                  {selectedBarangId === item.barangId && (
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      (Termasuk {item.jumlahKeluar} {item.satuanNama} dari transaksi ini)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Jumlah Diambil */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Jumlah Barang Diambil *</span>
              <span className="text-[11px] font-normal text-slate-400">
                Satuan: <strong className="text-slate-700">{satuanDisplay}</strong>
              </span>
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  type="number"
                  min="1"
                  max={!isLockedByTandaTerima ? maxStok : undefined}
                  disabled={isLockedByTandaTerima}
                  value={jumlah}
                  onChange={handleJumlahChange}
                  className="h-10 rounded-xl bg-slate-50/70 border-slate-200 text-sm font-semibold focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <span className="text-xs font-semibold text-slate-600 px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200">
                {satuanDisplay}
              </span>
            </div>
          </div>

          {/* 3. Catatan Keperluan */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Keperluan / Keterangan Pengambilan
            </label>
            <textarea
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Keperluan cetak kuesioner sensus, kegiatan rapat koordinasi, dll..."
              className="w-full p-3 rounded-xl bg-slate-50/70 border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white resize-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Konfirmasi Hapus / Batal jika diminta */}
          {isConfirmingDelete ? (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-2 animate-in fade-in-50 duration-150">
              <p className="text-xs font-bold text-red-900">
                Yakin ingin membatalkan transaksi ini?
              </p>
              <p className="text-[11px] text-red-700">
                Transaksi akan dihapus dari riwayat dan <strong>{item.jumlahKeluar} {item.satuanNama}</strong> akan langsung dikembalikan ke saldo stok gudang.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8 px-3 rounded-lg text-xs gap-1.5 font-semibold"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Ya, Batalkan Transaksi</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={isDeleting}
                  className="h-8 px-3 rounded-lg text-xs border-slate-200 bg-white"
                >
                  Tidak, Kembali
                </Button>
              </div>
            </div>
          ) : null}

          <DialogFooter className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100">
            {/* Tombol Hapus (Hanya jika belum masuk Tanda Terima) */}
            {!isLockedByTandaTerima && !isConfirmingDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmingDelete(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs gap-1.5 justify-start px-2.5 h-9 rounded-xl"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Batalkan Pengambilan</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isDeleting}
                className="text-xs h-9 rounded-xl border-slate-200 text-slate-600"
              >
                Tutup
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || isDeleting || isConfirmingDelete}
                className="bg-[#0F2F64] hover:bg-[#0A1F42] text-white text-xs font-semibold h-9 rounded-xl px-4 gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
