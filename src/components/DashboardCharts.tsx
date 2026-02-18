import React, { useMemo } from 'react';
import { OWNERS, STATUS_COLORS, ALL_STATUSES } from '../types/actionPlan';
import { useAppData } from '../context/AppContext';
import { ActionItem } from '../types/actionPlan';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Cell
} from 'recharts';

interface DashboardChartsProps {
  filteredData: ActionItem[];
}

const STATUS_COLOR_MAP: Record<string, string> = {
  'Done': 'hsl(142 76% 36%)',
  'Pending': 'hsl(45 93% 47%)',
  'Rjected': 'hsl(0 84% 60%)',
  'In Progress': 'hsl(199 89% 48%)',
  'Partially Done': 'hsl(25 95% 53%)',
  'Other': 'hsl(215 16% 47%)',
};

const STATUS_DISPLAY_MAP: Record<string, string> = {
  'Rjected': 'Rejected',
};

export function DashboardCharts({ filteredData }: DashboardChartsProps) {
  // Tasks by Status (bar chart)
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of filteredData) {
      const s = item.update || 'Other';
      counts[s] = (counts[s] || 0) + 1;
    }
    return Object.entries(counts).map(([status, count]) => ({
      status: STATUS_DISPLAY_MAP[status] || status || '—',
      count,
      color: STATUS_COLOR_MAP[status] || STATUS_COLOR_MAP['Other'],
    }));
  }, [filteredData]);

  // Stacked bar by Dashboard Owner × Status
  const ownerStatusData = useMemo(() => {
    const ownerMap: Record<string, Record<string, number>> = {};
    for (const item of filteredData) {
      const o = item.dashboardOwner || 'Unknown';
      const s = item.update || 'Other';
      if (!ownerMap[o]) ownerMap[o] = {};
      ownerMap[o][s] = (ownerMap[o][s] || 0) + 1;
    }
    return Object.entries(ownerMap).map(([owner, statuses]) => ({
      owner: owner.split(' ')[0], // short name
      fullName: owner,
      ...statuses,
    }));
  }, [filteredData]);

  const usedStatuses = useMemo(() => {
    const set = new Set<string>();
    for (const item of filteredData) {
      if (item.update) set.add(item.update);
    }
    return Array.from(set);
  }, [filteredData]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Bar Chart: Tasks by Status */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-foreground mb-4">Tasks by Status</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={statusData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
            <XAxis dataKey="status" tick={{ fontSize: 12, fill: 'hsl(215 16% 47%)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(215 16% 47%)' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {statusData.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stacked Bar: By Owner × Status */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-foreground mb-4">Tasks by Owner & Status</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={ownerStatusData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
            <XAxis dataKey="owner" tick={{ fontSize: 12, fill: 'hsl(215 16% 47%)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(215 16% 47%)' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
            />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            {usedStatuses.map((status) => (
              <Bar
                key={status}
                dataKey={status}
                stackId="a"
                fill={STATUS_COLOR_MAP[status] || STATUS_COLOR_MAP['Other']}
                name={STATUS_DISPLAY_MAP[status] || status}
                radius={usedStatuses.indexOf(status) === usedStatuses.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
