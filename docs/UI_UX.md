# PANDUAN STANDAR UI/UX & SISTEM DESAIN
# SIPBAR WEB — SISTEM INFORMASI PERSEDIAAN BARANG
**Badan Pusat Statistik (BPS) Kabupaten Jeneponto**
*Dokumen Spesifikasi Desain Antarmuka, Palet Warna, Tipografi, Komponen, dan Pola UX*

---

## 1. DESIGN DIRECTION

### 1.1 Gaya Visual & Karakter Desain
SIPBAR Web mengusung gaya visual **"BPS Modern Executive — Clean, Airy, & Ergonomic"**. Desain diarahkan untuk aplikasi produktivitas perkantoran instansi pemerintah yang profesional, terstruktur rapi, dan nyaman di mata untuk penggunaan berjam-jam (*all-day enterprise use*).

### 1.2 Prinsip Utama UI/UX
1. **Ergonomi Visual (*Eye-Comfort First*)**: Menghindari penggunaan warna putih 100% murni pada seluruh layar. Memadukan latar belakang abu-abu lembut (*Slate 50*) dengan kontainer kartu putih (*Pure White*) untuk menghasilkan kontras lembut tanpa silau.
2. **Keterpindaian Cepat (*Instant Scannability*)**: Status stok barang (*Tersedia, Menipis, Habis*) dan kartu KPI menggunakan kode warna dan *badge* kontras pastel sehingga mudah dibedakan dalam sekilas pandang.
3. **Efisiensi Entri Data (*Frictionless Input*)**: Formulir pencatatan barang masuk dan keluar dilengkapi fitur pencarian langsung (*autocomplete*), kalkulasi stok instan, dan *keyboard navigation* yang cepat.
4. **Identitas Resmi BPS**: Mengadopsi palet warna identitas Badan Pusat Statistik: *Deep Navy Blue* (wibawa & terpercaya), *Sky Blue* (modern & segar), dan *Vibrant Orange* (peringatan stok & aksi penting).
5. **Tata Letak Cetak Presisi (*Print-Ready Fidelity*)**: Format dokumen Berita Acara / Tanda Terima dirancang presisi sesuai ukuran kertas standar instansi (F4/A4) lengkap dengan Kop Surat resmi BPS Kabupaten Jeneponto.

---

## 2. COLOR PALETTE

Sistem mengadopsi palet warna **Opsi 1 (BPS Modern Executive)** yang telah disepakati:

```
+----------------------------------------------------------------------------------------------------+
|  [#0F2F64] Primary Navy       |  [#0284C7] Secondary Sky     |  [#F97316] Accent Orange            |
|  [#F8FAFC] Page Background    |  [#FFFFFF] Card Surface      |  [#E2E8F0] Border / Divider         |
|  [#0F172A] Text Primary       |  [#64748B] Text Muted        |  [#10B981] Success (Tersedia)       |
|  [#F59E0B] Warning (Menipis)  |  [#EF4444] Error (Habis)     |  [#38BDF8] Info Sky                 |
+----------------------------------------------------------------------------------------------------+
```

### Tabel Token Warna & Penggunaan

