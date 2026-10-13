"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { 
  UserRegisterSchema, 
  UserUpdateSchema, 
  UserPasswordResetSchema,
  UserRegisterInput,
  UserUpdateInput
} from "@/schemas/user.schema";
import { ActionResponse } from "@/types";

// Helper verifikasi hak akses SUPER_ADMIN
async function ensureSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Akses ditolak: Operasi ini hanya diizinkan untuk Super Admin IT BPS.");
  }
  return session;
}

// 1. Ambil seluruh data pengguna
export async function getUsers(): Promise<ActionResponse<any[]>> {
  try {
    await ensureSuperAdmin();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        nip: true,
        role: true,
        avatar: true,
        kecamatan: true,
        fungsiId: true,
        fungsi: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
        createdAt: true,
        _count: {
          select: {
            transaksiMasuk: true,
            transaksiKeluar: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      success: true,
      data: users,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memuat daftar pengguna.",
    };
  }
}

// 2. Ambil daftar Fungsi untuk dropdown
export async function getFungsiList(): Promise<ActionResponse<any[]>> {
  try {
    const list = await prisma.fungsi.findMany({
      orderBy: { nama: "asc" },
    });
    return { success: true, data: list };
  } catch (error: any) {
    return { success: false, error: "Gagal mengambil daftar seksi fungsi." };
  }
}

// 3. Tambah Pengguna Baru
export async function createUser(rawInput: UserRegisterInput): Promise<ActionResponse<any>> {
  try {
    await ensureSuperAdmin();

    const validated = UserRegisterSchema.parse(rawInput);

    // Cek duplikasi username
    const existingUsername = await prisma.user.findUnique({
      where: { username: validated.username },
    });
    if (existingUsername) {
      return { success: false, error: "Username tersebut sudah digunakan oleh staf lain." };
    }

    // Cek duplikasi NIP jika diisi
    if (validated.nip) {
      const existingNip = await prisma.user.findUnique({
        where: { nip: validated.nip },
      });
      if (existingNip) {
        return { success: false, error: "NIP tersebut sudah terdaftar di sistem." };
      }
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    const newUser = await prisma.user.create({
      data: {
        username: validated.username.toLowerCase().trim(),
        name: validated.name.trim(),
        nip: validated.nip?.trim() || null,
        password: hashedPassword,
        role: validated.role,
        fungsiId: validated.fungsiId || null,
        kecamatan: validated.kecamatan?.trim() || null,
      },
      select: {
        id: true,
        username: true,
        name: true,
        nip: true,
        role: true,
        kecamatan: true,
      },
    });

    revalidatePath("/pengaturan/users");
    return {
      success: true,
      message: `Akun pengguna ${newUser.name} (${newUser.username}) berhasil dibuat.`,
      data: newUser,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal membuat pengguna baru.",
    };
  }
}

// 4. Update Profil & Role Pengguna
export async function updateUser(
  id: string,
  rawInput: UserUpdateInput
): Promise<ActionResponse<any>> {
  try {
    await ensureSuperAdmin();

    const validated = UserUpdateSchema.parse(rawInput);

    // Cek duplikasi NIP jika diisi
    if (validated.nip) {
      const existingNip = await prisma.user.findFirst({
        where: {
          nip: validated.nip,
          NOT: { id },
        },
      });
      if (existingNip) {
        return { success: false, error: "NIP tersebut sudah digunakan akun lain." };
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: validated.name.trim(),
        nip: validated.nip?.trim() || null,
        role: validated.role,
        fungsiId: validated.fungsiId || null,
        kecamatan: validated.kecamatan?.trim() || null,
      },
    });

    revalidatePath("/pengaturan/users");
    return {
      success: true,
      message: `Data pengguna ${updated.name} berhasil diperbarui.`,
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memperbarui data pengguna.",
    };
  }
}

// 5. Reset Password Pengguna
export async function resetUserPassword(
  id: string,
  newPasswordRaw: string
): Promise<ActionResponse<any>> {
  try {
    await ensureSuperAdmin();

    const validated = UserPasswordResetSchema.parse({ newPassword: newPasswordRaw });
    const hashedPassword = await bcrypt.hash(validated.newPassword, 12);

    const user = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: { id: true, name: true, username: true },
    });

    return {
      success: true,
      message: `Kata sandi untuk pengguna ${user.name} (${user.username}) berhasil direset.`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal mereset kata sandi.",
    };
  }
}

// 6. Hapus Pengguna
export async function deleteUser(id: string): Promise<ActionResponse<any>> {
  try {
    const session = await ensureSuperAdmin();

    if (session.user.id === id) {
      return { success: false, error: "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif." };
    }

    // Cek apakah user memiliki relasi transaksi
    const user = await prisma.user.findUnique({
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

    if (!user) {
      return { success: false, error: "Akun pengguna tidak ditemukan." };
    }

    if (user._count.transaksiMasuk > 0 || user._count.transaksiKeluar > 0) {
      return {
        success: false,
        error: `Pengguna ${user.name} memiliki riwayat transaksi (${user._count.transaksiMasuk} masuk, ${user._count.transaksiKeluar} keluar) dan tidak dapat dihapus demi audit log. Anda dapat mengubah rolenya menjadi PEGAWAI.`,
      };
    }

    await prisma.user.delete({ where: { id } });

    revalidatePath("/pengaturan/users");
    return {
      success: true,
      message: `Akun pengguna ${user.name} berhasil dihapus.`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menghapus pengguna.",
    };
  }
}
