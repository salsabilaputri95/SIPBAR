# LAPORAN AUDIT & ANALISIS SISTEM INFORMASI PERSEDIAAN BARANG (SIPBAR)
**Badan Pusat Statistik (BPS) Kabupaten Jeneponto**
*Dokumen Analisis Komprehensif, Audit Teknis Ulang, Struktur Data, Logika Bisnis, Formula, Kode Makro/VBA, dan Navigasi Antarmuka*

---

# BAGIAN I: HASIL AUDIT ULANG LAPORAN SEBELUMNYA

## 1. Tabel Perbandingan dan Verifikasi Komponen (Audit Trail)

Pemeriksaan silang (*cross-examination*) dilakukan langsung antara berkas sumber `SIPBAR.xlsm` dengan laporan analisis sebelumnya untuk mengidentifikasi status kebenaran, kelengkapan, dan kekeliruan:

| Komponen / Bagian | Sudah Ada di Laporan | Kondisi | Yang Terlewat / Salah | Perbaikan & Penyesuaian |
| :--- | :---: | :--- | :--- | :--- |
| **Identitas & Entitas Sistem** | Ya | Benar dan lengkap | - | Dikonfirmasi: SIPBAR = Sistem Informasi Persediaan Barang BPS Kab. Jeneponto. |
| **Sheet `MENU` (Sheet1)** | Ya | Benar tetapi belum lengkap | Belum dijelaskan adanya kontrol ActiveX ListBox `TABELBARANG`, logo/gambar latar `image1.emf`, serta sel sampah `J31` bernilai `20`. | Menambahkan detail teknis komponen visual drawing, ActiveX ListBox, dan letak sel pembantu. |
| **Sheet `DATABARANG` (Sheet2)** | Ya | Benar dan lengkap | - | Terverifikasi: 316 item aktif, formula auto-number kolom A, counter penomoran di S1:S3. |
| **Sheet `BARANGMASUK` (Sheet3)** | Ya | Benar tetapi belum lengkap | Belum disebutkan properti *Print Titles* `$3:$3` (pengulangan baris header saat cetak). | Menambahkan informasi PageSetup dan Print Titles baris 3. |
| **Sheet `BARANGKELUAR` (Sheet4)** | Ya | Benar tetapi belum lengkap | Belum dijelaskan bahwa sebagian besar baris (baris 4 s.d. 489) dalam kondisi baris tersembunyi (*hidden rows*) karena bekas filter Excel. | Mendokumentasikan kondisi *hidden rows* pada sheet database keluar. |
| **Sheet `CARIBARANG` (Sheet5)** | Ya | Benar dan lengkap | - | Terverifikasi: buffer filter master barang (kriteria I1:I2). |
| **Sheet `CARIMASUK` (Sheet6)** | Ya | Benar tetapi belum lengkap | Belum disebutkan kriteria tanggal di `M1:N2` serta fungsi ganda sebagai lembar cetak laporan. | Menjelaskan pemetaan kriteria nama (`K1:K2`) dan periode tanggal (`M1:N2`). |
| **Sheet `CARIKELUAR` (Sheet7)** | Ya | Benar tetapi belum lengkap | Belum dicatat adanya konfigurasi Print Area `'CARIKELUAR'!$A$1:$I$34`. | Menambahkan detail rentang area cetak baku. |
| **Sheet `TERIMA` (Sheet16 - Hidden)** | Ya | Benar tetapi belum lengkap | Belum dirinci bahwa Kolom `G:J` dan Baris `25:39` disembunyikan (*hidden*), serta memiliki Print Area `$A$1:$E$47`. | Mendokumentasikan struktur baris/kolom tersembunyi dan Print Area. |
| **Sheet `TERIMA NEW` (Sheet17)** | Ya | Benar tetapi belum lengkap | Belum dijelaskan bahwa Kolom `J:M` berstatus *Hidden Columns* agar area helper tidak ikut tercetak, serta Print Area `$A$1:$H$64` dengan Print Titles `$9:$9`. | Menjelaskan kolom penolong tersembunyi, Print Area, dan logo kop resmi `image16.png`. |
| **UserForm `FORMBARANG`** | Ya | Benar dan lengkap | - | Terverifikasi seluruh kontrol, event handler CRUD, dan pencarian live. |
| **UserForm `FORMBARANGMASUK`** | Ya | Benar dan lengkap | - | Terverifikasi seluruh kontrol, validasi, dan event handler mutasi stok. |
| **UserForm `FORMBARANGKELUAR`** | Ya | Benar dan lengkap | - | Terverifikasi dropdown penerima (35 nama), dropdown fungsi (9 seksi), dan mutasi stok. |
| **Modul `Module1.bas`** | Ya | Benar dan lengkap | - | Terverifikasi subroutines pembuka form, simpan, keluar, dan pemanggilan form tanda terima. |
| **Modul `Module2.bas`** | Ya | Benar tetapi belum lengkap | Belum dijelaskan fungsi makro `Picture2_Click` yang bertindak sebagai tombol kembali ke Menu (`Sheet1.Select`). | Menjelaskan navigasi tombol back/home logo gambar. |
| **Macro `FORMTANDATERIMA`** | Ya | Benar dan lengkap | - | Terverifikasi: Form fisik tidak ada di proyek VBA, menyebabkan runtime error 424. |
| **Formula Agregasi Dasbor** | Ya | Benar dan lengkap | - | Terverifikasi formula COUNTA, SUM, SUMIF di Z5:AA25. |
| **Formula VLOOKUP & IF Tanda Terima** | Ya | Benar dan lengkap | - | Terverifikasi penggunaan parameter `TRUE` vs `FALSE` dan penomoran otomatis COUNTA. |
| **Conditional Formatting** | Ya | Benar dan lengkap | - | Terverifikasi aturan `=$A10<>""` untuk border otomatis lembar tanda terima. |
| **Data Validation Excel (Native)** | Ya | Benar dan lengkap | - | Terverifikasi tidak ada Data Validation sel bawaan Excel (semua validasi ditangani via UserForm VBA). |

