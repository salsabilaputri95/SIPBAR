export type Role = "SUPER_ADMIN" | "ADMIN_GUDANG" | "PEGAWAI";

export interface UserSession {
  id: string;
  name: string;
  username: string;
  nip?: string | null;
  role: Role;
  avatar?: string | null;
  fungsiId?: string | null;
  fungsiNama?: string | null;
}

export type StatusStok = "TERSEDIA" | "MENIPIS" | "HABIS";

export interface BarangItem {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  kategoriId: string;
  kategoriNama: string;
  satuanId: string;
  satuanNama: string;
  gudangId: string;
  gudangNama: string;
  stok: number;
  minStok: number;
  statusStok: StatusStok;
  hargaEstimasi?: number | null;
  gambarUrl?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TransaksiMasukItem {
  id: string;
  kodeTransaksi: string;
  tanggal: Date | string;
  barangId: string;
  barangNama: string;
  barangKode: string;
  satuanNama: string;
  jumlahMasuk: number;
  hargaBeli?: number | null;
  hargaSatuan?: number | null;
  sumberPengadaan?: string | null;
  keterangan?: string | null;
  createdByName: string;
  createdAt: Date | string;
}

export interface TransaksiKeluarItem {
  id: string;
  kodeTransaksi: string;
  tanggal: Date | string;
  barangId: string;
  barangNama: string;
  barangKode: string;
  satuanNama: string;
  jumlahKeluar: number;
  penerimaNama: string;
  penerimaNip?: string | null;
  fungsiId: string;
  fungsiNama: string;
  keterangan?: string | null;
  tandaTerimaId?: string | null;
  tandaTerimaNomor?: string | null;
  createdByName: string;
  createdAt: Date | string;
}

export interface TandaTerimaDetail {
  id: string;
  nomorDokumen: string;
  tanggalDokumen: Date | string;
  kasubbagNama: string;
  kasubbagNip?: string | null;
  kasubbagJabatan: string;
  items: Array<{
    id: string;
    kodeTransaksi: string;
    namaBarang: string;
    jumlahKeluar: number;
    satuan: string;
    tanggal: Date | string;
    penerimaNama: string;
    fungsi: string;
  }>;
  createdAt: Date | string;
}

export interface DashboardStats {
  totalVarianBarang: number;
  totalSaldoFisik: number;
  totalMasukBulanIni: number;
  totalKeluarBulanIni: number;
  gudangStats: Array<{
    gudangNama: string;
    totalStok: number;
  }>;
  totalLowStock: number;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

