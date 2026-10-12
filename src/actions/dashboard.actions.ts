"use server";

import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";

export interface DashboardData {
  stats: {
    totalVarianBarang: number;
    totalSaldoFisik: number;
    totalMasukBulanIni: number;
    totalKeluarBulanIni: number;
    criticalStockCount: number;
  };
  gudangBreakdown: Array<{
    id: string;
    nama: string;
    totalStok: number;
    totalItem: number;
  }>;
  monthlyTrends: Array<{
    bulan: string;
    masuk: number;
    keluar: number;
  }>;
  fungsiDistribution: Array<{
    fungsiNama: string;
    totalKeluar: number;
  }>;
  criticalStockItems: Array<{
    id: string;
    kodeBarang: string;
    namaBarang: string;
    kategoriNama: string;
    satuanNama: string;
    gudangNama: string;
    stok: number;
    minStok: number;
  }>;
  recentMasuk: Array<{
    id: string;
    kodeTransaksi: string;
    tanggal: Date | string;
    barangNama: string;
    satuanNama: string;
    jumlahMasuk: number;
    sumberPengadaan?: string | null;
  }>;
  recentKeluar: Array<{
    id: string;
    kodeTransaksi: string;
    tanggal: Date | string;
    barangNama: string;
    satuanNama: string;
    jumlahKeluar: number;
    penerimaNama: string;
    fungsiNama: string;
  }>;
}

export async function getDashboardData(): Promise<ActionResponse<DashboardData>> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalVarianBarang,
      sumStok,
      masukBulanIniSum,
      keluarBulanIniSum,
      gudangs,
      criticalItemsRaw,
      recentMasukRaw,
      recentKeluarRaw,
      fungsiList,
      keluarAll,
    ] = await Promise.all([
      prisma.barang.count(),
      prisma.barang.aggregate({ _sum: { stok: true } }),
      prisma.transaksiMasuk.aggregate({
        where: { tanggal: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { jumlahMasuk: true },
      }),
      prisma.transaksiKeluar.aggregate({
        where: { tanggal: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { jumlahKeluar: true },
      }),
      prisma.gudang.findMany({
        include: {
          barang: {
            select: { stok: true },
          },
        },
        orderBy: { nama: "asc" },
      }),
      prisma.barang.findMany({
        where: { stok: { lte: 5 } },
        include: {
          kategori: true,
          satuan: true,
          gudang: true,
        },
        orderBy: { stok: "asc" },
        take: 10,
      }),
      prisma.transaksiMasuk.findMany({
        take: 5,
        orderBy: { tanggal: "desc" },
        include: { barang: { select: { namaBarang: true, satuan: true } } },
      }),
      prisma.transaksiKeluar.findMany({
        take: 5,
        orderBy: { tanggal: "desc" },
        include: {
          barang: { select: { namaBarang: true, satuan: true } },
          fungsi: { select: { nama: true } },
        },
      }),
      prisma.fungsi.findMany({
        include: {
          transaksiKeluar: {
            select: { jumlahKeluar: true },
          },
        },
      }),
      prisma.transaksiKeluar.findMany({
        select: {
          tanggal: true,
          jumlahKeluar: true,
        },
      }),
    ]);

    // Breakdown Gudang
    const gudangBreakdown = gudangs.map((g) => ({
      id: g.id,
      nama: g.nama,
      totalStok: g.barang.reduce((acc, b) => acc + b.stok, 0),
      totalItem: g.barang.length,
    }));

    // Distribusi Seksi / Fungsi
    const fungsiDistribution = fungsiList
      .map((f) => ({
        fungsiNama: f.nama,
        totalKeluar: f.transaksiKeluar.reduce((acc, k) => acc + k.jumlahKeluar, 0),
      }))
      .filter((f) => f.totalKeluar > 0)
      .sort((a, b) => b.totalKeluar - a.totalKeluar);

    // Mock/Real monthly trends (sample 6 bulan terakhir)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const monthlyTrends: Array<{ bulan: string; masuk: number; keluar: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const [mMasuk, mKeluar] = await Promise.all([
        prisma.transaksiMasuk.aggregate({
          where: { tanggal: { gte: mStart, lte: mEnd } },
          _sum: { jumlahMasuk: true },
        }),
        prisma.transaksiKeluar.aggregate({
          where: { tanggal: { gte: mStart, lte: mEnd } },
          _sum: { jumlahKeluar: true },
        }),
      ]);

      monthlyTrends.push({
        bulan: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        masuk: mMasuk._sum.jumlahMasuk || 0,
        keluar: mKeluar._sum.jumlahKeluar || 0,
      });
    }

    const criticalStockItems = criticalItemsRaw.map((b) => ({
      id: b.id,
      kodeBarang: b.kodeBarang,
      namaBarang: b.namaBarang,
      kategoriNama: b.kategori.nama,
      satuanNama: b.satuan.nama,
      gudangNama: b.gudang.nama,
      stok: b.stok,
      minStok: b.minStok,
    }));

    const formattedMasuk = recentMasukRaw.map((m) => ({
      id: m.id,
      kodeTransaksi: m.kodeTransaksi,
      tanggal: m.tanggal,
      barangNama: m.barang.namaBarang,
      satuanNama: m.barang.satuan.nama,
      jumlahMasuk: m.jumlahMasuk,
      sumberPengadaan: m.sumberPengadaan,
    }));

    const formattedKeluar = recentKeluarRaw.map((k) => ({
      id: k.id,
      kodeTransaksi: k.kodeTransaksi,
      tanggal: k.tanggal,
      barangNama: k.barang.namaBarang,
      satuanNama: k.barang.satuan.nama,
      jumlahKeluar: k.jumlahKeluar,
      penerimaNama: k.penerimaNama,
      fungsiNama: k.fungsi.nama,
    }));

    return {
      success: true,
      data: {
        stats: {
          totalVarianBarang,
          totalSaldoFisik: sumStok._sum.stok || 0,
          totalMasukBulanIni: masukBulanIniSum._sum.jumlahMasuk || 0,
          totalKeluarBulanIni: keluarBulanIniSum._sum.jumlahKeluar || 0,
          criticalStockCount: criticalItemsRaw.length,
        },
        gudangBreakdown,
        monthlyTrends,
        fungsiDistribution,
        criticalStockItems,
        recentMasuk: formattedMasuk,
        recentKeluar: formattedKeluar,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memuat data statistik dasbor.",
    };
  }
}
