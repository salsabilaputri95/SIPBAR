# BLUEPRINT ARSITEKTUR TEKNIS SISTEM
# SIPBAR WEB — SISTEM INFORMASI PERSEDIAAN BARANG
**Badan Pusat Statistik (BPS) Kabupaten Jeneponto**
*Dokumen Spesifikasi & Standar Teknis Implementasi Perangkat Lunak*

---

## 1. PROJECT OVERVIEW

### 1.1 Deskripsi Produk
**SIPBAR Web** adalah aplikasi manajemen logistik dan inventaris persediaan barang berbasis web (*fullstack web application*) yang dibangun untuk menggantikan sistem lama berbasis Excel Macro (`SIPBAR.xlsm`) di **Badan Pusat Statistik (BPS) Kabupaten Jeneponto**.

### 1.2 Masalah yang Diselesaikan
* **Keterbatasan Akses Bersamaan (*Concurrency Lock*)**: Menghilangkan batasan file Excel yang hanya dapat diedit oleh 1 staf dalam satu waktu.
* **Transparansi Stok untuk Pegawai**: Memberikan akses mandiri kepada seluruh staf BPS untuk mengecek stok ATK secara *real-time* tanpa mengganggu admin gudang.
* **Jaminan Integritas Saldo Fisik**: Menghilangkan risiko selisih stok (*stock discrepancy*) melalui transaksi database ACID di PostgreSQL.
* **Otomasi Dokumen Pertanggungjawaban**: Menghasilkan lembar Tanda Terima / Berita Acara Penyerahan Barang resmi BPS berformat PDF/Print siap legalisasi.
* **Aksesibilitas Multi-Device & Jarak Jauh**: Dapat diakses di jaringan lokal kantor (LAN) berkecepatan tinggi serta melalui internet publik yang aman (*Ngrok HTTPS Tunneling*).

### 1.3 Ruang Lingkup Sistem (Scope)
* **In-Scope**:
  * Pengelolaan Katalog Master Barang, Kategori (27+ jenis), Satuan (14+ jenis), Gudang (1, 2, 3), dan Unit Kerja/Fungsi (9 seksi).
  * Pencatatan Transaksi Masuk (Pengadaan/Restocking) & Transaksi Keluar (Distribusi ke pegawai).
  * Kalkulasi stok fisik otomatis (*real-time inventory balance*).
  * Generator Dokumen Tanda Terima resmi standar BPS Kabupaten Jeneponto.
  * Dasbor analitik, monitoring stok kritis (*low-stock threshold*), dan ekspor laporan ke Excel (`.xlsx`) & PDF.
  * Manajemen pengguna berbasis peran (*Role-Based Access Control*).
  * Skrip migrasi data historis dari file spreadsheet lama (`SIPBAR.xlsm`).
* **Out-of-Scope**:
  * Pengadaan langsung secara e-commerce (pembelian barang tetap melalui mekanisme DIPA manual).
  * Modul workflow persetujuan berjenjang (*multi-level approval*) yang rumit (sesuai kesepakatan kebutuhan operasional BPS Jeneponto).

---

## 2. USER & ROLE MATRIX

Sistem menerapkan **Role-Based Access Control (RBAC)** dengan 3 tingkatan peran pengguna:

```
[ Super Admin (Tim IT) ]       --> Akses Penuh: User Management, Konfigurasi DB, Backup, Audit Log
[ Admin Gudang (Staf Umum) ]   --> Operasional: CRUD Master, Barang Masuk, Barang Keluar, Cetak Dokumen, Laporan
[ Pegawai (Staf BPS) ]         --> Read-Only: Cek Katalog Barang, Ketersediaan Stok Fisik, Status Barang
```

### Matriks Perizinan Akses (Permission Matrix)

| Modul / Tindakan | Super Admin | Admin Gudang | Pegawai (User) |
| :--- | :---: | :---: | :---: |
| **Katalog & Stok Live (`/katalog`)** | View | View | View |
| **Pencarian & Filter Barang** | Execute | Execute | Execute |
| **Dasbor Analitik & KPI (`/dashboard`)** | Full Access | Full Access | No Access |
| **Master Barang (`/inventaris`)** | CRUD | CRUD | No Access |
| **Transaksi Masuk (`/transaksi-masuk`)** | CRUD | CRUD | No Access |
| **Transaksi Keluar (`/transaksi-keluar`)** | CRUD | CRUD | No Access |
| **Generate & Cetak Tanda Terima (`/tanda-terima`)** | Full Access | Full Access | Read-Only (Milik Sendiri) |
| **Ekspor Laporan Excel/PDF (`/laporan`)** | Full Access | Full Access | No Access |
| **Manajemen Pengguna (`/pengaturan/users`)** | CRUD | No Access | No Access |
| **Master Referensi (`/pengaturan/referensi`)** | CRUD | CRUD | No Access |
| **Database Backup & System Settings** | Full Access | No Access | No Access |

