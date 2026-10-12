import { z } from "zod";

export const BarangSchema = z.object({
  namaBarang: z
    .string()
    .min(3, "Nama barang minimal 3 karakter")
    .max(200, "Nama barang maksimal 200 karakter"),
  kategoriId: z.string().min(1, "Kategori barang wajib dipilih"),
  satuanId: z.string().min(1, "Satuan barang wajib dipilih"),
  gudangId: z.string().min(1, "Gudang penyimpanan wajib dipilih"),
  minStok: z.coerce.number().int().min(0, "Stok minimum minimal 0").default(5),
  hargaEstimasi: z.coerce.number().optional().nullable(),
  gambarUrl: z.string().optional().nullable(),
});

export type BarangInput = z.infer<typeof BarangSchema>;
