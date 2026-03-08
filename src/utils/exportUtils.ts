import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActionItem } from '../types/actionPlan';

const EXPORT_COLUMNS: { key: keyof ActionItem; label: string }[] = [
  { key: 'id', label: '#' },
  { key: 'plannedActions', label: 'Planned Action' },
  { key: 'dashboardOwner', label: 'Dashboard Owner' },
  { key: 'update', label: 'Status' },
  { key: 'ecd', label: 'ECD' },
  { key: 'priority', label: 'Priority' },
  { key: 'areaOfImprovement', label: 'Area of Improvement' },
  { key: 'remarks', label: 'Remarks' },
];

export function exportToExcel(tasks: ActionItem[], filename = 'action-plan-report') {
  const rows = tasks.map(t => Object.fromEntries(EXPORT_COLUMNS.map(c => [c.label, t[c.key]])));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Action Plan');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPDF(tasks: ActionItem[], title = 'Action Plan Report') {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleDateString('en-GB')} · ${tasks.length} tasks`, 14, 25);

  autoTable(doc, {
    startY: 30,
    head: [EXPORT_COLUMNS.map(c => c.label)],
    body: tasks.map(t => EXPORT_COLUMNS.map(c => String(t[c.key] || ''))),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], fontSize: 7 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: { 1: { cellWidth: 60 }, 7: { cellWidth: 40 } },
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}
