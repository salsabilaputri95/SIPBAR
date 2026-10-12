# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# SIPBAR WEB — Sistem Informasi Persediaan Barang
**Badan Pusat Statistik (BPS) Kabupaten Jeneponto**

---

## 1. INFORMASI DOKUMEN & METADATA

| Item | Informasi |
| :--- | :--- |
| **Nama Produk** | **SIPBAR Web** (*Sistem Informasi Persediaan Barang Berbasis Web*) |
| **Instansi / Pemilik** | Badan Pusat Statistik (BPS) Kabupaten Jeneponto |
| **Versi Dokumen** | 1.0.0 |
| **Status** | *Approved for Implementation* |
| **Target Rilis** | Q4 2026 |
| **Tech Stack Utama** | Next.js (React + TypeScript), Tailwind CSS, PostgreSQL, Prisma ORM, Docker, Ngrok |
| **Lingkungan Server** | Server Komputer Lokal (Ubuntu OS) + LAN Kantor + Ngrok Remote Tunneling |

---

## 2. LATAR BELAKANG & TUJUAN PROYEK

### 2.1 Latar Belakang Masalah
Sebelumnya, pengelolaan barang persediaan (ATK, kertas, perlengkapan komputer, sarana kantor) di BPS Kabupaten Jeneponto dikelola menggunakan berkas **`SIPBAR.xlsm`** (*Microsoft Excel Macro-Enabled Workbook*). Berdasarkan hasil audit teknis, sistem berbasis spreadsheet memiliki beberapa kendala kritis:
1. **Keterbatasan Multi-User (*Concurrency*)**: File Excel hanya dapat dibuka oleh satu orang dalam mode edit pada satu waktu; jika staf lain membuka file, file menjadi *read-only*.
2. **Ketiadaan Hak Akses Berjenjang (*Access Control*)**: Pegawai tidak memiliki akses langsung untuk mengecek ketersediaan stok barang tanpa harus meminta admin membuka file Excel.
3. **Risiko Integritas Data Stok**: Perhitungan stok pada Excel rentan rusak jika terjadi salah edit baris secara manual atau jika terjadi kegagalan makro VBA.
4. **Penyusunan Tanda Terima Manual**: Pencetakan Tanda Terima Barang masih memerlukan input manual nomor baris transaksi pada sheet tersembunyi.
5. **Ketergantungan Perangkat**: File Excel hanya dapat dioperasikan secara optimal di laptop/PC tertentu yang mengaktifkan perizinan Macro VBA.

### 2.2 Tujuan Pengembangan
1. Membangun aplikasi berbasis web yang **modern, cepat, responsif, dan terpusat** untuk mengelola seluruh siklus persediaan barang di BPS Kabupaten Jeneponto.
2. Menyediakan akses mandiri bagi **seluruh pegawai BPS** untuk melihat ketersediaan barang secara transparan tanpa mengganggu operasional admin.
3. Menjamin **keandalan data persediaan (*Data Integrity*)** menggunakan transaksi database relasional ACID (PostgreSQL).
4. Menyediakan fitur **otomasi pembuatan Berita Acara / Tanda Terima resmi** berformat standar BPS siap cetak / PDF.
5. Mengimplementasikan arsitektur *self-hosted* yang hemat biaya dan aman menggunakan **Ubuntu Server + Docker Compose + Ngrok** yang dapat diakses melalui jaringan LAN kantor maupun internet saat dinas luar.

---

## 3. USER PERSONAS & ROLE-BASED ACCESS CONTROL (RBAC)

Sistem membagi hak akses ke dalam 3 tingkatan pengguna:

```
                               +-------------------------------------+
                               |           SIPBAR WEB ROLES          |
                               +-------------------------------------+
                                  /               |               \
                                 /                |                \
                                v                 v                 v
                 +-------------------+  +-------------------+  +-------------------+
                 |    SUPER ADMIN    |  |    ADMIN GUDANG   |  |   PEGAWAI / USER  |
                 |     (Tim IT)      |  |  (Pengelola ATK)  |  |    (Staf BPS)     |
                 +-------------------+  +-------------------+  +-------------------+
                 | - Kelola Akun     |  | - Kelola Master   |  | - Lihat Stok      |
                 | - Reset Password  |  | - Transaksi Masuk |  | - Cek Status      |
                 | - Konfigurasi DB  |  | - Transaksi Keluar|  | - Cari Katalog    |
                 | - Audit Log/Backup|  | - Cetak Tanda Trm |  |   (Read-Only)     |
                 | - Hak Admin Gudang|  | - Cetak Laporan   |  +-------------------+
                 +-------------------+  +-------------------+
```

### 3.1 Matriks Hak Akses Modul

| Modul / Fitur Sistem | Super Admin (Tim IT) | Admin Gudang | Pegawai (Staf BPS) |
| :--- | :---: | :---: | :---: |
| **Katalog Publik & Cek Ketersediaan Stok** | ✅ Baca | ✅ Baca | ✅ Baca |
| **Pencarian Live & Filter Kategori/Gudang** | ✅ Baca | ✅ Baca | ✅ Baca |
| **Dasbor Analitik & Peringatan Stok Rendah** | ✅ Akses Penuh | ✅ Akses Penuh | ❌ |
| **Manajemen Master Barang (CRUD)** | ✅ Akses Penuh | ✅ Akses Penuh | ❌ |
| **Manajemen Kategori, Satuan, Gudang (CRUD)** | ✅ Akses Penuh | ✅ Akses Penuh | ❌ |
| **Transaksi Barang Masuk / Pengadaan (CRUD)** | ✅ Akses Penuh | ✅ Akses Penuh | ❌ |
| **Transaksi Barang Keluar / Distribusi (CRUD)** | ✅ Akses Penuh | ✅ Akses Penuh | ❌ |
| **Generator Dokumen Tanda Terima (PDF/Print)** | ✅ Akses Penuh | ✅ Akses Penuh | ❌ (Hanya lihat jika milik yang bersangkutan) |
| **Ekspor Laporan Mutasi (Excel / PDF)** | ✅ Akses Penuh | ✅ Akses Penuh | ❌ |
| **Manajemen Pengguna (Tambah/Edit User, Role)** | ✅ Akses Penuh | ❌ | ❌ |
| **Pengaturan Sistem & Backup Database** | ✅ Akses Penuh | ❌ | ❌ |

---

## 4. SPESIFIKASI KEBUTUHAN FUNGSIONAL (FUNCTIONAL REQUIREMENTS)

### FR-1: Autentikasi & Manajemen Pengguna
* **FR-1.1 Login Berbasis Akun**: Pengguna dapat masuk menggunakan Username / NIP dan Password.
* **FR-1.2 Sesi Aman**: Menggunakan JSON Web Token (JWT) berbasis HTTP-Only Secure Cookies via NextAuth.js.
* **FR-1.3 Manajemen Profil**: Pengguna dapat mengubah nama, password, dan foto avatar profil.
* **FR-1.4 Manajemen Pengguna (Super Admin)**:
  * Menambah akun baru dengan penetapan Role (`SUPER_ADMIN`, `ADMIN_GUDANG`, `PEGAWAI`).
  * Mengaitkan pegawai dengan Seksi / Fungsi kerjanya (UMUM, PRODUKSI, SOSIAL, DISTRIBUSI, NERACA, IPDS, KEPALA SATKER, SECURITY, CLEANING SERVICES).
  * Fitur reset password instan untuk akun yang lupa kata sandi.

### FR-2: Manajemen Master Data Persediaan
* **FR-2.1 Katalog Barang**:
  * Pencatatan: Kode Barang (Auto/Custom `ID-1000xxx`), Nama Barang, Kategori/Jenis, Satuan, Lokasi Gudang (Gudang 1, 2, 3), Stok Minimum (*Safety Stock Threshold*), Estimasi Harga Satuan, dan Foto/Gambar Barang.