| Kategori Token | Nama Warna | Kode HEX | Tailwind CSS Class | Penggunaan & Keterangan |
| :--- | :--- | :---: | :--- | :--- |
| **Brand Primary** | Deep BPS Navy | `#0F2F64` | `bg-[#0F2F64]` / `text-[#0F2F64]` | Tombol utama, sidebar header, brand identity BPS. |
| **Primary Hover** | Darker Navy | `#0A1F42` | `hover:bg-[#0A1F42]` | Status hover tombol utama. |
| **Primary Light** | Soft Navy Tint | `#EFF4FA` | `bg-[#EFF4FA]` / `text-[#0F2F64]` | Background menu sidebar yang sedang aktif. |
| **Brand Secondary**| Sky Blue | `#0284C7` | `bg-sky-600` / `text-sky-600` | Tombol sekunder, link aktif, ikon interaktif. |
| **Secondary Hover**| Deep Sky Blue | `#0369A1` | `hover:bg-sky-700` | Status hover elemen sekunder. |
| **Brand Accent** | BPS Sunset Orange | `#F97316` | `bg-orange-500` / `text-orange-500` | Aksen tombol penting, sorotan KPI stok kritis. |
| **Background** | Soft Slate | `#F8FAFC` | `bg-slate-50` | Latar belakang seluruh halaman aplikasi. |
| **Surface / Card** | Pure White | `#FFFFFF` | `bg-white` | Latar kartu dasbor, tabel, modal dialog, dropdown. |
| **Border / Line** | Light Slate | `#E2E8F0` | `border-slate-200` | Garis batas kartu, pemisah baris tabel, border input. |
| **Text Primary** | Dark Slate | `#0F172A` | `text-slate-900` | Judul utama, angka metrik, isi data tabel penting. |
| **Text Secondary**| Medium Slate | `#475569` | `text-slate-600` | Teks isi konten, label form, deskripsi umum. |
| **Text Muted** | Muted Slate | `#64748B` | `text-slate-500` | Placeholder input, tanggal mutasi, satuan barang. |
| **Success (Bg)** | Soft Emerald | `#DCFCE7` | `bg-emerald-100` | Latar badge status stok "Tersedia". |
| **Success (Text)**| Dark Emerald | `#15803D` | `text-emerald-700` | Teks & border badge stok "Tersedia". |
| **Warning (Bg)** | Soft Amber | `#FEF3C7` | `bg-amber-100` | Latar badge status stok "Menipis / Kritis". |
| **Warning (Text)**| Dark Amber | `#B45309` | `text-amber-700` | Teks & border badge stok "Menipis / Kritis". |
| **Error (Bg)** | Soft Rose | `#FFE4E6` | `bg-rose-100` | Latar badge status stok "Habis" & alert gagal. |
| **Error (Text)** | Dark Rose | `#BE123C` | `text-rose-700` | Teks & border badge stok "Habis" & error form. |
| **Disabled Bg** | Disabled Gray | `#F1F5F9` | `bg-slate-100` | Latar tombol atau field input yang dinonaktifkan. |
| **Disabled Text** | Muted Gray | `#94A3B8` | `text-slate-400` | Teks elemen yang dinonaktifkan. |

---

## 3. TYPOGRAPHY

* **Font Utama**: `Inter` / `Plus Jakarta Sans`, sans-serif (Font modern dengan tingkat keterbacaan tinggi untuk angka tabel & UI densitas tinggi).
* **Font Monospace**: `JetBrains Mono` / `ui-monospace` (Khusus untuk kode barang `ID-1000xxx`, `BM-xxxx`, dan nominal harga).

### Skala Tipografi (Typography Scale)

| Level / Peran | Ukuran (Size) | Weight | Line Height | Tailwind Class | Contoh Penerapan |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **Heading 1 (H1)** | 24px (1.5rem) | Bold (700) | 32px (2rem) | `text-2xl font-bold text-slate-900` | Judul halaman utama dasbor / katalog |
| **Heading 2 (H2)** | 20px (1.25rem)| SemiBold (600)| 28px (1.75rem)| `text-xl font-semibold text-slate-900` | Judul kartu panel / judul modal form |
| **Heading 3 (H3)** | 16px (1.0rem) | SemiBold (600)| 24px (1.5rem) | `text-base font-semibold text-slate-800`| Judul sub-tabel / section header |
| **Body Large** | 16px (1.0rem) | Regular (400) | 24px (1.5rem) | `text-base font-normal text-slate-700` | Teks pengantar / ringkasan modal |
| **Body Default** | 14px (0.875rem)| Regular (400)| 20px (1.25rem)| `text-sm font-normal text-slate-700` | Teks isi data tabel, label input |
| **Body Medium** | 14px (0.875rem)| Medium (500) | 20px (1.25rem)| `text-sm font-medium text-slate-900` | Teks nama barang di tabel, tombol |
| **Caption / Small**| 12px (0.75rem)| Regular (400) | 16px (1.0rem) | `text-xs font-normal text-slate-500` | Timestamp tanggal, label helper |
| **Badge / Pill** | 12px (0.75rem)| SemiBold (600)| 16px (1.0rem) | `text-xs font-semibold uppercase` | Status ketersediaan stok barang |
| **Metric Number** | 30px (1.875rem)| Bold (700) | 36px (2.25rem)| `text-3xl font-bold text-slate-900` | Angka total stok / total varian item |

