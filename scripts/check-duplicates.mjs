import fs from "fs";
import path from "path";

const dataDir = path.resolve(process.cwd(), "data");
const masuk = JSON.parse(fs.readFileSync(path.join(dataDir, "transaksi-masuk.json"), "utf8"));
const keluar = JSON.parse(fs.readFileSync(path.join(dataDir, "transaksi-keluar.json"), "utf8"));

const masukCodes = new Set();
const duplicateMasuk = [];
for (const m of masuk) {
  if (masukCodes.has(m.kodeTransaksi)) {
    duplicateMasuk.push(m);
  }
  masukCodes.add(m.kodeTransaksi);
}

const keluarCodes = new Set();
const duplicateKeluar = [];
for (const k of keluar) {
  if (keluarCodes.has(k.kodeTransaksi)) {
    duplicateKeluar.push(k);
  }
  keluarCodes.add(k.kodeTransaksi);
}

console.log(`Duplicate Masuk codes count: ${duplicateMasuk.length}`);
if (duplicateMasuk.length > 0) {
  console.log("Duplicate Masuk samples:", duplicateMasuk.slice(0, 5));
}

console.log(`Duplicate Keluar codes count: ${duplicateKeluar.length}`);
if (duplicateKeluar.length > 0) {
  console.log("Duplicate Keluar samples:", duplicateKeluar.slice(0, 5));
}
