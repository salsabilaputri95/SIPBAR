"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { TransaksiMasukSchema, TransaksiMasukInput } from "@/schemas/transaksi.schema";
import { generateKodeTransaksiMasuk } from "@/lib/code-generator";
import { ActionResponse, TransaksiMasukItem } from "@/types";

// Helper verifikasi hak akses Admin
async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN_GUDANG")) {
    throw new Error("Akses ditolak: Operasi ini hanya diizinkan untuk Pengelola Persediaan BPS.");
  }
  return session;
}

export interface GetMasukFilter {
  search?: string;
  tanggalAwal?: string;
  tanggalAkhir?: string;
  barangId?: string;
}

// 1. Ambil daftar transaksi barang masuk
export async function getTransaksiMasukList(
  filter?: GetMasukFilter
): Promise<ActionResponse<{ items: TransaksiMasukItem[]; totalUnits: number; totalTransactions: number }>> {
  try {
    const search = filter?.search?.trim() || "";
    const barangId = filter?.barangId || undefined;
    const tanggalAwal = filter?.tanggalAwal ? new Date(`${filter.tanggalAwal}T00:00:00.000Z`) : undefined;
    const tanggalAkhir = filter?.tanggalAkhir ? new Date(`${filter.tanggalAkhir}T23:59:59.999Z`) : undefined;

    const where: any = {};

    if (search) {
      where.OR = [
        { kodeTransaksi: { contains: search, mode: "insensitive" } },
        { barang: { namaBarang: { contains: search, mode: "insensitive" } } },
        { barang: { kodeBarang: { contains: search, mode: "insensitive" } } },
        { sumberPengadaan: { contains: search, mode: "insensitive" } },
      ];
    }

    if (barangId && barangId !== "ALL") {
      where.barangId = barangId;
    }

    if (tanggalAwal || tanggalAkhir) {
      where.tanggal = {};
      if (tanggalAwal) where.tanggal.gte = tanggalAwal;
      if (tanggalAkhir) where.tanggal.lte = tanggalAkhir;
    }

    const rawList = await prisma.transaksiMasuk.findMany({
      where,
      include: {
        barang: {
          include: {
            satuan: true,
            gudang: true,
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
    const items: TransaksiMasukItem[] = rawList.map((m) => {
      totalUnits += m.jumlahMasuk;
      return {
        id: m.id,
        kodeTransaksi: m.kodeTransaksi,
        tanggal: m.tanggal,
        barangId: m.barangId,
        barangNama: m.barang.namaBarang,
        barangKode: m.barang.kodeBarang,
        satuanNama: m.barang.satuan.nama,
        jumlahMasuk: m.jumlahMasuk,
        hargaBeli: m.hargaBeli ? Number(m.hargaBeli) : null,
        hargaSatuan: m.hargaBeli && m.jumlahMasuk > 0 ? Math.round(Number(m.hargaBeli) / m.jumlahMasuk) : null,
        sumberPengadaan: m.sumberPengadaan,
        keterangan: m.keterangan,
        createdByName: m.createdBy.name,
        createdAt: m.createdAt,
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
      error: error.message || "Gagal memuat riwayat barang masuk.",
    };
  }
}

// 2. Ambil preview kode transaksi masuk berikutnya
export async function getNextKodeMasuk(): Promise<ActionResponse<string>> {
  try {
    const kode = await generateKodeTransaksiMasuk();
    return { success: true, data: kode };
  } catch (error: any) {
    return { success: false, error: "Gagal generate kode barang masuk." };
  }
}

// 3. Catat Transaksi Barang Masuk Baru (ACID Transaction)
export async function createTransaksiMasuk(
  rawInput: TransaksiMasukInput
): Promise<ActionResponse<any>> {
  try {
    const session = await ensureAdmin();

    const validated = TransaksiMasukSchema.parse(rawInput);
    const newKode = await generateKodeTransaksiMasuk();
    const tgl = new Date(validated.tanggal);

    // Jalankan transaksi ACID di PostgreSQL
    const result = await prisma.$transaction(async (tx) => {
      // 1. Simpan log transaksi masuk
      const logMasuk = await tx.transaksiMasuk.create({
        data: {
          kodeTransaksi: newKode,
          tanggal: tgl,
          barangId: validated.barangId,
          jumlahMasuk: validated.jumlahMasuk,
          hargaBeli: validated.hargaBeli || null,
          sumberPengadaan: validated.sumberPengadaan || null,
          keterangan: validated.keterangan || null,
          createdById: session.user.id,
        },
        include: {
          barang: {
            include: { satuan: true },
          },
        },
      });

      // 2. Tambahkan saldo stok fisik barang
      const updatedBarang = await tx.barang.update({
        where: { id: validated.barangId },
        data: {
          stok: {
            increment: validated.jumlahMasuk,
          },
        },
      });

      return { logMasuk, updatedBarang };
    });

    revalidatePath("/transaksi-masuk");
    revalidatePath("/inventaris");
    revalidatePath("/katalog");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Penerimaan ${result.logMasuk.jumlahMasuk} ${result.logMasuk.barang.satuan.nama} "${result.logMasuk.barang.namaBarang}" berhasil dicatat (${result.logMasuk.kodeTransaksi}). Stok terkini: ${result.updatedBarang.stok}.`,
      data: result.logMasuk,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal mencatat transaksi barang masuk.",
    };
  }
}

// 4. Hapus / Batalkan Transaksi Barang Masuk (ACID Rollback)
export async function deleteTransaksiMasuk(id: string): Promise<ActionResponse<any>> {
  try {
    await ensureAdmin();

    await prisma.$transaction(async (tx) => {
      const log = await tx.transaksiMasuk.findUnique({
        where: { id },
        include: { barang: true },
      });

      if (!log) {
        throw new Error("Transaksi barang masuk tidak ditemukan.");
      }

      // Validasi anti-minus: Cek apakah stok fisik mencukupi untuk dikurangi
      if (log.barang.stok < log.jumlahMasuk) {
        throw new Error(
          `Tidak dapat membatalkan transaksi: Saldo stok barang saat ini (${log.barang.stok}) lebih kecil dari jumlah transaksi yang akan dibatalkan (${log.jumlahMasuk}). Batalkan pengeluaran barang terkait terlebih dahulu.`
        );
      }

      // Kurangi saldo stok barang
      await tx.barang.update({
        where: { id: log.barangId },
        data: {
          stok: {
            decrement: log.jumlahMasuk,
          },
        },
      });

      // Hapus log transaksi
      await tx.transaksiMasuk.delete({
        where: { id },
      });
    });

    revalidatePath("/transaksi-masuk");
    revalidatePath("/inventaris");
    revalidatePath("/katalog");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Transaksi barang masuk berhasil dibatalkan dan saldo stok telah disesuaikan kembali.",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal membatalkan transaksi barang masuk.",
    };
  }
}
