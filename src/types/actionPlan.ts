export interface ActionItem {
  id: number;
  challengeCategory: string;
  areaOfImprovement: string;
  streamOwner: string;
  priority: string;
  plannedActions: string;
  dashboardOwner: string;
  owner: string;
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

// Alphabetical order
export const OWNERS: OwnerInfo[] = [
  { name: 'Ahmed Fathy', designation: 'Service Management', photoKey: 'Ahmed-Fathy' },
  { name: 'Amr Fahmy', designation: 'Field Ops', photoKey: 'Amr-Fahmy' },
  { name: 'Amr Rashwan', designation: 'IoT Ops', photoKey: 'Amr-Rashwan' },
  { name: 'Ashraf Hassan', designation: 'Call Center', photoKey: 'Ashraf-Hassan' },
  { name: 'Azzam', designation: 'IT and Systems', photoKey: 'Azzam' },
  { name: 'Hatem Gado', designation: 'Business', photoKey: 'Hatem-Gado' },
];

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
