import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN_GUDANG")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "rekap"; // 'rekap' | 'masuk' | 'keluar'
    const tanggalAwal = searchParams.get("tanggalAwal");
    const tanggalAkhir = searchParams.get("tanggalAkhir");
    const kategoriId = searchParams.get("kategoriId");
    const fungsiId = searchParams.get("fungsiId");

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SIPBAR Web - BPS Kab. Jeneponto";
    workbook.created = new Date();

    const tglExportStr = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    if (type === "rekap") {
      // 1. LAPORAN REKAPITULASI STOK FISIK
      const where: any = {};
      if (kategoriId && kategoriId !== "ALL") where.kategoriId = kategoriId;

      const barangs = await prisma.barang.findMany({
        where,
        include: {
          kategori: true,
          satuan: true,
          gudang: true,
        },
        orderBy: [{ kategori: { nama: "asc" } }, { namaBarang: "asc" }],
      });

      const worksheet = workbook.addWorksheet("Rekapitulasi Stok");

      // Title & Header Rows
      worksheet.mergeCells("A1:G1");
      worksheet.getCell("A1").value = "BADAN PUSAT STATISTIK KABUPATEN JENEPONTO";
      worksheet.getCell("A1").font = { name: "Arial", size: 13, bold: true, color: { argb: "0F2F64" } };
      worksheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };

      worksheet.mergeCells("A2:G2");
      worksheet.getCell("A2").value = "LAPORAN REKAPITULASI SALDO STOK PERSEDIAAN BARANG";
      worksheet.getCell("A2").font = { name: "Arial", size: 11, bold: true };
      worksheet.getCell("A2").alignment = { vertical: "middle", horizontal: "center" };

      worksheet.mergeCells("A3:G3");
      worksheet.getCell("A3").value = `Posisi Data Per: ${tglExportStr}`;
      worksheet.getCell("A3").font = { name: "Arial", size: 9, italic: true };
      worksheet.getCell("A3").alignment = { vertical: "middle", horizontal: "center" };

      worksheet.addRow([]); // Blank line 4

      // Header Columns
      const headers = ["No", "Kode Barang", "Nama Barang Persediaan", "Kategori", "Satuan", "Lokasi Gudang", "Saldo Stok Fisik"];
      const headerRow = worksheet.addRow(headers);
      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "0F2F64" },
        };
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      let totalStok = 0;
      barangs.forEach((b, idx) => {
        totalStok += b.stok;
        const row = worksheet.addRow([
          idx + 1,
          b.kodeBarang,
          b.namaBarang,
          b.kategori.nama,
          b.satuan.nama,
          b.gudang.nama,
          b.stok,
        ]);
        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(2).alignment = { horizontal: "center" };
        row.getCell(5).alignment = { horizontal: "center" };
        row.getCell(6).alignment = { horizontal: "center" };
        row.getCell(7).alignment = { horizontal: "right" };
        row.getCell(7).numFmt = "#,##0";
        row.eachCell((c) => {
          c.border = {
            top: { style: "thin", color: { argb: "CCCCCC" } },
            left: { style: "thin", color: { argb: "CCCCCC" } },
            bottom: { style: "thin", color: { argb: "CCCCCC" } },
            right: { style: "thin", color: { argb: "CCCCCC" } },
          };
        });
      });

      // Total Row
      const totalRow = worksheet.addRow(["", "", "TOTAL SALDO PERSEDIAAN", "", "", "", totalStok]);
      totalRow.font = { name: "Arial", size: 10, bold: true };
      totalRow.getCell(3).alignment = { horizontal: "right" };
      totalRow.getCell(7).alignment = { horizontal: "right" };
      totalRow.getCell(7).numFmt = "#,##0";
      totalRow.eachCell((c) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F1F5F9" } };
        c.border = { top: { style: "double" }, bottom: { style: "double" } };
      });

      worksheet.columns = [
        { width: 6 },
        { width: 16 },
        { width: 36 },
        { width: 22 },
        { width: 12 },
        { width: 14 },
        { width: 18 },
      ];
    } else if (type === "masuk") {
      // 2. LAPORAN TRANSAKSI MASUK
      const where: any = {};
      if (tanggalAwal || tanggalAkhir) {
        where.tanggal = {};
        if (tanggalAwal) where.tanggal.gte = new Date(`${tanggalAwal}T00:00:00.000Z`);
        if (tanggalAkhir) where.tanggal.lte = new Date(`${tanggalAkhir}T23:59:59.999Z`);
      }

      const list = await prisma.transaksiMasuk.findMany({
        where,
        include: {
          barang: { include: { satuan: true, kategori: true } },
          createdBy: true,
        },
        orderBy: { tanggal: "asc" },
      });

      const worksheet = workbook.addWorksheet("Barang Masuk");

      // Title & Header
      worksheet.mergeCells("A1:G1");
      worksheet.getCell("A1").value = "BADAN PUSAT STATISTIK KABUPATEN JENEPONTO";
      worksheet.getCell("A1").font = { name: "Arial", size: 13, bold: true, color: { argb: "0F2F64" } };
      worksheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };

      worksheet.mergeCells("A2:G2");
      worksheet.getCell("A2").value = "LAPORAN PENERIMAAN / PENGADAAN BARANG MASUK";
      worksheet.getCell("A2").font = { name: "Arial", size: 11, bold: true };
      worksheet.getCell("A2").alignment = { vertical: "middle", horizontal: "center" };

      worksheet.mergeCells("A3:G3");
      const periodeStr = tanggalAwal && tanggalAkhir ? `${tanggalAwal} s/d ${tanggalAkhir}` : "Seluruh Periode";
      worksheet.getCell("A3").value = `Periode: ${periodeStr} | Dicetak: ${tglExportStr}`;
      worksheet.getCell("A3").font = { name: "Arial", size: 9, italic: true };
      worksheet.getCell("A3").alignment = { vertical: "middle", horizontal: "center" };

      worksheet.addRow([]);

      const headers = ["No", "Kode Transaksi", "Tanggal", "Nama Barang Persediaan", "Satuan", "Jumlah Masuk", "Sumber Pengadaan / Vendor"];
      const headerRow = worksheet.addRow(headers);
      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0284C7" } };
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      });

      let totalMasuk = 0;
      list.forEach((item, idx) => {
        totalMasuk += item.jumlahMasuk;
        const row = worksheet.addRow([
          idx + 1,
          item.kodeTransaksi,
          new Date(item.tanggal).toLocaleDateString("id-ID"),
          item.barang.namaBarang,
          item.barang.satuan.nama,
          item.jumlahMasuk,
          item.sumberPengadaan || "-",
        ]);
        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(2).alignment = { horizontal: "center" };
        row.getCell(3).alignment = { horizontal: "center" };
        row.getCell(5).alignment = { horizontal: "center" };
        row.getCell(6).alignment = { horizontal: "right" };
        row.getCell(6).numFmt = "#,##0";
        row.eachCell((c) => {
          c.border = {
            top: { style: "thin", color: { argb: "CCCCCC" } },
            left: { style: "thin", color: { argb: "CCCCCC" } },
            bottom: { style: "thin", color: { argb: "CCCCCC" } },
            right: { style: "thin", color: { argb: "CCCCCC" } },
          };
        });
      });

      const totalRow = worksheet.addRow(["", "", "", "TOTAL PENGADAAN MASUK", "", totalMasuk, ""]);
      totalRow.font = { name: "Arial", size: 10, bold: true };
      totalRow.getCell(4).alignment = { horizontal: "right" };
      totalRow.getCell(6).alignment = { horizontal: "right" };
      totalRow.getCell(6).numFmt = "#,##0";
      totalRow.eachCell((c) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F1F5F9" } };
        c.border = { top: { style: "double" }, bottom: { style: "double" } };
      });

      worksheet.columns = [
        { width: 6 },
        { width: 18 },
        { width: 14 },
        { width: 36 },
        { width: 12 },
        { width: 16 },
        { width: 28 },
      ];
    } else {
      // 3. LAPORAN TRANSAKSI KELUAR
      const where: any = {};
      if (fungsiId && fungsiId !== "ALL") where.fungsiId = fungsiId;
      if (tanggalAwal || tanggalAkhir) {
        where.tanggal = {};
        if (tanggalAwal) where.tanggal.gte = new Date(`${tanggalAwal}T00:00:00.000Z`);
        if (tanggalAkhir) where.tanggal.lte = new Date(`${tanggalAkhir}T23:59:59.999Z`);
      }

      const list = await prisma.transaksiKeluar.findMany({
        where,
        include: {
          barang: { include: { satuan: true } },
          fungsi: true,
          tandaTerima: true,
        },
        orderBy: { tanggal: "asc" },
      });

      const worksheet = workbook.addWorksheet("Barang Keluar");

      worksheet.mergeCells("A1:H1");
      worksheet.getCell("A1").value = "BADAN PUSAT STATISTIK KABUPATEN JENEPONTO";
      worksheet.getCell("A1").font = { name: "Arial", size: 13, bold: true, color: { argb: "0F2F64" } };
      worksheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };

      worksheet.mergeCells("A2:H2");
      worksheet.getCell("A2").value = "LAPORAN PENYALURAN / PENGELUARAN BARANG KELUAR";
      worksheet.getCell("A2").font = { name: "Arial", size: 11, bold: true };
      worksheet.getCell("A2").alignment = { vertical: "middle", horizontal: "center" };

      worksheet.mergeCells("A3:H3");
      const periodeStr = tanggalAwal && tanggalAkhir ? `${tanggalAwal} s/d ${tanggalAkhir}` : "Seluruh Periode";
      worksheet.getCell("A3").value = `Periode: ${periodeStr} | Dicetak: ${tglExportStr}`;
      worksheet.getCell("A3").font = { name: "Arial", size: 9, italic: true };
      worksheet.getCell("A3").alignment = { vertical: "middle", horizontal: "center" };

      worksheet.addRow([]);

      const headers = ["No", "Kode Transaksi", "Tanggal", "Nama Barang Persediaan", "Satuan", "Jumlah Keluar", "Nama Penerima", "Seksi / Fungsi"];
      const headerRow = worksheet.addRow(headers);
      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F97316" } };
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      });

      let totalKeluar = 0;
      list.forEach((item, idx) => {
        totalKeluar += item.jumlahKeluar;
        const row = worksheet.addRow([
          idx + 1,
          item.kodeTransaksi,
          new Date(item.tanggal).toLocaleDateString("id-ID"),
          item.barang.namaBarang,
          item.barang.satuan.nama,
          item.jumlahKeluar,
          item.penerimaNama,
          item.fungsi.nama,
        ]);
        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(2).alignment = { horizontal: "center" };
        row.getCell(3).alignment = { horizontal: "center" };
        row.getCell(5).alignment = { horizontal: "center" };
        row.getCell(6).alignment = { horizontal: "right" };
        row.getCell(6).numFmt = "#,##0";
        row.eachCell((c) => {
          c.border = {
            top: { style: "thin", color: { argb: "CCCCCC" } },
            left: { style: "thin", color: { argb: "CCCCCC" } },
            bottom: { style: "thin", color: { argb: "CCCCCC" } },
            right: { style: "thin", color: { argb: "CCCCCC" } },
          };
        });
      });

      const totalRow = worksheet.addRow(["", "", "", "TOTAL PENYALURAN KELUAR", "", totalKeluar, "", ""]);
      totalRow.font = { name: "Arial", size: 10, bold: true };
      totalRow.getCell(4).alignment = { horizontal: "right" };
      totalRow.getCell(6).alignment = { horizontal: "right" };
      totalRow.getCell(6).numFmt = "#,##0";
      totalRow.eachCell((c) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F1F5F9" } };
        c.border = { top: { style: "double" }, bottom: { style: "double" } };
      });

      worksheet.columns = [
        { width: 6 },
        { width: 18 },
        { width: 14 },
        { width: 36 },
        { width: 12 },
        { width: 16 },
        { width: 22 },
        { width: 20 },
      ];
    }

    const buffer = await workbook.xlsx.writeBuffer();

    const filename = `SIPBAR_BPS_Jeneponto_${type.toUpperCase()}_${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Export Excel error:", error);
    return new NextResponse(`Export Error: ${error.message}`, { status: 500 });
  }
}
