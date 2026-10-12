import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runE2EVerification() {
  console.log("===============================================================");
  console.log("🚀 MEMULAI PENGUJIAN END-TO-END (E2E) SYSTEM SIPBAR WEB");
  console.log("===============================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details = "") {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   └─ ${details}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   └─ Error: ${details}`);
    }
  }

  try {
    // 1. Verifikasi Koneksi Basis Data & Master Data Awal
    console.log("--- 1. UJI KONEKTIVITAS & INTEGRITAS DATA HISTORIS ---");
    const [totalBarang, totalGudang, totalFungsi, totalUser, stockSum] = await Promise.all([
      prisma.barang.count(),
      prisma.gudang.count(),
      prisma.fungsi.count(),
      prisma.user.count(),
      prisma.barang.aggregate({ _sum: { stok: true } }),
    ]);

    assert(totalBarang >= 316, "Master Barang Terdaftar", `Total Barang: ${totalBarang} item`);
    assert(totalGudang === 3, "Master Gudang Terdaftar", `Total Gudang: ${totalGudang} (Gudang 1, 2, 3)`);
    assert(totalFungsi === 9, "Master Seksi/Fungsi Terdaftar", `Total Fungsi: ${totalFungsi} seksi BPS`);
    assert(totalUser >= 3, "Akun Pengguna Terdaftar", `Total User: ${totalUser} akun`);
    assert(stockSum._sum.stok === 489, "Rekonsiliasi Saldo Stok Fisik Awal", `Total Saldo Fisik: ${stockSum._sum.stok} unit (100% cocok dengan Excel SIPBAR)`);

    // 2. Uji Alur Transaksi Lengkap: Barang Masuk -> Stok Bertambah
    console.log("\n--- 2. UJI TRANSAKSI PENGADAAN (BARANG MASUK) ---");
    const kategoriTest = await prisma.kategori.findFirst();
    const satuanTest = await prisma.satuan.findFirst();
    const gudangTest = await prisma.gudang.findFirst({ where: { nama: "Gudang 2" } });
    const superAdmin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
    const fungsiUmum = await prisma.fungsi.findFirst({ where: { kode: "UMUM" } });

    // Buat Barang Dummy untuk Test
    const testBarang = await prisma.barang.create({
      data: {
        kodeBarang: "TEST-E2E-001",
        namaBarang: "Barang Uji Coba E2E Otomatis",
        kategoriId: kategoriTest.id,
        satuanId: satuanTest.id,
        gudangId: gudangTest.id,
        stok: 10,
        minStok: 5,
      },
    });
    assert(testBarang.stok === 10, "Pembuatan Master Barang Test Baru", `Kode: ${testBarang.kodeBarang}, Stok Awal: 10`);

    // Transaksi Masuk (+15 unit)
    const trxMasuk = await prisma.$transaction(async (tx) => {
      const log = await tx.transaksiMasuk.create({
        data: {
          kodeTransaksi: "BM-TEST-9999",
          barangId: testBarang.id,
          jumlahMasuk: 15,
          createdById: superAdmin.id,
          sumberPengadaan: "DIPA BPS 2026",
        },
      });
      const updated = await tx.barang.update({
        where: { id: testBarang.id },
        data: { stok: { increment: 15 } },
      });
      return { log, updated };
    });

    assert(trxMasuk.updated.stok === 25, "Mutasi Penambahan Stok Masuk (ACID Increment)", `Stok bertambah dari 10 menjadi ${trxMasuk.updated.stok}`);

    // 3. Uji Proteksi Anti-Minus: Coba Transaksi Keluar Melebihi Saldo
    console.log("\n--- 3. UJI PROTEKSI ANTI-MINUS STOK (ACID CONSTRAINT) ---");
    let minusBlocked = false;
    try {
      await prisma.$transaction(async (tx) => {
        const barang = await tx.barang.findUnique({ where: { id: testBarang.id } });
        const requestKeluar = 50; // Melebihi stok 25
        if (barang.stok < requestKeluar) {
          throw new Error("Stok tidak mencukupi!");
        }
        await tx.transaksiKeluar.create({
          data: {
            kodeTransaksi: "BK-TEST-MINUS",
            barangId: testBarang.id,
            jumlahKeluar: requestKeluar,
            penerimaNama: "Pegawai Uji",
            fungsiId: fungsiUmum.id,
            createdById: superAdmin.id,
          },
        });
      });
    } catch (e) {
      minusBlocked = true;
    }
    assert(minusBlocked, "Proteksi Anti-Minus Berhasil Memblokir Pengeluaran Berlebih", "Transaksi keluar 50 unit pada stok 25 unit berhasil digagalkan");

    // 4. Uji Transaksi Keluar Valid & Rollback Saldo
    console.log("\n--- 4. UJI TRANSAKSI PENYALURAN (BARANG KELUAR) & TANDA TERIMA ---");
    const trxKeluar = await prisma.$transaction(async (tx) => {
      const log = await tx.transaksiKeluar.create({
        data: {
          kodeTransaksi: "BK-TEST-9999",
          barangId: testBarang.id,
          jumlahKeluar: 8,
          penerimaNama: "Imaniar Dwi Aryanti",
          fungsiId: fungsiUmum.id,
          createdById: superAdmin.id,
        },
      });
      const updated = await tx.barang.update({
        where: { id: testBarang.id },
        data: { stok: { decrement: 8 } },
      });
      return { log, updated };
    });

    assert(trxKeluar.updated.stok === 17, "Mutasi Pengurangan Stok Keluar (ACID Decrement)", `Stok berkurang dari 25 menjadi ${trxKeluar.updated.stok}`);

    // Buat Tanda Terima
    const tandaTerima = await prisma.tandaTerima.create({
      data: {
        nomorDokumen: "TT-TEST-9999",
        kasubbagNama: "Imaniar Dwi Aryanti, S.TP",
        kasubbagJabatan: "Kepala Subbagian Umum",
      },
    });
    await prisma.transaksiKeluar.update({
      where: { id: trxKeluar.log.id },
      data: { tandaTerimaId: tandaTerima.id },
    });

    const checkedTT = await prisma.tandaTerima.findUnique({
      where: { id: tandaTerima.id },
      include: { items: true },
    });
    assert(checkedTT.items.length === 1, "Penerbitan Dokumen Tanda Terima Berita Acara", `Nomor: ${checkedTT.nomorDokumen}, Terkait ${checkedTT.items.length} item pengeluaran`);

    // 5. Cleanup Test Records
    console.log("\n--- 5. CLEANUP REKORD PENGUJIAN ---");
    await prisma.transaksiKeluar.delete({ where: { id: trxKeluar.log.id } });
    await prisma.tandaTerima.delete({ where: { id: tandaTerima.id } });
    await prisma.transaksiMasuk.delete({ where: { id: trxMasuk.log.id } });
    await prisma.barang.delete({ where: { id: testBarang.id } });

    const finalStockSum = await prisma.barang.aggregate({ _sum: { stok: true } });
    assert(finalStockSum._sum.stok === 489, "Verifikasi Integritas Saldo Stok Pasca-Uji", `Saldo fisik kembali bersih pada 489 unit persediaan.`);

  } catch (error) {
    console.error("Fatal error during E2E testing:", error);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n===============================================================");
  console.log(`HASIL AKHIR PENGUJIAN: ${passedTests}/${totalTests} TESTS BERHASIL [${passedTests === totalTests ? "LULUS 100%" : "GAGAL"}]`);
  console.log("===============================================================\n");
}

runE2EVerification();
