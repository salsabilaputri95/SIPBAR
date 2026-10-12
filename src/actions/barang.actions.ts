"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { BarangSchema, BarangInput } from "@/schemas/barang.schema";
import { generateKodeBarang } from "@/lib/code-generator";
import { ActionResponse, BarangItem, StatusStok } from "@/types";

// Helper verifikasi hak akses Admin (SUPER_ADMIN atau ADMIN_GUDANG)
async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN_GUDANG")) {
    throw new Error("Akses ditolak: Operasi ini hanya dapat dilakukan oleh Pengelola Persediaan BPS.");
  }
  return session;
}

export interface GetBarangFilter {
  search?: string;
  kategoriId?: string;
  gudangId?: string;
  statusStok?: "ALL" | StatusStok;
  page?: number;
  limit?: number;
}

// 1. Ambil daftar barang dengan filter lengkap & status ketersediaan
export async function getBarangList(filter?: GetBarangFilter): Promise<ActionResponse<{ items: BarangItem[]; total: number }>> {
  try {
    const search = filter?.search?.trim() || "";
    const kategoriId = filter?.kategoriId || undefined;
    const gudangId = filter?.gudangId || undefined;
    const statusStok = filter?.statusStok || "ALL";

    // Where conditions
    const where: any = {};

    if (search) {
      where.OR = [
        { namaBarang: { contains: search, mode: "insensitive" } },
        { kodeBarang: { contains: search, mode: "insensitive" } },
      ];
    }

    if (kategoriId && kategoriId !== "ALL") {
      where.kategoriId = kategoriId;
    }

    if (gudangId && gudangId !== "ALL") {
      where.gudangId = gudangId;
    }

    const rawList = await prisma.barang.findMany({
      where,
      include: {
        kategori: { select: { id: true, nama: true } },
        satuan: { select: { id: true, nama: true } },
        gudang: { select: { id: true, nama: true } },
      },
      orderBy: {
        kodeBarang: "asc",
      },
    });

    // Compute Status Stok
    const mappedItems: BarangItem[] = rawList.map((b) => {
      let computedStatus: StatusStok = "TERSEDIA";
      if (b.stok <= 0) {
        computedStatus = "HABIS";
      } else if (b.stok <= b.minStok) {
        computedStatus = "MENIPIS";
      }

      return {
        id: b.id,
        kodeBarang: b.kodeBarang,
        namaBarang: b.namaBarang,
        kategoriId: b.kategoriId,
        kategoriNama: b.kategori.nama,
        satuanId: b.satuanId,
        satuanNama: b.satuan.nama,
        gudangId: b.gudangId,
        gudangNama: b.gudang.nama,
        stok: b.stok,
        minStok: b.minStok,
        statusStok: computedStatus,
        hargaEstimasi: b.hargaEstimasi ? Number(b.hargaEstimasi) : null,
        gambarUrl: b.gambarUrl,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    });

    // Filter by statusStok if specified
    const filteredItems = statusStok === "ALL"
      ? mappedItems
      : mappedItems.filter((item) => item.statusStok === statusStok);

    return {
      success: true,
      data: {
        items: filteredItems,
        total: filteredItems.length,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memuat katalog barang.",
    };
  }
}

// 2. Ambil metadata referensi dropdown (Kategori, Satuan, Gudang)
export async function getBarangMasterDropdowns(): Promise<ActionResponse<{
  kategori: Array<{ id: string; nama: string }>;
  satuan: Array<{ id: string; nama: string }>;
  gudang: Array<{ id: string; nama: string }>;
}>> {
  try {
    const [kategori, satuan, gudang] = await Promise.all([
      prisma.kategori.findMany({ orderBy: { nama: "asc" } }),
      prisma.satuan.findMany({ orderBy: { nama: "asc" } }),
      prisma.gudang.findMany({ orderBy: { nama: "asc" } }),
    ]);

    return {
      success: true,
      data: { kategori, satuan, gudang },
    };
  } catch (error: any) {
    return {
      success: false,
      error: "Gagal mengambil data referensi.",
    };
  }
}

// 3. Ambil preview kode otomatis berikutnya
export async function getNextKodeBarang(): Promise<ActionResponse<string>> {
  try {
    const kode = await generateKodeBarang();
    return { success: true, data: kode };
  } catch (error: any) {
    return { success: false, error: "Gagal generate kode otomatis." };
  }
}

// 4. Tambah Master Barang Baru
export async function createBarang(rawInput: BarangInput): Promise<ActionResponse<BarangItem>> {
  try {
    await ensureAdmin();

    const validated = BarangSchema.parse(rawInput);
    const newKode = await generateKodeBarang();

    const created = await prisma.barang.create({
      data: {
        kodeBarang: newKode,
        namaBarang: validated.namaBarang.trim(),
        kategoriId: validated.kategoriId,
        satuanId: validated.satuanId,
        gudangId: validated.gudangId,
        minStok: validated.minStok ?? 5,
        hargaEstimasi: validated.hargaEstimasi || null,
        gambarUrl: validated.gambarUrl || null,
        stok: 0, // Barang baru mulai dengan stok 0 sebelum ada transaksi masuk
      },
      include: {
        kategori: true,
        satuan: true,
        gudang: true,
      },
    });

    revalidatePath("/inventaris");
    revalidatePath("/katalog");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Barang "${created.namaBarang}" (${created.kodeBarang}) berhasil ditambahkan ke katalog.`,
      data: {
        id: created.id,
        kodeBarang: created.kodeBarang,
        namaBarang: created.namaBarang,
        kategoriId: created.kategoriId,
        kategoriNama: created.kategori.nama,
        satuanId: created.satuanId,
        satuanNama: created.satuan.nama,
        gudangId: created.gudangId,
        gudangNama: created.gudang.nama,
        stok: created.stok,
        minStok: created.minStok,
        statusStok: "HABIS",
        hargaEstimasi: created.hargaEstimasi ? Number(created.hargaEstimasi) : null,
        gambarUrl: created.gambarUrl,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menambahkan barang baru.",
    };
  }
}

// 5. Update Detail Master Barang
export async function updateBarang(id: string, rawInput: BarangInput): Promise<ActionResponse<any>> {
  try {
    await ensureAdmin();

    const validated = BarangSchema.parse(rawInput);

    const updated = await prisma.barang.update({
      where: { id },
      data: {
        namaBarang: validated.namaBarang.trim(),
        kategoriId: validated.kategoriId,
        satuanId: validated.satuanId,
        gudangId: validated.gudangId,
        minStok: validated.minStok ?? 5,
        hargaEstimasi: validated.hargaEstimasi || null,
        gambarUrl: validated.gambarUrl || null,
      },
    });

    revalidatePath("/inventaris");
    revalidatePath("/katalog");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Informasi barang "${updated.namaBarang}" berhasil diperbarui.`,
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memperbarui data barang.",
    };
  }
}

// 6. Hapus Master Barang
export async function deleteBarang(id: string): Promise<ActionResponse<any>> {
  try {
    await ensureAdmin();

    const barang = await prisma.barang.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transaksiMasuk: true,
            transaksiKeluar: true,
          },
        },
      },
    });

    if (!barang) {
      return { success: false, error: "Data barang tidak ditemukan." };
    }

    if (barang._count.transaksiMasuk > 0 || barang._count.transaksiKeluar > 0) {
      return {
        success: false,
        error: `Barang "${barang.namaBarang}" tidak dapat dihapus karena memiliki riwayat ${barang._count.transaksiMasuk} pengadaan masuk dan ${barang._count.transaksiKeluar} penyaluran keluar.`,
      };
    }

    await prisma.barang.delete({ where: { id } });

    revalidatePath("/inventaris");
    revalidatePath("/katalog");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Barang "${barang.namaBarang}" (${barang.kodeBarang}) berhasil dihapus.`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menghapus data barang.",
    };
  }
}