---

## 2. Temuan yang Terlewat dari Analisis Sebelumnya

Berdasarkan audit ulang mendalam, berikut adalah rincian temuan teknis baru yang sebelumnya belum teridentifikasi secara lengkap:

### A. Kolom Helper Tersembunyi (*Hidden Columns*) pada Sheet `TERIMA NEW`
* **Lokasi**: Sheet `TERIMA NEW`, Kolom `J`, `K`, `L`, dan `M`.
* **Fungsi**: Menampung hasil penarikan data transaksi dari `BARANGKELUAR` (Nama Barang, Jumlah Keluar, Satuan, dan Tanggal).
* **Cara Kerja**: Kolom-kolom ini disembunyikan (*hidden*) secara visual di Excel agar saat pengguna mencetak lembar Tanda Terima (Rentang Cetak `$A$1:$H$64`), rumus lookup tetap bekerja tanpa merusak tata letak dokumen cetak.
* **Urgensi**: Menjelaskan bagaimana lembar Tanda Terima dapat memisahkan antara area kerja formula dengan area cetak resmi.

### B. Konfigurasi Area Cetak & Pengulangan Judul (*Page Setup, Print Area & Print Titles*)
* **Lokasi**:
  * `BARANGMASUK`: Print Titles Baris `$3:$3` (judul kolom otomatis berulang di setiap halaman).
  * `CARIKELUAR`: Print Area terkunci pada rentang `$A$1:$I$34`.
  * `TERIMA` (*Legacy*): Print Area `$A$1:$E$47` dengan baris 25 s.d. 39 disembunyikan.
  * `TERIMA NEW`: Print Area `$A$1:$H$64` dengan Print Titles Baris `$9:$9`.
* **Urgensi**: Dokumen SIPBAR telah dikonfigurasi agar siap dicetak langsung ke kertas fisik (F4/A4) tanpa memerlukan pengaturan margin manual oleh staf BPS.

### C. Navigasi Makro Objek Gambar (`Module2.Picture2_Click`)
* **Lokasi**: `Module2.bas` terhubung ke shape gambar/ikon `Picture 2`.
* **Fungsi**: Berfungsi sebagai tombol navigasi global *Back to Home* / *Kembali ke Menu Utama* dengan mengeksekusi perintah `Sheet1.Select`.
* **Urgensi**: Memberikan jalur navigasi instan bagi pengguna yang sedang berada di lembar kerja lain untuk kembali ke dasbor utama `MENU`.

### D. Kondisi Baris Tersembunyi (*Hidden Rows*) pada Sheet `BARANGKELUAR`
* **Lokasi**: Sheet `BARANGKELUAR`, baris 4 s.d. 489.
* **Fungsi & Fakta**: Mayoritas baris database transaksi keluar berada dalam status tersembunyi karena bekas operasi filter kustom manual di Excel sebelum file disimpan.
* **Urgensi**: Menjelaskan mengapa data pada lembar `BARANGKELUAR` sepintas terlihat hanya sedikit jika dibuka langsung di Excel tanpa membuka filter baris.

---

# BAGIAN II: LAPORAN ANALISIS SISTEM SIPBAR (VERSI FINAL & TERINTEGRASI)

---

## 1. Gambaran Umum SIPBAR

**SIPBAR** (**Sistem Informasi Persediaan Barang**) adalah aplikasi sistem manajemen logistik dan inventaris persediaan berbasis *Microsoft Excel Macro-Enabled Workbook* (`.xlsm`) yang digunakan secara operasional oleh **Badan Pusat Statistik (BPS) Kabupaten Jeneponto**.

