import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

async function main() {
  const filePath = path.resolve(process.cwd(), "SIPBAR.xlsm");
  console.log("Reading workbook:", filePath);
  
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const outputDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. DATABARANG
  const wsBarang = workbook.getWorksheet("DATABARANG");
  const barangList = [];
  
  // Let's check header row
  const barangHeaders = [];
  wsBarang.getRow(3).eachCell((cell, colNumber) => {
    barangHeaders.push({ col: colNumber, val: cell.text });
  });
  console.log("DATABARANG Headers (Row 3):", barangHeaders);

  // Rows start at row 4
  wsBarang.eachRow((row, rowNumber) => {
    if (rowNumber <= 3) return;
    const kode = row.getCell(2).text?.trim(); // Col B: ID Barang
    const nama = row.getCell(3).text?.trim(); // Col C: Nama Barang
    const kategori = row.getCell(4).text?.trim(); // Col D: Jenis Barang
    const satuan = row.getCell(5).text?.trim(); // Col E: Satuan
    const gudang = row.getCell(6).text?.trim(); // Col F: Gudang
    const stokRaw = row.getCell(7).value; // Col G: Stok

    if (kode && kode.startsWith("ID-")) {
      const stok = typeof stokRaw === "number" ? stokRaw : parseInt(row.getCell(7).text || "0", 10) || 0;
      barangList.push({
        rowNumber,
        kode,
        nama,
        kategori,
        satuan,
        gudang,
        stok,
      });
    }
  });

  console.log(`Extracted ${barangList.length} items from DATABARANG.`);

  // 2. BARANGMASUK
  const wsMasuk = workbook.getWorksheet("BARANGMASUK");
  const masukHeaders = [];
  wsMasuk.getRow(3).eachCell((cell, colNumber) => {
    masukHeaders.push({ col: colNumber, val: cell.text });
  });
  console.log("BARANGMASUK Headers (Row 3):", masukHeaders);

  const masukList = [];
  wsMasuk.eachRow((row, rowNumber) => {
    if (rowNumber <= 3) return;
    const kodeTransaksi = row.getCell(2).text?.trim(); // Col B: ID Transaksi
    const tanggalRaw = row.getCell(3).value; // Col C: Tanggal
    const kodeBarang = row.getCell(4).text?.trim(); // Col D: ID Barang
    const namaBarang = row.getCell(5).text?.trim(); // Col E: Nama Barang
    const satuan = row.getCell(6).text?.trim(); // Col F: Satuan
    const hargaRaw = row.getCell(7).value; // Col G: Harga
    const gudang = row.getCell(8).text?.trim(); // Col H: Gudang
    const jumlahRaw = row.getCell(9).value; // Col I: Jumlah Masuk

    if (kodeTransaksi && (kodeTransaksi.startsWith("BM-") || kodeTransaksi.startsWith("ID-") || kodeBarang)) {
      let tanggalStr = "";
      if (tanggalRaw instanceof Date) {
        tanggalStr = tanggalRaw.toISOString();
      } else if (typeof tanggalRaw === "string") {
        tanggalStr = tanggalRaw;
      } else {
        tanggalStr = row.getCell(3).text?.trim() || "";
      }

      const harga = typeof hargaRaw === "number" ? hargaRaw : parseFloat(row.getCell(7).text?.replace(/[^0-9.-]+/g, "") || "0") || 0;
      const jumlah = typeof jumlahRaw === "number" ? jumlahRaw : parseInt(row.getCell(9).text || "0", 10) || 0;

      masukList.push({
        rowNumber,
        kodeTransaksi,
        tanggal: tanggalStr,
        kodeBarang,
        namaBarang,
        satuan,
        harga,
        gudang,
        jumlah,
      });
    }
  });

  console.log(`Extracted ${masukList.length} transactions from BARANGMASUK.`);

  // 3. BARANGKELUAR
  const wsKeluar = workbook.getWorksheet("BARANGKELUAR");
  const keluarHeaders = [];
  wsKeluar.getRow(3).eachCell((cell, colNumber) => {
    keluarHeaders.push({ col: colNumber, val: cell.text });
  });
  console.log("BARANGKELUAR Headers (Row 3):", keluarHeaders);

  const keluarList = [];
  wsKeluar.eachRow((row, rowNumber) => {
    if (rowNumber <= 3) return;
    const noUrutRaw = row.getCell(1).value; // Col A: No Urut
    const kodeTransaksi = row.getCell(2).text?.trim(); // Col B: ID Transaksi
    const tanggalRaw = row.getCell(3).value; // Col C: Tanggal
    const kodeBarang = row.getCell(4).text?.trim(); // Col D: ID Barang
    const namaBarang = row.getCell(5).text?.trim(); // Col E: Nama Barang
    const satuan = row.getCell(6).text?.trim(); // Col F: Satuan
    const gudang = row.getCell(7).text?.trim(); // Col G: Gudang
    const jumlahRaw = row.getCell(8).value; // Col H: Jumlah Keluar
    const penerima = row.getCell(9).text?.trim(); // Col I: Penerima
    const fungsi = row.getCell(10).text?.trim(); // Col J: Fungsi

    if (kodeTransaksi && (kodeTransaksi.startsWith("BK-") || kodeBarang)) {
      let tanggalStr = "";
      if (tanggalRaw instanceof Date) {
        tanggalStr = tanggalRaw.toISOString();
      } else if (typeof tanggalRaw === "string") {
        tanggalStr = tanggalRaw;
      } else {
        tanggalStr = row.getCell(3).text?.trim() || "";
      }

      const noUrut = typeof noUrutRaw === "number" ? noUrutRaw : parseInt(row.getCell(1).text || "0", 10) || 0;
      const jumlah = typeof jumlahRaw === "number" ? jumlahRaw : parseInt(row.getCell(8).text || "0", 10) || 0;

      keluarList.push({
        rowNumber,
        noUrut,
        kodeTransaksi,
        tanggal: tanggalStr,
        kodeBarang,
        namaBarang,
        satuan,
        gudang,
        jumlah,
        penerima,
        fungsi,
      });
    }
  });

  console.log(`Extracted ${keluarList.length} transactions from BARANGKELUAR.`);

  // Save to JSON
  fs.writeFileSync(path.join(outputDir, "master-barang.json"), JSON.stringify(barangList, null, 2), "utf8");
  fs.writeFileSync(path.join(outputDir, "transaksi-masuk.json"), JSON.stringify(masukList, null, 2), "utf8");
  fs.writeFileSync(path.join(outputDir, "transaksi-keluar.json"), JSON.stringify(keluarList, null, 2), "utf8");

  console.log("JSON export complete in data/ directory.");
}

main().catch(console.error);
