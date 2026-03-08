import React, { useState, useMemo } from 'react';
import { ActionItem } from '../types/actionPlan';
import { ChevronLeft, ChevronRight, Search, X, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';

interface TasksTableProps {
  tasks: ActionItem[];
  pageSize?: number;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  'Done': { label: '✅ Done', cls: 'bg-status-done/15 text-status-done border border-status-done/30' },
  'Pending': { label: '🟡 Pending', cls: 'bg-status-pending/15 text-status-pending border border-status-pending/30' },
  'Rejected': { label: '🔴 Rejected', cls: 'bg-status-rejected/15 text-status-rejected border border-status-rejected/30' },
  'In Progress': { label: '🔵 In Progress', cls: 'bg-status-in-progress/15 text-status-in-progress border border-status-in-progress/30' },
  'Partially Done': { label: '🟠 Partially Done', cls: 'bg-status-partially-done/15 text-status-partially-done border border-status-partially-done/30' },
  'NA': { label: '⚪ NA', cls: 'bg-muted text-muted-foreground border border-border' },
  '': { label: '⚪ —', cls: 'bg-muted text-muted-foreground border border-border' },
};

const PRIORITY_BADGE: Record<string, string> = {
  'P1': 'bg-red-50 text-red-700 border border-red-200',
  'P2': 'bg-blue-50 text-blue-700 border border-blue-200',
};

type SortKey = 'plannedActions' | 'dashboardOwner' | 'update' | 'ecd' | 'priority' | 'remarks';
type SortDir = 'asc' | 'desc';

function compareValues(a: string, b: string, key: SortKey): number {
  if (key === 'ecd') {
    const da = a && a !== 'TBD' && a !== 'NA' ? new Date(a).getTime() : Infinity;
    const db = b && b !== 'TBD' && b !== 'NA' ? new Date(b).getTime() : Infinity;
    return da - db;
  }
  return (a || '').localeCompare(b || '', undefined, { sensitivity: 'base' });
}

export function TasksTable({ tasks, pageSize = 50 }: TasksTableProps) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ActionItem | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortKey(null); setSortDir('asc'); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter((t) =>
      Object.values(t).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [tasks, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = String(a[sortKey] || '');
      const vb = String(b[sortKey] || '');
      const cmp = compareValues(va, vb, sortKey);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const badge = (status: string) => STATUS_BADGE[status] || STATUS_BADGE[''];

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="text-muted-foreground/50" />;
    return sortDir === 'asc' ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />;
  };

  const thClass = "text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30 cursor-pointer select-none hover:text-foreground transition-colors";

  return (
    <>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search tasks across all columns…"
          className="w-full bg-card border border-border rounded-xl pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {search && (
          <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>
      <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30 w-8">#</th>
                <th className={`${thClass} min-w-[280px]`} onClick={() => handleSort('plannedActions')}>
                  <span className="inline-flex items-center gap-1">Planned Action <SortIcon col="plannedActions" /></span>
                </th>
                <th className={thClass} onClick={() => handleSort('dashboardOwner')}>
                  <span className="inline-flex items-center gap-1">Dashboard Owner <SortIcon col="dashboardOwner" /></span>
                </th>
                <th className={thClass} onClick={() => handleSort('update')}>
                  <span className="inline-flex items-center gap-1">Status <SortIcon col="update" /></span>
                </th>
                <th className={thClass} onClick={() => handleSort('ecd')}>
                  <span className="inline-flex items-center gap-1">ECD <SortIcon col="ecd" /></span>
                </th>
                <th className={thClass} onClick={() => handleSort('priority')}>
                  <span className="inline-flex items-center gap-1">Priority <SortIcon col="priority" /></span>
                </th>
                <th className={`${thClass} hidden xl:table-cell`} onClick={() => handleSort('remarks')}>
                  <span className="inline-flex items-center gap-1">Remarks <SortIcon col="remarks" /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    No tasks found
                  </td>
                </tr>
              ) : (
                paginated.map((task, idx) => {
                  const b = badge(task.update);
                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelected(task)}
                      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3 text-muted-foreground text-xs">{(page - 1) * pageSize + idx + 1}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{task.plannedActions}</p>
                        {task.areaOfImprovement && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.areaOfImprovement}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{task.dashboardOwner || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${b.cls}`}>
                          {b.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{task.ecd || '—'}</td>
                      <td className="px-4 py-3">
                        {task.priority && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${PRIORITY_BADGE[task.priority] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {task.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs hidden xl:table-cell">
                        <p className="text-xs text-muted-foreground line-clamp-2">{task.remarks || '—'}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {sorted.length} tasks · Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (pg > totalPages) return null;
                return (
                  <button key={pg} onClick={() => setPage(pg)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${pg === page ? 'gradient-hero text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}>
                    {pg}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <TaskDetailModal task={selected} onClose={() => setSelected(null)} />
    </>
  );
}
