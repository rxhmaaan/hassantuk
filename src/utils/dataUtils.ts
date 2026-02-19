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
        resolve(parseExcelBuffer(data));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function parseExcelBuffer(data: Uint8Array): ActionItem[] {
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];

  const items: ActionItem[] = [];
  let id = 1;

  // Header row is index 0, data starts at index 1
  // Columns: A=Challenge(0), B=num(1), C=Area(2), D=StreamOwner(3), E=Priority(4), F=num(5), G=PlannedActions(6), H=DashboardOwner(7), I=Owner(8), J=ECD(9), K=Update(10), L=Remarks(11)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    if (!row || row.length < 7) continue;

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
      if (str && str !== '' && str.toLowerCase() !== 'tbd' && str.toLowerCase() !== 'na') {
        const parsed = new Date(str);
        if (!isNaN(parsed.getTime())) {
          ecd = parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        } else {
          ecd = str;
        }
      } else {
        ecd = str;
      }
    }

    // Column K (index 10) is the Update/Status field
    const rawUpdate = String(row[10] || '').trim();
    const update = normalizeStatus(rawUpdate);

    const remarks = String(row[11] || '').trim();
    const streamOwner = String(row[3] || '').trim();
    const priority = String(row[4] || '').trim();
    const challengeCategory = String(row[0] || '').trim();
    const areaOfImprovement = String(row[2] || '').trim();

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
      update,
      remarks,
    });
  }

  return items;
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
  if (!s) return '';
  const lower = s.toLowerCase();
  if (lower === 'done') return 'Done';
  if (lower === 'pending') return 'Pending';
  if (lower === 'rejected' || lower === 'rjected') return 'Rejected';
  if (lower === 'in progress') return 'In Progress';
  if (lower === 'partially done') return 'Partially Done';
  if (lower === 'not yet shared') return 'Pending';
  if (lower === 'na' || lower === 'n/a') return 'NA';
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

export async function loadDefaultExcelData(): Promise<ActionItem[]> {
  try {
    const response = await fetch('/data/action-plan.xlsx');
    if (!response.ok) return [];
    const buffer = await response.arrayBuffer();
    return parseExcelBuffer(new Uint8Array(buffer));
  } catch {
    return [];
  }
}
