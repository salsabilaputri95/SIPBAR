"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  RotateCcw,
  Loader2,
  Package,
  Calendar,
  FileText,
  AlertCircle
} from "lucide-react";
import { PegawaiRiwayatItem, hapusPengambilanMandiri } from "@/actions/pegawai.actions";
import { formatTanggal } from "@/lib/utils";

interface BatalPengambilanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PegawaiRiwayatItem | null;
  onSuccess: (message: string) => void;
}

export function BatalPengambilanDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: BatalPengambilanDialogProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!item) return null;

  const handleConfirmCancel = async () => {
    if (isCancelling) return;

    setIsCancelling(true);
    setErrorMessage("");

    try {
      const res = await hapusPengambilanMandiri(item.id);

      if (!res.success) {
        setErrorMessage(res.error || "Gagal membatalkan transaksi pengambilan.");
        setIsCancelling(false);
        return;
      }

      setIsCancelling(false);
      onOpenChange(false);
      onSuccess(res.message || "Pengambilan barang berhasil dibatalkan dan stok telah dikembalikan.");
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi gangguan saat membatalkan transaksi.");
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isCancelling) {
        setErrorMessage("");
        onOpenChange(val);
      }
    }}>
      <DialogContent className="max-w-md p-0 rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

        <div className="p-6">
          <DialogHeader className="text-left space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-1">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>

            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
              Batalkan Pengambilan Barang?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin membatalkan transaksi pengambilan barang ini? Barang akan otomatis dikembalikan ke katalog persediaan kantor.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 animate-in fade-in-50 duration-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Gagal Membatalkan</p>
                <p className="mt-0.5 text-red-600">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Kartu Rincian Transaksi yang Dibatalkan */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-sky-700">
                {item.kodeTransaksi}
              </span>
              <Badge variant="outline" className="text-[10px] bg-white border-slate-200 text-slate-600">
                {item.kategoriNama}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium">Nama Barang Persediaan</p>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{item.barangNama}</h4>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-xs">
              <div>
                <p className="text-[11px] text-slate-500">Jumlah Dikembalikan</p>
                <p className="text-sm font-black text-emerald-700 mt-0.5">
                  +{item.jumlahKeluar} {item.satuanNama}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Waktu Pengambilan</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  {formatTanggal(item.tanggal)}
                </p>
              </div>
            </div>

            {item.keterangan && (
              <div className="pt-2 border-t border-slate-200/60 text-xs">
                <p className="text-[11px] text-slate-500">Keperluan / Keterangan:</p>
                <p className="text-xs text-slate-700 italic mt-0.5 line-clamp-2">
                  &ldquo;{item.keterangan}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-800 flex items-start gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Stok barang <strong>{item.barangNama}</strong> akan otomatis bertambah sebanyak <strong>{item.jumlahKeluar} {item.satuanNama}</strong> secara langsung di katalog dan database.
            </p>
          </div>

          <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isCancelling}
              className="h-9 px-4 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold"
            >
              Tidak
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold gap-1.5 shadow-sm shadow-red-950/20"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Membatalkan...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ya, Batalkan</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
