import { z } from "zod";

export const TransaksiMasukSchema = z.object({
  tanggal: z.string().min(1, "Tanggal transaksi wajib diisi"),
  barangId: z.string().min(1, "Barang wajib dipilih"),
  jumlahMasuk: z.coerce.number().int().positive("Jumlah masuk harus lebih besar dari 0"),
  hargaBeli: z.coerce.number().optional().nullable(),
  sumberPengadaan: z.string().optional().nullable(),
  keterangan: z.string().optional().nullable(),
});

export type TransaksiMasukInput = z.infer<typeof TransaksiMasukSchema>;

export const TransaksiKeluarSchema = z.object({
  tanggal: z.string().min(1, "Tanggal transaksi wajib diisi"),
  barangId: z.string().min(1, "Barang wajib dipilih"),
  jumlahKeluar: z.coerce.number().int().positive("Jumlah keluar harus lebih besar dari 0"),
  penerimaNama: z.string().min(2, "Nama pegawai penerima wajib diisi"),
  penerimaNip: z.string().optional().nullable(),
  fungsiId: z.string().min(1, "Seksi / Fungsi kerja wajib dipilih"),
  keterangan: z.string().optional().nullable(),
});

export type TransaksiKeluarInput = z.infer<typeof TransaksiKeluarSchema>;

export const TandaTerimaSchema = z.object({
  tanggalDokumen: z.string().min(1, "Tanggal dokumen wajib diisi"),
  transaksiKeluarIds: z.array(z.string()).min(1, "Minimal pilih 1 transaksi barang keluar"),
  kasubbagNama: z.string().min(2, "Nama Kasubbag Umum wajib diisi").default("Imaniar Dwi Aryanti, S.T.P."),
  kasubbagNip: z.string().optional().nullable().default("199001012015012001"),
  kasubbagJabatan: z.string().default("Kepala Subbagian Umum BPS Kabupaten Jeneponto"),
});

export type TandaTerimaInput = z.infer<typeof TandaTerimaSchema>;
