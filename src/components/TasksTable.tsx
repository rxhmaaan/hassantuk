import React, { useState } from 'react';
import { ActionItem } from '../types/actionPlan';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';

interface TasksTableProps {
  tasks: ActionItem[];
  pageSize?: number;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  'Done': { label: '✅ Done', cls: 'bg-green-100 text-green-800 border border-green-200' },
  'Pending': { label: '🟡 Pending', cls: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  'Rjected': { label: '🔴 Rejected', cls: 'bg-red-100 text-red-800 border border-red-200' },
  'In Progress': { label: '🔵 In Progress', cls: 'bg-blue-100 text-blue-800 border border-blue-200' },
  'Partially Done': { label: '🟠 Partially Done', cls: 'bg-orange-100 text-orange-800 border border-orange-200' },
  'NA': { label: '⚪ NA', cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  '': { label: '⚪ —', cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
};

const PRIORITY_BADGE: Record<string, string> = {
  'P1': 'bg-red-50 text-red-700 border border-red-200',
  'P2': 'bg-blue-50 text-blue-700 border border-blue-200',
};

export function TasksTable({ tasks, pageSize = 50 }: TasksTableProps) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ActionItem | null>(null);

  const totalPages = Math.max(1, Math.ceil(tasks.length / pageSize));
  const paginated = tasks.slice((page - 1) * pageSize, page * pageSize);

  const badge = (status: string) => STATUS_BADGE[status] || STATUS_BADGE[''];

  return (
    <>
      <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30 w-8">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30 min-w-[280px]">Planned Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30">ECD</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30 hidden xl:table-cell">Remarks</th>
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
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{task.owner || '—'}</td>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {tasks.length} tasks · Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (pg > totalPages) return null;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${pg === page ? 'gradient-hero text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
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
