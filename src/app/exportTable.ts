import * as XLSX from "xlsx";

export class exportTable {
  static exportToExcel(tableId: string, name?: string) {
    let timeSpan = new Date().toISOString();
    let getFullDay = timeSpan.split('T');
    // let prefix = name || "downLoadedFile";
    let prefix = name;
    let fileName = `${prefix}_${getFullDay[0]}`;
    let targetTableElm = document.getElementById(tableId);
    let wb = XLSX.utils.table_to_book(targetTableElm, <XLSX.Table2SheetOpts>{ sheet: prefix });
    XLSX.writeFile(wb, `${fileName}.csv`);
  }
}