Sistem ini didesain untuk mendigitalkan seluruh siklus pengelolaan persediaan perkantoran, mencakup:
1. **Pengelolaan Katalog Master Barang**: Pencatatan nomenklatur barang, kategori, satuan standar, dan alokasi gudang.
2. **Pencatatan Pengadaan Barang Masuk (*Restocking*)**: Dokumentasi perolehan barang masuk yang secara otomatis meningkatkan kuantitas stok fisik.
3. **Pencatatan Penyaluran Barang Keluar (*Distribution*)**: Dokumentasi permintaan barang oleh pegawai per unit kerja/fungsi yang secara otomatis memotong stok fisik.
4. **Monitoring & Dasbor Eksekutif**: Ringkasan posisi stok, sebaran per gudang, serta pemantauan stok kritis secara *real-time*.
5. **Penerbitan Berita Acara / Tanda Terima**: Pembuatan dokumen tanda terima penyerahan barang resmi siap cetak untuk pertanggungjawaban tata usaha dan administrasi BPS.

---

## 2. Seluruh Sheet dan Fungsinya

Terdapat **9 Sheet** di dalam berkas SIPBAR dengan peran dan status berikut:

| No | Nama Sheet | Status Tampilan | CodeName VBA | Fungsi Utama | Karakteristik Khusus |
|:---:|:---|:---:|:---:|:---|:---|
| 1 | `MENU` | Visible | `Sheet1` | Dasbor utama, navigasi menu makro, kartu indikator stok, dan tabel monitoring stok kritis. | Memuat ActiveX ListBox `TABELBARANG` dan kartu metrik agregat. |
| 2 | `DATABARANG` | Visible | `Sheet2` | Master database barang (316 item aktif). Menyimpan ID Barang, Nama, Jenis, Satuan, Gudang, dan Saldo Stok fisik. | Memuat counter ID otomatis di kolom `S1:S3`. |
| 3 | `BARANGMASUK` | Visible | `Sheet3` | Database transaksi penerimaan barang (647 transaksi tercatat). Menyimpan ID Transaksi, Tanggal, Harga, dan Kuantitas Masuk. | Print Titles baris `$3:$3` dan counter ID di `K1:K3`. |
| 4 | `BARANGKELUAR` | Visible | `Sheet4` | Database transaksi distribusi barang (486 transaksi tercatat). Menyimpan ID Transaksi, Tanggal, Kuantitas Keluar, Penerima, dan Fungsi. | Counter ID di `K1:K3`, baris data memiliki flag *hidden*. |
| 5 | `CARIBARANG` | Visible | `Sheet5` | Lembar kerja perantara (*query buffer*) untuk hasil pencarian master barang melalui *Advanced Filter*. | Menampung kriteria nama barang di `I1:I2` dan hasil salinan di `A:G`. |
| 6 | `CARIMASUK` | Visible | `Sheet6` | Lembar perantara pencarian & template cetak laporan transaksi barang masuk. | Menampung kriteria nama (`K1:K2`), kriteria tanggal (`M1:N2`), dan hasil di `A:I`. |
| 7 | `CARIKELUAR` | Visible | `Sheet7` | Lembar perantara pencarian & template cetak laporan transaksi barang keluar. | Menampung kriteria nama (`L1:L2`), kriteria tanggal (`N1:O2`), Print Area `$A$1:$I$34`. |
| 8 | `TERIMA` | Hidden | `Sheet16` | Template cetak Tanda Terima Barang versi lama (*legacy*). | Kolom G:J dan baris 25:39 disembunyikan; Print Area `$A$1:$E$47`. |
| 9 | `TERIMA NEW` | Visible | `Sheet17` | Template cetak Tanda Terima Barang versi aktif/resmi BPS Kabupaten Jeneponto. | Kolom J:M disembunyikan; Print Area `$A$1:$H$64`; Print Titles `$9:$9`. |

---

## 3. Seluruh Fitur dan Fungsi Sistem