* **FR-2.2 Master Kategori & Satuan**:
  * Pengelolaan 27+ jenis barang standar (Kertas HVS, Tinta/Toner, Stopmap, Alat Perekat, Komputer Supplies, dll).
  * Pengelolaan 14+ jenis satuan (Rim, Botol, Pack, Box, Buah, Lembar, Pcs, dll).
* **FR-2.3 Master Gudang**:
  * Pengelolaan lokasi penyimpanan fisik (Gudang 1, Gudang 2, Gudang 3, Ruang Server/IPDS).

### FR-3: Manajemen Transaksi Barang Masuk (*Restocking / Inbound*)
* **FR-3.1 Pencatatan Pengadaan**:
  * Input transaksi: Nomor Transaksi Otomatis (`BM-YYYYMM-xxxx`), Tanggal Masuk, Pilihan Barang (Autocomplete/Search), Kuantitas Masuk, Harga Beli/Perolehan, Sumber Pengadaan/Vendor, dan Catatan/Keterangan.
* **FR-3.2 Otomasi Mutasi Stok Positif**:
  * Begitu transaksi masuk disimpan, saldo fisik pada master barang bertambah secara otomatis dalam transaksi database ACID.
* **FR-3.3 Edit & Batalkan Transaksi Masuk**:
  * Jika ada koreksi kuantitas atau pembatalan transaksi masuk, saldo stok master barang secara otomatis dikompensasi secara akurat.

### FR-4: Manajemen Transaksi Barang Keluar (*Distribution / Outbound*)
* **FR-4.1 Pencatatan Distribusi ATK**:
  * Input transaksi: Nomor Transaksi Otomatis (`BK-YYYYMM-xxxx`), Tanggal Keluar, Pilihan Barang, Kuantitas Keluar, Nama Pegawai Penerima (Dropdown Staf BPS), dan Seksi/Fungsi Tujuan.
* **FR-4.2 Validasi Ketersediaan Stok (*Live Stock Check*)**:
  * Sistem memvalidasi agar kuantitas keluar tidak melebihi stok yang tersedia saat itu. Jika stok kurang, tombol simpan dinonaktifkan dengan peringatan visual.
* **FR-4.3 Otomasi Mutasi Stok Negatif**:
  * Saldo fisik master barang langsung terpotong secara instan.
* **FR-4.4 Pengelompokan Item Pengambilan (*Multi-Item Distribution*)**:
  * Admin dapat mencatat beberapa barang sekaligus dalam satu sesi distribusi untuk pegawai yang sama.

### FR-5: Generator Dokumen Resmi Tanda Terima / Berita Acara
* **FR-5.1 Pembuatan Tanda Terima Otomatis**:
  * Admin memilih satu atau beberapa transaksi pengeluaran barang $\rightarrow$ sistem mengompilasi menjadi dokumen **Tanda Terima / Berita Acara Penyerahan Barang**.
* **FR-5.2 Format Dokumen Standar BPS**:
  * Menggunakan tata letak resmi: Kop Surat BPS Kabupaten Jeneponto, Nomor Dokumen, Tanggal Penyerahan, Tabel Rincian Barang (No, Nama Barang, Jumlah, Satuan, Tanggal, Penerima, Fungsi, Kolom Paraf).
  * Area Pengesahan Pejabat: *An. Kepala BPS Kabupaten Jeneponto, Kepala Subbagian Umum (Imaniar Dwi Aryanti, S.TP)*.
* **FR-5.3 Ekspor & Cetak PDF**:
  * Tombol *Cetak Langsung* (Print CSS) dan tombol *Download PDF* berukuran kertas standar F4/A4.

### FR-6: Katalog Publik & Cek Ketersediaan untuk Pegawai
* **FR-6.1 Tampilan Transparan Stok**:
  * Seluruh staf kantor BPS dapat membuka halaman katalog untuk melihat stok terkini dari komputer/HP masing-masing tanpa perlu login sebagai admin.
* **FR-6.2 Badge Status Ketersediaan**:
  * `Tersedia` (Warna Hijau): Stok $> 5$ unit.
  * `Menipis` (Warna Kuning/Oranye): Stok $\le 5$ unit (mendekati minimum).
  * `Habis` (Warna Merah): Stok $= 0$ unit.