---

## 3. SYSTEM ARCHITECTURE

Sistem dirancang dengan arsitektur monolitik modern berbasis container (*Containerized Monolith*) menggunakan **Next.js App Router (Fullstack)** yang berjalan di atas **Ubuntu Server** lokal kantor BPS.

```mermaid
graph TD
    subgraph ClientLayer ["Client Layer (Perangkat Pengguna)"]
        UserPC["PC / Laptop Pegawai (LAN Kantor)"]
        UserMobile["HP / Laptop Dinas (Remote WFH)"]
    end

    subgraph NetworkLayer ["Network & Ingress Layer"]
        LocalSwitch["LAN Switch BPS (192.168.1.0/24)"]
        NgrokTunnel["Ngrok Secure Tunnel (HTTPS)"]
    end

    subgraph ServerHost ["Ubuntu Server 22.04 LTS (PC Server BPS)"]
        subgraph DockerCompose ["Docker Compose Environment"]
            subgraph WebContainer ["Container 1: sipbar-web (Node.js Alpine)"]
                NextApp["Next.js 14/15 App Router"]
                NextAuth["NextAuth.js v5 (JWT Session)"]
                ServerActions["Server Actions & API Routes"]
                PrismaClient["Prisma ORM Client"]
                PDFEngine["React-Print / PDF Export Engine"]
            end

            subgraph DBContainer ["Container 2: sipbar-db (PostgreSQL 16)"]
                PostgresDB[("PostgreSQL Database Engine")]
                DataVolume[("Docker Volume: postgres_data")]
            end
        end
        BackupCron["Cron Job: pg_dump Automated Backup"]
    end

    UserPC -->|HTTP :3000| LocalSwitch --> WebContainer
    UserMobile -->|HTTPS Publik| NgrokTunnel -->|Local Proxy :3000| WebContainer
    
    ServerActions --> PrismaClient
    NextAuth --> PrismaClient
    PrismaClient -->|Port 5432 TCP| PostgresDB
    PostgresDB --- DataVolume
    BackupCron -->|Daily Dump| PostgresDB
```

---

## 4. TECH STACK

| Lapisan (Layer) | Teknologi / Library | Versi Rekomendasi | Catatan / Fungsi |
| :--- | :--- | :--- | :--- |
| **Runtime Environment** | Node.js | `>= 20.x (LTS)` | Runtime JavaScript server-side |
| **Fullstack Framework** | Next.js (App Router) | `14.2.x` / `15.x` | Framework React SSR, Server Actions, API Routes |
| **Programming Language**| TypeScript | `5.x` | Strict type safety dari frontend sampai database |
| **Styling & UI Library**| Tailwind CSS + Shadcn UI | `Tailwind v3.4.x` | Utilitas CSS modern & komponen UI berbasis Radix UI |
| **Icon Library** | Lucide React | Latest | Kumpulan ikon minimalis konsisten |
| **Form & Validasi** | React Hook Form + Zod | Latest | Manajemen formulir & validasi skema runtime |
| **Data Visualization** | Recharts | Latest | Komponen grafik mutasi persediaan di dasbor |
| **Database Engine** | PostgreSQL | `16 Alpine` | RDBMS relasional dengan kepatuhan transaksi ACID |
| **ORM & Migrations** | Prisma ORM | `5.x` | Type-safe query builder, migrasi skema, dan seeder |
| **Authentication** | NextAuth.js (Auth.js) | `v5 (Beta)` / `v4.24` | Autentikasi Credential + JWT session cookie |
| **Password Hashing** | Bcryptjs | Latest | Enkripsi kata sandi pengguna (12 rounds) |
| **Excel Export/Import** | ExcelJS | Latest | Generator & parser file Excel `.xlsx` |
| **Containerization** | Docker & Docker Compose | Latest | Virtualisasi aplikasi & basis data terisolasi |
| **Remote Tunneling** | Ngrok | Latest | Ekspos URL HTTPS aman untuk akses luar kantor |

---

## 5. PROJECT STRUCTURE

Struktur direktori proyek dirancang terstruktur dan terstandarisasi:

```
sipbar-web/
├── .env.example                 # Template variabel lingkungan
├── .gitignore
├── docker-compose.yml           # Konfigurasi container Web & PostgreSQL
├── Dockerfile                   # Multi-stage build container Next.js
├── next.config.mjs              # Konfigurasi Next.js
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts           # Konfigurasi tema warna BPS Jeneponto
├── tsconfig.json
│
├── prisma/
│   ├── schema.prisma            # Definisi skema basis data relasional
│   ├── migrations/              # Berkas riwayat migrasi SQL
│   └── seed.ts                  # Skrip seeder master referensi & akun awal
│
├── public/                      # Asset statis publik
│   ├── images/
│   │   ├── bps-logo.png         # Logo resmi BPS untuk kop Tanda Terima
│   │   └── favicon.ico
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout aplikasi
│   │   ├── page.tsx             # Redirect root ke /katalog atau /dashboard
│   │   ├── (auth)/              # Route group autentikasi
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (public)/            # Route group publik / pegawai
│   │   │   └── katalog/
│   │   │       └── page.tsx     # Halaman katalog stok live untuk pegawai
│   │   ├── (admin)/             # Route group admin & super admin
│   │   │   ├── layout.tsx       # Layout admin (Sidebar + Navbar + Auth Guard)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx     # Dasbor analitik & kartu metrik
│   │   │   ├── inventaris/
│   │   │   │   ├── page.tsx     # Manajemen katalog master barang
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── transaksi-masuk/
│   │   │   │   ├── page.tsx     # Riwayat barang masuk
│   │   │   │   └── baru/page.tsx# Form entri pengadaan
│   │   │   ├── transaksi-keluar/
│   │   │   │   ├── page.tsx     # Riwayat barang keluar
│   │   │   │   └── baru/page.tsx# Form entri distribusi ATK
│   │   │   ├── tanda-terima/
│   │   │   │   ├── page.tsx     # Daftar dokumen tanda terima
│   │   │   │   ├── buat/page.tsx# Generator tanda terima multi-item
│   │   │   │   └── [id]/cetak/page.tsx # Halaman cetak / PDF Berita Acara
│   │   │   ├── laporan/
│   │   │   │   └── page.tsx     # Filter laporan & ekspor Excel/PDF
│   │   │   └── pengaturan/
│   │   │       ├── users/page.tsx       # Kelola user & role (Super Admin)
│   │   │       ├── referensi/page.tsx   # Kelola Kategori, Satuan, Gudang, Fungsi
│   │   │       └── backup/page.tsx      # Database backup & system status
│   │   └── api/                 # API Routes (Next.js)
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── health/route.ts  # Endpoint health check container
│   │       └── export/excel/route.ts
│   │
│   ├── actions/                 # Server Actions (Mutasi Data Backend)
│   │   ├── barang.actions.ts    # CRUD Master Barang
│   │   ├── masuk.actions.ts     # Transaksi Masuk + Update Stok
│   │   ├── keluar.actions.ts    # Transaksi Keluar + Potong Stok
│   │   ├── terima.actions.ts    # Generate Tanda Terima
│   │   └── users.actions.ts     # Manajemen User & Role
│   │
│   ├── components/              # Komponen React Reusable
│   │   ├── ui/                  # Komponen Shadcn UI (Button, Dialog, Form, Input, Table, dll)
│   │   ├── layout/              # Sidebar, Header, Navbar, UserDropdown
│   │   ├── dashboard/           # MetricCard, LowStockAlertTable, AnalyticsChart
│   │   ├── inventaris/          # ItemFormModal, ItemTable, ItemBadge
│   │   ├── transaksi/           # LiveStockSelector, TransactionTable
│   │   └── print/               # TandaTerimaDocument (Kop BPS, Form Pengesahan Kasubbag)
│   │
│   ├── lib/                     # Utilitas & Library Helper
│   │   ├── prisma.ts            # Prisma Client Singleton
│   │   ├── auth.ts              # Konfigurasi NextAuth.js
│   │   ├── utils.ts             # Format Rupiah, format tanggal Indonesia, classNames
│   │   └── code-generator.ts    # Algoritma auto-increment ID (`ID-`, `BM-`, `BK-`, `TT-`)
│   │
│   ├── schemas/                 # Skema Validasi Zod
│   │   ├── barang.schema.ts
│   │   ├── transaksi.schema.ts
│   │   ├── terima.schema.ts
│   │   └── user.schema.ts
│   │
│   └── types/                   # Definisi TypeScript Interfaces
│       └── index.ts
```

---

## 6. DATABASE ARCHITECTURE