| No | Fitur | Lokasi / Komponen | Fungsi & Cara Kerja | Input | Output |
|:---:|:---|:---|:---|:---|:---|
| 1 | **Monitoring Dasbor Utama** | Sheet `MENU` (Z5:AA25) | Menghitung total varian barang, total unit fisik, mutasi masuk/keluar, dan stok per gudang secara otomatis via formula Excel. | Data di sheet `DATABARANG`, `BARANGMASUK`, `BARANGKELUAR` | Angka metrik ringkasan pada kartu dasbor. |
| 2 | **Monitoring Stok Kritis** | Sheet `MENU` & `Module1.UpdateDataBArang` | Menjalankan *Advanced Filter* dari data master untuk memuat daftar barang yang perlu pengadaan ulang ke dalam ActiveX ListBox. | Tombol `Update Data` pada sheet `MENU` | Tabel interaktif barang beserta sisa stok di menu utama. |
| 3 | **Entri Data Barang Baru** | Form `FORMBARANG` (`CMDBARU` & `CMDADD`) | Mengenerate ID Barang otomatis (`ID-1000xxx`), mengaktifkan field input, dan menyimpan katalog barang baru dengan stok awal = 0. | Nama, Jenis Barang, Satuan, Gudang | Baris master baru tersimpan di `DATABARANG`. |
| 4 | **Pencarian Live Master Barang** | Form `FORMBARANG` (`TXTCARI_Change`) | Memfilter daftar barang di ListBox secara instan saat pengguna mengetik nama barang. | Teks pencarian pada `TXTCARI` | ListBox menampilkan item yang cocok secara real-time. |
| 5 | **Ubah & Hapus Data Master** | Form `FORMBARANG` (`CMDUPDATE` & `CMDDELETE`) | Memperbarui identitas barang (double click pada tabel) atau menghapus item barang dengan konfirmasi dialog. | Pilih baris tabel, edit field | Data master terbarui atau terhapus di `DATABARANG`. |
| 6 | **Entri Barang Masuk** | Form `FORMBARANGMASUK` (`CMDADD`) | Mengenerate kode `BM-1000xxx`, memilih ID Barang (stok lama otomatis tampil), menghitung total stok baru, dan mencatat transaksi masuk. | Tanggal, ID Barang, Qty Masuk, Harga | Transaksi masuk tercatat di `BARANGMASUK` & stok di `DATABARANG` bertambah. |
| 7 | **Filter & Cetak Laporan Masuk** | Form `FORMBARANGMASUK` (`CMDCARI` & `CMDCETAK`) | Memfilter transaksi masuk berdasarkan rentang tanggal atau nama barang, lalu membuka jendela Print Preview siap cetak. | Tanggal Awal, Tanggal Akhir / Nama Barang | Lembar laporan mutasi masuk siap cetak di `CARIMASUK`. |
| 8 | **Entri Barang Keluar** | Form `FORMBARANGKELUAR` (`CMDADD`) | Mengenerate kode `BK-1000xxx`, memilih ID Barang, memasukkan Qty Keluar, memilih Pegawai Penerima dan Fungsi/Unit Kerja. | Tanggal, ID Barang, Qty Keluar, Penerima, Fungsi | Transaksi keluar tercatat di `BARANGKELUAR` & stok di `DATABARANG` berkurang. |
| 9 | **Filter & Cetak Laporan Keluar** | Form `FORMBARANGKELUAR` (`CMDCARI` & `CMDCETAK`) | Memfilter riwayat pengeluaran barang per periode atau nama barang, lalu membuka jendela Print Preview laporan. | Tanggal Awal, Tanggal Akhir / Nama Barang | Lembar laporan mutasi keluar siap cetak di `CARIKELUAR`. |
| 10 | **Generator Tanda Terima Resmi** | Sheet `TERIMA NEW` | Menarik detail transaksi pengeluaran barang secara otomatis sesuai nomor baris yang diinput untuk dicetak sebagai Berita Acara. | Nomor transaksi pada kolom I (`I10:I57`) | Dokumen Tanda Terima lengkap dengan paraf penerima & tanda tangan Kasubbag Umum. |
| 11 | **Navigasi Tombol Home** | `Module2.Picture2_Click` | Mengembalikan tampilan layar langsung ke dasbor menu utama dari sheet mana pun. | Klik shape gambar / icon back | Layar berpindah ke `Sheet1 (MENU)`. |
| 12 | **Simpan & Keluar Aman** | `Module1.SimpanData` & `Module1.Keluar` | Menyimpan perubahan buku kerja secara instan atau menutup file dengan dialog konfirmasi Yes/No. | Klik tombol `Simpan` / `Keluar` | Buku kerja tersimpan dan tertutup aman. |

---

## 4. Struktur dan Desain Basis Data

```
+----------------------------------------------------------------------------------------------------+
|                                           DATABARANG (Sheet2)                                      |
+----------------------------------------------------------------------------------------------------+
| PK | B: Id Barang (e.g. ID-1000001)                                                                |
|    | C: Nama Barang | D: Jenis Barang | E: Satuan | F: Gudang | G: Stok (Saldo Fisik)              |
|    | S1: "Kode Otomatis" | S2: =LEN($S$3) | S3: Counter ID Master (Nilai: 327)                     |
+----------------------------------------------------------------------------------------------------+
                                      | 1                           | 1
                                      |                             |
                                      | M                           | M
+---------------------------------------------+     +------------------------------------------------+
|             BARANGMASUK (Sheet3)            |     |              BARANGKELUAR (Sheet4)             |
+---------------------------------------------+     +------------------------------------------------+
| PK | B: ID Transaksi (e.g. BM-1000001)      |     | PK | B: ID Transaksi (e.g. BK-1000001)         |
| FK | D: Id Barang --------------------------+     | FK | D: Id Barang -----------------------------+
|    | C: Tanggal | E: Nama Barang            |     |    | A: No Urut (Index Baris Lookup)           |
|    | F: Satuan | G: Harga | H: Gudang       |     |    | C: Tanggal | E: Nama Barang | F: Satuan   |
|    | I: Jumlah Masuk                        |     |    | G: Gudang | H: Jumlah Keluar              |
|    | K1: "Kode Otomatis" | K2: 3 | K3: 649  |     |    | I: Penerima | J: Fungsi (Seksi Unit Kerja)|
+---------------------------------------------+     |    | K1: "Kode Otomatis"| K2:=LEN($K$3)| K3:534|
                                                    +------------------------------------------------+
                                                                            |
                                                                            | Lookup by Row Index (A)
                                                                            v
                                                    +------------------------------------------------+
                                                    |              TERIMA NEW (Sheet17)              |
                                                    +------------------------------------------------+
                                                    | Helper | I: No Urut Baris (BARANGKELUAR!A)     |
                                                    | (Hide) | J: Nama | K: Qty | L: Satuan | M: Tgl |
                                                    | Cetak  | A: No Urut Dokumen (Formula COUNTA)   |
                                                    |        | B: Nama Barang | C: Qty | D: Satuan   |
                                                    |        | E: Tanggal Ambil | F: Nama Penerima   |
                                                    |        | G: Fungsi | H: Kolom Tanda Tangan     |
                                                    +------------------------------------------------+
```

