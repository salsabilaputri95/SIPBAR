import fs from "fs";
import path from "path";

const dataDir = path.resolve(process.cwd(), "data");
const masterBarang = JSON.parse(fs.readFileSync(path.join(dataDir, "master-barang.json"), "utf8"));
const transaksiMasuk = JSON.parse(fs.readFileSync(path.join(dataDir, "transaksi-masuk.json"), "utf8"));
const transaksiKeluar = JSON.parse(fs.readFileSync(path.join(dataDir, "transaksi-keluar.json"), "utf8"));

console.log("=== DATA COUNTS ===");
console.log(`Master Barang count: ${masterBarang.length}`);
console.log(`Transaksi Masuk count: ${transaksiMasuk.length}`);
console.log(`Transaksi Keluar count: ${transaksiKeluar.length}`);

// Check Master Categories, Satuans, Gudangs
const categories = new Set(masterBarang.map(b => b.kategori));
const satuans = new Set(masterBarang.map(b => b.satuan));
const gudangs = new Set(masterBarang.map(b => b.gudang));
const fungsis = new Set(transaksiKeluar.map(k => k.fungsi));
const penerimas = new Set(transaksiKeluar.map(k => k.penerima));

console.log("\n=== MASTER METADATA ===");
console.log("Categories in Master:", Array.from(categories).sort());
console.log("Satuans in Master:", Array.from(satuans).sort());
console.log("Gudangs in Master:", Array.from(gudangs).sort());
console.log("Fungsi in Keluar:", Array.from(fungsis).sort());
console.log("Unique Penerima count:", penerimas.size);

// Check Referential Integrity
const masterCodes = new Set(masterBarang.map(b => b.kode));

const orphanMasuk = transaksiMasuk.filter(m => !masterCodes.has(m.kodeBarang));
console.log(`\nMasuk transactions with unknown kodeBarang: ${orphanMasuk.length}`);
if (orphanMasuk.length > 0) {
  console.log("Orphan Masuk samples:", orphanMasuk.slice(0, 5));
}

const orphanKeluar = transaksiKeluar.filter(k => !masterCodes.has(k.kodeBarang));
console.log(`Keluar transactions with unknown kodeBarang: ${orphanKeluar.length}`);
if (orphanKeluar.length > 0) {
  console.log("Orphan Keluar samples:", orphanKeluar.slice(0, 5));
}

// Check Stock Reconciliation
const stockMap = new Map();
for (const b of masterBarang) {
  stockMap.set(b.kode, {
    kode: b.kode,
    nama: b.nama,
    gudang: b.gudang,
    excelStok: b.stok,
    totalMasuk: 0,
    totalKeluar: 0,
    calculatedStok: 0,
  });
}

for (const m of transaksiMasuk) {
  if (stockMap.has(m.kodeBarang)) {
    stockMap.get(m.kodeBarang).totalMasuk += m.jumlah;
  }
}

for (const k of transaksiKeluar) {
  if (stockMap.has(k.kodeBarang)) {
    stockMap.get(k.kodeBarang).totalKeluar += k.jumlah;
  }
}

let totalExcelStok = 0;
let totalCalculatedStok = 0;
let totalMasukQty = 0;
let totalKeluarQty = 0;
let diffCount = 0;

const gudangTotals = {};

for (const [kode, item] of stockMap.entries()) {
  item.calculatedStok = item.totalMasuk - item.totalKeluar;
  totalExcelStok += item.excelStok;
  totalCalculatedStok += item.calculatedStok;
  totalMasukQty += item.totalMasuk;
  totalKeluarQty += item.totalKeluar;

  const g = item.gudang || "Unknown";
  gudangTotals[g] = (gudangTotals[g] || 0) + item.excelStok;

  if (item.excelStok !== item.calculatedStok) {
    diffCount++;
    if (diffCount <= 10) {
      console.log(`Diff on ${kode} (${item.nama}): Excel=${item.excelStok}, Calc=${item.calculatedStok} (Masuk=${item.totalMasuk}, Keluar=${item.totalKeluar})`);
    }
  }
}

console.log("\n=== RECONCILIATION SUMMARY ===");
console.log(`Total Masuk Qty: ${totalMasukQty}`);
console.log(`Total Keluar Qty: ${totalKeluarQty}`);
console.log(`Total Excel Stock: ${totalExcelStok}`);
console.log(`Total Calculated Stock (Masuk - Keluar): ${totalCalculatedStok}`);
console.log(`Items with diff between Excel and Calc: ${diffCount} / ${masterBarang.length}`);
console.log("Stock breakdown by Gudang (Excel):", gudangTotals);