### 6.1 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ TRANSAKSI_MASUK : "creates"
    USERS ||--o{ TRANSAKSI_KELUAR : "creates"
    FUNGSI ||--o{ USERS : "assigned_to"
    FUNGSI ||--o{ TRANSAKSI_KELUAR : "receives"
    
    KATEGORI ||--o{ BARANG : "classifies"
    SATUAN ||--o{ BARANG : "measures"
    GUDANG ||--o{ BARANG : "stores"
    
    BARANG ||--o{ TRANSAKSI_MASUK : "restocked_in"
    BARANG ||--o{ TRANSAKSI_KELUAR : "distributed_in"
    
    TANDA_TERIMA ||--o{ TRANSAKSI_KELUAR : "groups"

    USERS {
        string id PK
        string username UK
        string name
        string nip UK
        string password
        enum role "SUPER_ADMIN, ADMIN_GUDANG, PEGAWAI"
        string avatar
        string fungsiId FK
        datetime createdAt
        datetime updatedAt
    }

    FUNGSI {
        string id PK
        string nama UK "UMUM, PRODUKSI, dll"
        string kode UK
    }

    KATEGORI {
        string id PK
        string nama UK "Kertas HVS, Tinta, dll"
        string deskripsi
    }

    SATUAN {
        string id PK
        string nama UK "Rim, Botol, Buah, dll"
    }

    GUDANG {
        string id PK
        string nama UK "Gudang 1, Gudang 2, Gudang 3"
        string lokasi
    }

    BARANG {
        string id PK
        string kodeBarang UK "ID-1000xxx"
        string namaBarang
        string kategoriId FK
        string satuanId FK
        string gudangId FK
        int stok "Saldo Fisik"
        int minStok "Default 5"
        decimal hargaEstimasi
        string gambarUrl
        datetime createdAt
        datetime updatedAt
    }

    TRANSAKSI_MASUK {
        string id PK
        string kodeTransaksi UK "BM-YYYYMM-xxxx"
        datetime tanggal
        string barangId FK
        int jumlahMasuk
        decimal hargaBeli
        string sumberPengadaan
        string keterangan
        string createdById FK
        datetime createdAt
    }

    TRANSAKSI_KELUAR {
        string id PK
        string kodeTransaksi UK "BK-YYYYMM-xxxx"
        datetime tanggal
        string barangId FK
        int jumlahKeluar
        string penerimaNama
        string penerimaNip
        string fungsiId FK
        string keterangan
        string tandaTerimaId FK
        string createdById FK
        datetime createdAt
    }

    TANDA_TERIMA {
        string id PK
        string nomorDokumen UK "TT-YYYYMM-xxxx"
        datetime tanggalDokumen
        string kasubbagNama "Imaniar Dwi Aryanti, S.TP"
        string kasubbagNip
        string kasubbagJabatan "Kepala Subbagian Umum"
        datetime createdAt
    }
```

### 6.2 Constraints, Keys, and Indexes

1. **Foreign Keys & Cascading**:
   * `Barang.kategoriId` $\rightarrow$ `Kategori.id` (`ON DELETE RESTRICT`)
   * `Barang.satuanId` $\rightarrow$ `Satuan.id` (`ON DELETE RESTRICT`)
   * `Barang.gudangId` $\rightarrow$ `Gudang.id` (`ON DELETE RESTRICT`)
   * `TransaksiMasuk.barangId` $\rightarrow$ `Barang.id` (`ON DELETE RESTRICT`)
   * `TransaksiKeluar.barangId` $\rightarrow$ `Barang.id` (`ON DELETE RESTRICT`)
   * `TransaksiKeluar.tandaTerimaId` $\rightarrow$ `TandaTerima.id` (`ON DELETE SET NULL`)
2. **Database Indexes**:
   * `Barang`: Index pada `namaBarang`, `kategoriId`, `gudangId` (Optimasi kueri pencarian cepat).
   * `TransaksiMasuk`: Index pada `tanggal`, `barangId`.
   * `TransaksiKeluar`: Index pada `tanggal`, `barangId`, `fungsiId`, `tandaTerimaId`.
   * `User`: Index unik pada `username` dan `nip`.

---

## 7. DATA FLOW ARCHITECTURE

### 7.1 Alur Transaksi Pengeluaran Barang (Outbound & Stock Deduction)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin Gudang
    participant UI as Browser (React Form)
    participant Action as Server Action (keluar.actions)
    participant Zod as Validator (Zod Schema)
    participant DB as PostgreSQL (Prisma $transaction)
    
    Admin->>UI: Pilih Barang, Masukkan Qty Keluar, Pilih Penerima & Fungsi
    UI->>UI: Validasi di sisi Client (Live Stock Balance)
    Admin->>UI: Klik 'Simpan Transaksi'
    UI->>Action: Invoke createTransaksiKeluar(payload)
    Action->>Zod: Validasi Payload Schema
    Zod-->>Action: Payload Valid
    
    Action->>DB: BEGIN TRANSACTION (ACID)
    DB->>DB: Query Barang by ID (Lock Row & Cek Saldo Stok)
    alt Stok Cukup (Stok >= Qty Keluar)
        DB->>DB: INSERT into TransaksiKeluar
        DB->>DB: UPDATE Barang SET stok = stok - Qty Keluar
        DB->>Action: COMMIT TRANSACTION
        Action-->>UI: Return Success { message, data }
        UI-->>Admin: Toast Success & Refresh Tabel/Katalog
    else Stok Tidak Cukup (Stok < Qty Keluar)
        DB->>Action: ROLLBACK TRANSACTION
        Action-->>UI: Return Error ("Stok tidak mencukupi!")
        UI-->>Admin: Tampilkan Alert Gagal
    end
```

---

## 8. BUSINESS RULES & LOGIC SPECIFICATIONS

1. **BR-1: Saldo Stok Tidak Boleh Negatif**:
   * Kuantitas transaksi pengeluaran barang **tidak boleh melebihi** saldo fisik yang tercatat di database (`jumlahKeluar <= stok`).
2. **BR-2: Transaksionalitas ACID pada Mutasi Stok**:
   * Seluruh mutasi kuantitas stok wajib dijalankan dalam satu blok transaksi `prisma.$transaction()`. Jika penulisan riwayat transaksi gagal, pemotongan stok otomatis dibatalkan (*rollback*).
3. **BR-3: Format Penomoran Dokumen Otomatis**:
   * Master Barang: `ID-1000xxx` (Counter bertambah secara sekuensial).
   * Barang Masuk: `BM-YYYYMM-xxxx` (e.g., `BM-202610-0001`).
   * Barang Keluar: `BK-YYYYMM-xxxx` (e.g., `BK-202610-0001`).
   * Tanda Terima: `TT-YYYY-MM-xxxx` (e.g., `TT-2026-10-0001`).
4. **BR-4: Ambang Batas Peringatan Stok (*Low-Stock Threshold*)**:
   * Status `Habis`: Stok $= 0$.
   * Status `Menipis`: Stok $\le$ `minStok` (Default $\le 5$ unit).
   * Status `Tersedia`: Stok $>$ `minStok`.
5. **BR-5: Pengelompokan Tanda Terima**:
   * Beberapa transaksi pengeluaran barang untuk pegawai/seksi yang sama pada hari yang sama dapat digabungkan ke dalam **satu lembar Tanda Terima (Multi-Item)**.
6. **BR-6: Otorisasi Pengesahan Dokumen**:
   * Lembar Tanda Terima secara default mencantumkan penandatangan: *An. Kepala BPS Kabupaten Jeneponto, Kepala Subbagian Umum (Imaniar Dwi Aryanti, S.TP)*.

---

## 9. FRONTEND ARCHITECTURE

1. **Routing Strategy**: Menggunakan **Next.js App Router** dengan pemisahan Route Groups:
   * `(auth)`: Login, Forgot Password.
   * `(public)`: Katalog stok untuk seluruh staf.
   * `(admin)`: Dasbor manajemen, transaksi, laporan, dan pengaturan.
2. **State Management**:
   * **Server State**: Next.js Server Components + Server Actions dengan `revalidatePath` / `revalidateTag`.
   * **Client State**: React `useState` & `useTransition` untuk form input live dan dynamic filter.
3. **Design System & Palet Warna (BPS Identity)**:
   * **BPS Deep Navy**: `#0A2540` / `#1E3A8A` (Header, Sidebar aktif, Primary Buttons).
   * **BPS Sky Blue**: `#0284C7` / `#38BDF8` (Aksen, Badge status, Hover states).
   * **BPS Vibrant Orange**: `#F97316` / `#FB923C` (Warning badge stok menipis, highlight KPI).
   * **Background**: `#F8FAFC` (Slate 50) untuk area konten yang bersih dan nyaman dibaca.
4. **Print & PDF Styling Rules**:
   * Menggunakan CSS `@media print` khusus pada rute `/tanda-terima/[id]/cetak` untuk menyembunyikan sidebar, tombol, dan navbar, menyisakan format dokumen kop resmi BPS berukuran F4/A4.

---

## 10. BACKEND ARCHITECTURE

1. **Pola Desain Server Actions (Action-Service-Prisma)**:
   * **Actions Layer (`/src/actions/*.ts`)**: Menerima request dari form, memeriksa sesi autentikasi pengguna, mengeksekusi validasi Zod.
   * **Service/Domain Logic**: Menjalankan logika bisnis (cek stok, format nomor kode transaksi).
   * **Data Access Layer**: Menjalankan query ke PostgreSQL via Prisma ORM Client Singleton.
2. **Standar Respons Server Actions**:
   ```typescript
   export type ActionResponse<T = unknown> = {
     success: boolean;
     message: string;
     data?: T;
     errors?: Record<string, string[]>;
   };
   ```
3. **Middleware & Route Guards (`middleware.ts`)**:
   * Memeriksa token sesi NextAuth pada setiap request.
   * Rute `/pengaturan/users` dikunci khusus untuk role `SUPER_ADMIN`.
   * Rute `/inventaris`, `/transaksi-masuk`, `/transaksi-keluar`, `/laporan` dikunci untuk role `ADMIN_GUDANG` dan `SUPER_ADMIN`.
   * Rute `/katalog` dapat diakses oleh seluruh pengguna terotentikasi maupun tamu (*public inside LAN*).

---

## 11. API & SERVER ACTIONS SPECIFICATION

| Action / Endpoint | Method / Type | Role Access | Request Payload | Response Data |
| :--- | :--- | :--- | :--- | :--- |
| `loginUser` | Server Action | Public | `{ username, password }` | `{ success, user, redirectUrl }` |
| `getKatalogBarang` | Server Action | All | `{ search?, kategoriId?, gudangId?, page, limit }` | `{ items: Barang[], total, totalPages }` |
| `createBarang` | Server Action | Admin / Super | `BarangSchema` (Nama, Kategori, Satuan, Gudang, MinStok, dll) | `ActionResponse<Barang>` |
| `updateBarang` | Server Action | Admin / Super | `{ id, ...BarangSchema }` | `ActionResponse<Barang>` |
| `deleteBarang` | Server Action | Admin / Super | `{ id }` | `ActionResponse<void>` |
| `createTransaksiMasuk` | Server Action | Admin / Super | `{ barangId, jumlahMasuk, hargaBeli?, tanggal?, keterangan? }` | `ActionResponse<TransaksiMasuk>` |
| `createTransaksiKeluar`| Server Action | Admin / Super | `{ barangId, jumlahKeluar, penerimaNama, fungsiId, tanggal?, keterangan? }` | `ActionResponse<TransaksiKeluar>` |
| `createTandaTerima` | Server Action | Admin / Super | `{ transaksiKeluarIds: string[], tanggalDokumen? }` | `ActionResponse<TandaTerima>` |
| `exportLaporanExcel` | GET `/api/export/excel` | Admin / Super | Query Params: `?jenis=masuk|keluar&startDate=&endDate=` | Binary Stream `.xlsx` |
| `getHealthStatus` | GET `/api/health` | Public | None | `{ status: "UP", timestamp, db: "CONNECTED" }` |

---

## 12. AUTHENTICATION & AUTHORIZATION

* **Framework**: NextAuth.js v5 (Credentials Provider).
* **Alur Login**:
  1. Pengguna memasukkan `username` (atau NIP) dan `password`.
  2. Backend memverifikasi keberadaan user di database PostgreSQL.
  3. Bcrypt membandingkan password plain-text dengan password hash.
  4. Jika cocok, sesi JWT diterbitkan dan disimpan dalam cookie HTTP-Only terenkripsi (`next-auth.session-token`).
* **Struktur JWT Payload**:
  ```json
  {
    "sub": "user_cuid_123",
    "name": "Nur Azizah Tajuddin",
    "username": "azizah",
    "nip": "199408222018012001",
    "role": "ADMIN_GUDANG",
    "fungsi": "UMUM"
  }
  ```

---

## 13. SECURITY SPECIFICATIONS

1. **Pencegahan SQL Injection**: Seluruh query dieksekusi melalui Prisma ORM yang menggunakan parameter binding aman.
2. **Pencegahan Cross-Site Scripting (XSS)**: React secara default melakukan sanitasi HTML output; seluruh input form divalidasi dan di-strip karakter berbahaya menggunakan Zod.
3. **Proteksi Password**: Password wajib di-hash menggunakan `bcryptjs` dengan minimum 12 salt rounds. Password asli tidak pernah dicatat dalam log.
4. **Proteksi Akses URL Langsung**: Middleware Next.js memvalidasi role pada setiap request server-side; aksi tidak dapat ditembus hanya dengan memanipulasi frontend.
5. **CORS & HTTP Headers**: Header keamanan (X-Frame-Options, X-Content-Type-Options, Referrer-Policy) dikonfigurasi melalui `next.config.mjs`.

---

## 14. EXTERNAL INTEGRATION & TUNNELING

### 14.1 Ngrok Tunneling Architecture
Untuk memfasilitasi akses staf BPS dari luar kantor (WFH / Dinas Luar) tanpa memerlukan IP Publik Statis kantor:
* **Service**: Ngrok Secure Tunnel.
* **Protokol**: HTTP/HTTPS Proxying ke port host `3000`.
* **Konfigurasi Autostart (Ubuntu Systemd / Ngrok Config)**:
  ```yaml
  version: "2"
  authtoken: <NGROK_AUTH_TOKEN>
  tunnels:
    sipbar:
      proto: http
      addr: 3000
      domain: sipbar-bps-jeneponto.ngrok-free.app # (Optional static domain)
  ```

---

## 15. ENVIRONMENT & DEPLOYMENT ARCHITECTURE

### 15.1 Variabel Lingkungan (`.env.example`)
```ini
# App Configuration
NODE_ENV=production
NEXTAUTH_URL=http://192.168.1.50:3000
NEXTAUTH_SECRET=rahasia_super_aman_jwt_bps_jeneponto_2026_xyz

# PostgreSQL Database Connection
DATABASE_URL=postgresql://postgres:sipbarpassword123@sipbar-db:5432/sipbardb?schema=public

# Application Defaults
DEFAULT_KASUBBAG_NAMA="Imaniar Dwi Aryanti, S.TP"
DEFAULT_KASUBBAG_NIP="199001012015012001"
DEFAULT_KASUBBAG_JABATAN="Kepala Subbagian Umum BPS Kabupaten Jeneponto"
```

### 15.2 Konfigurasi Container (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  sipbar-db:
    image: postgres:16-alpine
    container_name: sipbar-db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: sipbarpassword123
      POSTGRES_DB: sipbardb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - sipbar-network

  sipbar-web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: sipbar-web
    restart: always
    depends_on:
      - sipbar-db
    environment:
      - DATABASE_URL=postgresql://postgres:sipbarpassword123@sipbar-db:5432/sipbardb?schema=public
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=rahasia_super_aman_jwt_bps_jeneponto_2026_xyz
    ports:
      - "3000:3000"
    networks:
      - sipbar-network

volumes:
  postgres_data:
    driver: local

networks:
  sipbar-network:
    driver: bridge
```

---

## 16. TESTING STRATEGY

1. **Unit Testing**:
   * Menguji helper fungsi pembuatan kode otomatis (`code-generator.test.ts`).
   * Menguji skema validasi Zod untuk seluruh transaksi.
2. **Integration Testing**:
   * Menguji skenario Server Actions: Tambah Transaksi Keluar $\rightarrow$ Verifikasi baris transaksi tercatat dan stok master terpotong secara akurat.
   * Menguji penolakan transaksi jika kuantitas melebihi stok yang tersedia.
3. **User Acceptance Testing (UAT)**:
   * Verifikasi pencetakan Tanda Terima oleh Admin Gudang.
   * Verifikasi pengecekan katalog oleh Pegawai melalui smartphone via jaringan LAN BPS.

---

## 17. PERFORMANCE & SCALABILITY

1. **Server-Side Rendering (SSR) & Server Components**: Halaman katalog dan dasbor dirender langsung di server, menghasilkan waktu First Contentful Paint (FCP) di bawah 1 detik.
2. **On-Demand Revalidation (`revalidatePath`)**: Saat transaksi masuk/keluar terjadi, Next.js hanya merefresh cache halaman terkait tanpa membebani database dengan polling berkala.
3. **Database Indexing**: Indeks pada `namaBarang`, `kategoriId`, dan `tanggal` menjaga kecepatan respon pencarian di bawah 150 ms meskipun transaksi mencapai puluhan ribu record.
4. **Image Optimization**: Menggunakan `next/image` untuk otomatis mengompresi foto barang ke format WebP ringan.

---

## 18. LOGGING & MONITORING

1. **Application Health Check Endpoint**:
   * Route: `/api/health`
   * Memverifikasi konektivitas aplikasi dan ping aktif ke PostgreSQL.
2. **Audit Logging (Database Transaction Logs)**:
   * Setiap mutasi persediaan secara otomatis merekam relasi `createdById` (ID user pembuat) dan timestamp `createdAt` untuk keperluan audit internal/Inspektorat.
3. **Docker Logs**:
   * Log container Next.js dan PostgreSQL dipantau langsung melalui perintah standar:
     ```bash
     docker compose logs -f sipbar-web
     ```

---

## 19. DEPENDENCIES SPECIFICATION

```json
{
  "dependencies": {
    "@prisma/client": "^5.18.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.1",
    "bcryptjs": "^2.4.3",
    "clsx": "^2.1.1",
    "exceljs": "^4.4.0",
    "lucide-react": "^0.435.0",
    "next": "14.2.5",
    "next-auth": "^4.24.7",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.52.2",
    "recharts": "^2.12.7",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "prisma": "^5.18.0",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

---

## 20. CONSTRAINTS & RULES (BATASAN TEKNIS KETAT)

* **Aturan Mutasi Stok**: Tidak diperbolehkan mengedit field stok di tabel `Barang` secara langsung tanpa melalui prosedur pencatatan transaksi masuk atau keluar.
* **Format Kode Unik**: Skema penomoran (`ID-`, `BM-`, `BK-`, `TT-`) tidak boleh diubah agar tetap konsisten dengan histori arsip pembukuan BPS.
* **Kompatibilitas Format Cetak Tanda Terima**: Tata letak kop surat BPS, nama pejabat Kasubbag Umum, dan kolom tanda tangan penerima pada lembar Berita Acara harus selalu presisi saat dicetak pada kertas standar F4/A4.

---

## 21. ARCHITECTURAL DECISIONS (ADRs)

1. **ADR-1: Memilih Next.js App Router (Fullstack) daripada Terpisah Frontend/Backend**
   * *Alasan*: Menghilangkan overhead pemeliharaan 2 repositori terpisah, deployment Docker jauh lebih ringkas (*single container build*), dan mempermudah tim IT BPS Jeneponto dalam pemeliharaan berkala.
2. **ADR-2: Menggunakan PostgreSQL + Prisma ORM daripada MongoDB/NoSQL**
   * *Alasan*: Data inventaris dan transaksi persediaan bersifat relasional ketat dan memerlukan jaminan integritas transaksi ACID untuk mencegah selisih stok fisik.
3. **ADR-3: Menggunakan Docker Compose di PC Server Lokal Ubuntu**
   * *Alasan*: Menghilangkan biaya sewa cloud bulanan, memberikan kecepatan akses LAN kantor tanpa batas kuota internet, serta menjaga kedaulatan data persediaan tetap berada di internal kantor BPS Jeneponto.
4. **ADR-4: Menggunakan Ngrok Tunnel untuk Akses Luar Kantor**
   * *Alasan*: Solusi paling praktis untuk mengakses server kantor dari luar jaringan tanpa perlu mengonfigurasi IP Public statis atau port forwarding router kantor yang rumit.

---

## 22. DEVELOPMENT CHECKLIST

### Tahap 1: Setup Proyek & Database
- [ ] Inisialisasi proyek Next.js dengan TypeScript dan Tailwind CSS.
- [ ] Buat file `docker-compose.yml` dan konfigurasi container PostgreSQL.
- [ ] Tulis skema Prisma di `prisma/schema.prisma`.
- [ ] Jalankan migrasi database pertama (`npx prisma migrate dev`).
- [ ] Buat skrip seeder (`prisma/seed.ts`) untuk Kategori, Satuan, Gudang, Fungsi, dan User awal.

### Tahap 2: Migrasi Data Lama Excel
- [ ] Ekstrak 316 data master barang dari `SIPBAR.xlsm` sheet `DATABARANG`.
- [ ] Ekstrak 647 transaksi masuk dari sheet `BARANGMASUK` dan 486 transaksi keluar dari `BARANGKELUAR`.
- [ ] Eksekusi skrip import migrasi ke PostgreSQL dan verifikasi kesesuaian saldo stok akhir.

### Tahap 3: Autentikasi & Katalog Publik Pegawai
- [ ] Konfigurasi NextAuth.js (Credentials Provider + JWT + Role Middleware).
- [ ] Bangun halaman login `/login`.
- [ ] Bangun halaman publik `/katalog` (Tabel pencarian live, filter kategori/gudang, badge ketersediaan stok).

### Tahap 4: Modul Transaksi & Manajemen Stok
- [ ] Bangun halaman CRUD master barang `/inventaris`.
- [ ] Bangun modul transaksi masuk `/transaksi-masuk` (Kalkulasi penambahan stok otomatis).
- [ ] Bangun modul transaksi keluar `/transaksi-keluar` (Validasi sisa stok & pemotongan stok otomatis).

### Tahap 5: Modul Tanda Terima, Laporan & Dasbor
- [ ] Bangun Dasbor KPI dan Low-Stock Alerts `/dashboard`.
- [ ] Bangun modul generator dokumen Berita Acara `/tanda-terima/buat`.
- [ ] Bangun halaman cetak resmi Tanda Terima format BPS `/tanda-terima/[id]/cetak`.
- [ ] Bangun fitur filter dan ekspor laporan mutasi ke Excel `/laporan`.

### Tahap 6: Deployment & UAT
- [ ] Uji performa dan fungsionalitas end-to-end.
- [ ] Build production image Dockerfile.
- [ ] Deploy container ke Ubuntu Server kantor BPS Jeneponto.
- [ ] Setup dan uji coba koneksi remote Ngrok HTTPS Tunnel.
