import { prisma } from "@/lib/prisma";

/**
 * Menghasilkan Kode Unik Master Barang sekuensial (Format: ID-1000xxx)
 */
export async function generateKodeBarang(): Promise<string> {
  const latestBarang = await prisma.barang.findFirst({
    where: { kodeBarang: { startsWith: "ID-" } },
    orderBy: { kodeBarang: "desc" },
    select: { kodeBarang: true },
  });

  let nextNum = 1000328;
  if (latestBarang && latestBarang.kodeBarang) {
    const match = latestBarang.kodeBarang.match(/ID-(\d+)/);
    if (match) {
      const currentVal = parseInt(match[1], 10);
      nextNum = currentVal + 1;
    }
  }

  return `ID-${nextNum}`;
}

/**
 * Menghasilkan Kode Transaksi Masuk
 * - Tahun <= 2026: Format sekuensial historis BPS (BM-1000xxx)
 * - Tahun >= 2027: Format berbasis periode bulan (BM-YYYYMM-xxxx)
 */
export async function generateKodeTransaksiMasuk(): Promise<string> {
  const now = new Date();
  const currentYear = now.getFullYear();

  // 1. Tahun 2026 dan sebelumnya: Tetap pakai pola kode historis BPS (BM-1000xxx)
  if (currentYear <= 2026) {
    const latest = await prisma.transaksiMasuk.findFirst({
      where: {
        kodeTransaksi: {
          startsWith: "BM-1",
        },
      },
      orderBy: {
        kodeTransaksi: "desc",
      },
      select: { kodeTransaksi: true },
    });

    let nextNum = 1000650; // Melanjutkan setelah max data historis Excel (BM-1000649)
    if (latest && latest.kodeTransaksi) {
      const match = latest.kodeTransaksi.match(/BM-(\d+)/);
      if (match) {
        nextNum = Math.max(nextNum, parseInt(match[1], 10) + 1);
      }
    }
    return `BM-${nextNum}`;
  }

  // 2. Tahun 2027 dan seterusnya: Menggunakan format periodik (BM-YYYYMM-xxxx)
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `BM-${currentYear}${month}-`;

  const countThisMonth = await prisma.transaksiMasuk.count({
    where: {
      kodeTransaksi: {
        startsWith: prefix,
      },
    },
  });

  const nextSeq = String(countThisMonth + 1).padStart(4, "0");
  return `${prefix}${nextSeq}`;
}

/**
 * Menghasilkan Kode Transaksi Keluar
 * - Tahun <= 2026: Format sekuensial historis BPS (BK-1000xxx)
 * - Tahun >= 2027: Format berbasis periode bulan (BK-YYYYMM-xxxx)
 */
export async function generateKodeTransaksiKeluar(): Promise<string> {
  const now = new Date();
  const currentYear = now.getFullYear();

  // 1. Tahun 2026 dan sebelumnya: Tetap pakai pola kode historis BPS (BK-1000xxx)
  if (currentYear <= 2026) {
    const latest = await prisma.transaksiKeluar.findFirst({
      where: {
        kodeTransaksi: {
          startsWith: "BK-1",
        },
      },
      orderBy: {
        kodeTransaksi: "desc",
      },
      select: { kodeTransaksi: true },
    });

    let nextNum = 1000535; // Melanjutkan setelah max data historis Excel (BK-1000534)
    if (latest && latest.kodeTransaksi) {
      const match = latest.kodeTransaksi.match(/BK-(\d+)/);
      if (match) {
        nextNum = Math.max(nextNum, parseInt(match[1], 10) + 1);
      }
    }
    return `BK-${nextNum}`;
  }

  // 2. Tahun 2027 dan seterusnya: Menggunakan format periodik (BK-YYYYMM-xxxx)
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `BK-${currentYear}${month}-`;

  const countThisMonth = await prisma.transaksiKeluar.count({
    where: {
      kodeTransaksi: {
        startsWith: prefix,
      },
    },
  });

  const nextSeq = String(countThisMonth + 1).padStart(4, "0");
  return `${prefix}${nextSeq}`;
}

/**
 * Menghasilkan Nomor Dokumen Tanda Terima (Format: TT-YYYYMM-xxxx)
 */
export async function generateNomorTandaTerima(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `TT-${year}${month}-`;

  const countThisMonth = await prisma.tandaTerima.count({
    where: {
      nomorDokumen: {
        startsWith: prefix,
      },
    },
  });

  const nextSeq = String(countThisMonth + 1).padStart(4, "0");
  return `${prefix}${nextSeq}`;
}
