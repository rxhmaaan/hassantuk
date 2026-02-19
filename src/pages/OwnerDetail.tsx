import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppContext';
import { OWNERS, ALL_STATUSES } from '../types/actionPlan';
import { TasksTable } from '../components/TasksTable';
import { ArrowLeft, User, ChevronDown } from 'lucide-react';

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === 'TBD' || dateStr === 'NA') return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return null;
}

export default function OwnerDetail() {
  const { ownerName } = useParams<{ ownerName: string }>();
  const navigate = useNavigate();
  const { data, photos } = useAppData();

  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const decodedName = decodeURIComponent(ownerName || '');
  const ownerInfo = OWNERS.find((o) => o.name === decodedName);

  const ownerTasks = useMemo(() => {
    return data.filter((item) => item.dashboardOwner === decodedName);
  }, [data, decodedName]);

  const filteredTasks = useMemo(() => {
    return ownerTasks.filter((item) => {
      if (selectedStatus && item.update !== selectedStatus) return false;
      if (dateFrom || dateTo) {
        const d = parseDate(item.ecd);
        if (d) {
          if (dateFrom && d < new Date(dateFrom)) return false;
          if (dateTo && d > new Date(dateTo)) return false;
        }
      }
      return true;
    });
  }, [ownerTasks, selectedStatus, dateFrom, dateTo]);

  const done = ownerTasks.filter((t) => t.update === 'Done').length;
  const pending = ownerTasks.filter((t) => t.update === 'Pending').length;
  const inProgress = ownerTasks.filter((t) => t.update === 'In Progress').length;
  const rejected = ownerTasks.filter((t) => t.update === 'Rejected').length;
  const partiallyDone = ownerTasks.filter((t) => t.update === 'Partially Done').length;
  const photo = ownerInfo ? photos[ownerInfo.photoKey] : null;

  const STATUS_COLORS_MAP: Record<string, string> = {
    'Done': 'text-status-done bg-status-done/10',
    'Pending': 'text-status-pending bg-status-pending/10',
    'Rejected': 'text-status-rejected bg-status-rejected/10',
    'In Progress': 'text-status-in-progress bg-status-in-progress/10',
    'Partially Done': 'text-status-partially-done bg-status-partially-done/10',
  };

  const hasFilters = selectedStatus || dateFrom || dateTo;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Card */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        <div className="gradient-hero px-6 py-5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="flex items-center gap-5">
            {photo ? (
              <img
                src={photo}
                alt={decodedName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/15 border-4 border-white/30 flex items-center justify-center shadow-xl">
                <User size={40} className="text-white/80" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{decodedName}</h1>
              {ownerInfo && (
                <p className="text-white/70 text-sm italic mt-0.5">{ownerInfo.designation}</p>
              )}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{ownerTasks.length}</div>
                  <div className="text-xs text-white/60">Total</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-status-done">{done}</div>
                  <div className="text-xs text-white/60">Done</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-status-pending">{pending}</div>
                  <div className="text-xs text-white/60">Pending</div>
                </div>
                {inProgress > 0 && (
                  <>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-status-in-progress">{inProgress}</div>
                      <div className="text-xs text-white/60">In Progress</div>
                    </div>
                  </>
                )}
                {rejected > 0 && (
                  <>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-status-rejected">{rejected}</div>
                      <div className="text-xs text-white/60">Rejected</div>
                    </div>
                  </>
                )}
                {partiallyDone > 0 && (
                  <>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-status-partially-done">{partiallyDone}</div>
                      <div className="text-xs text-white/60">Partially Done</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Filter Bar */}
      <div className="bg-card rounded-2xl shadow-card p-4 border border-border/50 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Status</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Due Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Due Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {hasFilters && (
          <button
            onClick={() => { setSelectedStatus(''); setDateFrom(''); setDateTo(''); }}
            className="text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg border border-border bg-muted/30"
          >
            Clear
          </button>
        )}
      </div>

      {/* Tasks Table */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">
          Tasks ({filteredTasks.length})
        </h2>
        <TasksTable tasks={filteredTasks} />
      </section>
    </div>
  );
}