---

## 4. SPACING & LAYOUT SYSTEM

### 4.1 Grid & Container
* **Layout Grid**: 12-kolom responsif berbasis CSS Grid & Flexbox.
* **Max Container Width**:
  * Desktop Lebar: `max-w-7xl` (1280px) untuk dasbor dan katalog.
  * Form / Modal Terfokus: `max-w-xl` (576px) s.d. `max-w-2xl` (672px).
  * Lembar Cetak Tanda Terima: Lebar tetap `794px` (Standar A4/F4 portrait).

### 4.2 Spacing Scale (Padding & Margin)
* **Micro Spacing (`4px` - `8px`)**: `p-1`, `p-2`, `gap-2` untuk padding badge, ikon ke teks, dan chip filter.
* **Component Spacing (`12px` - `16px`)**: `p-3`, `p-4`, `gap-4` untuk padding tombol, cell tabel, dan form input.
* **Card Spacing (`20px` - `24px`)**: `p-5`, `p-6`, `gap-6` untuk padding kontainer kartu dasbor & modal dialog.
* **Section Spacing (`32px` - `48px`)**: `py-8`, `mb-8`, `gap-8` untuk jarak antar-blok section halaman.

### 4.3 Responsive Breakpoints
* **Mobile (`sm`)**: `< 640px` (Sidebar terlipat menjadi drawer hamburger, tabel kartu responsif).
* **Tablet (`md`)**: `640px - 1024px` (Sidebar mini/ikon, 2-kolom kartu KPI).
* **Desktop (`lg` / `xl`)**: `> 1024px` (Sidebar penuh tetap 256px, 4-kolom kartu KPI).

---

## 5. KOMPONEN STANDAR (DESIGN SYSTEM COMPONENTS)

### 5.1 Navbar & Header
* **Karakteristik**: Berada di bagian atas konten (`h-16`), latar belakang `bg-white border-b border-slate-200`, bayangan halus `shadow-sm`.
* **Konten**:
  * Kiri: Judul halaman aktif & Breadcrumb navigasi.
  * Kanan: Tanggal hari ini, badge peran pengguna (`SUPER_ADMIN` / `ADMIN_GUDANG` / `PEGAWAI`), dan User Dropdown Avatar.

### 5.2 Sidebar Navigasi
* **Karakteristik**: Lebar tetap `w-64` (256px), latar belakang `bg-white border-r border-slate-200`.
* **Header Sidebar**: Logo BPS Kabupaten Jeneponto + Teks "SIPBAR BPS".
* **Aturan Menu Item**:
  * Default: `text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg px-3 py-2.5 text-sm font-medium flex items-center gap-3`.
  * Active State: `bg-[#EFF4FA] text-[#0F2F64] font-semibold rounded-lg px-3 py-2.5 text-sm flex items-center gap-3 border-l-4 border-[#0F2F64]`.

### 5.3 Buttons (Tombol)
* **Primary Button**: `bg-[#0F2F64] hover:bg-[#0A1F42] text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-[#0F2F64]/20`.
* **Secondary Button**: `bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all`.
* **Accent / Warning Button**: `bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg shadow-sm`.
* **Outline Button**: `border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg transition-all`.
* **Destructive Button**: `bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm`.
* **Disabled State**: `bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60`.

### 5.4 Form Controls (Input, Select, Textarea)
* **Standard Text/Number Input**:
  `w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F2F64] focus:ring-2 focus:ring-[#0F2F64]/10 transition-all`.
* **Input dengan Ikon (Search Bar)**: Ikon kaca pembesar di sisi kiri dalam `pl-10 text-slate-400`.
* **Select Dropdown**: Menggunakan style senada dengan arrow chevron subtle di sisi kanan.
* **Error State Input**: `border-rose-500 focus:border-rose-500 focus:ring-rose-500/10`. Disertai teks pesan error merah di bawah input `text-xs text-rose-600 mt-1`.

