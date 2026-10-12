import { z } from "zod";

export const UserLoginSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type UserLoginInput = z.infer<typeof UserLoginSchema>;

export const UserRegisterSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(50),
  name: z.string().min(2, "Nama lengkap minimal 2 karakter").max(100),
  nip: z.string().optional().nullable(),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["SUPER_ADMIN", "ADMIN_GUDANG", "PEGAWAI"]).default("PEGAWAI"),
  fungsiId: z.string().optional().nullable(),
});

export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;

export const UserUpdateSchema = z.object({
  name: z.string().min(2, "Nama lengkap minimal 2 karakter").max(100),
  nip: z.string().optional().nullable(),
  role: z.enum(["SUPER_ADMIN", "ADMIN_GUDANG", "PEGAWAI"]),
  fungsiId: z.string().optional().nullable(),
});

export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;

export const UserPasswordResetSchema = z.object({
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
});

export type UserPasswordResetInput = z.infer<typeof UserPasswordResetSchema>;

