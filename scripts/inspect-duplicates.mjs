import fs from "fs";
import path from "path";

const dataDir = path.resolve(process.cwd(), "data");
const masuk = JSON.parse(fs.readFileSync(path.join(dataDir, "transaksi-masuk.json"), "utf8"));

const codeCounts = {};
for (const m of masuk) {
  codeCounts[m.kodeTransaksi] = (codeCounts[m.kodeTransaksi] || 0) + 1;
}

const dupCodes = Object.keys(codeCounts).filter(k => codeCounts[k] > 1);
console.log("Duplicate codes:", dupCodes);

for (const code of dupCodes) {
  console.log(`\n--- Code: ${code} (${codeCounts[code]} occurrences) ---`);
  const occ = masuk.filter(m => m.kodeTransaksi === code);
  for (const o of occ) {
    console.log(` Row ${o.rowNumber}: date=${o.tanggal}, item=${o.kodeBarang} (${o.namaBarang}), qty=${o.jumlah}`);
  }
}
