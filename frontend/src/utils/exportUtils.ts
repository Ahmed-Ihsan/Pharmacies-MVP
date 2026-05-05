import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export interface ExportData {
  [key: string]: any;
}

export function exportToCSV(data: ExportData[], filename: string) {
  const csv = Papa.unparse(data, {
    delimiter: ',',
    header: true,
  });
  
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
}

export function exportToJSON(data: ExportData[], filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  saveAs(blob, `${filename}.json`);
}