---

## 5. Seluruh Proses Input dan Output

### A. Proses Input
1. **Input Katalog Barang**: Dilakukan via `FORMBARANG` $\rightarrow$ mengisi nama, memilih jenis barang dari 31 item kategori, memilih satuan dari 15 opsi satuan, memilih gudang (Gudang 1/2/3).
2. **Input Pengadaan (Masuk)**: Dilakukan via `FORMBARANGMASUK` $\rightarrow$ memilih ID Barang dari ComboBox, memasukkan tanggal perolehan, jumlah unit masuk, dan harga beli (opsional).
3. **Input Penyaluran (Keluar)**: Dilakukan via `FORMBARANGKELUAR` $\rightarrow$ memilih ID Barang, memasukkan tanggal keluar, jumlah unit keluar, memilih nama pegawai penerima dari 35 pejabat/staf, dan memilih seksi fungsi dari 9 unit kerja.
4. **Input Lembar Tanda Terima**: Dilakukan langsung pada sel `TERIMA NEW!I10:I57` dengan mengetik nomor baris transaksi pengeluaran barang yang akan dicetak.

### B. Proses Output
1. **Output Dasbor Visual**: Metrik persediaan pada sel `MENU!Z5:AA25` dan tampilan daftar barang pada ActiveX ListBox `MENU!TABELBARANG`.
2. **Output Laporan Mutasi Masuk**: Lembar `CARIMASUK` dalam format Print Preview yang mencakup seluruh kolom detail perolehan barang.
3. **Output Laporan Mutasi Keluar**: Lembar `CARIKELUAR` dalam format Print Preview siap cetak kertas.
4. **Output Berita Acara / Tanda Terima**: Lembar `TERIMA NEW` siap cetak format F4/A4 yang memuat tanda tangan penerima barang serta pengesahan Kasubbag Umum BPS Kabupaten Jeneponto.

---

## 6. Rumus dan Logika Penting

### 1. Penomoran Baris Mandiri (Self-Adjusting Auto-Number)
```excel
=ROW() - ROW(DATABARANG!$A$3)
```
* **Cara Kerja**: Menghitung selisih nomor baris aktif terhadap baris header `$A$3`. Saat baris ke-4 dievaluasi, rumusnya menghasilkan `4 - 3 = 1`. Jika ada baris yang dihapus atau disisipkan, nomor urut selalu runtut tanpa perlu penomoran ulang manual.

### 2. Agregasi Statistik Persediaan Dasbor (`MENU`)
* **Total Varian Master Barang**:
  `=COUNTA(DATABARANG!$B$4:$B$69987)`
* **Total Kuantitas Stok Fisik Seluruh Gudang**:
  `=SUM(DATABARANG!$G$4:$G$69987)`
* **Total Transaksi & Kuantitas Barang Keluar**:
  `=COUNTA(BARANGKELUAR!$B$4:$B$49986)` dan `=SUM(BARANGKELUAR!$H$4:$H$49986)`
* **Saldo Stok per Lokasi Gudang**:
  `=SUMIF(DATABARANG!$F$4:$F$69987, MENU!$Z$18, DATABARANG!$G$4:$G$69987)` (untuk Gudang 1)
  `=SUMIF(DATABARANG!$F$4:$F$69987, MENU!$Z$21, DATABARANG!$G$4:$G$69987)` (untuk Gudang 2)
  `=SUMIF(DATABARANG!$F$4:$F$69987, MENU!$Z$24, DATABARANG!$G$4:$G$69987)` (untuk Gudang 3)

