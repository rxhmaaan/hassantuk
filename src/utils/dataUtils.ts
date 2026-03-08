import * as XLSX from 'xlsx';
import {
  ActionItem, OwnerInfo, ColumnConfig, DEFAULT_OWNERS, DEFAULT_COLUMNS,
  ThemeConfig, DEFAULT_THEME, LayoutConfig, DEFAULT_LAYOUT,
  BrandingConfig, DEFAULT_BRANDING, StatusConfig, DEFAULT_STATUS_CONFIG,
  KpiConfig, DEFAULT_KPI_CONFIG,
} from '../types/actionPlan';

const STORAGE_KEY = 'hassantuk_action_plan_data';
const PHOTOS_KEY = 'hassantuk_owner_photos';
const OWNERS_KEY = 'hassantuk_owners_config';
const COLUMNS_KEY = 'hassantuk_columns_config';
const DASHBOARD_KEY = 'hassantuk_dashboard_config';
const THEME_KEY = 'hassantuk_theme_config';
const LAYOUT_KEY = 'hassantuk_layout_config';
const BRANDING_KEY = 'hassantuk_branding_config';
const STATUS_CFG_KEY = 'hassantuk_status_config';
const KPI_KEY = 'hassantuk_kpi_config';

// ======= EXCEL PARSING =======
export function parseExcelFile(file: File): Promise<ActionItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        resolve(parseExcelBuffer(data));
      } catch (err) { reject(err); }
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

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    if (!row || row.length < 7) continue;
    const plannedActions = String(row[6] || '').trim();
    const summary = String(row[7] || '').trim();
    const dashboardOwner = String(row[8] || '').trim();
    const taskSupporters = String(row[9] || '').trim();
    if (!plannedActions && !dashboardOwner) continue;

    let ecd = '';
    const rawEcd = row[10];
    if (rawEcd instanceof Date) {
      ecd = rawEcd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } else if (rawEcd) {
      const str = String(rawEcd).trim();
      if (str && str.toLowerCase() !== 'tbd' && str.toLowerCase() !== 'na') {
        const parsed = new Date(str);
        ecd = !isNaN(parsed.getTime()) ? parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : str;
      } else { ecd = str; }
    }

    const rawUpdate = String(row[11] || '').trim();
    const update = normalizeStatus(rawUpdate);
    const remarks = String(row[12] || '').trim();

    items.push({
      id: id++,
      challengeCategory: String(row[0] || '').trim(),
      areaOfImprovement: String(row[2] || '').trim(),
      streamOwner: String(row[3] || '').trim(),
      priority: String(row[4] || '').trim(),
      plannedActions, summary,
      dashboardOwner: normalizeDashboardOwner(dashboardOwner) || dashboardOwner,
      taskSupporters, ecd, update, remarks,
    });
  }
  return items;
}

function normalizeDashboardOwner(name: string): string {
  const n = name.toLowerCase().trim();
  if (n.includes('ahmed') && n.includes('fathy')) return 'Ahmed Fathy';
  if (n.includes('hatem')) return 'Hatem Gado';
  if (n.includes('azzam')) return 'Azzam';
  if (n.includes('amr') && n.includes('fahmy')) return 'Amr Fahmy';
  if (n.includes('ashraf')) return 'Ashraf Hassan';
  if (n.includes('amr') && n.includes('rashwan')) return 'Amr Rashwan';
  if (n.includes('fadil') || n.includes('alzarouni')) return 'Fadil AlZarouni';
  return name;
}

function normalizeStatus(status: string): string {
  const s = status.trim();
  if (!s) return '';
  const l = s.toLowerCase();
  if (l === 'done') return 'Done';
  if (l === 'pending') return 'Pending';
  if (l === 'rejected' || l === 'rjected') return 'Rejected';
  if (l === 'in progress') return 'In Progress';
  if (l === 'partially done') return 'Partially Done';
  if (l === 'not yet shared') return 'Pending';
  if (l === 'na' || l === 'n/a') return 'NA';
  return s;
}

// ======= GENERIC STORAGE HELPERS =======
function saveJSON(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.error('Save failed', key, e); }
}
function loadJSON<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
}

