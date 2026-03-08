export interface ActionItem {
  id: number;
  challengeCategory: string;
  areaOfImprovement: string;
  streamOwner: string;
  priority: string;
  plannedActions: string;
  summary: string;
  dashboardOwner: string;
  taskSupporters: string;
  ecd: string;
  update: string;
  remarks: string;
}

export type StatusType = 'Done' | 'Pending' | 'Rejected' | 'In Progress' | 'Partially Done' | 'Other';

export interface OwnerInfo {
  name: string;
  designation: string;
  photoKey: string;
}

export const DEFAULT_OWNERS: OwnerInfo[] = [
  { name: 'Ahmed Fathy', designation: 'Service Management', photoKey: 'Ahmed-Fathy' },
  { name: 'Amr Fahmy', designation: 'Field Ops', photoKey: 'Amr-Fahmy' },
  { name: 'Amr Rashwan', designation: 'IoT Ops', photoKey: 'Amr-Rashwan' },
  { name: 'Ashraf Hassan', designation: 'Call Center', photoKey: 'Ashraf-Hassan' },
  { name: 'Azzam', designation: 'IT and Systems', photoKey: 'Azzam' },
  { name: 'Fadil AlZarouni', designation: 'Management', photoKey: 'Fadil-AlZarouni' },
  { name: 'Hatem Gado', designation: 'Business', photoKey: 'Hatem-Gado' },
];

export interface ColumnConfig {
  key: keyof ActionItem;
  label: string;
  visible: boolean;
}

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'id', label: '#', visible: true },
  { key: 'challengeCategory', label: 'Challenge Category', visible: true },
  { key: 'areaOfImprovement', label: 'Area of Improvement', visible: true },
  { key: 'streamOwner', label: 'Stream Owner', visible: false },
  { key: 'priority', label: 'Priority', visible: true },
  { key: 'plannedActions', label: 'Planned Actions', visible: true },
  { key: 'summary', label: 'Summary', visible: true },
  { key: 'dashboardOwner', label: 'Dashboard Owner', visible: true },
  { key: 'taskSupporters', label: 'Task Supporters', visible: false },
  { key: 'ecd', label: 'ECD', visible: true },
  { key: 'update', label: 'Update', visible: true },
  { key: 'remarks', label: 'Remarks', visible: true },
];

// ======= STATUS CONFIG =======
export interface StatusConfig {
  key: string;
  label: string;
  emoji: string;
  color: string; // HSL values like "142 76% 36%"
}

export const DEFAULT_STATUS_CONFIG: StatusConfig[] = [
  { key: 'Done', label: 'Completed', emoji: '✅', color: '142 76% 36%' },
  { key: 'Pending', label: 'Pending', emoji: '🟡', color: '45 93% 47%' },
  { key: 'Rejected', label: 'Rejected', emoji: '🔴', color: '0 84% 60%' },
  { key: 'In Progress', label: 'In Progress', emoji: '🔵', color: '199 89% 48%' },
  { key: 'Partially Done', label: 'Partially Done', emoji: '🟠', color: '25 95% 53%' },
];

// ======= THEME CONFIG =======
export interface ThemeConfig {
  primaryHue: number;
  primarySaturation: number;
  primaryLightness: number;
  borderRadius: number; // in rem
  fontFamily: string;
  fontSize: 'sm' | 'base' | 'lg';
  darkMode: boolean;
}

export const DEFAULT_THEME: ThemeConfig = {
  primaryHue: 0,
  primarySaturation: 72,
  primaryLightness: 32,
  borderRadius: 0.5,
  fontFamily: 'Inter',
  fontSize: 'base',
  darkMode: false,
};

export const FONT_OPTIONS = [
  'Inter',
  'system-ui',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Courier New',
  'Arial',
  'Tahoma',
];

// ======= LAYOUT CONFIG =======
export interface LayoutConfig {
  ownerCardColumns: 2 | 3 | 4;
  tableDensity: 'compact' | 'normal' | 'relaxed';
  showOwnerCards: boolean;
  showKpiBoxes: boolean;
  showTasksTable: boolean;
  showProgressBar: boolean;
  showOwnerPhoto: boolean;
  ownerCardStyle: 'full' | 'compact' | 'minimal';
  kpiStyle: 'boxes' | 'inline' | 'banner';
}

export const DEFAULT_LAYOUT: LayoutConfig = {
  ownerCardColumns: 3,
  tableDensity: 'normal',
  showOwnerCards: true,
  showKpiBoxes: true,
  showTasksTable: true,
  showProgressBar: true,
  showOwnerPhoto: true,
  ownerCardStyle: 'full',
  kpiStyle: 'boxes',
};

// ======= BRANDING CONFIG =======
export interface BrandingConfig {
  appName: string;
  appSubtitle: string;
  logoDataUrl: string;
  faviconEmoji: string;
  footerText: string;
  showNavBadge: boolean;
}

export const DEFAULT_BRANDING: BrandingConfig = {
  appName: 'Hassantuk',
  appSubtitle: 'Action Plan Tracker',
  logoDataUrl: '',
  faviconEmoji: '📊',
  footerText: '',
  showNavBadge: true,
};

// ======= KPI CONFIG =======
export interface KpiConfig {
  showTotal: boolean;
  showCompleted: boolean;
  showPending: boolean;
  showInProgress: boolean;
  showRejected: boolean;
  totalLabel: string;
  completedLabel: string;
  pendingLabel: string;
  inProgressLabel: string;
  rejectedLabel: string;
}

export const DEFAULT_KPI_CONFIG: KpiConfig = {
  showTotal: true,
  showCompleted: true,
  showPending: true,
  showInProgress: true,
  showRejected: true,
  totalLabel: 'Total',
  completedLabel: 'Completed',
  pendingLabel: 'Pending',
  inProgressLabel: 'In Progress',
  rejectedLabel: 'Rejected',
};

export const STATUS_COLORS: Record<string, string> = {
  'Done': 'hsl(142 76% 36%)',
  'Pending': 'hsl(45 93% 47%)',
  'Rejected': 'hsl(0 84% 60%)',
  'In Progress': 'hsl(199 89% 48%)',
  'Partially Done': 'hsl(25 95% 53%)',
  'Other': 'hsl(215 16% 47%)',
  'NA': 'hsl(215 16% 47%)',
  '': 'hsl(215 16% 47%)',
};

export const STATUS_BG_COLORS: Record<string, string> = {
  'Done': 'bg-status-done',
  'Pending': 'bg-status-pending',
  'Rejected': 'bg-status-rejected',
  'In Progress': 'bg-status-in-progress',
  'Partially Done': 'bg-status-partially-done',
  'Other': 'bg-muted-foreground',
};

export const STATUS_DISPLAY: Record<string, string> = {
  'Done': '✅ Done',
  'Pending': '🟡 Pending',
  'Rejected': '🔴 Rejected',
  'In Progress': '🔵 In Progress',
  'Partially Done': '🟠 Partially Done',
  'NA': '⚪ NA',
  '': '⚪ —',
};

export const ALL_STATUSES = ['Done', 'Pending', 'Rejected', 'In Progress', 'Partially Done'];
