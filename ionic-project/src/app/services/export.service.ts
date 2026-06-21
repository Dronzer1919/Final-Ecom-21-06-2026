import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  dataKey: string;
  width?: number;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportToPDF(data: any[], columns: ExportColumn[], fileName: string, title?: string): void {
    try {
      const orientation = columns.length >= 6 ? 'landscape' : 'portrait';
      const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
      if (title) { doc.setFontSize(16); doc.text(title, 14, 15); }
      const tableData = data.map(item => columns.map(col => this.getNestedValue(item, col.dataKey)));
      const fontSize = columns.length > 8 ? 7 : columns.length > 6 ? 8 : 9;
      const cellPadding = columns.length > 8 ? 2 : 3;
      autoTable(doc, {
        head: [columns.map(col => col.header)],
        body: tableData,
        startY: title ? 25 : 10,
        styles: { fontSize, cellPadding, overflow: 'linebreak', cellWidth: 'wrap', minCellHeight: 8, halign: 'left', valign: 'middle' },
        headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        tableWidth: 'auto',
        margin: { top: 10, left: 10, right: 10, bottom: 10 },
        horizontalPageBreak: true,
        horizontalPageBreakRepeat: 0,
      });
      doc.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  }

  exportToExcel(data: any[], columns: ExportColumn[], fileName: string, sheetName: string = 'Sheet1'): void {
    try {
      const exportData = data.map(item => {
        const row: any = {};
        columns.forEach(col => { row[col.header] = this.getNestedValue(item, col.dataKey); });
        return row;
      });
      const ws = XLSX.utils.json_to_sheet(exportData);
      ws['!cols'] = columns.map(col => ({ wch: col.width || 15 }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export Excel. Please try again.');
    }
  }

  private getNestedValue(obj: any, path: string): any {
    if (!obj) return 'N/A';
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) { value = value[key]; }
      else { return 'N/A'; }
    }
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Active' : 'Inactive';
    if (value instanceof Date) return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
  }
}
