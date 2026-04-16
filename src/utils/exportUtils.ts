import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { message } from 'antd';

// ─── Generic PDF ──────────────────────────────────────────────────────────────
export function downloadPDF(params: {
  filename: string;
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  summary?: { label: string; value: string }[];
}) {
  const { filename, title, subtitle, headers, rows, summary } = params;
  const doc = new jsPDF();
  const now = new Date().toLocaleString();

  // Header bar
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`SwiftPOS — ${title}`, 14, 16);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle ?? `Generated: ${now}`, 14, 24);

  doc.setTextColor(0, 0, 0);
  let startY = 36;

  // Optional summary cards
  if (summary && summary.length > 0) {
    const boxW = (210 - 28 - (summary.length - 1) * 4) / summary.length;
    summary.forEach((s, i) => {
      const x = 14 + i * (boxW + 4);
      doc.setFillColor(248, 249, 255);
      doc.roundedRect(x, startY, boxW, 16, 2, 2, 'F');
      doc.setFontSize(7);
      doc.setTextColor(120);
      doc.text(s.label, x + 4, startY + 6);
      doc.setFontSize(9);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text(s.value, x + 4, startY + 13);
      doc.setFont('helvetica', 'normal');
    });
    startY += 22;
  }

  autoTable(doc, {
    startY,
    head: [headers],
    body: rows,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 255] },
    margin: { left: 14, right: 14 },
  });

  // Page numbers
  const pages = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(170);
    doc.text(`Page ${i} of ${pages} · SwiftPOS`, 14, 290);
    doc.text(now, 180, 290, { align: 'right' });
  }

  doc.save(filename);
  message.success('PDF downloaded');
}

// ─── Generic Excel ────────────────────────────────────────────────────────────
export function downloadExcel(params: {
  filename: string;
  sheetName: string;
  headers: string[];
  rows: (string | number)[][];
  colWidths?: number[];
}) {
  const { filename, sheetName, headers, rows, colWidths } = params;
  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Style header row bold (limited support in community xlsx)
  if (colWidths) {
    ws['!cols'] = colWidths.map((w) => ({ wch: w }));
  }

  // Freeze top row
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
  message.success('Excel downloaded');
}
