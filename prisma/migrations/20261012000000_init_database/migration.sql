-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN_GUDANG', 'PEGAWAI');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nip" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PEGAWAI',
    "avatar" TEXT,
    "fungsi_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fungsi" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT NOT NULL,

    CONSTRAINT "fungsi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satuan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "satuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gudang" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "lokasi" TEXT,

    CONSTRAINT "gudang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barang" (
    "id" TEXT NOT NULL,
    "kode_barang" TEXT NOT NULL,
    "nama_barang" TEXT NOT NULL,
    "kategori_id" TEXT NOT NULL,
    "satuan_id" TEXT NOT NULL,
    "gudang_id" TEXT NOT NULL,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "min_stok" INTEGER NOT NULL DEFAULT 5,
    "harga_estimasi" DECIMAL(15,2),
    "gambar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi_masuk" (
    "id" TEXT NOT NULL,
    "kode_transaksi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "barang_id" TEXT NOT NULL,
    "jumlah_masuk" INTEGER NOT NULL,
    "harga_beli" DECIMAL(15,2),
    "sumber_pengadaan" TEXT,
    "keterangan" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_masuk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi_keluar" (
    "id" TEXT NOT NULL,
    "kode_transaksi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "barang_id" TEXT NOT NULL,
    "jumlah_keluar" INTEGER NOT NULL,
    "penerima_nama" TEXT NOT NULL,
    "penerima_nip" TEXT,
    "fungsi_id" TEXT NOT NULL,
    "keterangan" TEXT,
    "tanda_terima_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_keluar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tanda_terima" (
    "id" TEXT NOT NULL,
    "nomor_dokumen" TEXT NOT NULL,
    "tanggal_dokumen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kasubbag_nama" TEXT NOT NULL DEFAULT 'Imaniar Dwi Aryanti, S.TP',
    "kasubbag_nip" TEXT,
    "kasubbag_jabatan" TEXT NOT NULL DEFAULT 'Kepala Subbagian Umum BPS Kabupaten Jeneponto',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tanda_terima_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_nip_key" ON "users"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "fungsi_nama_key" ON "fungsi"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "fungsi_kode_key" ON "fungsi"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_nama_key" ON "kategori"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "satuan_nama_key" ON "satuan"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "gudang_nama_key" ON "gudang"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "barang_kode_barang_key" ON "barang"("kode_barang");

-- CreateIndex
CREATE INDEX "barang_nama_barang_idx" ON "barang"("nama_barang");

-- CreateIndex
CREATE INDEX "barang_kategori_id_idx" ON "barang"("kategori_id");

-- CreateIndex
CREATE INDEX "barang_gudang_id_idx" ON "barang"("gudang_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaksi_masuk_kode_transaksi_key" ON "transaksi_masuk"("kode_transaksi");

-- CreateIndex
CREATE INDEX "transaksi_masuk_tanggal_idx" ON "transaksi_masuk"("tanggal");

-- CreateIndex
CREATE INDEX "transaksi_masuk_barang_id_idx" ON "transaksi_masuk"("barang_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaksi_keluar_kode_transaksi_key" ON "transaksi_keluar"("kode_transaksi");

-- CreateIndex
CREATE INDEX "transaksi_keluar_tanggal_idx" ON "transaksi_keluar"("tanggal");

-- CreateIndex
CREATE INDEX "transaksi_keluar_barang_id_idx" ON "transaksi_keluar"("barang_id");

-- CreateIndex
CREATE INDEX "transaksi_keluar_fungsi_id_idx" ON "transaksi_keluar"("fungsi_id");

-- CreateIndex
CREATE INDEX "transaksi_keluar_tanda_terima_id_idx" ON "transaksi_keluar"("tanda_terima_id");

-- CreateIndex
CREATE UNIQUE INDEX "tanda_terima_nomor_dokumen_key" ON "tanda_terima"("nomor_dokumen");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_fungsi_id_fkey" FOREIGN KEY ("fungsi_id") REFERENCES "fungsi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang" ADD CONSTRAINT "barang_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang" ADD CONSTRAINT "barang_satuan_id_fkey" FOREIGN KEY ("satuan_id") REFERENCES "satuan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang" ADD CONSTRAINT "barang_gudang_id_fkey" FOREIGN KEY ("gudang_id") REFERENCES "gudang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_masuk" ADD CONSTRAINT "transaksi_masuk_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_masuk" ADD CONSTRAINT "transaksi_masuk_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_keluar" ADD CONSTRAINT "transaksi_keluar_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_keluar" ADD CONSTRAINT "transaksi_keluar_fungsi_id_fkey" FOREIGN KEY ("fungsi_id") REFERENCES "fungsi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_keluar" ADD CONSTRAINT "transaksi_keluar_tanda_terima_id_fkey" FOREIGN KEY ("tanda_terima_id") REFERENCES "tanda_terima"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_keluar" ADD CONSTRAINT "transaksi_keluar_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
