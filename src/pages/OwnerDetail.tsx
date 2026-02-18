import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppContext';
import { OWNERS, ALL_STATUSES } from '../types/actionPlan';
import { TasksTable } from '../components/TasksTable';
import { FilterPanel } from '../components/FilterPanel';
import { DashboardCharts } from '../components/DashboardCharts';
import { ArrowLeft, User, CheckCircle2, Clock, BarChart3 } from 'lucide-react';

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
    return data.filter((item) => {
      const firstName = decodedName.split(' ')[0].toLowerCase();
      return item.dashboardOwner.toLowerCase().includes(firstName) || item.dashboardOwner === decodedName;
    });
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
  const pending = ownerTasks.length - done;
  const photo = ownerInfo ? photos[ownerInfo.photoKey] : null;

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of ownerTasks) {
      const s = t.update || '—';
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  }, [ownerTasks]);

  const STATUS_COLORS_MAP: Record<string, string> = {
    'Done': 'text-status-done',
    'Pending': 'text-status-pending',
    'Rjected': 'text-status-rejected',
    'In Progress': 'text-status-in-progress',
    'Partially Done': 'text-status-partially-done',
  };

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
              <div className="flex items-center gap-4 mt-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{ownerTasks.length}</div>
                  <div className="text-xs text-white/60">Total</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-foreground/90">{done}</div>
                  <div className="text-xs text-primary-foreground/60">Done</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-foreground/80">{pending}</div>
                  <div className="text-xs text-primary-foreground/60">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="px-6 py-4 flex flex-wrap gap-4">
          {Object.entries(statusBreakdown).map(([status, count]) => (
            <div key={status} className="flex items-center gap-2">
              <span className={`text-sm font-bold ${STATUS_COLORS_MAP[status] || 'text-muted-foreground'}`}>{count}</span>
              <span className="text-xs text-muted-foreground">{status === 'Rjected' ? 'Rejected' : status || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters (no owner filter on detail page) */}
      <FilterPanel
        selectedOwner={decodedName}
        setSelectedOwner={() => {}}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
      />

      {/* Charts for this owner */}
      <section>
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
          <BarChart3 size={17} className="text-primary" />
          Analytics
        </h2>
        <DashboardCharts filteredData={filteredTasks} />
      </section>

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