### 5.5 Tabel Data (Data Table)
* **Container**: `bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm`.
* **Header Kolom (`<thead>`)**: `bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3`.
* **Baris Data (`<tr>`)**: `border-b border-slate-100 hover:bg-slate-50/80 transition-colors text-sm text-slate-700`.
* **Kolom Numerik (Stok, Harga, Qty)**: Rata kanan (`text-right font-medium`).

### 5.6 Status Badge (Status Ketersediaan Stok)
| Status Stok | Tampilan Visual | Kode CSS Kelas |
| :--- | :--- | :--- |
| **TERSEDIA** | Lingkaran hijau + "Tersedia" | `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200` |
| **MENIPIS** | Segitiga amber + "Menipis" | `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200` |
| **HABIS** | Tanda silang merah + "Habis" | `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200` |

### 5.7 Kartu Metrik Dasbor (KPI Metric Card)
* **Struktur Visual**:
  * Box putih `bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow`.
  * Ikon pendukung di dalam lingkaran pastel di pojok kanan atas (misal: Ikon Box Navy, Ikon Inbound Hijau, Ikon Outbound Oranye).
  * Label metrik `text-xs font-medium text-slate-500 uppercase tracking-wider`.
  * Angka metrik `text-3xl font-bold text-slate-900 mt-1`.
  * Keterangan sub-metrik di bawah angka `text-xs text-slate-500 mt-2`.

### 5.8 Modal Dialog & Konfirmasi
* **Backdrop**: `bg-slate-900/40 backdrop-blur-sm transition-opacity`.
* **Dialog Container**: `bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95`.
* **Header**: Judul tebal + Tombol tutup silang (`X`) di sudut kanan atas.
* **Footer**: Tombol aksi kanan (Batal: Outline / Konfirmasi: Primary atau Destructive).

### 5.9 Toast Notifications
* **Posisi**: Pojok kanan atas (`top-4 right-4 z-50`).
* **Format Sukses**: Background putih dengan aksen garis kiri hijau `border-l-4 border-emerald-500`, ikon checklist hijau, judul "Berhasil Disimpan", durasi auto-dismiss 3.5 detik.
* **Format Gagal**: Aksen garis kiri merah `border-l-4 border-rose-500`, ikon seru merah, judul "Gagal Menyimpan Transaksi".

### 5.10 Loading & Empty State
* **Loading Skeleton**: `animate-pulse bg-slate-200 rounded-md` yang meniru dimensi baris tabel/kartu.
* **Empty State**: Ilustrasi/ikon kotak terbuka abu-abu `w-12 h-12 text-slate-300`, judul `text-sm font-semibold text-slate-700` ("Tidak ada data transaksi"), deskripsi `text-xs text-slate-500` ("Coba sesuaikan kata kunci pencarian atau filter").

---

## 6. NAVIGATION & SITEMAP

```
+----------------------------------------------------------------------------------------------------+
|                                    STRUKTUR NAVIGASI UTAMA                                         |
+----------------------------------------------------------------------------------------------------+
| 1. AREA PUBLIK (Semua Pengguna & Pegawai):                                                         |
|    - [📦 Katalog Persediaan] -> /katalog (Tabel pencarian stok fisik real-time)                    |
|                                                                                                    |
| 2. AREA OPERASIONAL (Admin Gudang & Super Admin):                                                  |
|    - [📊 Dasbor Utama]       -> /dashboard (KPI persediaan, grafik, low-stock alerts)              |
|    - [🗂️ Master Barang]      -> /inventaris (Katalog item master, tambah/edit item)                |
|    - [📥 Barang Masuk]       -> /transaksi-masuk (Pencatatan pengadaan & riwayat)                  |
|    - [📤 Barang Keluar]      -> /transaksi-keluar (Pencatatan distribusi ke pegawai)               |
|    - [📄 Tanda Terima]       -> /tanda-terima (Generator Berita Acara & Cetak PDF)                 |
|    - [📈 Laporan Mutasi]     -> /laporan (Filter tanggal & Ekspor Excel .xlsx)                     |
|                                                                                                    |
| 3. AREA ADMINISTRASI (Khusus Super Admin):                                                         |
|    - [👥 Manajemen User]     -> /pengaturan/users (Akun pegawai, role, reset password)              |
|    - [⚙️ Master Referensi]   -> /pengaturan/referensi (Kategori, Satuan, Gudang, Seksi)             |
|    - [💾 Backup Database]    -> /pengaturan/backup (Status DB & SQL dump)                          |
+----------------------------------------------------------------------------------------------------+
```