* **FR-6.3 Filter & Pencarian Cepat**:
  * Filter menurut Kategori, Lokasi Gudang, dan pencarian instan nama barang.

### FR-7: Dasbor Eksekutif & Laporan Analitik
* **FR-7.1 Kartu Ringkasan Metrik (KPI)**:
  * Total Jenis Barang Aktif, Total Saldo Fisik Persediaan, Total Barang Masuk Bulan Ini, Total Barang Keluar Bulan Ini.
  * Rincian Persediaan per Gudang (Gudang 1, Gudang 2, Gudang 3).
* **FR-7.2 Widget Peringatan Stok Kritis (*Low Stock Alert Table*)**:
  * Menampilkan tabel prioritas barang yang stoknya sudah habis atau berada di bawah batas minimum pemesanan ulang.
* **FR-7.3 Grafik Analitik Mutasi**:
  * Grafik tren pengeluaran ATK per bulan dan proporsi distribusi barang per Seksi/Fungsi (Umum, Produksi, Sosial, Distribusi, Neraca, IPDS).
* **FR-7.4 Ekspor Laporan Komprehensif**:
  * Filter laporan berdasarkan rentang tanggal perolehan/distribusi.
  * Ekspor data ke format **Excel (`.xlsx`)** dan format **PDF Laporan Mutasi**.

### FR-8: Modul Migrasi Data Awal (Legacy Excel Importer)
* **FR-8.1 Impor Data Master**: Skrip otomatis untuk mengimpor 316 data barang dari `SIPBAR.xlsm` sheet `DATABARANG` ke database PostgreSQL.
* **FR-8.2 Impor Riwayat Transaksi**: Mengimpor 647 transaksi barang masuk dan 486 transaksi barang keluar masa lalu agar histori pembukuan persediaan tidak terputus.

---

## 5. SPESIFIKASI KEBUTUHAN NON-FUNGSIONAL (NON-FUNCTIONAL REQUIREMENTS)

| Kategori | Parameter | Kebutuhan & Standar |
| :--- | :--- | :--- |
| **Performa** | Waktu Respons | Waktu muat halaman $< 1.5$ detik di jaringan lokal kantor. Waktu query pencarian $< 200$ ms. |
| **Keamanan** | Enkripsi & Proteksi | Password di-hash menggunakan algoritma `Bcrypt` (12 salt rounds). Proteksi CSRF, sanitasi input Zod, proteksi SQL Injection via Prisma ORM parameterized query. |
| **Ketersediaan** | Uptime & Container | Docker container dikonfigurasi dengan kebijakan `restart: always` sehingga otomatis hidup kembali saat server Ubuntu menyala ulang (*power reboot*). |
| **Integritas Data** | ACID Compliance | Seluruh operasi mutasi stok berjalan dalam blok transaksi `prisma.$transaction()` untuk mencegah selisih data akibat *race condition*. |
| **Penyimpanan Data** | Persistent Storage | Volume database PostgreSQL di-mount ke direktori fisik server Ubuntu (`/var/lib/docker/volumes/...`), menjamin data tidak hilang saat container di-build ulang. |
| **Responsivitas UI** | Multi-Device | Antarmuka adaptif untuk layar monitor desktop kantor, laptop, tablet, hingga smartphone staf BPS. |
| **Desain & Branding** | Brand Identity | Palet warna selaras dengan identitas visual Badan Pusat Statistik: *Navy Blue* (`#0A2540` / `#1E3A8A`), *BPS Blue* (`#0284C7`), *BPS Orange* (`#F97316`), dan *Clean Slate/White*. |

---

## 6. ARSITEKTUR TEKNOLOGI & INFRASTRUKTUR

### 6.1 Arsitektur Perangkat Lunak (Software Stack)