### 3. Logika Pembuatan Lembar Tanda Terima Dinamis (`TERIMA NEW`)
* **Penomoran Otomatis Item Terisi**:
  `=IF(B10<>"", COUNTA($B$10:B10), "")`
  *(Mencegah munculnya angka penomoran pada baris yang tidak memiliki nama barang)*.
* **Penyajian Data Bersyarat**:
  `=IF(I10>0, J10, "")`
* **Lookup Transaksi Barang Keluar**:
  `=VLOOKUP(I10, BARANGKELUAR!A3:I1048576, 5, TRUE)` $\rightarrow$ Nama Barang
  `=VLOOKUP(I10, BARANGKELUAR!A3:I1048576, 8, TRUE)` $\rightarrow$ Kuantitas Keluar
  `=VLOOKUP(I10, BARANGKELUAR!A3:I1048576, 6, TRUE)` $\rightarrow$ Satuan
  `=VLOOKUP(I10, BARANGKELUAR!A3:J1048576, 3, FALSE)` $\rightarrow$ Tanggal
  `=VLOOKUP(I10, BARANGKELUAR!A3:I1048576, 9, TRUE)` $\rightarrow$ Nama Penerima
  `=VLOOKUP(I10, BARANGKELUAR!$A$3:$J$1048576, 10, TRUE)` $\rightarrow$ Seksi / Fungsi

### 4. Logika Perhitungan Mutasi Stok pada VBA Macro
* **Saat Tambah Barang Masuk**: `Stok_Baru = Stok_Lama + TXTMASUK`
* **Saat Hapus Barang Masuk**: `Stok_Baru = Stok_Lama - STOKHAPUS`
* **Saat Ubah Barang Masuk**: `Stok_Baru = Stok_Lama - STOKHAPUS + TXTMASUK`
* **Saat Tambah Barang Keluar**: `Stok_Baru = Stok_Lama - TXTKELUAR`
* **Saat Hapus Barang Keluar**: `Stok_Baru = Stok_Lama + STOKHAPUS`
* **Saat Ubah Barang Keluar**: `Stok_Baru = Stok_Lama + STOKHAPUS - TXTKELUAR`

---

## 7. Hubungan dan Keterkaitan Antar-Sheet

1. **`MENU` $\leftrightarrow$ Seluruh Sheet Database**: Mengambil metrik agregat dari `DATABARANG`, `BARANGMASUK`, dan `BARANGKELUAR`. Menyalin data stok menipis dari `DATABARANG!K4:Q` ke kontrol ListBox menu.
2. **`FORMBARANG` $\leftrightarrow$ `DATABARANG` $\leftrightarrow$ `CARIBARANG`**: Form membaca dan menulis master barang di `DATABARANG`. Operasi pencarian live mengekstrak kriteria ke `CARIBARANG` dan mengalirkan hasilnya kembali ke ListBox formulir.
3. **`FORMBARANGMASUK` $\leftrightarrow$ `BARANGMASUK` $\leftrightarrow$ `DATABARANG` $\leftrightarrow$ `CARIMASUK`**: Form mengambil daftar ID Barang dari `DATABARANG`, menulis log transaksi ke `BARANGMASUK`, memperbarui angka saldo stok di `DATABARANG`, serta menggunakan `CARIMASUK` untuk pencarian dan cetak laporan.
4. **`FORMBARANGKELUAR` $\leftrightarrow$ `BARANGKELUAR` $\leftrightarrow$ `DATABARANG` $\leftrightarrow$ `CARIKELUAR`**: Form mengambil ID Barang dari `DATABARANG`, menulis transaksi distribusi ke `BARANGKELUAR`, memotong stok di `DATABARANG`, serta menggunakan `CARIKELUAR` untuk pencarian dan cetak laporan.
5. **`TERIMA NEW` $\leftrightarrow$ `BARANGKELUAR`**: Sheet `TERIMA NEW` bertindak sebagai *view/report engine* yang menarik baris-baris mutasi pengeluaran barang dari `BARANGKELUAR` untuk disajikan ke dalam format Berita Acara resmi.

---

## 8. Workflow Sistem Lengkap (End-to-End)

```
[Mulai]
   |
   v
[Buka SIPBAR.xlsm] ---> [Dasbor MENU Utama Tampil]
                           |
       +-------------------+-------------------+-------------------+
       |                   |                   |                   |
       v                   v                   v                   v
[Klik 'Data Barang']  [Klik 'Barang Masuk'] [Klik 'Barang Keluar'] [Buka 'TERIMA NEW']
       |                   |                   |                   |
       v                   v                   v                   v
(Buka FORMBARANG)   (FORMBARANGMASUK)   (FORMBARANGKELUAR)  (Input No Transaksi di Kolom I)
       |                   |                   |                   |
       v                   v                   v                   v
[Generate Auto-ID]  [Generate Auto-ID]  [Generate Auto-ID]  [VLOOKUP Tarik Detail Otomatis]
       |                   |                   |                   |
       v                   v                   v                   v
[Simpan Master]     [Update Stok (+)]   [Update Stok (-)]   [Cetak Lembar Tanda Terima]
       |                   |                   |                   |
       +-------------------+-------------------+                   v
                           |                         [Tanda Tangan Penerima & Kasubbag]
                           v
              [Kembali ke Dasbor MENU]
                           |
                           v
              [Klik 'Update Data' Stok Rendah]
                           |
                           v
              [Klik 'Simpan' & 'Keluar'] ---> [Selesai]
```

