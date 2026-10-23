"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateKodeTransaksiKeluar } from "@/lib/code-generator";
import { ActionResponse } from "@/types";

export interface PegawaiProfileData {
  id: string;
  name: string;
  username: string;
  nip: string | null;
  role: string;
  avatar: string | null;
  fungsiNama: string;
  createdAt: Date;
}

export interface PegawaiRiwayatItem {
  id: string;
  kodeTransaksi: string;
  tanggal: Date;
  barangId: string;
  barangNama: string;
  barangKode: string;
  kategoriNama: string;
  satuanNama: string;
  jumlahKeluar: number;
  keterangan: string | null;
  tandaTerimaNomor: string | null;
  tandaTerimaId?: string | null;
  createdAt: Date;
}

export interface PegawaiDashboardData {
  profile: PegawaiProfileData;
  stats: {
    totalTransaksi: number;
    totalUnitDiambil: number;
    transaksiTerakhir: {
      tanggal: Date;
      barangNama: string;
      jumlah: number;
      satuan: string;
    } | null;
  };
  recentHistory: PegawaiRiwayatItem[];
}

export interface BarangOpsiPengambilan {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  kategoriNama: string;
  satuanNama: string;
  gudangNama: string;
  stok: number;
}

// 1. Ambil Profil & Ringkasan Dashboard Pegawai
export async function getPegawaiDashboardData(): Promise<ActionResponse<PegawaiDashboardData>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Sesi login telah berakhir. Silakan login kembali.",
      };
    }

    const userId = session.user.id;

    // Ambil data user dari database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { fungsi: true },
    });

    if (!user) {
      return {
        success: false,
        error: "Data profil pegawai tidak ditemukan.",
      };
    }

    // Ambil riwayat pengambilan barang milik pegawai ini
    // Strictly filter hanya milik user bersangkutan (createdById ATAU penerimaNip jika terdaftar)
    const whereClause: any = {
      OR: [
        { createdById: userId },
        ...(user.nip ? [{ penerimaNip: user.nip }] : []),
      ],
    };

    const rawHistory = await prisma.transaksiKeluar.findMany({
      where: whereClause,
      include: {
        barang: {
          include: {
            satuan: true,
            kategori: true,
          },
        },
        tandaTerima: {
          select: {
            nomorDokumen: true,
          },
        },
      },
      orderBy: {
        tanggal: "desc",
      },
      take: 50,
    });

    let totalUnitDiambil = 0;
    const historyItems: PegawaiRiwayatItem[] = rawHistory.map((item) => {
      totalUnitDiambil += item.jumlahKeluar;
      return {
        id: item.id,
        kodeTransaksi: item.kodeTransaksi,
        tanggal: item.tanggal,
        barangId: item.barangId,
        barangNama: item.barang.namaBarang,
        barangKode: item.barang.kodeBarang,
        kategoriNama: item.barang.kategori.nama,
        satuanNama: item.barang.satuan.nama,
        jumlahKeluar: item.jumlahKeluar,
        keterangan: item.keterangan,
        tandaTerimaNomor: item.tandaTerima?.nomorDokumen || null,
        tandaTerimaId: item.tandaTerimaId || null,
        createdAt: item.createdAt,
      };
    });

    const transaksiTerakhir = historyItems.length > 0
      ? {
          tanggal: historyItems[0].tanggal,
          barangNama: historyItems[0].barangNama,
          jumlah: historyItems[0].jumlahKeluar,
          satuan: historyItems[0].satuanNama,
        }
      : null;

    return {
      success: true,
      data: {
        profile: {
          id: user.id,
          name: user.name,
          username: user.username,
          nip: user.nip,
          role: user.role,
          avatar: user.avatar,
          fungsiNama: user.fungsi?.nama || "BPS Kabupaten Jeneponto",
          createdAt: user.createdAt,
        },
        stats: {
          totalTransaksi: rawHistory.length,
          totalUnitDiambil,
          transaksiTerakhir,
        },
        recentHistory: historyItems,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memuat data dashboard pegawai.",
    };
  }
}