```
+-------------------------------------------------------------------------------+
|                                 FRONTEND LAYER                                |
|   Next.js 14/15 App Router | React 18/19 | TypeScript | Tailwind CSS          |
|   Shadcn UI | Radix UI | Lucide React Icons | Recharts (Grafik Analitik)       |
+-------------------------------------------------------------------------------+
                                        | (Server Actions & REST API)
                                        v
+-------------------------------------------------------------------------------+
|                                 BACKEND LAYER                                 |
|   Next.js Server Actions | Node.js Runtime | NextAuth.js v5 (Session JWT)     |
|   Zod (Schema Validation) | ExcelJS (Export/Import) | Puppeteer/PDF Engine    |
+-------------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                            DATA ACCESS LAYER (ORM)                            |
|   Prisma ORM (Type-Safe Database Client, Migration Engine, Seeders)           |
+-------------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                                DATABASE LAYER                                 |
|   PostgreSQL 16 (Relational Database, ACID Transactions, Automated Indexes)   |
+-------------------------------------------------------------------------------+
```

### 6.2 Arsitektur Infrastruktur Deployment (Ubuntu + Docker + Ngrok)

```
                       [ Pengguna Luar / WFH (Internet) ]
                                       |
                                       v (HTTPS Publik)
                               [ Ngrok Secure Tunnel ]
                                       |
+--------------------------------------v----------------------------------------+
| UBUNTU SERVER (PC Kantor BPS Jeneponto)                                       |
|                                                                               |
|   [ Pengguna Lokal Kantor (Jaringan LAN BPS: http://192.168.1.xxx:3000) ]     |
|                                      |                                        |
|                                      v                                        |
|   +-----------------------------------------------------------------------+   |
|   | DOCKER ENGINE / DOCKER COMPOSE                                        |   |
|   |                                                                       |   |
|   |   +-------------------------------+   +-------------------------------+   |   |
|   |   | Container 1: 'sipbar-web'     |   | Container 2: 'sipbar-db'      |   |   |
|   |   | - Next.js Standalone Build    |   | - PostgreSQL 16 Alpine        |   |   |
|   |   | - Port 3000 (Exposed to Host) |-->| - Port 5432 (Internal Network)|   |   |
|   |   | - Node.js Alpine Environment  |   | - Persistent Volume: db_data  |   |   |
|   |   +-------------------------------+   +-------------------------------+   |   |
|   +-----------------------------------------------------------------------+   |
+-------------------------------------------------------------------------------+
```

---

## 7. RANCANGAN SKEMA BASIS DATA (DATA MODEL PRISMA)

Berikut adalah rancangan spesifikasi model relasional database untuk Prisma ORM (`schema.prisma`):

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  SUPER_ADMIN
  ADMIN_GUDANG
  PEGAWAI
}

model User {
  id            String            @id @default(cuid())
  username      String            @unique
  name          String
  nip           String?           @unique
  password      String            // Hashed using bcrypt
  role          Role              @default(PEGAWAI)
  avatar        String?
  fungsiId      String?
  fungsi        Fungsi?           @relation(fields: [fungsiId], references: [id])
  
  transaksiMasuk  TransaksiMasuk[]  @relation("CreatedByMasuk")
  transaksiKeluar TransaksiKeluar[] @relation("CreatedByKeluar")
  
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  @@map("users")
}

model Fungsi {
  id          String            @id @default(cuid())
  nama        String            @unique // e.g. UMUM, PRODUKSI, SOSIAL, DISTRIBUSI, NERACA, IPDS, dll
  kode        String            @unique
  users       User[]
  transaksi   TransaksiKeluar[]

  @@map("fungsi")
}

model Kategori {
  id          String    @id @default(cuid())
  nama        String    @unique // e.g. Kertas HVS, Tinta/Toner Printer, Alat Perekat
  deskripsi   String?
  barang      Barang[]

  @@map("kategori")
}

model Satuan {
  id          String    @id @default(cuid())
  nama        String    @unique // e.g. Rim, Botol, Buah, Pack, Box
  barang      Barang[]

  @@map("satuan")
}

model Gudang {
  id          String    @id @default(cuid())
  nama        String    @unique // e.g. Gudang 1, Gudang 2, Gudang 3
  lokasi      String?
  barang      Barang[]

  @@map("gudang")
}

