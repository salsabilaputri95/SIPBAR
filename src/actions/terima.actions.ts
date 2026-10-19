"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { generateNomorTandaTerima } from "@/lib/code-generator";
import { ActionResponse, TandaTerimaDetail, TransaksiKeluarItem } from "@/types";

// Helper verifikasi hak akses Admin
async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN_GUDANG")) {
    throw new Error("Akses ditolak: Operasi ini hanya diizinkan untuk Pengelola Persediaan BPS.");
  }
  return session;
}

export interface CreateTandaTerimaInput {
  transaksiKeluarIds: string[];
  kasubbagNama?: string;
  kasubbagNip?: string;
  kasubbagJabatan?: string;
}

// 1. Ambil daftar transaksi keluar yang belum memiliki tanda terima (Unassigned)
export async function getUnassignedKeluarList(filter?: {
  fungsiId?: string;
  penerimaNama?: string;
  tanggalAwal?: string;
  tanggalAkhir?: string;
}): Promise<ActionResponse<TransaksiKeluarItem[]>> {
  try {
    const where: any = {
      tandaTerimaId: null,
    };

    if (filter?.fungsiId && filter.fungsiId !== "ALL") {
      where.fungsiId = filter.fungsiId;
    }

    if (filter?.penerimaNama && filter.penerimaNama !== "ALL") {
      where.penerimaNama = filter.penerimaNama;
    }

    if (filter?.tanggalAwal || filter?.tanggalAkhir) {
      where.tanggal = {};
      if (filter.tanggalAwal) where.tanggal.gte = new Date(`${filter.tanggalAwal}T00:00:00.000Z`);
      if (filter.tanggalAkhir) where.tanggal.lte = new Date(`${filter.tanggalAkhir}T23:59:59.999Z`);
    }

    const rawList = await prisma.transaksiKeluar.findMany({
      where,
      include: {
        barang: {
          include: {
            satuan: true,
          },
        },
        fungsi: true,
        createdBy: true,
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    const items: TransaksiKeluarItem[] = rawList.map((k) => ({
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
      keterangan: k.keterangan,
      tandaTerimaId: null,
      tandaTerimaNomor: null,
      createdByName: k.createdBy.name,
      createdAt: k.createdAt,
    }));

    return {
      success: true,
      data: items,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memuat transaksi pengeluaran yang belum memiliki tanda terima.",
    };
  }
}

// 2. Buat Dokumen Tanda Terima Baru
export async function createTandaTerima(
  input: CreateTandaTerimaInput
): Promise<ActionResponse<any>> {
  try {
    await ensureAdmin();

    if (!input.transaksiKeluarIds || input.transaksiKeluarIds.length === 0) {
      return {
        success: false,
        error: "Silakan pilih setidaknya 1 transaksi pengeluaran barang untuk dibuatkan tanda terima.",
      };
    }

    const nomorDokumen = await generateNomorTandaTerima();

    const created = await prisma.$transaction(async (tx) => {
      // 1. Buat Header Tanda Terima
      const tandaTerima = await tx.tandaTerima.create({
        data: {
          nomorDokumen,
          tanggalDokumen: new Date(),
          kasubbagNama: input.kasubbagNama?.trim() || process.env.DEFAULT_KASUBBAG_NAMA || "Imaniar Dwi Aryanti, S.TP",
          kasubbagNip: input.kasubbagNip?.trim() || process.env.DEFAULT_KASUBBAG_NIP || "199001012015012001",
          kasubbagJabatan: input.kasubbagJabatan?.trim() || process.env.DEFAULT_KASUBBAG_JABATAN || "Kepala Subbagian Umum BPS Kabupaten Jeneponto",
        },
      });

      // 2. Kaitkan item-item transaksi keluar ke tanda terima ini
      await tx.transaksiKeluar.updateMany({
        where: {
          id: { in: input.transaksiKeluarIds },
        },
        data: {
          tandaTerimaId: tandaTerima.id,
        },
      });

      return tandaTerima;
    });

    revalidatePath("/tanda-terima");
    revalidatePath("/transaksi-keluar");

    return {
      success: true,
      message: `Dokumen Tanda Terima ${created.nomorDokumen} berhasil diterbitkan dengan ${input.transaksiKeluarIds.length} item pengeluaran.`,
      data: created,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menerbitkan Dokumen Tanda Terima.",
    };
  }
}

// 3. Ambil Daftar Dokumen Tanda Terima
export async function getTandaTerimaList(): Promise<ActionResponse<any[]>> {
  try {
    const list = await prisma.tandaTerima.findMany({
      include: {
        items: {
          include: {
            barang: {
              include: {
                satuan: true,
              },
            },
            fungsi: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = list.map((t) => {
      let totalUnits = 0;
      t.items.forEach((i) => {
        totalUnits += i.jumlahKeluar;
      });

      const uniquePenerima = Array.from(new Set(t.items.map((i) => i.penerimaNama))).join(", ");

      return {
        id: t.id,
        nomorDokumen: t.nomorDokumen,
        tanggalDokumen: t.tanggalDokumen,
        kasubbagNama: t.kasubbagNama,
        kasubbagJabatan: t.kasubbagJabatan,
        totalItems: t.items.length,
        totalUnits,
        penerimaSummary: uniquePenerima,
        createdAt: t.createdAt,
      };
    });

    return {
      success: true,
      data: formatted,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memuat daftar Tanda Terima.",
    };
  }
}

// 4. Ambil Rincian Detail Tanda Terima untuk Cetak & Tinjauan
export async function getTandaTerimaDetail(id: string): Promise<ActionResponse<TandaTerimaDetail>> {
  try {
    const tt = await prisma.tandaTerima.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            barang: {
              include: {
                satuan: true,
              },
            },
            fungsi: true,
          },
          orderBy: {
            tanggal: "asc",
          },
        },
      },
    });

    if (!tt) {
      return {
        success: false,
        error: "Dokumen Tanda Terima tidak ditemukan.",
      };
    }

    const detail: TandaTerimaDetail = {
      id: tt.id,
      nomorDokumen: tt.nomorDokumen,
      tanggalDokumen: tt.tanggalDokumen,
      kasubbagNama: tt.kasubbagNama,
      kasubbagNip: tt.kasubbagNip,
      kasubbagJabatan: tt.kasubbagJabatan,
      items: tt.items.map((i) => ({
        id: i.id,
        kodeTransaksi: i.kodeTransaksi,
        namaBarang: i.barang.namaBarang,
        jumlahKeluar: i.jumlahKeluar,
        satuan: i.barang.satuan.nama,
        tanggal: i.tanggal,
        penerimaNama: i.penerimaNama,
        fungsi: i.fungsi.nama,
      })),
      createdAt: tt.createdAt,
    };

    return {
      success: true,
      data: detail,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memuat detail Dokumen Tanda Terima.",
    };
  }
}

// 5. Hapus Dokumen Tanda Terima (Unlink item pengeluaran)
export async function deleteTandaTerima(id: string): Promise<ActionResponse<any>> {
  try {
    await ensureAdmin();

    await prisma.$transaction(async (tx) => {
      // Unlink relasi transaksi keluar
      await tx.transaksiKeluar.updateMany({
        where: { tandaTerimaId: id },
        data: { tandaTerimaId: null },
      });

      // Hapus dokumen tanda terima
      await tx.tandaTerima.delete({
        where: { id },
      });
    });

    revalidatePath("/tanda-terima");
    revalidatePath("/transaksi-keluar");

    return {
      success: true,
      message: "Dokumen Tanda Terima berhasil dihapus. Item transaksi pengeluaran dikembalikan ke status belum bertanda terima.",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menghapus Dokumen Tanda Terima.",
    };
  }
}
