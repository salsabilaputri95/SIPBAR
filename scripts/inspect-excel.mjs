import ExcelJS from "exceljs";
import path from "path";

async function main() {
  const filePath = path.resolve(process.cwd(), "SIPBAR.xlsm");
  console.log("Loading workbook:", filePath);
  
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  console.log("Sheets found:", workbook.worksheets.map(ws => ws.name));
  
  for (const sheet of workbook.worksheets) {
    console.log(`Sheet "${sheet.name}": rowCount=${sheet.rowCount}, actualRowCount=${sheet.actualRowCount}, columnCount=${sheet.columnCount}`);
  }
}

main().catch(err => {
  console.error("Error reading Excel:", err);
});