model Barang {
  id              String            @id @default(cuid())
  kodeBarang      String            @unique // e.g. ID-1000001
  namaBarang      String
  kategoriId      String
  kategori        Kategori          @relation(fields: [kategoriId], references: [id])
  satuanId        String
  satuan          Satuan            @relation(fields: [satuanId], references: [id])
  gudangId        String
  gudang          Gudang            @relation(fields: [gudangId], references: [id])
  
  stok            Int               @default(0)
  minStok         Int               @default(5) // Ambang batas peringatan stok menipis
  hargaEstimasi   Decimal?          @db.Decimal(15, 2)
  gambarUrl       String?
  
  transaksiMasuk  TransaksiMasuk[]
  transaksiKeluar TransaksiKeluar[]
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([namaBarang])
  @@index([kategoriId])
  @@map("barang")
}

model TransaksiMasuk {
  id              String    @id @default(cuid())
  kodeTransaksi   String    @unique // e.g. BM-202610-0001
  tanggal         DateTime  @default(now())
  
  barangId        String
  barang          Barang    @relation(fields: [barangId], references: [id])
  jumlahMasuk     Int
  hargaBeli       Decimal?  @db.Decimal(15, 2)
  sumberPengadaan String?   // Nama vendor / pengadaan DIPA
  keterangan      String?
  
  createdById     String
  createdBy       User      @relation("CreatedByMasuk", fields: [createdById], references: [id])
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([tanggal])
  @@index([barangId])
  @@map("transaksi_masuk")
}

model TransaksiKeluar {
  id              String          @id @default(cuid())
  kodeTransaksi   String          @unique // e.g. BK-202610-0001
  tanggal         DateTime        @default(now())
  
  barangId        String
  barang          Barang          @relation(fields: [barangId], references: [id])
  jumlahKeluar    Int
  
  penerimaNama    String          // Nama lengkap pegawai penerima
  penerimaNip     String?
  
  fungsiId        String
  fungsi          Fungsi          @relation(fields: [fungsiId], references: [id])
  
  keterangan      String?
  
  // Relasi ke Lembar Tanda Terima
  tandaTerimaId   String?
  tandaTerima     TandaTerima?    @relation(fields: [tandaTerimaId], references: [id])
  
  createdById     String
  createdBy       User            @relation("CreatedByKeluar", fields: [createdById], references: [id])
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([tanggal])
  @@index([barangId])
  @@index([fungsiId])
  @@map("transaksi_keluar")
}

