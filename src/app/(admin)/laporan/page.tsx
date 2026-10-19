"use client";

import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  Filter, 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Building2, 
  RefreshCw,
  Eye,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getBarangList } from "@/actions/barang.actions";
import { getTransaksiMasukList } from "@/actions/masuk.actions";
import { getTransaksiKeluarList, getKeluarMetadata } from "@/actions/keluar.actions";
import { formatTanggal, formatRupiah } from "@/lib/utils";

type ReportType = "rekap" | "masuk" | "keluar";

export default function LaporanPage() {
  const [reportType, setReportType] = useState<ReportType>("rekap");
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("ALL");
  const [selectedFungsi, setSelectedFungsi] = useState("ALL");

  // Filter options
  const [fungsis, setFungsis] = useState<Array<{ id: string; nama: string; kode: string }>>([]);
  const [kategoriList, setKategoriList] = useState<Array<{ id: string; nama: string }>>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Load metadata filters
  useEffect(() => {
    async function loadMeta() {
      const [resBarang, resKeluarMeta] = await Promise.all([
        getBarangList(),
        getKeluarMetadata(),
      ]);

      if (resBarang.success && resBarang.data) {
        const uniqueKatsMap = new Map<string, string>();
        resBarang.data.items.forEach((b) => {
          uniqueKatsMap.set(b.kategoriId, b.kategoriNama);
        });
        const kats = Array.from(uniqueKatsMap.entries()).map(([id, nama]) => ({ id, nama })).sort((a, b) => a.nama.localeCompare(b.nama));
        setKategoriList(kats);
      }
      if (resKeluarMeta.success && resKeluarMeta.data) {
        setFungsis(resKeluarMeta.data.fungsis);
      }
    }
    loadMeta();
  }, []);

  // Fetch preview data based on active report type
  const loadPreview = async () => {
    setIsLoading(true);
    if (reportType === "rekap") {
      const res = await getBarangList({
        kategoriId: selectedKategori !== "ALL" ? selectedKategori : undefined,
      });
      if (res.success && res.data) {
        setPreviewData(res.data.items);
      }
    } else if (reportType === "masuk") {
      const res = await getTransaksiMasukList({
        tanggalAwal: tanggalAwal || undefined,
        tanggalAkhir: tanggalAkhir || undefined,
      });
      if (res.success && res.data) {
        setPreviewData(res.data.items);
      }
    } else if (reportType === "keluar") {
      const res = await getTransaksiKeluarList({
        tanggalAwal: tanggalAwal || undefined,
        tanggalAkhir: tanggalAkhir || undefined,
        fungsiId: selectedFungsi !== "ALL" ? selectedFungsi : undefined,
      });
      if (res.success && res.data) {
        setPreviewData(res.data.items);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadPreview();
  }, [reportType, selectedKategori, selectedFungsi, tanggalAwal, tanggalAkhir]);

  const handleDownloadExcel = () => {
    setDownloading(true);
    const params = new URLSearchParams();
    params.set("type", reportType);
    if (tanggalAwal) params.set("tanggalAwal", tanggalAwal);
    if (tanggalAkhir) params.set("tanggalAkhir", tanggalAkhir);
    if (selectedKategori !== "ALL") params.set("kategoriId", selectedKategori);
    if (selectedFungsi !== "ALL") params.set("fungsiId", selectedFungsi);

    const url = `/api/export/excel?${params.toString()}`;
    window.location.href = url;
    setTimeout(() => {
      setDownloading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Laporan & Ekspor Persediaan</h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold">
              Format Excel (.xlsx)
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Ekspor rekapitulasi saldo stok, mutasi pengadaan masuk, dan penyaluran barang kantor berformat resmi BPS Jeneponto.
          </p>
        </div>

        <Button
          onClick={handleDownloadExcel}
          disabled={downloading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-md shadow-emerald-950/20 rounded-xl"
        >
          <Download className={`w-4 h-4 ${downloading ? "animate-bounce" : ""}`} />
          {downloading ? "Menyiapkan Excel..." : "Unduh Laporan Excel (.xlsx)"}
        </Button>
      </div>

      {/* Report Type Selector (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setReportType("rekap")}
          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
            reportType === "rekap"
              ? "bg-[#0F2F64] text-white border-[#0F2F64] shadow-md shadow-blue-950/20"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <Boxes className={`w-5 h-5 ${reportType === "rekap" ? "text-sky-300" : "text-[#0F2F64]"}`} />
            {reportType === "rekap" && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
          </div>
          <h3 className="font-bold text-sm mt-3">1. Rekapitulasi Saldo Stok</h3>
          <p className={`text-xs mt-1 ${reportType === "rekap" ? "text-blue-100" : "text-slate-400"}`}>
            Posisi saldo riil seluruh master barang per gudang & kategori.
          </p>
        </div>

        <div
          onClick={() => setReportType("masuk")}
          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
            reportType === "masuk"
              ? "bg-[#0284C7] text-white border-[#0284C7] shadow-md shadow-sky-950/20"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <ArrowDownLeft className={`w-5 h-5 ${reportType === "masuk" ? "text-white" : "text-sky-600]"}`} />
            {reportType === "masuk" && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
          <h3 className="font-bold text-sm mt-3">2. Laporan Pengadaan Masuk</h3>
          <p className={`text-xs mt-1 ${reportType === "masuk" ? "text-sky-100" : "text-slate-400"}`}>
            Riwayat transaksi penerimaan barang dan vendor pengadaan.
          </p>
        </div>

        <div
          onClick={() => setReportType("keluar")}
          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
            reportType === "keluar"
              ? "bg-[#F97316] text-white border-[#F97316] shadow-md shadow-orange-950/20"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <ArrowUpRight className={`w-5 h-5 ${reportType === "keluar" ? "text-white" : "text-orange-600"}`} />
            {reportType === "keluar" && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
          <h3 className="font-bold text-sm mt-3">3. Laporan Penyaluran Keluar</h3>
          <p className={`text-xs mt-1 ${reportType === "keluar" ? "text-orange-100" : "text-slate-400"}`}>
            Distribusi pemakaian persediaan per seksi/fungsi kerja.
          </p>
        </div>
      </div>

      {/* Filter Parameters Bar */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Filter Laporan:
              </span>

              {/* Date Filter (for Masuk & Keluar) */}
              {(reportType === "masuk" || reportType === "keluar") && (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="date"
                    value={tanggalAwal}
                    onChange={(e) => setTanggalAwal(e.target.value)}
                    className="bg-transparent text-xs text-slate-700 focus:outline-none"
                    title="Tanggal Awal"
                  />
                  <span className="text-slate-300">s/d</span>
                  <input
                    type="date"
                    value={tanggalAkhir}
                    onChange={(e) => setTanggalAkhir(e.target.value)}
                    className="bg-transparent text-xs text-slate-700 focus:outline-none"
                    title="Tanggal Akhir"
                  />
                </div>
              )}

              {/* Kategori Filter (for Rekap) */}
              {reportType === "rekap" && (
                <select
                  value={selectedKategori}
                  onChange={(e) => setSelectedKategori(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:bg-white max-w-xs truncate"
                >
                  <option value="ALL">Semua Kategori Barang</option>
                  {kategoriList.map((kat) => (
                    <option key={kat.id} value={kat.id}>{kat.nama}</option>
                  ))}
                </select>
              )}

              {/* Seksi / Fungsi Filter (for Keluar) */}
              {reportType === "keluar" && (
                <select
                  value={selectedFungsi}
                  onChange={(e) => setSelectedFungsi(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:bg-white max-w-xs truncate"
                >
                  <option value="ALL">Semua Seksi/Fungsi</option>
                  {fungsis.map((f) => (
                    <option key={f.id} value={f.id}>{f.nama}</option>
                  ))}
                </select>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadPreview}
              title="Perbarui Pratinjau"
              className="h-10 px-3 rounded-xl border-slate-200 text-slate-600"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Data Preview Table */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-600" />
              Pratinjau Lembar Kerja ({previewData.length} Baris Data)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Data yang akan disertakan saat mengunduh berkas spreadsheet .xlsx
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={handleDownloadExcel}
            className="h-8 gap-1.5 text-xs bg-[#0F2F64] hover:bg-[#0B2550] text-white font-semibold rounded-lg"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Ekspor Sekarang
          </Button>
        </CardHeader>

        <div className="overflow-x-auto max-h-[460px]">
          <table className="w-full text-left text-sm">
            {/* Table Header by Report Type */}
            {reportType === "rekap" && (
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase sticky top-0 bg-slate-50 z-10">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Kode Barang</th>
                  <th className="py-3 px-4">Nama Barang Persediaan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Lokasi Gudang</th>
                  <th className="py-3 px-4 text-right">Saldo Stok Fisik</th>
                </tr>
              </thead>
            )}
            {reportType === "masuk" && (
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase sticky top-0 bg-slate-50 z-10">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Kode Transaksi</th>
                  <th className="py-3 px-4">Tanggal Masuk</th>
                  <th className="py-3 px-4">Nama Barang Persediaan</th>
                  <th className="py-3 px-4 text-right">Jumlah Masuk</th>
                  <th className="py-3 px-4">Sumber Pengadaan / Vendor</th>
                  <th className="py-3 px-4 text-right">Harga Satuan</th>
                  <th className="py-3 px-4 text-right">Total Harga</th>
                </tr>
              </thead>
            )}
            {reportType === "keluar" && (
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase sticky top-0 bg-slate-50 z-10">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Kode Transaksi</th>
                  <th className="py-3 px-4">Tanggal Keluar</th>
                  <th className="py-3 px-4">Nama Barang Persediaan</th>
                  <th className="py-3 px-4 text-right">Jumlah Keluar</th>
                  <th className="py-3 px-4">Penerima & Seksi / Fungsi</th>
                </tr>
              </thead>
            )}

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={reportType === "masuk" ? 8 : 6} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-[#0284C7] rounded-full animate-spin mx-auto mb-2" />
                    <p>Memuat data pratinjau laporan...</p>
                  </td>
                </tr>
              ) : previewData.length === 0 ? (
                <tr>
                  <td colSpan={reportType === "masuk" ? 8 : 6} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada data untuk filter ini</p>
                  </td>
                </tr>
              ) : (
                previewData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4 text-center text-slate-400 font-semibold">{idx + 1}</td>

                    {reportType === "rekap" && (
                      <>
                        <td className="py-2.5 px-4 font-mono font-bold text-sky-700">{item.kodeBarang}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{item.namaBarang}</td>
                        <td className="py-2.5 px-4 text-slate-600">{item.kategoriNama}</td>
                        <td className="py-2.5 px-4 text-slate-600">{item.gudangNama}</td>
                        <td className="py-2.5 px-4 text-right font-black text-slate-900">
                          {item.stok} <span className="font-normal text-[10px] text-slate-500">{item.satuanNama}</span>
                        </td>
                      </>
                    )}

                    {reportType === "masuk" && (
                      <>
                        <td className="py-2.5 px-4 font-mono font-bold text-sky-700">{item.kodeTransaksi}</td>
                        <td className="py-2.5 px-4 text-slate-600">{formatTanggal(item.tanggal)}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{item.barangNama}</td>
                        <td className="py-2.5 px-4 text-right font-black text-emerald-600">
                          +{item.jumlahMasuk} <span className="font-normal text-[10px] text-slate-500">{item.satuanNama}</span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{item.sumberPengadaan || "-"}</td>
                        <td className="py-2.5 px-4 text-right text-emerald-700 font-semibold">
                          {item.hargaSatuan ? (
                            <span>{formatRupiah(item.hargaSatuan)}</span>
                          ) : item.hargaBeli && item.jumlahMasuk > 0 ? (
                            <span>{formatRupiah(Math.round(item.hargaBeli / item.jumlahMasuk))}</span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                          {item.hargaBeli ? formatRupiah(item.hargaBeli) : "-"}
                        </td>
                      </>
                    )}

                    {reportType === "keluar" && (
                      <>
                        <td className="py-2.5 px-4 font-mono font-bold text-orange-700">{item.kodeTransaksi}</td>
                        <td className="py-2.5 px-4 text-slate-600">{formatTanggal(item.tanggal)}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{item.barangNama}</td>
                        <td className="py-2.5 px-4 text-right font-black text-orange-600">
                          -{item.jumlahKeluar} <span className="font-normal text-[10px] text-slate-500">{item.satuanNama}</span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-700">
                          <span className="font-bold">{item.penerimaNama}</span>{" "}
                          <span className="text-slate-400">({item.fungsiNama})</span>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