---

## 9. Dasbor dan Laporan

### A. Dasbor Eksekutif (`MENU`)
* **Metrik Total Persediaan**: Menampilkan varian item aktif (316 item) dan total saldo fisik seluruh gudang.
* **Metrik Alokasi Gudang**: Memisahkan stok secara spesifik untuk Gudang 1, Gudang 2 (489 unit), dan Gudang 3.
* **Monitoring Stok Kritis**: Menampilkan tabel barang yang perlu dilakukan pemesanan ulang.

### B. Laporan Mutasi Barang Masuk (`CARIMASUK`)
* Menyajikan rekapitulasi pengadaan barang berdasarkan periode tanggal tertentu lengkap dengan harga perolehan barang.

### C. Laporan Mutasi Barang Keluar (`CARIKELUAR`)
* Menyajikan rekapitulasi distribusi logistik ke seluruh seksi kerja di BPS Jeneponto.

### D. Dokumen Tanda Terima Pengeluaran Barang (`TERIMA NEW`)
* Lembar formal berlogo BPS (`image16.png`) yang memuat rincian penyerahan barang dan kolom otorisasi resmi:
  * **Pihak Penerima**: Nama dan tanda tangan pegawai peminta.
  * **Pihak Pengesah**: *An. Kepala BPS Kabupaten Jeneponto, Kepala Subbagian Umum (Imaniar Dwi Aryanti, S.TP)*.

---

## 10. Validasi dan Otomatisasi

1. **State Management Tombol Form**: Mengunci tombol `Simpan`, `Ubah`, `Hapus` saat form pertama kali dibuka dan mengaktifkannya sesuai alur kerja yang valid.
2. **Validasi Mandatori Field**: Memeriksa kelengkapan pengisian kolom form sebelum transaksi disimpan ke basis data.
3. **Pencegahan Human Error Hapus Data**: Kotak dialog konfirmasi `MsgBox (vbYesNo)` wajib dikonfirmasi pengguna sebelum baris data dihapus.
4. **Auto-Increment Generator**: Algoritma penomoran ID otomatis berbasis fungsi `LEN` counter untuk menjaga konsistensi format kode.
5. **Conditional Formatting Garis Tabel**: Formula `=$A10<>""` secara otomatis membingkai baris dokumen tanda terima yang memiliki isi data.

---

## 11. Arsitektur Makro dan Kode VBA

Proyek VBA pada `SIPBAR.xlsm` terdiri atas:
* **`Module1.bas`**: Modul prosedur umum untuk memanggil form (`BukaDataBarang`, `BarangMasuk`, `BarangKeluar`, `TandaTerima`), menjalankan filter stok kritis (`UpdateDataBArang`), serta menyimpan/menutup workbook (`SimpanData`, `Keluar`).
* **`Module2.bas`**: Prosedur navigasi `Picture2_Click` untuk kembali ke sheet menu utama (`Sheet1.Select`).
* **`FORMBARANG.frm`**: Formulir master barang lengkap dengan prosedur CRUD, pencarian live `TXTCARI_Change`, serta pengisian dropdown jenis/satuan/gudang.
* **`FORMBARANGMASUK.frm`**: Formulir transaksi masuk dengan prosedur kalkulasi stok live `TXTMASUK_Change`, pencarian periode tanggal `CMDCARI_Click`, dan pratinjau cetak `CMDCETAK_Click`.
* **`FORMBARANGKELUAR.frm`**: Formulir transaksi keluar dengan kalkulasi sisa stok `TXTKELUAR_Change`, daftar 35 pegawai penerima, 9 unit kerja fungsi, dan pencetakan laporan keluar.

---

## 12. Navigasi dan Interaksi Pengguna

* **Navigasi Tombol Dasbor**: Tombol shape interaktif pada menu utama langsung menampilkan form yang dituju tanpa membuat pengguna berpindah antar-sheet secara manual.
* **Interaksi Klik Tabel ListBox**:
  * *Single Click* $\rightarrow$ Memilih baris data untuk mode Hapus Data (`CMDDELETE`).
  * *Double Click* $\rightarrow$ Memilih dan menyalin seluruh field baris ke kotak input untuk mode Ubah Data (`CMDUPDATE`).
* **Pencarian Real-Time**: Cukup mengetik pada textbox pencarian, daftar tabel di form langsung menyesuaikan tanpa perlu menekan tombol submit.

---

## 13. Temuan Masalah dan Potensi Error (Audit Teknis)