model TandaTerima {
  id              String            @id @default(cuid())
  nomorDokumen    String            @unique // e.g. TT-2026-X-001
  tanggalDokumen  DateTime          @default(now())
  
  items           TransaksiKeluar[]
  
  // Info Pejabat Pengesah
  kasubbagNama    String            @default("Imaniar Dwi Aryanti, S.TP")
  kasubbagNip     String?
  kasubbagJabatan String            @default("Kepala Subbagian Umum BPS Kabupaten Jeneponto")
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@map("tanda_terima")
}
```

---

## 8. STRUKTUR HALAMAN & SITEMAP APLIKASI

```
/ (Root)
│
├── /katalog                          --> [Public / Pegawai] Cek Ketersediaan Stok & Pencarian Barang
├── /login                            --> Halaman Masuk Akun (NextAuth)
│
├── /dashboard                        --> [Admin / Super Admin] Dasbor Analitik & KPI Stok Persediaan
│
├── /inventaris                       --> [Admin] Kelola Master Barang
│   ├── /inventaris/tambah            --> Modal / Form Tambah Master Barang
│   └── /inventaris/[id]              --> Detail & Edit Barang
│
├── /transaksi-masuk                  --> [Admin] Riwayat & Entri Barang Masuk
│   └── /transaksi-masuk/baru         --> Form Transaksi Pengadaan Barang
│
├── /transaksi-keluar                 --> [Admin] Riwayat & Entri Distribusi Barang
│   └── /transaksi-keluar/baru        --> Form Pengeluaran Barang ke Pegawai/Seksi
│
├── /tanda-terima                     --> [Admin] Daftar & Generator Tanda Terima Resmi
│   ├── /tanda-terima/buat            --> Kompilasi Transaksi Keluar ke Lembar Tanda Terima
│   └── /tanda-terima/[id]/cetak      --> Halaman Siap Cetak (Print View & Export PDF)
│
├── /laporan                          --> [Admin] Laporan Mutasi & Filter Periode Tanggal
│   ├── /laporan/barang-masuk         --> Export Excel/PDF Mutasi Masuk
│   └── /laporan/barang-keluar        --> Export Excel/PDF Mutasi Keluar
│
├── /pengaturan                       --> [Super Admin] Manajemen Pengguna & Sistem
│   ├── /pengaturan/users             --> Kelola Akun Staf & Role
│   ├── /pengaturan/master-referensi  --> Kelola Kategori, Satuan, Gudang, Fungsi
│   └── /pengaturan/backup            --> Backup Database SQL Dump
│
└── /profil                           --> [Semua User] Pengaturan Akun & Ganti Password
```

---

## 9. RENCANA IMPLEMENTASI & TAHAPAN PENGEMBANGAN (ROADMAP)

### **Fase 1: Fondasi Proyek & Database Setup**
* Inisialisasi Next.js 14/15 App Router dengan TypeScript dan Tailwind CSS.
* Konfigurasi Docker Compose (Service `web` dan Service `postgres`).
* Penulisan skema Prisma ORM dan eksekusi migrasi database awal.
* Pembuatan skrip seeder untuk data awal (Kategori, Satuan, Gudang, Seksi Fungsi, Akun Default Super Admin & Admin Gudang).

### **Fase 2: Migrasi Data Historis dari Excel SIPBAR**
* Ekstraksi 316 data master barang dari `SIPBAR.xlsm` sheet `DATABARANG`.
* Ekstraksi 647 transaksi masuk dari sheet `BARANGMASUK` dan 486 transaksi keluar dari sheet `BARANGKELUAR`.
* Menjalankan skrip import otomatis untuk memuat seluruh histori ke PostgreSQL.

### **Fase 3: Autentikasi & Antarmuka Katalog Pegawai**
* Setup NextAuth.js v5 (Credential login + JWT session role-based protection).
* Pembuatan Halaman Publik `/katalog` untuk pegawai (pencarian instan, filter kategori, badge stok).

### **Fase 4: Modul Transaksi & Otomasi Mutasi Stok**
* Pembuatan form master barang (CRUD).
* Pembuatan form transaksi barang masuk (penambahan stok otomatis).
* Pembuatan form transaksi barang keluar (validasi stok real-time, pengurangan stok otomatis, pemilihan pegawai penerima & seksi).

### **Fase 5: Modul Tanda Terima, Laporan & Dasbor**
* Pembuatan Dasbor Eksekutif (Kartu KPI, Low Stock Alerts, Grafik Recharts).
* Pembuatan Modul Generator Dokumen Tanda Terima resmi BPS siap cetak / PDF.
* Pembuatan fitur filter laporan mutasi dan export ke Excel `.xlsx`.

### **Fase 6: Deployment Ubuntu Server & Ngrok Tunnel**
* Konfigurasi Dockerfile multi-stage production build.
* Konfigurasi Ngrok service pada Ubuntu Server untuk tunneling remote access.
* Pengujian fungsionalitas end-to-end (User Acceptance Testing / UAT).

---

## 10. KESIMPULAN

Dokumen PRD ini menjadi acuan spesifikasi resmi dalam membangun sistem **SIPBAR Web** di Badan Pusat Statistik (BPS) Kabupaten Jeneponto. Dengan beralih dari Microsoft Excel Macro ke aplikasi web modern berbasis Next.js, TypeScript, dan PostgreSQL, tata kelola persediaan barang di BPS Kabupaten Jeneponto akan menjadi jauh lebih transparan, akuntabel, bebas dari risiko korupsi data, dan mudah diakses oleh seluruh jajaran pegawai.