// 2. Ambil Riwayat Pengambilan Barang Pegawai (dengan filter pencarian)
export async function getPegawaiRiwayatPengambilan(filter?: {
  search?: string;
  tanggalAwal?: string;
  tanggalAkhir?: string;
}): Promise<ActionResponse<PegawaiRiwayatItem[]>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Sesi login telah berakhir.",
      };
    }

    const userId = session.user.id;
    const userNip = session.user.nip;
    const search = filter?.search?.trim() || "";
    const tanggalAwal = filter?.tanggalAwal ? new Date(`${filter.tanggalAwal}T00:00:00.000Z`) : undefined;
    const tanggalAkhir = filter?.tanggalAkhir ? new Date(`${filter.tanggalAkhir}T23:59:59.999Z`) : undefined;

    const baseOwnerCondition: any = {
      OR: [
        { createdById: userId },
        ...(userNip ? [{ penerimaNip: userNip }] : []),
      ],
    };

    const andConditions: any[] = [baseOwnerCondition];

    if (search) {
      andConditions.push({
        OR: [
          { kodeTransaksi: { contains: search, mode: "insensitive" } },
          { keterangan: { contains: search, mode: "insensitive" } },
          { barang: { namaBarang: { contains: search, mode: "insensitive" } } },
          { barang: { kodeBarang: { contains: search, mode: "insensitive" } } },
        ],
      });
    }

    if (tanggalAwal || tanggalAkhir) {
      const dateFilter: any = {};
      if (tanggalAwal) dateFilter.gte = tanggalAwal;
      if (tanggalAkhir) dateFilter.lte = tanggalAkhir;
      andConditions.push({ tanggal: dateFilter });
    }

    const rawList = await prisma.transaksiKeluar.findMany({
      where: { AND: andConditions },
      include: {
        barang: {
          include: {
            satuan: true,
            kategori: true,
          },
        },
        tandaTerima: {
          select: {
            nomorDokumen: true,
          },
        },
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    const items: PegawaiRiwayatItem[] = rawList.map((item) => ({
      id: item.id,
      kodeTransaksi: item.kodeTransaksi,
      tanggal: item.tanggal,
      barangId: item.barangId,
      barangNama: item.barang.namaBarang,
      barangKode: item.barang.kodeBarang,
      kategoriNama: item.barang.kategori.nama,
      satuanNama: item.barang.satuan.nama,
      jumlahKeluar: item.jumlahKeluar,
      keterangan: item.keterangan,
      tandaTerimaNomor: item.tandaTerima?.nomorDokumen || null,
      tandaTerimaId: item.tandaTerimaId || null,
      createdAt: item.createdAt,
    }));

    return {
      success: true,
      data: items,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memuat riwayat pengambilan.",
    };
  }
}

// 3. Ambil Daftar Barang Tersedia untuk Opsi Pengambilan
export async function getBarangTersediaForPengambilan(): Promise<ActionResponse<BarangOpsiPengambilan[]>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Sesi login tidak sah.",
      };
    }

    const barangs = await prisma.barang.findMany({
      where: {
        stok: {
          gt: 0,
        },
      },
      include: {
        kategori: true,
        satuan: true,
        gudang: true,
      },
      orderBy: {
        namaBarang: "asc",
      },
    });

    const options: BarangOpsiPengambilan[] = barangs.map((b) => ({
      id: b.id,
      kodeBarang: b.kodeBarang,
      namaBarang: b.namaBarang,
      kategoriNama: b.kategori.nama,
      satuanNama: b.satuan.nama,
      gudangNama: b.gudang.nama,
      stok: b.stok,
    }));

    return {
      success: true,
      data: options,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memuat opsi barang.",
    };
  }
}

