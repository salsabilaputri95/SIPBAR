import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [
    userCount,
    fungsiCount,
    kategoriCount,
    satuanCount,
    gudangCount,
    barangCount,
    masukCount,
    keluarCount,
    stockAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.fungsi.count(),
    prisma.kategori.count(),
    prisma.satuan.count(),
    prisma.gudang.count(),
    prisma.barang.count(),
    prisma.transaksiMasuk.count(),
    prisma.transaksiKeluar.count(),
    prisma.barang.aggregate({
      _sum: { stok: true },
    }),
  ]);

  console.log("=== LAPORAN INTEGRITAS DATABASE POSTGRESQL (SIPBAR) ===");
  console.log(`1. Total Users             : ${userCount}`);
  console.log(`2. Total Fungsi            : ${fungsiCount}`);
  console.log(`3. Total Kategori          : ${kategoriCount}`);
  console.log(`4. Total Satuan            : ${satuanCount}`);
  console.log(`5. Total Gudang            : ${gudangCount}`);
  console.log(`6. Total Master Barang     : ${barangCount}`);
  console.log(`7. Total Transaksi Masuk   : ${masukCount}`);
  console.log(`8. Total Transaksi Keluar  : ${keluarCount}`);
  console.log(`9. Total Saldo Stok Fisik  : ${stockAgg._sum.stok} unit (Gudang 2)`);
  console.log("=======================================================");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
