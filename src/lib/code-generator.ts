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
 * Menghasilkan Kode Transaksi Masuk (Format: BM-YYYYMM-xxxx)
 */
export async function generateKodeTransaksiMasuk(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `BM-${year}${month}-`;

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
 * Menghasilkan Kode Transaksi Keluar (Format: BK-YYYYMM-xxxx)
 */
export async function generateKodeTransaksiKeluar(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `BK-${year}${month}-`;

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