// 4. Catat Pengambilan Barang Secara Mandiri (ACID Transaction & Anti-Minus)
export async function catatPengambilanMandiri(input: {
  barangId: string;
  jumlah: number;
  keterangan?: string;
}): Promise<ActionResponse<any>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Akses ditolak: Silakan login terlebih dahulu.",
      };
    }

    const { barangId, jumlah, keterangan } = input;

    // Validasi input
    if (!barangId) {
      return { success: false, error: "Pilih barang yang ingin diambil." };
    }
    if (!jumlah || jumlah < 1 || !Number.isInteger(jumlah)) {
      return { success: false, error: "Jumlah pengambilan harus berupa bilangan bulat minimal 1 unit." };
    }

    const userId = session.user.id;
    const userName = session.user.name;
    const userNip = session.user.nip || null;

    // Pastikan user dan fungsi valid
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { fungsiId: true },
    });

    let fungsiId = dbUser?.fungsiId || session.user.fungsiId;
    if (!fungsiId) {
      // Fallback ke fungsi UMUM jika belum terhubung
      let defaultFungsi = await prisma.fungsi.findFirst({
        where: { nama: { in: ["UMUM", "Umum"] } },
      });
      if (!defaultFungsi) {
        defaultFungsi = await prisma.fungsi.findFirst();
      }
      fungsiId = defaultFungsi ? defaultFungsi.id : undefined;
    }

    if (!fungsiId) {
      return {
        success: false,
        error: "Unit kerja / Fungsi belum terkonfigurasi. Hubungi Administrator.",
      };
    }

    const newKode = await generateKodeTransaksiKeluar();

    // Jalankan transaksi ACID di PostgreSQL
    const result = await prisma.$transaction(async (tx) => {
      // 1. Cek ketersediaan stok fisik barang saat ini
      const barang = await tx.barang.findUnique({
        where: { id: barangId },
        include: { satuan: true },
      });

      if (!barang) {
        throw new Error("Barang yang dipilih tidak ditemukan dalam sistem.");
      }

      // 2. Validasi Anti-Minus Kritis
      if (barang.stok < jumlah) {
        throw new Error(
          `Stok tidak mencukupi! Sisa stok "${barang.namaBarang}" saat ini adalah ${barang.stok} ${barang.satuan.nama}, sedangkan permintaan Anda adalah ${jumlah} ${barang.satuan.nama}.`
        );
      }

      // 3. Catat transaksi keluar
      const logKeluar = await tx.transaksiKeluar.create({
        data: {
          kodeTransaksi: newKode,
          tanggal: new Date(),
          barangId: barang.id,
          jumlahKeluar: jumlah,
          penerimaNama: userName,
          penerimaNip: userNip,
          fungsiId: fungsiId!,
          keterangan: keterangan?.trim() || "Pengambilan mandiri oleh pegawai",
          createdById: userId,
        },
        include: {
          barang: {
            include: { satuan: true },
          },
          fungsi: true,
        },
      });

      // 4. Potong saldo stok fisik secara atomik
      const updatedBarang = await tx.barang.update({
        where: { id: barangId },
        data: {
          stok: {
            decrement: jumlah,
          },
        },
      });

      return { logKeluar, updatedBarang };
    });

    // Revalidasi seluruh rute yang menampilkan saldo stok dan riwayat
    revalidatePath("/pegawai");
    revalidatePath("/katalog");
    revalidatePath("/dashboard");
    revalidatePath("/transaksi-keluar");
    revalidatePath("/inventaris");

    return {
      success: true,
      message: `Pengambilan ${result.logKeluar.jumlahKeluar} ${result.logKeluar.barang.satuan.nama} "${result.logKeluar.barang.namaBarang}" berhasil dicatat (${result.logKeluar.kodeTransaksi}). Sisa stok saat ini: ${result.updatedBarang.stok} ${result.logKeluar.barang.satuan.nama}.`,
      data: result.logKeluar,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal mencatat pengambilan barang.",
    };
  }
}

