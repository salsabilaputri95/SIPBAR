# PANDUAN DEPLOYMENT & OPERASIONAL SERVER (DEPLOYMENT_GUIDE.MD)

# SIPBAR WEB — SISTEM INFORMASI PERSEDIAAN BARANG

**Badan Pusat Statistik (BPS) Kabupaten Jeneponto**
*Panduan Lengkap Pemasangan di Server Ubuntu Kantor & Akses Publik Ngrok*

---

## 1. IKHTISAR SISTEM & PRASYARAT SERVER

Aplikasi **SIPBAR Web** dirancang untuk beroperasi secara *on-premise* di server kantor BPS Kabupaten Jeneponto dengan container Docker yang aman, ringan, dan mandiri.

### Spesifikasi Minimum Komputer Server:

- **Sistem Operasi**: Ubuntu Server 22.04 LTS / 24.04 LTS (atau varian Linux lainnya).
- **CPU**: 2 Cores / 4 Threads (Intel Core i3 / AMD Ryzen 3 atau lebih tinggi).
- **RAM**: Minimum 4 GB (Disarankan 8 GB).
- **Penyimpanan**: 20 GB SSD / HDD ruang bebas.
- **Jaringan**: Terhubung ke Jaringan LAN Kantor BPS Jeneponto (IP Statis lokal, misal `192.168.1.100`) dan memiliki koneksi internet.

---

## 2. INSTALASI DOCKER & DOCKER COMPOSE DI UBUNTU

Jalankan perintah berikut di terminal server Ubuntu:

```bash
# 1. Update package index
sudo apt update && sudo apt upgrade -y

# 2. Install package pendukung
sudo apt install -y curl apt-transport-https ca-certificates gnupg lsb-release

# 3. Tambahkan kunci GPG resmi Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. Tambahkan repository Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Pasang Docker Engine dan Docker Compose Plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 6. Izinkan user menjalankan docker tanpa sudo (opsional)
sudo usermod -aG docker $USER
newgrp docker
```

---

## 3. CLONE REPOSITORI & KONFIGURASI ENVIRONMENT

1. Clone repositori ke direktori kerja server:

   ```bash
   cd /opt
   sudo git clone <URL_REPO_SIPBAR> sipbar
   cd /opt/sipbar
   ```
2. Buat file variabel lingkungan produksi `.env`:

   ```bash
   cp .env.example .env
   ```

   Sesuaikan parameter berikut pada berkas `.env`:

   ```env
   # Basis Data PostgreSQL
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=BpsJeneponto7304Secure!
   POSTGRES_DB=sipbardb

   DATABASE_URL="postgresql://postgres:BpsJeneponto7304Secure!@postgres:5432/sipbardb?schema=public"

   # Autentikasi NextAuth.js
   # Isi dengan IP server lokal atau domain Ngrok publik
   NEXTAUTH_URL="http://192.168.1.100:3000"
   NEXTAUTH_SECRET="f9b4c6e2a87d4130b91e7c53d2e0f81a7b4c9e2d5f8a1b3c6e9d2f5a8b1c4e7"

   TZ="Asia/Makassar"
   ```

---

## 4. MENJALANKAN CONTAINER PRODUKSI

1. **Build dan Jalankan Container via Docker Compose**:

   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```
2. **Jalankan Migrasi & Seeding Data Awal ke Database Container**:

   ```bash
   # Jalankan migrasi schema Prisma
   docker compose -f docker-compose.prod.yml exec web npx prisma migrate deploy

   # Eksekusi seeder master data & migrasi Excel
   docker compose -f docker-compose.prod.yml exec web node scripts/import-full-excel.mjs
   ```
3. **Verifikasi Status Container**:

   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

   *Pastikan container `sipbar_prod_db` berstatus `healthy` dan `sipbar_prod_app` berstatus `running`.*

---

## 5. KONFIGURASI NGROK SEBAGAI BACKGROUND SYSTEMD SERVICE

Agar aplikasi SIPBAR Web dapat diakses oleh pegawai dari luar kantor via HTTPS tanpa perlu IP publik statis:

1. **Unduh dan Pasang Ngrok di Ubuntu**:

   ```bash
   curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
   echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
   sudo apt update && sudo apt install ngrok
   ```
2. **Tambahkan Authtoken Akun Ngrok BPS**:

   ```bash
   ngrok config add-authtoken <YOUR_NGROK_AUTHTOKEN>
   ```
3. **Buat Systemd Service untuk Autostart Ngrok**:

   ```bash
   sudo nano /etc/systemd/system/sipbar-ngrok.service
   ```

   Isi file dengan konfigurasi berikut:

   ```ini
   [Unit]
   Description=SIPBAR Web Ngrok Tunneling Service
   After=network.target docker.service

   [Service]
   Type=simple
   User=root
   ExecStart=/usr/local/bin/ngrok http 3000 --log=stdout
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```
4. **Aktifkan dan Jalankan Service Ngrok**:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable sipbar-ngrok.service
   sudo systemctl start sipbar-ngrok.service
   ```
5. **Lihat URL Publik Aktif**:

   ```bash
   curl -s http://127.0.0.1:4040/api/tunnels | grep -o "https://[a-zA-Z0-9.-]*.ngrok-free.app"
   ```

---

## 6. JADWAL BACKUP OTOMATIS BASIS DATA (CRON JOB)

Untuk menjamin keamanan data persediaan, buat skrip pencadangan otomatis harian:

1. **Buat Skrip Backup `backup-db.sh`**:

   ```bash
   sudo mkdir -p /var/backups/sipbar
   sudo nano /opt/sipbar/scripts/backup-db.sh
   ```

   Isi skrip:

   ```bash
   #!/bin/bash
   BACKUP_DIR="/var/backups/sipbar"
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   FILENAME="sipbar_backup_${TIMESTAMP}.sql.gz"

   docker exec sipbar_prod_db pg_dump -U postgres sipbardb | gzip > "${BACKUP_DIR}/${FILENAME}"

   # Hapus backup yang lebih tua dari 30 hari
   find ${BACKUP_DIR} -type f -name "*.sql.gz" -mtime +30 -delete
   ```
2. **Beri Izin Eksekusi & Tambahkan ke Crontab**:

   ```bash
   sudo chmod +x /opt/sipbar/scripts/backup-db.sh
   sudo crontab -e
   ```

   Tambahkan baris berikut untuk backup otomatis setiap hari pukul 23:00 WITA:

   ```cron
   0 23 * * * /opt/sipbar/scripts/backup-db.sh >> /var/log/sipbar-backup.log 2>&1
   ```

---

## 7. PROSEDUR UPDATE APLIKASI DI MASA DEPAN

Jika ada pembaruan kode di repositori Git:

```bash
cd /opt/sipbar
git pull origin main
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml exec web npx prisma migrate deploy
```

---

## 8. AKUN PENGGUNA DEFAULT BPS JENEPONTO

| Peran (Role)           | Username        | Password Default  | Hak Akses                                                                 |
| :--------------------- | :-------------- | :---------------- | :------------------------------------------------------------------------ |
| **Super Admin**  | `superadmin`  | `superadmin123` | Akses Penuh Sistem, Manajemen User & Konfigurasi                          |
| **Admin Gudang** | `admingudang` | `admin123`      | Pengelolaan Master Barang, Transaksi Masuk, Keluar, Tanda Terima, Laporan |
| **Pegawai BPS**  | `pegawai`     | `pegawai123`    | Pencarian Katalog Stok Mandiri (Read-Only)                                |

---

**Badan Pusat Statistik Kabupaten Jeneponto — Melayani dengan Integritas dan Data Berkualitas**
