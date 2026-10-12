import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTandaTerimaDetail } from "@/actions/terima.actions";
import { formatTanggal } from "@/lib/utils";
import PrintTriggerButton from "./print-button";

interface CetakTandaTerimaProps {
  params: {
    id: string;
  };
}

export default async function CetakTandaTerimaPage({ params }: CetakTandaTerimaProps) {
  const res = await getTandaTerimaDetail(params.id);

  if (!res.success || !res.data) {
    notFound();
  }

  const doc = res.data;
  const totalUnits = doc.items.reduce((acc, curr) => acc + curr.jumlahKeluar, 0);

  // Ambil nama penerima pertama untuk kolom kiri tanda tangan
  const penerimaUtama = doc.items[0]?.penerimaNama || "Pegawai Penerima";
  const fungsiUtama = doc.items[0]?.fungsi || "Unit Kerja Terkait";

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white p-4 sm:p-8 flex flex-col items-center">
      {/* Floating Action Bar (Hidden on Print) */}
      <div className="w-full max-w-4xl mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/tanda-terima"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-200"
        >
          ← Kembali ke Daftar Tanda Terima
        </Link>
        <PrintTriggerButton />
      </div>

      {/* Official BPS Document Sheet (A4/F4 Portrait) */}
      <div className="w-full max-w-4xl bg-white p-8 sm:p-12 shadow-md print:shadow-none border print:border-none border-slate-200 text-slate-900 font-sans print:p-0">
        {/* Kop Surat Resmi BPS */}
        <div className="border-b-2 border-slate-900 pb-3 mb-6">
          <div className="flex items-center gap-5">
            {/* Logo BPS Style Emblem */}
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center border-2 border-[#0F2F64] rounded-lg p-1 bg-white">
              <div className="text-center">
                <div className="text-[11px] font-black text-[#0F2F64] leading-tight">BPS</div>
                <div className="text-[7px] font-bold text-sky-700 leading-none">JENEPONTO</div>
              </div>
            </div>

            <div className="flex-1 text-center">
              <h2 className="text-sm sm:text-base font-bold tracking-wider text-slate-700 uppercase">
                Badan Pusat Statistik
              </h2>
              <h1 className="text-base sm:text-xl font-black tracking-wide text-[#0F2F64] uppercase">
                Kabupaten Jeneponto
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                Jl. Pahlawan No. 42 Jeneponto, Sulawesi Selatan 92311 | Telp: (0419) 21014
              </p>
              <p className="text-[10px] text-slate-500 italic">
                Website: jenepontokab.bps.go.id | Email: bps7304@bps.go.id
              </p>
            </div>
          </div>
          {/* Double border line for government letterhead */}
          <div className="w-full border-t border-slate-900 mt-2.5 pt-0.5" />
        </div>

        {/* Title of Document */}
        <div className="text-center my-6">
          <h3 className="text-sm sm:text-base font-black underline tracking-wide text-slate-900 uppercase">
            Berita Acara Penyerahan Barang Persediaan
          </h3>
          <p className="text-xs font-mono font-bold text-slate-700 mt-1">
            Nomor: {doc.nomorDokumen}
          </p>
        </div>

        {/* Introduction Paragraph */}
        <div className="text-xs leading-relaxed text-slate-800 space-y-2 mb-4">
          <p>
            Pada hari ini, <strong>{formatTanggal(doc.tanggalDokumen)}</strong>, bertempat di Kantor Badan Pusat Statistik Kabupaten Jeneponto, telah dilakukan penyerahan barang persediaan perlengkapan kantor untuk kebutuhan operasional dengan rincian sebagai berikut:
          </p>
        </div>

        {/* Items Table */}
        <table className="w-full text-xs text-left border-collapse border border-slate-400 my-4">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
              <th className="border border-slate-400 py-2 px-2.5 text-center w-8">No</th>
              <th className="border border-slate-400 py-2 px-2.5">Kode Transaksi</th>
              <th className="border border-slate-400 py-2 px-2.5">Nama Barang Persediaan</th>
              <th className="border border-slate-400 py-2 px-2.5 text-right w-24">Banyaknya</th>
              <th className="border border-slate-400 py-2 px-2.5">Nama Penerima</th>
              <th className="border border-slate-400 py-2 px-2.5">Seksi / Fungsi</th>
            </tr>
          </thead>
          <tbody>
            {doc.items.map((item, idx) => (
              <tr key={item.id} className="border-b border-slate-300">
                <td className="border border-slate-400 py-2 px-2.5 text-center font-semibold">{idx + 1}</td>
                <td className="border border-slate-400 py-2 px-2.5 font-mono text-[11px] text-slate-700">{item.kodeTransaksi}</td>
                <td className="border border-slate-400 py-2 px-2.5 font-bold text-slate-900">{item.namaBarang}</td>
                <td className="border border-slate-400 py-2 px-2.5 text-right font-black">
                  {item.jumlahKeluar} <span className="font-normal text-[11px]">{item.satuan}</span>
                </td>
                <td className="border border-slate-400 py-2 px-2.5">{item.penerimaNama}</td>
                <td className="border border-slate-400 py-2 px-2.5">{item.fungsi}</td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-slate-50 font-bold border-t-2 border-slate-900">
              <td colSpan={3} className="border border-slate-400 py-2 px-2.5 text-right uppercase">
                Total Barang Diserahkan:
              </td>
              <td className="border border-slate-400 py-2 px-2.5 text-right font-black text-sm">
                {totalUnits} Unit
              </td>
              <td colSpan={2} className="border border-slate-400 py-2 px-2.5 text-slate-500 font-normal italic">
                {doc.items.length} macam barang
              </td>
            </tr>
          </tbody>
        </table>

        {/* Closing Paragraph */}
        <div className="text-xs leading-relaxed text-slate-800 my-4">
          <p>
            Demikian Berita Acara Penyerahan Barang Persediaan ini dibuat dengan sebenarnya dalam rangkap secukupnya untuk dipergunakan sebagaimana mestinya.
          </p>
        </div>

        {/* Signatures Column (2 Columns) */}
        <div className="grid grid-cols-2 gap-8 pt-8 mt-6 text-xs text-center text-slate-900">
          {/* Sisi Kiri: Yang Menerima */}
          <div className="space-y-16">
            <div>
              <p className="font-semibold">Yang Menerima,</p>
              <p className="text-[11px] text-slate-600">{fungsiUtama}</p>
            </div>
            <div>
              <p className="font-bold underline text-slate-900 uppercase">{penerimaUtama}</p>
              <p className="text-[11px] text-slate-600">Pegawai BPS Kab. Jeneponto</p>
            </div>
          </div>

          {/* Sisi Kanan: Yang Menyerahkan / Mengetahui */}
          <div className="space-y-16">
            <div>
              <p className="font-semibold">
                Jeneponto, {formatTanggal(doc.tanggalDokumen)}
              </p>
              <p className="font-semibold">{doc.kasubbagJabatan}</p>
            </div>
            <div>
              <p className="font-bold underline text-slate-900 uppercase">{doc.kasubbagNama}</p>
              {doc.kasubbagNip ? (
                <p className="text-[11px] font-mono text-slate-700">NIP. {doc.kasubbagNip}</p>
              ) : (
                <p className="text-[11px] font-mono text-slate-500">NIP. -</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
