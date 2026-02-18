import * as XLSX from 'xlsx';
import { ActionItem } from '../types/actionPlan';

const STORAGE_KEY = 'hassantuk_action_plan_data';
const PHOTOS_KEY = 'hassantuk_owner_photos';

export function parseExcelFile(file: File): Promise<ActionItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];

        const items: ActionItem[] = [];
        let id = 1;

        // Header row is index 0, data starts at index 1
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] as unknown[];
          if (!row || row.length < 7) continue;

          // Columns: 0=Challenge, 1=num, 2=Area, 3=StreamOwner, 4=Priority, 5=num, 6=PlannedActions, 7=DashboardOwner, 8=Owner, 9=ECD, 10=Update, 11=Remarks
          const plannedActions = String(row[6] || '').trim();
          const dashboardOwner = String(row[7] || '').trim();
          const owner = String(row[8] || '').trim();
          
          if (!plannedActions && !dashboardOwner) continue;

          let ecd = '';
          const rawEcd = row[9];
          if (rawEcd instanceof Date) {
            ecd = rawEcd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          } else if (rawEcd) {
            const str = String(rawEcd).trim();
            // Try to parse date strings
            const parsed = new Date(str);
            if (!isNaN(parsed.getTime())) {
              ecd = parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            } else {
              ecd = str;
            }
          }

          const update = String(row[10] || '').trim();
          const remarks = String(row[11] || '').trim();
          const streamOwner = String(row[3] || '').trim();
          const priority = String(row[4] || '').trim();
          const challengeCategory = String(row[0] || '').trim();
          const areaOfImprovement = String(row[2] || '').trim();

          // Determine the actual dashboard owner - normalize names
          const normalizedOwner = normalizeDashboardOwner(dashboardOwner);

          items.push({
            id: id++,
            challengeCategory,
            areaOfImprovement,
            streamOwner,
            priority,
            plannedActions,
            dashboardOwner: normalizedOwner || dashboardOwner,
            owner,
            ecd,
            update: normalizeStatus(update),
            remarks,
          });
        }

        resolve(items);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function normalizeDashboardOwner(name: string): string {
  const normalized = name.toLowerCase().trim();
  if (normalized.includes('ahmed') && normalized.includes('fathy')) return 'Ahmed Fathy';
  if (normalized.includes('hatem')) return 'Hatem Gado';
  if (normalized.includes('azzam')) return 'Azzam';
  if (normalized.includes('amr') && normalized.includes('fahmy')) return 'Amr Fahmy';
  if (normalized.includes('ashraf')) return 'Ashraf Hassan';
  if (normalized.includes('amr') && normalized.includes('rashwan')) return 'Amr Rashwan';
  return name;
}

function normalizeStatus(status: string): string {
  const s = status.trim();
  if (!s || s === 'NA') return s;
  if (s.toLowerCase() === 'done') return 'Done';
  if (s.toLowerCase() === 'pending') return 'Pending';
  if (s.toLowerCase() === 'rjected' || s.toLowerCase() === 'rejected') return 'Rjected';
  if (s.toLowerCase() === 'in progress') return 'In Progress';
  if (s.toLowerCase() === 'partially done') return 'Partially Done';
  return s;
}

export function saveDataToStorage(items: ActionItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save data to localStorage', e);
  }
}

export function loadDataFromStorage(): ActionItem[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActionItem[];
  } catch {
    return null;
  }
}

export function savePhotosToStorage(photos: Record<string, string>): void {
  try {
    const existing = loadPhotosFromStorage() || {};
    const merged = { ...existing, ...photos };
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Failed to save photos', e);
  }
}

export function loadPhotosFromStorage(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(PHOTOS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}

export function photoFileToKey(filename: string): string {
  // Ahmed-Fathy.jpg → Ahmed-Fathy
  return filename.replace(/\.[^/.]+$/, '');
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
