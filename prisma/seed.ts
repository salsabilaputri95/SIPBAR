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
  console.log("🌱 [5/6] Seeding Akun Pengguna (Admin & 19 Pegawai)...");
  const hashAdmin = await bcrypt.hash("adminsipbar!", 12);

  const adminUser = await prisma.user.upsert({
    where: { username: "adminsipbar" },
    update: {
      password: hashAdmin,
      role: Role.SUPER_ADMIN,
      name: "Administrator SIPBAR",
    },
    create: {
      username: "adminsipbar",
      name: "Administrator SIPBAR",
      nip: "199501012018011001",
      password: hashAdmin,
      role: Role.SUPER_ADMIN,
      fungsiId: fungsiMap.get("IPDS") || fungsiMap.get("UMUM"),
    },
  });

  const daftarPegawai = [
    { name: "Imaniar Dwi Aryanti, S.TP.", kecamatan: "Bangkala Barat", username: "imaniar", password: "ima361", nip: "199001012015012001" },
    { name: "Kasmawati Saleng, SE", kecamatan: "Binamu", username: "kasmawati", password: "kas303", nip: "198505122008012002" },
    { name: "Misbahuddin, S.Si", kecamatan: "Bangkala Barat", username: "misbahuddin", password: "mis813", nip: "198803152011011003" },
    { name: "ST. Syamriani S S.Kom", kecamatan: "Binamu", username: "st", password: "sts225", nip: "198907202012012004" },
    { name: "Madsutriman Achmad, S.Si.", kecamatan: "Bangkala", username: "madsutriman", password: "mad413", nip: "198711102010011005" },
    { name: "Ian Tryaldi Halim, S.Tr.Stat.", kecamatan: "Arungkeke", username: "ian", password: "ian691", nip: "199602052019011006" },
    { name: "Muh. Reza Agung Wirawan, A.Md.Stat.", kecamatan: "Bontoramba", username: "muh", password: "muh913", nip: "199708142020011007" },
    { name: "Achmad Syahrul Ramadhani, A.Md.", kecamatan: "Tarowang", username: "achmad", password: "ach844", nip: "199801222021011008" },
    { name: "Sapril, A.Md. Kom", kecamatan: "Kelara", username: "sapril", password: "sap628", nip: "199204182014011009" },
    { name: "Sudarnati M.", kecamatan: "Bangkala Barat", username: "sudarnati", password: "sud130", nip: "198609052009012010" },
    { name: "Rima Mayyadah S.Tr.Stat.", kecamatan: "Turatea", username: "rima", password: "rim966", nip: "199712302020012011" },
    { name: "Nur Azizah Tadjuddin A.Md.Stat.", kecamatan: "Tamalatea", username: "nurazizah", password: "nur258", nip: "199408222018012001" },
    { name: "Dicki Abdurohman S.Tr.Stat.", kecamatan: "Rumbia", username: "dicki", password: "dic970", nip: "199510112018011013" },
    { name: "Muhammad Muawwad MS, S.Tr. Stat", kecamatan: "Bangkala", username: "muhammad", password: "muh192", nip: "199606162019011014" },
    { name: "Zainika Ichtarona, S.Tr.Stat", kecamatan: "Binamu", username: "zainika", password: "zai436", nip: "199804022021012015" },
    { name: "Nur Lianasari, A.Md.Stat", kecamatan: "Bontoramba", username: "nurlianasari", password: "nur787", nip: "199505252018012016" },
    { name: "Herlina Pujianti, S.Tr.Stat", kecamatan: "Batang", username: "herlina", password: "her443", nip: "199609192019012017" },
    { name: "Andi Sri Rahmawati, A.Md", kecamatan: "Tamalatea", username: "andi", password: "and176", nip: "199312012016012018" },
    { name: "Naufal Muhammad Iqbal, S.Tr. Stat", kecamatan: "Rumbia", username: "naufal", password: "nau188", nip: "199903102022011019" },
  ];

  for (const p of daftarPegawai) {
    const pHash = await bcrypt.hash(p.password, 12);

    if (p.nip) {
      const existingByNip = await prisma.user.findUnique({ where: { nip: p.nip } });
      if (existingByNip && existingByNip.username !== p.username) {
        await prisma.user.update({
          where: { id: existingByNip.id },
          data: {
            username: p.username,
            name: p.name,
            password: pHash,
            role: Role.PEGAWAI,
            kecamatan: p.kecamatan,
            fungsiId: fungsiMap.get("UMUM"),
          },
        });
        continue;
      }
    }

    await prisma.user.upsert({
      where: { username: p.username },
      update: {
        name: p.name,
        nip: p.nip,
        password: pHash,
        role: Role.PEGAWAI,
        kecamatan: p.kecamatan,
        fungsiId: fungsiMap.get("UMUM"),
      },
      create: {
        username: p.username,
        name: p.name,
        nip: p.nip,
        password: pHash,
        role: Role.PEGAWAI,
        kecamatan: p.kecamatan,
        fungsiId: fungsiMap.get("UMUM"),
      },
    });
  }
  console.log(`✅ Akun default pengguna admin ('adminsipbar') dan ${daftarPegawai.length} Pegawai aktif.`);

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
          createdById: adminUser.id,
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
          createdById: adminUser.id,
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
