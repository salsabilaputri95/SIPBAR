import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("=================================================================");
  console.log("👥 SEEDING PENGGUNA BPS JENEPONTO (ADMIN & 19 PEGAWAI)");
  console.log("=================================================================\n");

  // Ambil fungsi UMUM / IPDS sebagai default jika relasi fungsi dibutuhkan
  let umumFungsi = await prisma.fungsi.findUnique({ where: { nama: "UMUM" } });
  if (!umumFungsi) {
    umumFungsi = await prisma.fungsi.upsert({
      where: { nama: "UMUM" },
      update: {},
      create: { nama: "UMUM", kode: "UMUM" },
    });
  }

  // 1. ADMIN SIPBAR (SUPER_ADMIN)
  console.log("🔐 [1/2] Mendaftarkan/Memperbarui Akun Administrator...");
  const adminPasswordHash = await bcrypt.hash("adminsipbar!", 12);
  
  // Jika sebelumnya ada user 'superadmin', perbarui username & password-nya
  const existingSuper = await prisma.user.findUnique({ where: { username: "superadmin" } });
  if (existingSuper) {
    await prisma.user.update({
      where: { id: existingSuper.id },
      data: {
        username: "adminsipbar",
        name: "Administrator SIPBAR (BPS Jeneponto)",
        password: adminPasswordHash,
        role: Role.SUPER_ADMIN,
        fungsiId: umumFungsi.id,
      },
    });
    console.log("   ✅ Akun 'superadmin' diperbarui menjadi username 'adminsipbar'.");
  } else {
    await prisma.user.upsert({
      where: { username: "adminsipbar" },
      update: {
        name: "Administrator SIPBAR (BPS Jeneponto)",
        password: adminPasswordHash,
        role: Role.SUPER_ADMIN,
      },
      create: {
        username: "adminsipbar",
        name: "Administrator SIPBAR (BPS Jeneponto)",
        nip: "199501012018011001",
        password: adminPasswordHash,
        role: Role.SUPER_ADMIN,
        fungsiId: umumFungsi.id,
      },
    });
    console.log("   ✅ Akun 'adminsipbar' berhasil didaftarkan (Role: SUPER_ADMIN).");
  }

  // 2. DAFTAR 19 PEGAWAI
  console.log("\n📋 [2/2] Mendaftarkan 19 Pegawai BPS Jeneponto...");

  const daftarPegawai = [
    {
      name: "Imaniar Dwi Aryanti, S.TP.",
      kecamatan: "Bangkala Barat",
      username: "imaniar",
      password: "ima361",
      nip: "199001012015012001",
    },
    {
      name: "Kasmawati Saleng, SE",
      kecamatan: "Binamu",
      username: "kasmawati",
      password: "kas303",
      nip: "198505122008012002",
    },
    {
      name: "Misbahuddin, S.Si",
      kecamatan: "Bangkala Barat",
      username: "misbahuddin",
      password: "mis813",
      nip: "198803152011011003",
    },
    {
      name: "ST. Syamriani S S.Kom",
      kecamatan: "Binamu",
      username: "st",
      password: "sts225",
      nip: "198907202012012004",
    },
    {
      name: "Madsutriman Achmad, S.Si.",
      kecamatan: "Bangkala",
      username: "madsutriman",
      password: "mad413",
      nip: "198711102010011005",
    },
    {
      name: "Ian Tryaldi Halim, S.Tr.Stat.",
      kecamatan: "Arungkeke",
      username: "ian",
      password: "ian691",
      nip: "199602052019011006",
    },
    {
      name: "Muh. Reza Agung Wirawan, A.Md.Stat.",
      kecamatan: "Bontoramba",
      username: "muh",
      password: "muh913",
      nip: "199708142020011007",
    },
    {
      name: "Achmad Syahrul Ramadhani, A.Md.",
      kecamatan: "Tarowang",
      username: "achmad",
      password: "ach844",
      nip: "199801222021011008",
    },
    {
      name: "Sapril, A.Md. Kom",
      kecamatan: "Kelara",
      username: "sapril",
      password: "sap628",
      nip: "199204182014011009",
    },
    {
      name: "Sudarnati M.",
      kecamatan: "Bangkala Barat",
      username: "sudarnati",
      password: "sud130",
      nip: "198609052009012010",
    },
    {
      name: "Rima Mayyadah S.Tr.Stat.",
      kecamatan: "Turatea",
      username: "rima",
      password: "rim966",
      nip: "199712302020012011",
    },
    {
      name: "Nur Azizah Tadjuddin A.Md.Stat.",
      kecamatan: "Tamalatea",
      username: "nurazizah",
      password: "nur258",
      nip: "199408222018012001",
    },
    {
      name: "Dicki Abdurohman S.Tr.Stat.",
      kecamatan: "Rumbia",
      username: "dicki",
      password: "dic970",
      nip: "199510112018011013",
    },
    {
      name: "Muhammad Muawwad MS, S.Tr. Stat",
      kecamatan: "Bangkala",
      username: "muhammad",
      password: "muh192",
      nip: "199606162019011014",
    },
    {
      name: "Zainika Ichtarona, S.Tr.Stat",
      kecamatan: "Binamu",
      username: "zainika",
      password: "zai436",
      nip: "199804022021012015",
    },
    {
      name: "Nur Lianasari, A.Md.Stat",
      kecamatan: "Bontoramba",
      username: "nurlianasari",
      password: "nur787",
      nip: "199505252018012016",
    },
    {
      name: "Herlina Pujianti, S.Tr.Stat",
      kecamatan: "Batang",
      username: "herlina",
      password: "her443",
      nip: "199609192019012017",
    },
    {
      name: "Andi Sri Rahmawati, A.Md",
      kecamatan: "Tamalatea",
      username: "andi",
      password: "and176",
      nip: "199312012016012018",
    },
    {
      name: "Naufal Muhammad Iqbal, S.Tr. Stat",
      kecamatan: "Rumbia",
      username: "naufal",
      password: "nau188",
      nip: "199903102022011019",
    },
  ];

  let successCount = 0;
  for (const p of daftarPegawai) {
    const passwordHash = await bcrypt.hash(p.password, 12);

    // Cek apakah ada akun lama yang memegang NIP ini (misal akun 'admingudang' lama)
    if (p.nip) {
      const existingByNip = await prisma.user.findUnique({ where: { nip: p.nip } });
      if (existingByNip && existingByNip.username !== p.username) {
        await prisma.user.update({
          where: { id: existingByNip.id },
          data: {
            username: p.username,
            name: p.name,
            password: passwordHash,
            role: Role.PEGAWAI,
            kecamatan: p.kecamatan,
            fungsiId: umumFungsi.id,
          },
        });
        successCount++;
        console.log(`   [${successCount}/${daftarPegawai.length}] ✅ @${p.username.padEnd(14)} : ${p.name} (Kec. ${p.kecamatan}) [migrated from @${existingByNip.username}]`);
        continue;
      }
    }

    await prisma.user.upsert({
      where: { username: p.username },
      update: {
        name: p.name,
        nip: p.nip,
        password: passwordHash,
        role: Role.PEGAWAI,
        kecamatan: p.kecamatan,
        fungsiId: umumFungsi.id,
      },
      create: {
        username: p.username,
        name: p.name,
        nip: p.nip,
        password: passwordHash,
        role: Role.PEGAWAI,
        kecamatan: p.kecamatan,
        fungsiId: umumFungsi.id,
      },
    });
    successCount++;
    console.log(`   [${successCount}/${daftarPegawai.length}] ✅ @${p.username.padEnd(14)} : ${p.name} (Kec. ${p.kecamatan})`);
  }

  console.log("\n=================================================================");
  console.log(`🎉 BERHASIL: 1 Akun Admin ('adminsipbar') & ${successCount} Akun Pegawai siap digunakan!`);
  console.log("=================================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding pengguna:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
