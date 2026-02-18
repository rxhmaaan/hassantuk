import React, { useMemo, useState } from 'react';
import { useAppData } from '../context/AppContext';
import { ActionItem, ALL_STATUSES, OWNERS, STATUS_COLORS } from '../types/actionPlan';
import { Filter, ChevronDown, Calendar, X } from 'lucide-react';

interface FilterPanelProps {
  selectedOwner: string;
  setSelectedOwner: (v: string) => void;
  selectedStatus: string;
  setSelectedStatus: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
}

const STATUS_DOT: Record<string, string> = {
  'Done': 'bg-status-done',
  'Pending': 'bg-status-pending',
  'Rjected': 'bg-status-rejected',
  'In Progress': 'bg-status-in-progress',
  'Partially Done': 'bg-status-partially-done',
};

export function FilterPanel({
  selectedOwner, setSelectedOwner,
  selectedStatus, setSelectedStatus,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
}: FilterPanelProps) {
  const hasFilters = selectedOwner || selectedStatus || dateFrom || dateTo;

  const clearAll = () => {
    setSelectedOwner('');
    setSelectedStatus('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-5 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Filter size={15} className="text-primary" />
          Filters
        </h3>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Dashboard Owner */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Dashboard Owner</label>
          <div className="relative">
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="w-full appearance-none bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Owners</option>
              {OWNERS.map((o) => (
                <option key={o.name} value={o.name}>{o.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full appearance-none bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Status</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s === 'Rjected' ? 'Rejected' : s}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Date From */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Due Date From</label>
          <div className="relative">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Date To */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Due Date To</label>
          <div className="relative">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
