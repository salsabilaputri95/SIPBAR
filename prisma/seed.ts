import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 [1/6] Seeding 9 Seksi/Fungsi Kerja BPS Jeneponto...");
  const fungsiMap = new Map<string, string>();
  const fungsis = [
    { nama: "KEPALA SATKER", kode: "KS" },
    { nama: "UMUM", kode: "UMUM" },
    { nama: "DISTRIBUSI", kode: "DIST" },
    { nama: "IPDS", kode: "IPDS" },
    { nama: "NERACA", kode: "NERACA" },
    { nama: "PRODUKSI", kode: "PROD" },
    { nama: "SOSIAL", kode: "SOS" },
    { nama: "SECURITY", kode: "SEC" },
    { nama: "CLEANING SERVICES", kode: "CS" },
  ];

  for (const f of fungsis) {
    const res = await prisma.fungsi.upsert({
      where: { nama: f.nama },
      update: { kode: f.kode },
      create: { nama: f.nama, kode: f.kode },
    });
    fungsiMap.set(f.nama, res.id);
  }
  console.log(`✅ ${fungsiMap.size} Fungsi berhasil disimpan.`);

  // 2. Kategori
  console.log("🌱 [2/6] Seeding 27 Kategori Barang...");
  const kategoriList = [
    "Kertas HVS",
    "Tinta/Toner Printer",
    "Stopmap",
    "Alat Perekat",
    "Komputer Supplies",
    "Amplop",
    "Bahan Cetak Lainnya",
    "Bahan Komputer Lainnya",
    "Berbagai Kertas",
    "Buku",
    "Cutter (Alat Tulis Kantor)",
    "Isi Staples",
    "Kertas Cover",
    "Kertas Dan Cover Lainnya",
    "Ordner Dan Map",
    "Penggaris",
    "Penghapus/Korektor",
    "Penjepit Kertas",
    "Peralatan Komputer",
    "Perlengkapan Penunjang Kegiatan Kantor Lainnya",
    "Pulpen",
    "Staples",
    "Tinta Tulis, Tinta Stempel",
    "USB/Flash Disk",
    "Alat Penunjang Kegiatan Kantor Lainnya",
    "Alat Tulis Kantor Lainnya",
    "Alat/bahan Untuk Kegiatan Kantor Lainnya",
  ];
  const kategoriMap = new Map<string, string>();
  for (const k of kategoriList) {
    const res = await prisma.kategori.upsert({
      where: { nama: k },
      update: {},
      create: { nama: k },
    });
    kategoriMap.set(k, res.id);
  }
  console.log(`✅ ${kategoriMap.size} Kategori berhasil disimpan.`);

  // 3. Satuan
  console.log("🌱 [3/6] Seeding 14 Satuan Unit...");
  const satuanList = [
    "Rim",
    "Botol",
    "Buah",
    "Pack",
    "Box",
    "Lembar",
    "Pcs",
    "Biji",
    "Dus",
    "Kotak",
    "Lusin",
    "Rol",
    "Set",
    "Toples",
  ];
  const satuanMap = new Map<string, string>();
  for (const s of satuanList) {
    const res = await prisma.satuan.upsert({
      where: { nama: s },
      update: {},
      create: { nama: s },
    });
    satuanMap.set(s, res.id);
  }
  console.log(`✅ ${satuanMap.size} Satuan berhasil disimpan.`);

  // 4. Gudang
  console.log("🌱 [4/6] Seeding 3 Lokasi Gudang...");
  const gudangList = [
    { nama: "Gudang 1", lokasi: "Ruang Arsip Lt. 1" },
    { nama: "Gudang 2", lokasi: "Ruang Persediaan Utama BPS Jeneponto" },
    { nama: "Gudang 3", lokasi: "Ruang Server & Pengolahan" },
  ];
  const gudangMap = new Map<string, string>();
  for (const g of gudangList) {
    const res = await prisma.gudang.upsert({
      where: { nama: g.nama },
      update: { lokasi: g.lokasi },
      create: { nama: g.nama, lokasi: g.lokasi },
    });
    gudangMap.set(g.nama, res.id);
  }
  console.log(`✅ ${gudangMap.size} Gudang berhasil disimpan.`);

  // 5. Users
  console.log("🌱 [5/6] Seeding Akun Pengguna Default...");
  const hashSuper = await bcrypt.hash("AdminBPS2026!", 12);
  const hashGudang = await bcrypt.hash("GudangBPS2026!", 12);
  const hashPegawai = await bcrypt.hash("PegawaiBPS2026!", 12);

  await prisma.user.upsert({
    where: { username: "superadmin" },
    update: { password: hashSuper },
    create: {
      username: "superadmin",
      name: "Super Admin IT (BPS Jeneponto)",
      nip: "199501012018011001",
      password: hashSuper,
      role: Role.SUPER_ADMIN,
      fungsiId: fungsiMap.get("IPDS"),
    },
  });

  const adminGudangUser = await prisma.user.upsert({
    where: { username: "admingudang" },
    update: { password: hashGudang },
    create: {
      username: "admingudang",
      name: "Nur Azizah Tajuddin, A.Md",
      nip: "199408222018012001",
      password: hashGudang,
      role: Role.ADMIN_GUDANG,
      fungsiId: fungsiMap.get("UMUM"),
    },
  });

  await prisma.user.upsert({
    where: { username: "pegawai" },
    update: { password: hashPegawai },
    create: {
      username: "pegawai",
      name: "Staf BPS Jeneponto",
      nip: "199001012019011002",
      password: hashPegawai,
      role: Role.PEGAWAI,
      fungsiId: fungsiMap.get("UMUM"),
    },
  });
  console.log("✅ Akun default pengguna aktif.");

  // 6. Migrasi Barang & Transaksi jika file data JSON tersedia
  const dataDir = path.resolve(process.cwd(), "data");
  const masterFile = path.join(dataDir, "master-barang.json");
  const masukFile = path.join(dataDir, "transaksi-masuk.json");
  const keluarFile = path.join(dataDir, "transaksi-keluar.json");

  if (fs.existsSync(masterFile) && fs.existsSync(masukFile) && fs.existsSync(keluarFile)) {
    console.log("\n🌱 [6/6] Melakukan migrasi data persediaan Excel...");
    const rawMaster = JSON.parse(fs.readFileSync(masterFile, "utf8"));
    const rawMasuk = JSON.parse(fs.readFileSync(masukFile, "utf8"));
    const rawKeluar = JSON.parse(fs.readFileSync(keluarFile, "utf8"));

    const barangIdMap = new Map<string, string>();
    for (const b of rawMaster) {
      const kId = kategoriMap.get(b.kategori) || kategoriMap.get("Alat Tulis Kantor Lainnya") || "";
      const sId = satuanMap.get(b.satuan) || satuanMap.get("Buah") || "";
      const gId = gudangMap.get(b.gudang) || gudangMap.get("Gudang 2") || "";

      const res = await prisma.barang.upsert({
        where: { kodeBarang: b.kode },
        update: {
          namaBarang: b.nama,
          kategoriId: kId,
          satuanId: sId,
          gudangId: gId,
          stok: b.stok,
        },
        create: {
          kodeBarang: b.kode,
          namaBarang: b.nama,
          kategoriId: kId,
          satuanId: sId,
          gudangId: gId,
          stok: b.stok,
          minStok: 5,
        },
      });
      barangIdMap.set(b.kode, res.id);
    }
    console.log(`✅ ${barangIdMap.size} Data Master Barang tersimpan.`);

    const seenMasukCodes = new Set<string>();
    let countMasuk = 0;
    for (const m of rawMasuk) {
      const targetBarangId = barangIdMap.get(m.kodeBarang);
      if (!targetBarangId) continue;

      let uniqueKode = m.kodeTransaksi;
      if (seenMasukCodes.has(uniqueKode)) {
        uniqueKode = `${m.kodeTransaksi}-${m.rowNumber}`;
      }
      seenMasukCodes.add(uniqueKode);

      const tgl = m.tanggal ? new Date(m.tanggal) : new Date();
      await prisma.transaksiMasuk.upsert({
        where: { kodeTransaksi: uniqueKode },
        update: {
          tanggal: tgl,
          barangId: targetBarangId,
          jumlahMasuk: m.jumlah,
          hargaBeli: m.harga > 0 ? m.harga : null,
        },
        create: {
          kodeTransaksi: uniqueKode,
          tanggal: tgl,
          barangId: targetBarangId,
          jumlahMasuk: m.jumlah,
          hargaBeli: m.harga > 0 ? m.harga : null,
          createdById: adminGudangUser.id,
          keterangan: `Migrasi Excel SIPBAR (Baris ${m.rowNumber})`,
        },
      });
      countMasuk++;
    }
    console.log(`✅ ${countMasuk} Transaksi Masuk tersimpan.`);

    const seenKeluarCodes = new Set<string>();
    let countKeluar = 0;
    for (const k of rawKeluar) {
      const targetBarangId = barangIdMap.get(k.kodeBarang);
      if (!targetBarangId) continue;

      let uniqueKode = k.kodeTransaksi;
      if (seenKeluarCodes.has(uniqueKode)) {
        uniqueKode = `${k.kodeTransaksi}-${k.rowNumber}`;
      }
      seenKeluarCodes.add(uniqueKode);

      const tgl = k.tanggal ? new Date(k.tanggal) : new Date();
      const targetFungsiId = fungsiMap.get(k.fungsi) || fungsiMap.get("UMUM") || "";

      await prisma.transaksiKeluar.upsert({
        where: { kodeTransaksi: uniqueKode },
        update: {
          tanggal: tgl,
          barangId: targetBarangId,
          jumlahKeluar: k.jumlah,
          penerimaNama: k.penerima || "Pegawai BPS",
          fungsiId: targetFungsiId,
        },
        create: {
          kodeTransaksi: uniqueKode,
          tanggal: tgl,
          barangId: targetBarangId,
          jumlahKeluar: k.jumlah,
          penerimaNama: k.penerima || "Pegawai BPS",
          fungsiId: targetFungsiId,
          createdById: adminGudangUser.id,
          keterangan: `Migrasi Excel SIPBAR (No Urut ${k.noUrut}, Baris ${k.rowNumber})`,
        },
      });
      countKeluar++;
    }
    console.log(`✅ ${countKeluar} Transaksi Keluar tersimpan.`);
  }

  console.log("\n🎉 Seeding & Migrasi Database Selesai 100%!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
