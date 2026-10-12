# SIPBAR WEB — SISTEM INFORMASI PERSEDIAAN BARANG

<div align="center">

![BPS Kabupaten Jeneponto](https://img.shields.io/badge/BPS-Kabupaten%20Jeneponto-0F2F64?style=for-the-badge&logo=gov)
![Next.js](https://img.shields.io/badge/Next.js-14.2%20App%20Router-000000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20Alpine-4169E1?style=for-the-badge&logo=postgresql)
![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

**Aplikasi Web Modern Manajemen Persediaan Barang Kantor, Pencatatan Transaksi Masuk/Keluar ACID Anti-Minus, Penerbitan Berita Acara Format BPS, dan Ekspor Laporan Terintegrasi.**

</div>

---

## 📌 1. Latar Belakang & Transformasi Sistem

Aplikasi **SIPBAR Web** merupakan modernisasi menyeluruh dari aplikasi inventaris berbasis makro spreadsheet (**`SIPBAR.xlsm`**) milik **Badan Pusat Statistik (BPS) Kabupaten Jeneponto**.

Sistem ini memecahkan berbagai keterbatasan spreadsheet terdahulu:
* ❌ **Spreadsheet Lama**: Rawan bentrok data saat diakses bersamaan (*concurrency issue*), tidak ada pembatasan hak akses berbasis role (RBAC), rawan salah rumus, dan pengoperasian terbatas pada perangkat tertentu.
* ✅ **SIPBAR Web Modern**: Didukung basis data relasional **PostgreSQL 16** dengan **transaksi ACID anti-minus stok**, otentikasi role-based (**NextAuth.js**), **katalog pencarian mandiri untuk staf**, penerbitan **Berita Acara resmi format F4/A4 BPS**, dan dasbor analitik real-time.

---

## 🏢 2. Struktur Organisasi & Data Historis BPS Jeneponto

Seluruh data historis dari berkas `SIPBAR.xlsm` telah dimigrasikan 100% secara akurat:
* **316 Master Varian Barang** (Alat Tulis Kantor, Kertas HVS, Tinta/Toner Printer, Komputer Supplies, dll).
* **489 Unit Saldo Stok Fisik Akhir** (Terekonsiliasi 100% presisi di Gudang 2).
* **647 Transaksi Penerimaan / Pengadaan Masuk**.
* **486 Transaksi Penyaluran Keluar**.
* **9 Seksi / Fungsi BPS Jeneponto**:
  1. `KEPALA SATKER`
  2. `UMUM`
  3. `DISTRIBUSI`
  4. `IPDS`
  5. `NERACA`
  6. `PRODUKSI`
  7. `SOSIAL`
  8. `SECURITY`
  9. `CLEANING SERVICES`
* **3 Master Gudang**: Gudang 1, Gudang 2, Gudang 3.

---

## 🚀 3. Fitur Utama Aplikasi

### 1. 📊 Dasbor Eksekutif & Monitoring Stok Kritis
* 4 Kartu KPI Metrik (Total Varian Barang, Total Saldo Fisik, Mutasi Masuk Bulan Ini, Mutasi Keluar Bulan Ini).
* Widget rincian saldo stok per Gudang (Gudang 1, 2, 3).
* Visualisasi grafik tren mutasi pengadaan vs penyaluran dan proporsi pemakaian per fungsi kerja (**Recharts**).
* **Tabel Peringatan Stok Kritis (Low-Stock Alert)** untuk barang dengan saldo $\le 5$ unit.

### 2. 🔍 Katalog Pencarian Mandiri Pegawai (`/katalog`)
* Akses mandiri untuk seluruh staf BPS mengecek ketersediaan stok sebelum mengajukan permintaan.
* Pencarian nama barang instan (*debounced search*) & filter kategori/gudang.
* Badge status ketersediaan visual: **TERSEDIA**, **MENIPIS (≤ 5)**, **HABIS**.

### 3. 📦 Pengelolaan Master Inventaris (`/inventaris`)
* Manajemen data master barang persediaan BPS (Kode otomatis `ID-1000xxx`, nama, kategori, satuan, gudang, saldo).
* Validasi proteksi integritas: master barang yang memiliki histori transaksi dilindungi dari penghapusan sembarangan.

### 4. 📥 Modul Transaksi Pengadaan Masuk (`/transaksi-masuk`)
* Pencatatan perolehan barang kantor dari vendor / DIPA dengan kode otomatis `BM-YYYYMM-xxxx`.
* Mutasi stok atomic PostgreSQL (`prisma.$transaction` dengan `stok: { increment }`).
* Pratinjau estimasi saldo setelah masuk secara live.

### 5. 📤 Modul Penyaluran Keluar Anti-Minus (`/transaksi-keluar`)
* Pencatatan distribusi barang ke pegawai dengan kode otomatis `BK-YYYYMM-xxxx`.
* **Proteksi Anti-Minus ACID**: Validasi ketat `stok >= jumlahKeluar`. Sistem menolak dan memblokir submit jika permintaan melebihi saldo fisik.
* Autocomplete 35 pegawai historis dan pilihan 9 seksi/fungsi penanggung jawab.
* Kalkulator sisa stok real-time di form modal.

### 6. 📄 Dokumen Tanda Terima / Berita Acara BPS (`/tanda-terima`)
* Kompilasi multi-item pengeluaran menjadi satu lembar Berita Acara resmi ber-nomor `TT-YYYYMM-xxxx`.
* Halaman cetak presisi ukuran kertas **F4 / A4 Portrait** dilengkapi Kop Surat resmi BPS Kabupaten Jeneponto dan kolom tanda tangan pengesahan Kasubbag Umum (*Imaniar Dwi Aryanti, S.TP*).

### 7. 📈 Laporan & Ekspor Excel (.xlsx) (`/laporan`)
* Ekspor berkas spreadsheet terformat rapi menggunakan **ExcelJS** untuk:
  1. *Rekapitulasi Saldo Stok Persediaan per Gudang & Kategori*.
  2. *Laporan Riwayat Barang Masuk (Pengadaan & Vendor)*.
  3. *Laporan Riwayat Penyaluran Keluar per Seksi/Fungsi*.

### 8. 👥 Manajemen Pengguna & Hak Akses RBAC (`/pengaturan/users`)
* Role-based access control terenkripsi bcrypt (12 salt rounds):
  * **SUPER_ADMIN**: Hak akses penuh teknis & manajemen pengguna.
  * **ADMIN_GUDANG**: Pengelola harian persediaan (Pencatatan Masuk/Keluar, Tanda Terima, Inventaris, Laporan).
  * **PEGAWAI**: Akses katalog pencarian mandiri.

---

## 🛠️ 4. Arsitektur & Teknologi

* **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Shadcn UI / Radix Primitives.
* **Backend**: Next.js Server Actions & Route Handlers, Zod Validation, ExcelJS.
* **Basis Data**: PostgreSQL 16 Alpine, Prisma ORM (Connection pooling & ACID Transaction).
* **Autentikasi**: NextAuth.js (Credentials Provider, JWT Session, Protected Middleware).
* **Visualisasi Data**: Recharts.
* **Deployment**: Docker Multi-Stage Build, Docker Compose, Ngrok HTTPS Tunneling.

---

## 📁 5. Struktur Folder Proyek

```text
SIPBAR/
├── data/                         # Data ekstraksi historis JSON
├── docs/                         # Dokumentasi lengkap sistem
│   ├── AGENT.md                  # Aturan kerja agen & pengembang
│   ├── API.md                    # Kontrak API & Server Actions
│   ├── Arsitektur.md             # Blueprint arsitektur teknis
│   ├── DATABASE.md               # Skema database & kamus data
│   ├── DEPLOYMENT_GUIDE.md       # Panduan deploy server Ubuntu & Ngrok
│   ├── FASE_PENGERJAAN.md        # Rencana kerja & checklist fase
│   ├── PRD.md                    # Product Requirements Document
│   └── SYSTEM_DESIGN.md          # Desain sistem & alur bisnis
├── prisma/
│   ├── schema.prisma             # Skema Prisma ORM PostgreSQL
│   └── seed.ts                   # Seeder master referensi & user
├── scripts/                      # Skrip migrasi & verifikasi E2E
├── src/
│   ├── actions/                  # Next.js Server Actions (ACID Logic)
│   ├── app/                      # Next.js 14 App Router Pages
│   │   ├── (admin)/              # Rute terproteksi Admin & Dashboard
│   │   ├── (auth)/               # Halaman Login BPS Executive
│   │   ├── api/                  # API endpoints (Auth, Excel export, health)
│   │   └── katalog/              # Halaman Katalog Publik Pegawai
│   ├── components/               # Komponen UI & Layout Admin
│   ├── lib/                      # Helper Prisma, Auth, Code Generator
│   ├── schemas/                  # Skema validasi Zod
│   └── types/                    # Definisi tipe TypeScript
├── Dockerfile                    # Multi-stage production container
├── docker-compose.prod.yml       # Docker Compose untuk server produksi
├── docker-compose.yml            # Docker Compose untuk local development
└── package.json                  # Konfigurasi dependensi proyek
```

---

## 💻 6. Cara Menjalankan Aplikasi di Lingkungan Lokal

### Prasyarat:
* Node.js v20+ atau v22+
* PostgreSQL 16 (Local / Docker)

### Langkah-langkah:
1. **Clone Repositori**:
   ```bash
   git clone https://github.com/salsabilaputri95/SIPBAR.git
   cd SIPBAR
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi File `.env`**:
   Salin dari template `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Pastikan parameter koneksi database terisi:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sipbardb?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="sipbar-secret-bps-jeneponto-2026"
   ```

4. **Migrasi Schema Database & Seeding Data Excel**:
   ```bash
   npx prisma migrate dev --name init_database
   node scripts/migrate-excel.mjs
   ```

5. **Jalankan Automated E2E Verification Test**:
   ```bash
   node scripts/e2e-verification.mjs
   ```

6. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000`.

---

## 🐳 7. Menjalankan via Docker Compose (Server Produksi)

```bash
# Build dan jalankan container
docker compose -f docker-compose.prod.yml up --build -d

# Migrasi skema Prisma
docker compose -f docker-compose.prod.yml exec web npx prisma migrate deploy

# Import data awal Excel
docker compose -f docker-compose.prod.yml exec web node scripts/migrate-excel.mjs
```

*Untuk panduan lengkap setup Ngrok dan Backup Cron Job di Ubuntu Server, lihat: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).*

---

## 🔑 8. Kredensial Akun Pengguna Bawaan

| Peran | Username | Password Default | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Super Admin IT** | `superadmin` | `superadmin123` | Akses Penuh, Manajemen User & Konfigurasi |
| **Admin Gudang** | `admingudang` | `admin123` | Inventaris, Transaksi Masuk/Keluar, Berita Acara, Laporan |
| **Pegawai BPS** | `pegawai` | `pegawai123` | Pencarian Mandiri Katalog Persediaan (Read-Only) |

---

<div align="center">

**Badan Pusat Statistik Kabupaten Jeneponto**  
*Jl. Pahlawan No. 42 Jeneponto, Sulawesi Selatan 92311*  
*Website: [jenepontokab.bps.go.id](https://jenepontokab.bps.go.id) | Email: bps7304@bps.go.id*

</div>