// 5. Update / Edit Transaksi Pengambilan Barang Mandiri (ACID & Anti-Minus)
export async function updatePengambilanMandiri(input: {
  transaksiId: string;
  barangId: string;
  jumlah: number;
  keterangan?: string;
  tanggal?: Date | string;
}): Promise<ActionResponse<any>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Akses ditolak: Silakan login terlebih dahulu.",
      };
    }

    const { transaksiId, barangId, jumlah, keterangan, tanggal } = input;

    if (!transaksiId) {
      return { success: false, error: "ID transaksi tidak valid." };
    }
    if (!barangId) {
      return { success: false, error: "Pilih barang yang ingin diambil." };
    }
    if (!jumlah || jumlah < 1 || !Number.isInteger(jumlah)) {
      return {
        success: false,
        error: "Jumlah pengambilan harus berupa bilangan bulat minimal 1 unit.",
      };
    }

    const userId = session.user.id;
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nip: true, role: true },
    });

    if (!dbUser) {
      return { success: false, error: "Data pengguna tidak ditemukan." };
    }

    // Ambil data transaksi lama
    const existingTx = await prisma.transaksiKeluar.findUnique({
      where: { id: transaksiId },
      include: {
        barang: { include: { satuan: true } },
      },
    });

    if (!existingTx) {
      return { success: false, error: "Transaksi pengambilan tidak ditemukan." };
    }

    // Verifikasi kepemilikan (hanya pembuat atau NIP penerima atau Admin)
    const isOwner =
      existingTx.createdById === dbUser.id ||
      (dbUser.nip && existingTx.penerimaNip === dbUser.nip);
    const isAdmin = dbUser.role === "SUPER_ADMIN" || dbUser.role === "ADMIN_GUDANG";

    if (!isOwner && !isAdmin) {
      return {
        success: false,
        error: "Anda tidak memiliki wewenang untuk mengubah transaksi pegawai lain.",
      };
    }

    // Cek jika sudah diterbitkan tanda terima resmi
    if (existingTx.tandaTerimaId) {
      if (existingTx.barangId !== barangId || existingTx.jumlahKeluar !== jumlah) {
        return {
          success: false,
          error: "Transaksi ini telah memiliki Surat Tanda Terima resmi. Barang dan kuantitas terkunci dari perubahan.",
        };
      }
    }

    // Eksekusi penyesuaian stok secara ACID
    const result = await prisma.$transaction(async (tx) => {
      const isSameBarang = existingTx.barangId === barangId;
      const oldJumlah = existingTx.jumlahKeluar;
      const newJumlah = jumlah;

      let updatedBarang;

      if (isSameBarang) {
        const delta = newJumlah - oldJumlah;
        if (delta > 0) {
          // Permintaan ditambah: cek ketersediaan stok
          const currentBarang = await tx.barang.findUnique({
            where: { id: existingTx.barangId },
            include: { satuan: true },
          });

          if (!currentBarang) {
            throw new Error("Barang tidak ditemukan dalam database.");
          }

          if (currentBarang.stok < delta) {
            throw new Error(
              `Stok tidak mencukupi untuk penambahan! Sisa stok "${currentBarang.namaBarang}" saat ini adalah ${currentBarang.stok} ${currentBarang.satuan.nama}, sedangkan Anda meminta penambahan sebanyak ${delta} ${currentBarang.satuan.nama}.`
            );
          }

          updatedBarang = await tx.barang.update({
            where: { id: existingTx.barangId },
            data: {
              stok: {
                decrement: delta,
              },
            },
            include: { satuan: true },
          });
        } else if (delta < 0) {
          // Permintaan dikurangi: kembalikan kelebihan ke stok gudang
          const refund = Math.abs(delta);
          updatedBarang = await tx.barang.update({
            where: { id: existingTx.barangId },
            data: {
              stok: {
                increment: refund,
              },
            },
            include: { satuan: true },
          });
        } else {
          // Jumlah tetap sama
          updatedBarang = await tx.barang.findUnique({
            where: { id: existingTx.barangId },
            include: { satuan: true },
          });
        }
      } else {
        // Ganti jenis barang:
        // 1. Kembalikan kuantitas barang lama ke stok
        await tx.barang.update({
          where: { id: existingTx.barangId },
          data: {
            stok: {
              increment: oldJumlah,
            },
          },
        });

        // 2. Cek ketersediaan barang baru
        const newBarang = await tx.barang.findUnique({
          where: { id: barangId },
          include: { satuan: true },
        });

        if (!newBarang) {
          throw new Error("Barang pengganti yang dipilih tidak ditemukan.");
        }

        if (newBarang.stok < newJumlah) {
          throw new Error(
            `Stok barang pengganti tidak mencukupi! Sisa stok "${newBarang.namaBarang}" adalah ${newBarang.stok} ${newBarang.satuan.nama}, sedangkan permintaan Anda adalah ${newJumlah} ${newBarang.satuan.nama}.`
          );
        }

        // 3. Potong stok barang baru
        updatedBarang = await tx.barang.update({
          where: { id: barangId },
          data: {
            stok: {
              decrement: newJumlah,
            },
          },
          include: { satuan: true },
        });
      }

      // Update data transaksi keluar
      const updatedTx = await tx.transaksiKeluar.update({
        where: { id: transaksiId },
        data: {
          barangId: barangId,
          jumlahKeluar: newJumlah,
          keterangan: keterangan?.trim() || "Pengambilan mandiri oleh pegawai",
          ...(tanggal ? { tanggal: new Date(tanggal) } : {}),
        },
        include: {
          barang: {
            include: { satuan: true, kategori: true },
          },
          fungsi: true,
          tandaTerima: true,
        },
      });

      return { updatedTx, updatedBarang };
    });

    revalidatePath("/pegawai");
    revalidatePath("/katalog");
    revalidatePath("/dashboard");
    revalidatePath("/transaksi-keluar");
    revalidatePath("/inventaris");

    return {
      success: true,
      message: `Perubahan transaksi ${result.updatedTx.kodeTransaksi} (${result.updatedTx.barang.namaBarang} - ${result.updatedTx.jumlahKeluar} ${result.updatedTx.barang.satuan.nama}) berhasil disimpan.`,
      data: result.updatedTx,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memperbarui transaksi pengambilan.",
    };
  }
}