---

## 7. ARSITEKTUR TATA LETAK HALAMAN (PAGE LAYOUTS)

### 7.1 Layout Dasbor Admin (`/dashboard`)
* **Bagian Atas**: 4 Kartu KPI Metrik (Total Varian Barang, Total Saldo Fisik, Mutasi Masuk Bulan Ini, Mutasi Keluar Bulan Ini).
* **Bagian Tengah Kiri (2/3 Kolom)**: Grafik Tren Mutasi Keluar-Masuk (Recharts Bar/Area Chart).
* **Bagian Tengah Kanan (1/3 Kolom)**: Distribusi Stok per Lokasi Gudang (Gudang 1, 2, 3).
* **Bagian Bawah**: Tabel Prioritas Peringatan Stok Kritis (*Low Stock Alert Table* dengan tombol aksi cepat pengadaan).

### 7.2 Layout Katalog Publik Pegawai (`/katalog`)
* **Header Ringkas**: Logo BPS Jeneponto, Judul "Katalog Ketersediaan Barang Persediaan", dan tombol Login di kanan atas.
* **Bar Pencarian & Filter Cepat**:
  * Input pencarian nama barang berukuran besar di tengah.
  * Pill filter horizontal untuk Kategori (Semua, Kertas, Tinta, Stopmap, ATK Lainnya) dan Filter Gudang.
* **Tabel / Grid Kartu Stok**: Menampilkan nama barang, satuan, stok sisa, dan badge ketersediaan (*Tersedia, Menipis, Habis*).

### 7.3 Layout Entri Transaksi Masuk / Keluar (`/transaksi-masuk/baru` & `/transaksi-keluar/baru`)
* **Desain Form 2-Kolom**:
  * Kolom Kiri: Pilihan Barang (Autocomplete dengan penampil sisa stok saat ini), Tanggal Transaksi, dan Kuantitas.
  * Kolom Kanan: Pilihan Pegawai Penerima (Dropdown Staf BPS), Seksi/Fungsi Peminta, dan Keterangan Tambahan.
  * Bar Informasi Kalkulasi Bawah: Ringkasan `[Stok Saat Ini] - [Qty Keluar] = [Estimasi Sisa Stok]` secara interaktif.

### 7.4 Layout Cetak Tanda Terima Resmi (`/tanda-terima/[id]/cetak`)
* **Format Kertas**: Portrait F4 / A4 (`794px` lebar standar).
* **Kop Surat Resmi**: Logo BPS di kiri, Teks Kop instansi "BADAN PUSAT STATISTIK KABUPATEN JENEPONTO".
* **Judul Dokumen**: "TANDA TERIMA PENYERAHAN BARANG PERSEDIAAN", Nomor Dokumen, dan Tanggal.
* **Tabel Barang**: Kolom No, Nama Barang, Kuantitas, Satuan, Tanggal Pengambilan, Nama Penerima, Fungsi/Seksi, dan Kolom Paraf.
* **Pengesahan Bawah**: Dua kolom tanda tangan:
  * Kiri: Pegawai Penerima Barang.
  * Kanan: *An. Kepala BPS Kabupaten Jeneponto, Kepala Subbagian Umum (Imaniar Dwi Aryanti, S.TP)*.
* **Aturan Print CSS**: `@media print` otomatis menyembunyikan sidebar, navbar, tombol cetak, dan background aplikasi, mencetak dokumen bersih berlatar putih 100%.