// ======= DATA =======
export function saveDataToStorage(items: ActionItem[]) { saveJSON(STORAGE_KEY, items); }
export function loadDataFromStorage(): ActionItem[] | null { return loadJSON(STORAGE_KEY); }

// ======= PHOTOS =======
export function savePhotosToStorage(photos: Record<string, string>) {
  const existing = loadPhotosFromStorage() || {};
  saveJSON(PHOTOS_KEY, { ...existing, ...photos });
}
export function loadPhotosFromStorage(): Record<string, string> | null { return loadJSON(PHOTOS_KEY); }

// ======= OWNERS =======
export function saveOwnersConfig(owners: OwnerInfo[]) { saveJSON(OWNERS_KEY, owners); }
export function loadOwnersConfig(): OwnerInfo[] | null { return loadJSON(OWNERS_KEY); }

// ======= COLUMNS =======
export function saveColumnsConfig(columns: ColumnConfig[]) { saveJSON(COLUMNS_KEY, columns); }
export function loadColumnsConfig(): ColumnConfig[] | null { return loadJSON(COLUMNS_KEY); }

// ======= DASHBOARD =======
export interface DashboardConfig { title: string; subtitle: string; dateLabel: string; }
export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = { title: 'Action Plan Dashboard', subtitle: 'Hassantuk', dateLabel: '16 Feb 2026' };
export function saveDashboardConfig(config: DashboardConfig) { saveJSON(DASHBOARD_KEY, config); }
export function loadDashboardConfig(): DashboardConfig | null { return loadJSON(DASHBOARD_KEY); }

// ======= THEME =======
export function saveThemeConfig(theme: ThemeConfig) { saveJSON(THEME_KEY, theme); }
export function loadThemeConfig(): ThemeConfig | null { return loadJSON(THEME_KEY); }

// ======= LAYOUT =======
export function saveLayoutConfig(layout: LayoutConfig) { saveJSON(LAYOUT_KEY, layout); }
export function loadLayoutConfig(): LayoutConfig | null { return loadJSON(LAYOUT_KEY); }

// ======= BRANDING =======
export function saveBrandingConfig(branding: BrandingConfig) { saveJSON(BRANDING_KEY, branding); }
export function loadBrandingConfig(): BrandingConfig | null { return loadJSON(BRANDING_KEY); }

// ======= STATUS CONFIG =======
export function saveStatusConfig(config: StatusConfig[]) { saveJSON(STATUS_CFG_KEY, config); }
export function loadStatusConfig(): StatusConfig[] | null { return loadJSON(STATUS_CFG_KEY); }

// ======= KPI CONFIG =======
export function saveKpiConfig(config: KpiConfig) { saveJSON(KPI_KEY, config); }
export function loadKpiConfig(): KpiConfig | null { return loadJSON(KPI_KEY); }

// ======= UTILITY =======
export function photoFileToKey(filename: string): string { return filename.replace(/\.[^/.]+$/, ''); }

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function loadDefaultExcelData(): Promise<ActionItem[]> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 5000);

  try {
    const resp = await fetch('/data/action-plan.xlsx', { signal: controller.signal, cache: 'no-store' });
    if (!resp.ok) return [];
    const buffer = await resp.arrayBuffer();
    return parseExcelBuffer(new Uint8Array(buffer));
  } catch {
    return [];
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function clearAllData() {
  // Clear localStorage (legacy)
  [STORAGE_KEY, PHOTOS_KEY, OWNERS_KEY, COLUMNS_KEY, DASHBOARD_KEY, THEME_KEY, LAYOUT_KEY, BRANDING_KEY, STATUS_CFG_KEY, KPI_KEY].forEach(k => localStorage.removeItem(k));
  // Clear DB
  try {
    const { supabase } = await import('../integrations/supabase/client');
    await supabase.from('action_items').delete().gte('id', 0);
    await supabase.from('app_settings').delete().neq('key', '');
    await supabase.from('owner_photos').delete().neq('photo_key', '');
  } catch (e) {
    console.error('Failed to clear DB data:', e);
  }
}
