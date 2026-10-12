"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { TransaksiKeluarSchema, TransaksiKeluarInput } from "@/schemas/transaksi.schema";
import { generateKodeTransaksiKeluar } from "@/lib/code-generator";
import { ActionResponse, TransaksiKeluarItem } from "@/types";

// Helper verifikasi hak akses Admin
async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN_GUDANG")) {
    throw new Error("Akses ditolak: Operasi ini hanya diizinkan untuk Pengelola Persediaan BPS.");
  }
  return session;
}

export interface GetKeluarFilter {
  search?: string;
  tanggalAwal?: string;
  tanggalAkhir?: string;
  fungsiId?: string;
  barangId?: string;
  penerimaNama?: string;
  tanpaTandaTerima?: boolean;
}

// 1. Ambil daftar transaksi barang keluar
export async function getTransaksiKeluarList(
  filter?: GetKeluarFilter
): Promise<ActionResponse<{ items: TransaksiKeluarItem[]; totalUnits: number; totalTransactions: number }>> {
  try {
    const search = filter?.search?.trim() || "";
    const fungsiId = filter?.fungsiId || undefined;
    const barangId = filter?.barangId || undefined;
    const penerimaNama = filter?.penerimaNama || undefined;
    const tanpaTandaTerima = filter?.tanpaTandaTerima;
    const tanggalAwal = filter?.tanggalAwal ? new Date(`${filter.tanggalAwal}T00:00:00.000Z`) : undefined;
    const tanggalAkhir = filter?.tanggalAkhir ? new Date(`${filter.tanggalAkhir}T23:59:59.999Z`) : undefined;

    const where: any = {};

    if (search) {
      where.OR = [
        { kodeTransaksi: { contains: search, mode: "insensitive" } },
        { penerimaNama: { contains: search, mode: "insensitive" } },
        { barang: { namaBarang: { contains: search, mode: "insensitive" } } },
        { barang: { kodeBarang: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (fungsiId && fungsiId !== "ALL") {
      where.fungsiId = fungsiId;
    }

    if (barangId && barangId !== "ALL") {
      where.barangId = barangId;
    }

    if (penerimaNama && penerimaNama !== "ALL") {
      where.penerimaNama = penerimaNama;
    }

    if (tanpaTandaTerima) {
      where.tandaTerimaId = null;
    }

    if (tanggalAwal || tanggalAkhir) {
      where.tanggal = {};
      if (tanggalAwal) where.tanggal.gte = tanggalAwal;
      if (tanggalAkhir) where.tanggal.lte = tanggalAkhir;
    }

    const rawList = await prisma.transaksiKeluar.findMany({
      where,
      include: {
        barang: {
          include: {
            satuan: true,
            gudang: true,
          },
        },
        fungsi: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
        tandaTerima: {
          select: {
            id: true,
            nomorDokumen: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    let totalUnits = 0;
    const items: TransaksiKeluarItem[] = rawList.map((k) => {
      totalUnits += k.jumlahKeluar;
      return {
        id: k.id,
        kodeTransaksi: k.kodeTransaksi,
        tanggal: k.tanggal,
        barangId: k.barangId,
        barangNama: k.barang.namaBarang,
        barangKode: k.barang.kodeBarang,
        satuanNama: k.barang.satuan.nama,
        jumlahKeluar: k.jumlahKeluar,
        penerimaNama: k.penerimaNama,
        penerimaNip: k.penerimaNip,
        fungsiId: k.fungsiId,
        fungsiNama: k.fungsi.nama,
        tandaTerimaId: k.tandaTerimaId,
        tandaTerimaNomor: k.tandaTerima?.nomorDokumen || null,
        keterangan: k.keterangan,
        createdByName: k.createdBy.name,
        createdAt: k.createdAt,
      };
    });

    return {
      success: true,
      data: {
        items,
        totalUnits,
        totalTransactions: items.length,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memuat riwayat pengeluaran barang.",
    };
  }
}

// 2. Ambil preview kode transaksi keluar berikutnya
export async function getNextKodeKeluar(): Promise<ActionResponse<string>> {
  try {
    const kode = await generateKodeTransaksiKeluar();
    return { success: true, data: kode };
  } catch (error: any) {
    return { success: false, error: "Gagal generate kode barang keluar." };
  }
}

// 3. Ambil daftar pegawai dan referensi untuk form pengeluaran
export async function getKeluarMetadata(): Promise<ActionResponse<{
  fungsis: Array<{ id: string; nama: string; kode: string }>;
  penerimas: string[];
}>> {
  try {
    const [fungsis, distinctPenerima] = await Promise.all([
      prisma.fungsi.findMany({ orderBy: { nama: "asc" } }),
      prisma.transaksiKeluar.findMany({
        distinct: ["penerimaNama"],
        select: { penerimaNama: true },
        orderBy: { penerimaNama: "asc" },
      }),
    ]);

    const penerimas = distinctPenerima.map((p) => p.penerimaNama).filter(Boolean);

    return {
      success: true,
      data: {
        fungsis,
        penerimas,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: "Gagal mengambil metadata referensi pengeluaran.",
    };
  }
}

// 4. Catat Transaksi Barang Keluar Baru (ACID & Anti-Minus Transaction)
export async function createTransaksiKeluar(
  rawInput: TransaksiKeluarInput
): Promise<ActionResponse<any>> {
  try {
    const session = await ensureAdmin();

    const validated = TransaksiKeluarSchema.parse(rawInput);
    const newKode = await generateKodeTransaksiKeluar();
    const tgl = new Date(validated.tanggal);

    // Jalankan transaksi ACID di PostgreSQL
    const result = await prisma.$transaction(async (tx) => {
      // 1. Cek stok fisik barang saat ini
      const barang = await tx.barang.findUnique({
        where: { id: validated.barangId },
        include: { satuan: true },
      });

      if (!barang) {
        throw new Error("Barang yang dipilih tidak ditemukan dalam database.");
      }

      // 2. Validasi Anti-Minus
      if (barang.stok < validated.jumlahKeluar) {
        throw new Error(
          `Stok tidak mencukupi! Saldo fisik "${barang.namaBarang}" saat ini adalah ${barang.stok} ${barang.satuan.nama}, sedangkan permintaan keluar adalah ${validated.jumlahKeluar} ${barang.satuan.nama}.`
        );
      }

      // 3. Simpan log transaksi keluar
      const logKeluar = await tx.transaksiKeluar.create({
        data: {
          kodeTransaksi: newKode,
          tanggal: tgl,
          barangId: validated.barangId,
          jumlahKeluar: validated.jumlahKeluar,
          penerimaNama: validated.penerimaNama.trim(),
          penerimaNip: validated.penerimaNip?.trim() || null,
          fungsiId: validated.fungsiId,
          keterangan: validated.keterangan || null,
          createdById: session.user.id,
        },
        include: {
          barang: {
            include: { satuan: true },
          },
          fungsi: true,
        },
      });

      // 4. Potong saldo stok fisik barang
      const updatedBarang = await tx.barang.update({
        where: { id: validated.barangId },
        data: {
          stok: {
            decrement: validated.jumlahKeluar,
          },
        },
      });

      return { logKeluar, updatedBarang };
    });

    revalidatePath("/transaksi-keluar");
    revalidatePath("/inventaris");
    revalidatePath("/katalog");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Penyaluran ${result.logKeluar.jumlahKeluar} ${result.logKeluar.barang.satuan.nama} "${result.logKeluar.barang.namaBarang}" kepada ${result.logKeluar.penerimaNama} (${result.logKeluar.fungsi.nama}) berhasil dicatat (${result.logKeluar.kodeTransaksi}). Sisa stok: ${result.updatedBarang.stok}.`,
      data: result.logKeluar,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal mencatat transaksi barang keluar.",
    };
  }
}

// 5. Hapus / Batalkan Transaksi Barang Keluar (ACID Rollback)
export async function deleteTransaksiKeluar(id: string): Promise<ActionResponse<any>> {
  try {
    await ensureAdmin();

    await prisma.$transaction(async (tx) => {
      const log = await tx.transaksiKeluar.findUnique({
        where: { id },
      });

      if (!log) {
        throw new Error("Transaksi barang keluar tidak ditemukan.");
      }

      // Kembalikan saldo stok barang
      await tx.barang.update({
        where: { id: log.barangId },
        data: {
          stok: {
            increment: log.jumlahKeluar,
          },
        },
      });

      // Hapus log transaksi
      await tx.transaksiKeluar.delete({
        where: { id },
      });
    });

    revalidatePath("/transaksi-keluar");
    revalidatePath("/inventaris");
    revalidatePath("/katalog");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Transaksi barang keluar berhasil dibatalkan dan kuantitas barang telah dikembalikan ke saldo stok fisik.",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal membatalkan transaksi barang keluar.",
    };
  }
}
