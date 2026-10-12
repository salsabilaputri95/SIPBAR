# PEDOMAN OPERASIONAL & ATURAN KERJA AI CODING AGENT (AGENT.MD)
# SIPBAR WEB — SISTEM INFORMASI PERSEDIAAN BARANG
**Badan Pusat Statistik (BPS) Kabupaten Jeneponto**
*Dokumen Aturan Kerja, Standar Implementasi, Batasan Modifikasi, dan Protokol Eksekusi untuk AI Agent*

---

## 1. PROJECT CONTEXT

**SIPBAR Web** adalah aplikasi manajemen logistik dan persediaan barang terpusat berbasis web yang dibangun untuk memodernisasi tata kelola inventaris di **Badan Pusat Statistik (BPS) Kabupaten Jeneponto**, menggantikan sistem lama berbasis spreadsheet macro (`SIPBAR.xlsm`).

* **Teknologi Utama**: Next.js 14/15 (App Router, React, TypeScript), Tailwind CSS, Shadcn UI, Prisma ORM, PostgreSQL 16 (Docker Container), NextAuth.js v5 (JWT Session), dan Ngrok Tunneling.
* **Tujuan Utama**: Menyediakan akses mandiri bagi seluruh staf BPS untuk mengecek ketersediaan stok fisik secara *real-time*, memfasilitasi pencatatan mutasi pengadaan (masuk) dan distribusi (keluar) oleh Admin Gudang dengan jaminan transaksi ACID anti-minus, serta menerbitkan Berita Acara / Tanda Terima resmi berformat standar BPS Jeneponto siap cetak / PDF.

---

## 2. DOCUMENTATION PRIORITY (SUMBER KEBENARAN)

AI Agent wajib mematuhi hierarki sumber kebenaran (*Single Source of Truth*) berikut apabila terjadi perbedaan informasi atau ketidakpastian:

```
1. PRD.md            ──> Kebutuhan Produk, Fitur, dan Role Matrix (Prioritas Tertinggi)
2. SYSTEM_DESIGN.md  ──> Alur Kerja Sistem, Interaksi Fitur, dan Logika Bisnis
3. ARSITEKTUR.md     ──> Struktur Arsitektur Teknis, Tech Stack, dan Infrastruktur Docker
4. DATABASE.md       ──> Skema Tabel, Relasi ERD, Constraints, Indeks, dan Aturan Data
5. API.md            ──> Kontrak REST API, Server Actions, Skema Request/Response, dan Kode Error
6. UI_UX.md          ──> Standar Desain Visual, Palet Warna BPS Modern Executive, dan UX Rules
7. Source Code       ──> Implementasi Kode Aktual
```