1. **UserForm `FORMTANDATERIMA` Hilang (*Critical Error*)**:
   * Tombol "Tanda Terima" di sheet `MENU` memanggil makro `TandaTerima` yang mengeksekusi `FORMTANDATERIMA.Show`. Karena form tersebut tidak ada dalam proyek VBA, klik pada tombol ini akan menghasilkan *Runtime Error 424 (Object Required)*.
2. **Statistik Hardcoded pada Menu Utama**:
   * Nilai transaksi masuk di `MENU!AA11` (`77`) dan kuantitas masuk di `MENU!AA12` (`911`) diketik manual sebagai angka mati, sehingga angka tersebut tidak akan pernah bertambah saat ada transaksi baru.
3. **Typo Pesan Konfirmasi Cetak Form Barang Keluar**:
   * Tombol cetak di `FORMBARANGKELUAR` memunculkan konfirmasi bertuliskan *"Anda akan mencetak laporan barang masuk"*, yang merupakan kekeliruan teks salinan dari form barang masuk.
4. **Kriteria Filter Stok Menipis Kosong**:
   * Sel kriteria `DATABARANG!I4` tidak memiliki nilai pembatas (misal: `<=0` atau `<=5`), sehingga tombol `Update Data` di menu utama menyalin seluruh master barang ke dasbor.
5. **Inkonsistensi Helper LEN pada `BARANGMASUK`**:
   * Sel `BARANGMASUK!K2` bernilai angka statis `3` (bukan rumus `=LEN($K$3)`), berpotensi menyebabkan ketidaksesuaian penomoran jika transaksi melampaui 999 baris.
6. **Parameter `TRUE` pada Formula VLOOKUP Tanda Terima**:
   * Rumus VLOOKUP di sheet `TERIMA NEW` menggunakan parameter pencocokan perkiraan (`TRUE`). Jika data nomor baris tidak terurut strictly ascending, VLOOKUP dapat mengambil nama barang yang keliru.
7. **Saldo Stok Disimpan Sebagai Nilai Statis**:
   * Stok di `DATABARANG!G` dimutasi lewat VBA. Jika staf BPS mengedit transaksi langsung pada sheet Excel tanpa melalui form, saldo stok master tidak akan sinkron dengan mutasi riil.

---

## 14. Rekomendasi Solusi Teknis Perbaikan

1. **Koreksi Makro Tanda Terima**: Ubah prosedur `TandaTerima` pada `Module1.bas` agar langsung memilih dan menampilkan sheet `TERIMA NEW`:
   ```vba
   Sub TandaTerima()
       Sheets("TERIMA NEW").Select
   End Sub
   ```
2. **Dinamisasi Sel Dasbor Barang Masuk**: Ganti isi sel `MENU!AA11` dengan `=COUNTA(BARANGMASUK!$B$4:$B$69987)` dan sel `MENU!AA12` dengan `=SUM(BARANGMASUK!$I$4:$I$69987)`.
3. **Koreksi Typo Form Barang Keluar**: Edit teks dialog pada `FORMBARANGKELUAR.frm` menjadi *"Anda akan mencetak laporan barang keluar"*.
4. **Pengisian Kriteria Stok Kritis**: Isi sel `DATABARANG!I4` dengan kriteria `<=5` agar dasbor benar-benar menyaring barang yang stoknya menipis.
5. **Koreksi VLOOKUP Exact Match**: Ubah seluruh rumus lookup di `TERIMA NEW` dari parameter `TRUE` menjadi `FALSE` (contoh: `=VLOOKUP(I10, BARANGKELUAR!$A$3:$I$1048576, 5, FALSE)`).
6. **Koreksi Helper LEN Masuk**: Ubah sel `BARANGMASUK!K2` menjadi formula `=LEN($K$3)`.

---

## 15. Kesimpulan Cara Kerja SIPBAR Secara Keseluruhan

**SIPBAR** merupakan aplikasi inventaris persediaan berbasis Excel-VBA yang dirancang secara efektif dan tepat guna untuk kebutuhan operasional **BPS Kabupaten Jeneponto**.

Sistem ini berhasil mengabstraksi kerumitan pengelolaan lembar kerja spreadsheet melalui antarmuka formulir pengguna (*UserForms*) yang ramah pengguna. Aliran data berjalan secara teratur mulai dari pendataan katalog master barang, pencatatan transaksi masuk (yang otomatis menambah stok), pencatatan transaksi keluar (yang otomatis memotong stok dan mencatat identitas penerima/seksi), hingga penyusunan lembar pertanggungjawaban penyerahan barang (*Tanda Terima*) siap cetak.

Dengan mengaplikasikan beberapa poin rekomendasi perbaikan teknis pada formula dasbor, parameter VLOOKUP, dan penyelarasan makro tombol tanda terima, aplikasi SIPBAR akan menjadi sistem informasi persediaan yang sangat andal, akurat, dan bebas dari potensi galat operasional.
