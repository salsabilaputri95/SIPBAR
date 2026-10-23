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
    <div className="min-h-screen bg-slate-100 print:bg-white p-4 sm:p-8 print:p-0 flex flex-col items-center print:block">
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
      <div className="w-full max-w-4xl bg-white p-8 sm:p-12 print:p-0 shadow-md print:shadow-none border print:border-none border-slate-200 text-slate-900 font-sans print:w-full print:max-w-none">
        {/* Kop Surat Resmi BPS (Proporsional & Ringkas) */}
        <div className="pb-1 mb-4 print:mb-2">
          <div className="flex items-center gap-3 sm:gap-4 print:gap-3">
            {/* Logo Resmi BPS */}
            <img
              src="/bps-logo.svg"
              alt="Logo Badan Pusat Statistik"
              className="h-12 sm:h-14 print:h-11 w-auto object-contain shrink-0"
            />

            <div className="flex-1 text-left">
              <h2 className="text-sm sm:text-base print:text-[11.5pt] font-black italic tracking-wide text-slate-950 uppercase leading-snug font-sans">
                BADAN PUSAT STATISTIK
              </h2>
              <h1 className="text-sm sm:text-base print:text-[11.5pt] font-black italic tracking-wide text-slate-950 uppercase leading-snug font-sans">
                KABUPATEN JENEPONTO
              </h1>
              <p className="text-[9px] sm:text-[10px] print:text-[7.5pt] text-slate-800 leading-tight mt-0.5 font-sans">
                Jalan Sultan Hasanuddin No.58 Bontosunggu, Empoang, Jeneponto Sulawesi Selatan
              </p>
              <p className="text-[9px] sm:text-[10px] print:text-[7.5pt] text-slate-800 leading-tight font-sans">
                Kode Pos 92311, Telp/Fax : (0419) 22256, Homepage : jenepontokab.bps.go.id
              </p>
            </div>
          </div>
          {/* Garis Tebal Kop Surat */}
          <div className="w-full border-b-[2px] border-slate-950 mt-2 print:mt-1.5" />
        </div>

        {/* Title of Document */}
        <div className="text-center my-4 print:my-2.5">
          <h3 className="text-xs sm:text-sm print:text-[10.5pt] font-bold underline tracking-wide text-slate-900 uppercase">
            Surat Permintaan Barang ATK/CETAK/DLL
          </h3>
        </div>

        {/* Introduction Paragraph */}
        <div className="text-xs print:text-[8.5pt] leading-relaxed text-slate-800 space-y-1 mb-3 print:mb-2">
          <p>
            Pada hari ini, <strong>{formatTanggal(doc.tanggalDokumen)}</strong>, bertempat di Kantor Badan Pusat Statistik Kabupaten Jeneponto, telah dilakukan penyerahan barang persediaan perlengkapan kantor untuk kebutuhan operasional dengan rincian sebagai berikut:
          </p>
        </div>

        {/* Items Table */}
        <table className="w-full text-xs print:text-[8pt] text-left border-collapse border border-slate-400 my-3 print:my-2">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400 print:bg-slate-100">
              <th className="border border-slate-400 py-1.5 px-2 text-center w-8 print:w-7">No</th>
              <th className="border border-slate-400 py-1.5 px-2 text-center">Kode Transaksi</th>
              <th className="border border-slate-400 py-1.5 px-2 text-center">Nama Barang Persediaan</th>
              <th className="border border-slate-400 py-1.5 px-2 text-center w-24 print:w-20">Banyaknya</th>
              <th className="border border-slate-400 py-1.5 px-2 text-center">Nama Penerima</th>
              <th className="border border-slate-400 py-1.5 px-2 text-center">Seksi / Fungsi</th>
              <th className="border border-slate-400 py-1.5 px-2 text-center w-24 print:w-20">TTD</th>
            </tr>
          </thead>
          <tbody>
            {doc.items.map((item, idx) => (
              <tr key={item.id} className="border-b border-slate-300">
                <td className="border border-slate-400 py-1.5 px-2 text-center font-semibold">{idx + 1}</td>
                <td className="border border-slate-400 py-1.5 px-2 text-center font-mono text-[10px] print:text-[7.5pt] text-slate-700">{item.kodeTransaksi}</td>
                <td className="border border-slate-400 py-1.5 px-2 font-bold text-slate-900">{item.namaBarang}</td>
                <td className="border border-slate-400 py-1.5 px-2 text-center font-normal">
                  {item.jumlahKeluar} <span className="text-[10px] print:text-[7.5pt]">{item.satuan}</span>
                </td>
                <td className="border border-slate-400 py-1.5 px-2">{item.penerimaNama}</td>
                <td className="border border-slate-400 py-1.5 px-2 text-center">{item.fungsi}</td>
                <td className="border border-slate-400 py-1.5 px-2 text-center h-8 print:h-7"></td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-slate-50 font-bold border-t-2 border-slate-900 print:bg-slate-50">
              <td colSpan={3} className="border border-slate-400 py-1.5 px-2 text-right uppercase text-[10px] print:text-[7.5pt]">
                Total Barang Diserahkan:
              </td>
              <td className="border border-slate-400 py-1.5 px-2 text-center font-black text-xs print:text-[8pt]">
                {totalUnits} Unit
              </td>
              <td colSpan={3} className="border border-slate-400 py-1.5 px-2 text-slate-600 font-normal italic text-[10px] print:text-[7.5pt]">
                {doc.items.length} macam barang
              </td>
            </tr>
          </tbody>
        </table>

        {/* Closing Paragraph */}
        <div className="text-xs print:text-[8.5pt] leading-relaxed text-slate-800 my-3 print:my-2">
          <p>
            Demikian Surat Permintaan Barang ATK/CETAK/DLL ini dibuat dengan sebenarnya dalam rangkap secukupnya untuk dipergunakan sebagaimana mestinya.
          </p>
        </div>

        {/* Signatures Column (2 Columns) */}
        <div className="grid grid-cols-2 gap-8 pt-4 mt-2 print:pt-3 print:mt-1 text-xs print:text-[8.5pt] text-center text-slate-900">
          {/* Sisi Kiri: Kepala Gudang */}
          <div className="space-y-12 print:space-y-10">
            <div>
              <p className="invisible select-none text-[8.5pt]">Jeneponto, {formatTanggal(doc.tanggalDokumen)}</p>
              <p className="invisible select-none text-[8.5pt]">Mengetahui,</p>
              <p className="font-bold text-slate-900">Kepala Gudang,</p>
              <p className="text-[10px] print:text-[7.5pt] text-slate-600">BPS Kabupaten Jeneponto</p>
            </div>
            <div>
              <p className="font-bold underline text-slate-900 text-xs print:text-[8.5pt]">
                Sapril, A.Md.Kom.
              </p>
              <p className="text-[10px] print:text-[7.5pt] font-mono text-slate-700">NIP. 199204182014011009</p>
            </div>
          </div>

          {/* Sisi Kanan: Yang Menyerahkan / Mengetahui (Kasubbag Umum) */}
          <div className="space-y-12 print:space-y-10">
            <div>
              <p className="font-semibold text-slate-800">
                Jeneponto, {formatTanggal(doc.tanggalDokumen)}
              </p>
              <p className="font-semibold text-slate-800">Mengetahui,</p>
              <p className="font-bold text-slate-900">Kepala Subbagian Umum,</p>
              <p className="text-[10px] print:text-[7.5pt] text-slate-600">BPS Kabupaten Jeneponto</p>
            </div>
            <div>
              <p className="font-bold underline text-slate-900 text-xs print:text-[8.5pt]">
                {doc.kasubbagNama && doc.kasubbagNama.trim()
                  ? (doc.kasubbagNama.toLowerCase().includes("imaniar")
                      ? "Imaniar Dwi Aryanti, S.T.P."
                      : doc.kasubbagNama)
                  : "Imaniar Dwi Aryanti, S.T.P."}
              </p>
              <p className="text-[10px] print:text-[7.5pt] font-mono text-slate-700">
                NIP. {doc.kasubbagNip && doc.kasubbagNip !== "199204182014011009"
                  ? doc.kasubbagNip
                  : "199001012015012001"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