// 6. Batalkan / Hapus Transaksi Pengambilan Mandiri (Rollback Stok)
export async function hapusPengambilanMandiri(transaksiId: string): Promise<ActionResponse<any>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const userId = session.user.id;
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nip: true, role: true },
    });

    if (!dbUser) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    const existingTx = await prisma.transaksiKeluar.findUnique({
      where: { id: transaksiId },
      include: {
        barang: { include: { satuan: true } },
      },
    });

    if (!existingTx) {
      return { success: false, error: "Transaksi tidak ditemukan." };
    }

    const isOwner =
      existingTx.createdById === dbUser.id ||
      (dbUser.nip && existingTx.penerimaNip === dbUser.nip);
    const isAdmin = dbUser.role === "SUPER_ADMIN" || dbUser.role === "ADMIN_GUDANG";

    if (!isOwner && !isAdmin) {
      return {
        success: false,
        error: "Anda tidak memiliki izin membatalkan transaksi pegawai lain.",
      };
    }

    if (existingTx.tandaTerimaId) {
      return {
        success: false,
        error: "Transaksi ini telah memiliki Surat Tanda Terima resmi sehingga tidak dapat dibatalkan secara sepihak.",
      };
    }

    // Rollback stok & hapus transaksi secara ACID
    const result = await prisma.$transaction(async (tx) => {
      // 1. Cek ulang transaksi di dalam transaksi database untuk mencegah double-cancellation
      const txToCancel = await tx.transaksiKeluar.findUnique({
        where: { id: transaksiId },
        include: {
          barang: { include: { satuan: true } },
        },
      });

      if (!txToCancel) {
        throw new Error("Transaksi sudah pernah dibatalkan atau tidak ditemukan.");
      }

      // 2. Kembalikan stok ke barang secara otomatis
      const updatedBarang = await tx.barang.update({
        where: { id: txToCancel.barangId },
        data: {
          stok: {
            increment: txToCancel.jumlahKeluar,
          },
        },
        include: { satuan: true },
      });

      // 3. Hapus transaksi keluar
      await tx.transaksiKeluar.delete({
        where: { id: transaksiId },
      });

      return { txToCancel, updatedBarang };
    });

    revalidatePath("/pegawai");
    revalidatePath("/katalog");
    revalidatePath("/dashboard");
    revalidatePath("/transaksi-keluar");
    revalidatePath("/inventaris");

    return {
      success: true,
      message: `Pengambilan ${result.txToCancel.barang.namaBarang} (${result.txToCancel.kodeTransaksi}) berhasil dibatalkan. ${result.txToCancel.jumlahKeluar} ${result.txToCancel.barang.satuan.nama} telah otomatis dikembalikan ke katalog persediaan (Stok saat ini: ${result.updatedBarang.stok} ${result.updatedBarang.satuan.nama}).`,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal membatalkan transaksi pengambilan.",
    };
  }
}
