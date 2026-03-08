import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAppData } from '../context/AppContext';
import { ActionItem, ALL_STATUSES } from '../types/actionPlan';
import { Plus, Trash2, Save, X, Search, ArrowDown, ArrowUp, Copy, GripVertical } from 'lucide-react';

type EditableKey = keyof ActionItem;

const COLUMNS: { key: EditableKey; label: string; width: string }[] = [
  { key: 'id', label: '#', width: 'w-12' },
  { key: 'challengeCategory', label: 'Category', width: 'min-w-[140px]' },
  { key: 'areaOfImprovement', label: 'Area of Improvement', width: 'min-w-[180px]' },
  { key: 'streamOwner', label: 'Stream Owner', width: 'min-w-[130px]' },
  { key: 'priority', label: 'Priority', width: 'min-w-[100px]' },
  { key: 'plannedActions', label: 'Planned Actions', width: 'min-w-[250px]' },
  { key: 'summary', label: 'Summary', width: 'min-w-[200px]' },
  { key: 'dashboardOwner', label: 'Dashboard Owner', width: 'min-w-[140px]' },
  { key: 'taskSupporters', label: 'Task Supporters', width: 'min-w-[140px]' },
  { key: 'ecd', label: 'ECD', width: 'min-w-[120px]' },
  { key: 'update', label: 'Status', width: 'min-w-[120px]' },
  { key: 'remarks', label: 'Remarks', width: 'min-w-[200px]' },
];

interface CellRef {
  row: number;
  col: number;
}

export default function SpreadsheetEditor() {
  const { data, updateTask, addTask, deleteTask } = useAppData();
  const [editingCell, setEditingCell] = useState<CellRef | null>(null);
  const [editValue, setEditValue] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  const filtered = data.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return Object.values(item).some((v) => String(v).toLowerCase().includes(q));
  });

  const startEdit = useCallback((rowIdx: number, colIdx: number, value: string) => {
    setEditingCell({ row: rowIdx, col: colIdx });
    setEditValue(value);
  }, []);

  const commitEdit = useCallback(() => {
    if (!editingCell) return;
    const task = filtered[editingCell.row];
    const col = COLUMNS[editingCell.col];
    if (task && col.key !== 'id') {
      updateTask(task.id, { [col.key]: editValue });
    }
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, filtered, updateTask]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current) {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [editingCell]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!editingCell) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
      // Move down
      if (editingCell.row < filtered.length - 1) {
        const nextTask = filtered[editingCell.row + 1];
        const col = COLUMNS[editingCell.col];
        startEdit(editingCell.row + 1, editingCell.col, String(nextTask[col.key] || ''));
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      commitEdit();
      const nextCol = e.shiftKey
        ? Math.max(1, editingCell.col - 1)
        : Math.min(COLUMNS.length - 1, editingCell.col + 1);
      if (nextCol !== editingCell.col) {
        const task = filtered[editingCell.row];
        startEdit(editingCell.row, nextCol, String(task[COLUMNS[nextCol].key] || ''));
      }
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }, [editingCell, commitEdit, cancelEdit, filtered, startEdit]);

  const toggleRow = (id: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const deleteSelected = () => {
    if (selectedRows.size === 0) return;
    if (!confirm(`Delete ${selectedRows.size} selected task(s)?`)) return;
    selectedRows.forEach((id) => deleteTask(id));
    setSelectedRows(new Set());
  };

  const addNewRow = () => {
    const maxId = data.reduce((max, t) => Math.max(max, t.id), 0);
    const newTask: ActionItem = {
      id: maxId + 1,
      challengeCategory: '',
      areaOfImprovement: '',
      streamOwner: '',
      priority: '',
      plannedActions: '',
      summary: '',
      dashboardOwner: '',
      taskSupporters: '',
      ecd: '',
      update: '',
      remarks: '',
    };
    addTask(newTask);
  };

  const renderCell = (task: ActionItem, colIdx: number, rowIdx: number) => {
    const col = COLUMNS[colIdx];
    const value = String(task[col.key] || '');
    const isEditing = editingCell?.row === rowIdx && editingCell?.col === colIdx;

    if (col.key === 'id') {
      return <span className="text-xs text-muted-foreground font-mono">{task.id}</span>;
    }

    if (isEditing) {
      if (col.key === 'update') {
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="w-full bg-background border-2 border-primary rounded px-1.5 py-1 text-xs text-foreground focus:outline-none"
          >
            <option value="">—</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        );
      }

      if (col.key === 'plannedActions' || col.key === 'remarks' || col.key === 'summary') {
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="w-full bg-background border-2 border-primary rounded px-1.5 py-1 text-xs text-foreground focus:outline-none resize-none"
            rows={3}
          />
        );
      }

      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="w-full bg-background border-2 border-primary rounded px-1.5 py-1 text-xs text-foreground focus:outline-none"
        />
      );
    }

    return (
      <div
        onDoubleClick={() => startEdit(rowIdx, colIdx, value)}
        className="cursor-cell px-1.5 py-1 text-xs text-foreground truncate hover:bg-primary/5 rounded min-h-[28px] flex items-center"
        title={value || 'Double-click to edit'}
      >
        {value || <span className="text-muted-foreground/50 italic">empty</span>}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button onClick={addNewRow} className="flex items-center gap-1.5 gradient-hero text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90">
          <Plus size={14} /> Add Row
        </button>
        {selectedRows.size > 0 && (
          <button onClick={deleteSelected} className="flex items-center gap-1.5 bg-destructive/10 text-destructive text-xs font-semibold px-4 py-2 rounded-lg hover:bg-destructive/20 border border-destructive/30">
            <Trash2 size={14} /> Delete {selectedRows.size} Selected
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} tasks · Double-click a cell to edit · Tab/Enter to navigate</span>
      </div>

      {/* Spreadsheet Grid */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted/80 backdrop-blur-sm">
                <th className="w-10 px-2 py-2.5 border-b border-r border-border">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedRows.size === filtered.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(filtered.map((t) => t.id)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/30"
                  />
                </th>
                {COLUMNS.map((col) => (
                  <th key={col.key} className={`${col.width} text-left px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-r border-border last:border-r-0 bg-muted/80`}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((task, rowIdx) => (
                <tr key={task.id} className={`border-b border-border/50 ${selectedRows.has(task.id) ? 'bg-primary/5' : 'hover:bg-muted/20'} transition-colors`}>
                  <td className="px-2 py-1 border-r border-border/50 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(task.id)}
                      onChange={() => toggleRow(task.id)}
                      className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/30"
                    />
                  </td>
                  {COLUMNS.map((col, colIdx) => (
                    <td key={col.key} className={`${col.width} border-r border-border/30 last:border-r-0 align-top`}>
                      {renderCell(task, colIdx, rowIdx)}
                    </td>
                  ))}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className="text-center py-12 text-sm text-muted-foreground">
                    {search ? 'No tasks match your search' : 'No tasks yet — click "Add Row" to create one'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