> **Aturan Resolusi Konflik**: Jika ditemukan kontradiksi antar-dokumen, AI Agent **dilarang keras menebak**. Tandai konflik dan laporkan secara transparan menggunakan format pada [Bagian 13](#13-handling-ambiguity).

---

## 3. GENERAL RULES (ATURAN UMUM)

1. **Baca Dokumentasi Terlebih Dahulu**: Sebelum membuat atau mengedit berkas kode, baca dan pahami dokumen terkait (`PRD.md`, `DATABASE.md`, `API.md`, `UI_UX.md`).
2. **Dilarang Mengarang (*No Hallucinated Requirements*)**: Jangan pernah mengarang requirement, endpoint API baru, kolom database, peran pengguna, atau aturan bisnis yang tidak tercantum dalam dokumentasi resmi.
3. **Dilarang Menghapus Fitur Eksisting**: Jangan menghapus atau menonaktifkan fitur/fungsi yang sudah berjalan tanpa instruksi eksplisit.
4. **Dilarang Mengubah Business Rules Diam-Diam**: Aturan perhitungan stok anti-minus ($stok \ge 0$), penomoran otomatis sekuensial, dan otorisasi dokumen tidak boleh dimodifikasi.
5. **Gunakan Struktur Proyek yang Ada**: Wajib mematuhi pola arsitektur direktori yang telah ditetapkan di `ARSITEKTUR.md` (`/src/app`, `/src/actions`, `/src/components`, `/src/lib`, `/src/schemas`, `/src/types`).
6. **Reuse Over Recreate**: Wajib menggunakan kembali (*reuse*) komponen UI Shadcn, helper fungsi, schema Zod, dan utilitas yang sudah tersedia sebelum membuat yang baru.
7. **Hindari Kode Duplikat (*DRY Principle*)**: Ekstrak logika berulang ke dalam custom hooks, utility functions, atau Server Actions.
8. **Dilarang Menambah Dependency Sembarangan**: Jangan menginstal paket `npm` baru tanpa alasan teknis yang kuat dan esensial.

---

## 4. IMPLEMENTATION WORKFLOW

Setiap pengerjaan tugas (*task*) wajib mengikuti alur 7 langkah terstruktur:

```text
Understand ──> Inspect ──> Plan ──> Implement ──> Test ──> Verify ──> Document
```

### Rincian Tahapan Eksekusi:
1. **Understand**: Pahami dengan jelas tujuan tugas, requirement fitur, dan batasan teknisnya.
2. **Inspect**: Periksa berkas-berkas terkait, skema basis data, dan implementasi yang sudah ada.
3. **Plan**: Susun rencana implementasi singkat yang mencakup daftar file yang akan dibuat/diubah.
4. **Implement**: Tulis kode yang bersih, type-safe (TypeScript strict mode), dan sesuai standar dokumentasi.
5. **Test**: Jalankan pengujian, validasi tipe (*TypeScript check*), linting, atau uji fungsionalitas.
6. **Verify**: Cocokkan kembali hasil implementasi terhadap kriteria penerimaan di `PRD.md` dan `API.md`.
7. **Document**: Perbarui dokumentasi terkait jika terjadi penambahan endpoint, skema data, atau konfigurasi.

---

## 5. CODE MODIFICATION RULES

* **Modifikasi Minimal & Terfokus**: Ubah hanya baris dan berkas yang relevan dengan tugas. Jangan menyentuh file yang tidak berkaitan.
* **Dilarang Refactor Besar Tanpa Izin**: Jangan merombak struktur folder, arsitektur modul, atau mengganti library hanya karena ada alternatif lain.
* **Pertahankan Backward Compatibility**: Pastikan perubahan tidak merusak komponen, Server Actions, atau endpoint yang sudah digunakan modul lain.
* **Pola Penulisan Kode**:
  * Gunakan **TypeScript Strict Mode** (hindari penggunaan `any`).
  * Gunakan **React Server Components (RSC)** secara default; tambahkan directive `'use client'` hanya pada komponen yang membutuhkan interaktivitas state/event listener browser.
  * Gunakan **Server Actions** untuk operasi mutasi data backend (Create, Update, Delete).

---

## 6. DATABASE RULES

* **Patuhi `DATABASE.md`**: Seluruh tabel, kolom, tipe data, foreign key, dan indeks wajib mengikuti spesifikasi resmi.
* **Wajib Prisma Migrate**: Dilarang mengubah struktur tabel secara manual pada basis data production. Seluruh perubahan skema wajib melalui `prisma/schema.prisma` dan migrasi deklaratif (`npx prisma migrate dev`).
* **Wajib Transaksi ACID (`prisma.$transaction`)**: Seluruh operasi yang melibatkan mutasi stok ganda (misal: catat barang keluar + potong stok barang) **wajib dibungkus dalam satu blok transaksi database**.
* **Proteksi Integritas Histori**: Dilarang melakukan *hard delete* pada master barang yang sudah memiliki riwayat mutasi masuk atau keluar.
* **Dilarang Menyimpan Kredensial**: Jangan pernah menaruh password, secret key, atau string koneksi database langsung di dalam kode program (gunakan `.env`).

---

## 7. API & SERVER ACTIONS RULES

* **Patuhi `API.md`**: Seluruh rute, method, payload request, dan format response wajib sesuai kontrak API.
* **Validasi Skema Berlapis (Zod)**: Seluruh input dari client wajib divalidasi di sisi server menggunakan skema Zod sebelum diproses ke database.
* **Format Respons Konsisten**: Seluruh Server Actions dan API Routes wajib mengembalikan format amplop standar `{ success, message, data, errors, meta }`.
* **Otorisasi Ketat pada Server Side**: Selalu periksa sesi pengguna dan peran role (`SUPER_ADMIN`, `ADMIN_GUDANG`) sebelum mengeksekusi operasi mutasi data.

---

## 8. FRONTEND & UI/UX RULES

* **Patuhi `UI_UX.md`**: Wajib menggunakan palet warna resmi **BPS Modern Executive**:
  * Background: Soft Slate (`#F8FAFC` / `bg-slate-50`)
  * Card/Panel: Pure White (`#FFFFFF` / `bg-white`)
  * Brand Primary: Deep Navy BPS (`#0F2F64`)
  * Secondary / Accent: Sky Blue (`#0284C7`) & Sunset Orange (`#F97316`)
  * Status Badges: Emerald (`Tersedia`), Amber (`Menipis`), Rose (`Habis`)
* **Tangani 4 State UI pada Setiap Halaman**:
  1. **Loading State**: Gunakan skeleton placeholder `animate-pulse` yang meniru bentuk tabel/kartu.
  2. **Error State**: Tampilkan banner alert informatif dengan pesan yang mudah dipahami staf.
  3. **Empty State**: Tampilkan ilustrasi/ikon kotak kosong dan instruksi penyesuaian filter jika data bernilai 0.
  4. **Success State**: Tampilkan notifikasi toast otomatis saat data berhasil disimpan.
* **Responsif Multi-Device**: Pastikan tata letak rapi pada layar Desktop ($\ge 1024px$), Tablet ($768px - 1023px$), dan Smartphone ($< 768px$).
* **Format Cetak Presisi**: Halaman cetak Tanda Terima wajib menerapkan aturan CSS `@media print` untuk menghasilkan format Berita Acara bersih pada kertas F4/A4 dengan Kop BPS Kabupaten Jeneponto.

---

## 9. SECURITY & DATA PRIVACY RULES

1. **Proteksi Kredensial**: Password wajib di-hash menggunakan `bcryptjs` (minimal 12 salt rounds). Field password **dilarang keras disertakan dalam output JSON** ke client (`select: { password: false }`).
2. **Pencegahan Injeksi**: Manfaatkan parameter binding otomatis Prisma ORM untuk mencegah SQL Injection.
3. **Pencegahan XSS**: Sanitasi seluruh input teks dan manfaatkan sanitasi bawaan React terhadap rendering string.
4. **Proteksi Akses URL Langsung**: Middleware Next.js wajib memvalidasi token sesi JWT dan hak akses role pada setiap request server-side.

---

## 10. TESTING & VERIFICATION RULES

Setelah melakukan perubahan kode:
1. **Verifikasi Tipe & Linting**: Pastikan tidak ada error TypeScript (`tsc --noEmit`) atau lint warning.
2. **Uji Kasus Positif (*Happy Path*)**: Pastikan fitur berfungsi normal saat input valid diberikan.
3. **Uji Kasus Negatif (*Edge Cases*)**:
   * Coba input kuantitas keluar yang melebihi saldo stok $\rightarrow$ Pastikan sistem menolak dengan pesan error yang tepat (*Anti-Minus Rule*).
   * Coba hapus barang yang memiliki transaksi $\rightarrow$ Pastikan sistem menolak penghapusan.
   * Coba akses halaman admin menggunakan role Pegawai $\rightarrow$ Pastikan middleware memblokir akses.
4. **Verifikasi Build**: Pastikan perintah `npm run build` berhasil tanpa error kompilasi.

---

## 11. GIT & VERSION CONTROL RULES

* **Dilarang Force Push**: Jangan pernah menjalankan perintah `git push --force` ke repositori.
* **Dilarang Menghapus Pekerjaan User**: Jangan melakukan `git reset --hard` atau menghapus file lokal tanpa persetujuan eksplisit.
* **Pesan Commit Deskriptif**: Gunakan konvensi commit standar (misal: `feat: implementasi transaksi barang keluar`, `fix: perbaikan kalkulasi stok live`).
* **Jaga Kebersihan Repository**: Jangan meng-commit file environment (`.env`), folder `node_modules/`, folder `.next/`, atau dump data sementara.

---

## 12. CHANGE IMPACT ASSESSMENT

Sebelum mengubah bagian inti sistem, lakukan analisis dampak terhadap:

```
+-----------------------------------------------------------------------------------+
|                        MATRIKS ANALISIS DAMPAK PERUBAHAN                          |
+-----------------------------------------------------------------------------------+
| 1. Skema Database  ──> Apakah memerlukan migrasi? Apakah memengaruhi data lama?   |
| 2. API / Actions   ──> Apakah memutus kontrak request/response pada frontend?     |
| 3. Business Logic  ──> Apakah memengaruhi perhitungan saldo stok atau validasi?   |
| 4. Antarmuka UI    ──> Apakah merusak komponen lain yang menggunakan props sama?  |
| 5. Dokumentasi     ──> Apakah PRD, ARSITEKTUR, DATABASE, atau API perlu diupdate? |
+-----------------------------------------------------------------------------------+
```

---

## 13. HANDLING AMBIGUITY & CONFLICTS

Jika AI Agent menemukan requirement yang tidak jelas atau terjadi kontradiksi informasi antar-dokumen:
* **Dilarang menebak atau mengambil asumsi sendiri**.
* Tuliskan temuan konflik dan ajukan kepada pengguna menggunakan format resmi:

```text
CONFLICT IDENTIFIED:
- Sumber A (misal PRD.md): [Kutipan Kebutuhan]
- Sumber B (misal DATABASE.md): [Kutipan Struktur]
- Dampak Teknis: [Penjelasan potensi dampak jika salah memilih]
- Keputusan yang Dibutuhkan: [Pilihan opsi solusi A atau B]
```

---

## 14. COMPLETION CHECKLIST

Sebelum AI Agent menyatakan suatu tugas telah selesai (*task completed*), lakukan verifikasi terhadap checklist berikut:

- [ ] Requirement fungsional terpenuhi secara lengkap.
- [ ] Logika bisnis persediaan (stok anti-minus, auto-ID, kompensasi stok) berjalan benar.
- [ ] Skema database dan relasi foreign key sesuai dengan `DATABASE.md`.
- [ ] Server Actions dan endpoint API sesuai dengan `API.md`.
- [ ] Tampilan UI mematuhi palet warna, tipografi, dan tata letak `UI_UX.md`.
- [ ] Hak akses RBAC (`SUPER_ADMIN`, `ADMIN_GUDANG`, `PEGAWAI`) terproteksi dengan benar.
- [ ] Seluruh state form (loading, error, validation message, empty state) tertangani.
- [ ] Tidak ada kredensial, token, atau data sensitif yang terekspos ke publik/log.
- [ ] Kompilasi TypeScript dan build Next.js berhasil tanpa error.
- [ ] Dokumentasi terkait telah diperbarui jika ada perubahan teknis.

---

## 15. FINAL RESPONSE FORMAT

Setiap kali menyelesaikan sebuah tugas atau rangkaian implementasi kode, AI Agent wajib menyajikan laporan ringkas dengan format standar berikut:

```markdown
## 1. Ringkasan Perubahan (Changes Summary)
- [Penjelasan singkat fitur/perubahan yang dibuat]

## 2. Berkas yang Dibuat / Diubah (Files Modified)
- `src/app/...`: [Fungsi perubahan]
- `src/actions/...`: [Fungsi perubahan]

## 3. Hasil Pengujian & Verifikasi (Test & Verification)
- [Hasil uji fungsionalitas, validasi input, atau pengujian TypeScript build]

## 4. Catatan Teknis Tambahan (Notes & Follow-up)
- [Catatan konfigurasi environment, migrasi database, atau langkah selanjutnya]
```

---

### PRINSIP UTAMA AI CODING AGENT

> **CORRECTNESS > SECURITY > CONSISTENCY > MAINTAINABILITY > SPEED**
> 
> *AI Agent bertindak sebagai pengembang profesional yang mematuhi dokumentasi proyek dengan disiplin tinggi, memprioritaskan kebenaran logika data persediaan BPS Kabupaten Jeneponto, dan tidak pernah membuat asumsi sepihak pada keputusan arsitektur kritis.*