---

## 8. RESPONSIVE DESIGN SPECIFICATIONS

| Komponen / Halaman | Desktop ($\ge 1024px$) | Tablet ($768px - 1023px$) | Mobile ($< 768px$) |
| :--- | :--- | :--- | :--- |
| **Sidebar Navigasi** | Tampil penuh `w-64` di kiri. | Terlipat menjadi ikon mini (`w-16`). | Tersembunyi, dibuka via tombol hamburger (Drawer). |
| **Kartu KPI Dasbor** | 4 Kolom berdampingan (`grid-cols-4`). | 2 Kolom berdampingan (`grid-cols-2`). | 1 Kolom tumpuk vertikal (`grid-cols-1`). |
| **Tabel Inventaris** | Tabel lengkap dengan seluruh kolom. | Tabel dengan scroll horizontal mulus. | Kartu ringkas (*card list*) per barang. |
| **Form Entri Data** | 2 Kolom berdampingan. | 2 Kolom berdampingan. | 1 Kolom penuh menurun ke bawah. |
| **Halaman Cetak TT** | Pratinjau dokumen ukuran asli F4. | Pratinjau dengan kontrol zoom. | Tampilan ringkas dengan tombol "Unduh PDF". |

---

## 9. ATURAN PENGALAMAN PENGGUNA (UX RULES)

1. **Pemberian Umpan Balik Cepat (*Immediate Feedback*)**:
   * Setiap tombol simpan wajib menampilkan *loading spinner* saat proses request berjalan dan dinonaktifkan untuk mencegah klik ganda (*double submission*).
2. **Validasi Inline (*Real-Time Validation*)**:
   * Validasi kesalahan input muncul seketika setelah pengguna keluar dari kolom (*onBlur*) atau saat mengetik jika kuantitas melebihi stok yang tersedia.
3. **Konfirmasi Tindakan Destruktif**:
   * Menghapus transaksi atau master barang wajib memunculkan modal dialog konfirmasi eksplisit dengan tombol merah *"Hapus Data"*, bukan hanya prompt browser bawaan.
4. **Preservasi Data Form (*Form State Retention*)**:
   * Jika terjadi kegagalan koneksi saat submit form, data yang telah diketik tidak boleh hilang dari form.
5. **Aksesibilitas Kontras (WCAG 2.1 AA Compliant)**:
   * Seluruh teks utama memiliki rasio kontras minimal $4.5:1$ terhadap background putih/slate untuk menjamin kenyamanan membaca semua pengguna.

---

## 10. DESIGN RULES (DO & DON'T)

### Wajib Dilakukan (DO):
* ✅ Gunakan warna `#F8FAFC` (*Slate 50*) untuk background halaman dan `#FFFFFF` untuk kontainer kartu/tabel.
* ✅ Gunakan font `Inter` atau `Plus Jakarta Sans` dengan hirarki ukuran yang konsisten.
* ✅ Gunakan format badge status resmi (*Emerald = Tersedia, Amber = Menipis, Rose = Habis*).
* ✅ Selalu format angka nominal rupiah (`Rp 50.000`) dan kuantitas unit dengan tanda pemisah ribuan.
* ✅ Gunakan ikon *Lucide React* yang seragam dengan ketebalan garis (*stroke*) $1.75$ px s.d. $2.0$ px.

### Dilarang Keras (DON'T):
* ❌ Jangan gunakan warna background hitam pekat atau dark mode pada fase awal (aplikasi difokuskan pada *Clean Light Mode* instansi).
* ❌ Jangan gunakan warna background putih 100% murni di seluruh layar tanpa pemisah kartu yang jelas.
* ❌ Jangan gunakan warna merah menyala untuk teks biasa; warna merah hanya dikhususkan untuk error kritis dan badge stok habis.
* ❌ Jangan biarkan tabel memotong teks nama barang tanpa opsi tooltip atau pembungkusan baris (*word wrap*) yang rapi.
* ❌ Jangan hilangkan logo BPS atau kolom tanda tangan resmi Kasubbag Umum pada lembar cetak Tanda Terima.
