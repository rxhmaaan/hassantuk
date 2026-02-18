import React, { useMemo, useState } from 'react';
import { useAppData } from '../context/AppContext';
import { OwnerCards } from '../components/OwnerCards';
import { DashboardCharts } from '../components/DashboardCharts';
import { FilterPanel } from '../components/FilterPanel';
import { TasksTable } from '../components/TasksTable';
import { Upload, BarChart3, Users } from 'lucide-react';
import { UploadModal } from '../components/UploadModal';

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === 'TBD' || dateStr === 'NA') return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return null;
}

export default function Index() {
  const { data, isLoaded } = useAppData();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedOwner && item.dashboardOwner !== selectedOwner) return false;
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
  }, [data, selectedOwner, selectedStatus, dateFrom, dateTo]);

  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Upload size={36} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Welcome to Hassantuk</h1>
            <h2 className="text-lg text-primary font-semibold mb-2">Action Plan Tracker</h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              Upload your Excel spreadsheet and owner photos to activate the dashboard. 
              Your data will persist across all sessions.
            </p>
            <button
              onClick={() => setUploadOpen(true)}
              className="gradient-hero text-primary-foreground font-semibold px-8 py-3 rounded-xl text-sm flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity shadow-lg"
            >
              <Upload size={18} />
              Upload Excel + Owner Photos
            </button>
          </div>
        </div>
        <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      </>
    );
  }

  const doneCount = filteredData.filter((d) => d.update === 'Done').length;
  const pendingCount = filteredData.filter((d) => d.update !== 'Done').length;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Action Plan Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hassantuk — 16 Feb 2026 · {data.length} total tasks
          </p>
        </div>
        {/* Summary Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-card rounded-xl px-4 py-2.5 shadow-card border border-border/50 text-center">
            <div className="text-lg font-bold text-status-done">{doneCount}</div>
            <div className="text-xs text-muted-foreground">Done</div>
          </div>
          <div className="bg-card rounded-xl px-4 py-2.5 shadow-card border border-border/50 text-center">
            <div className="text-lg font-bold text-status-pending">{pendingCount}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="bg-card rounded-xl px-4 py-2.5 shadow-card border border-border/50 text-center">
            <div className="text-lg font-bold text-primary">{data.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>

      {/* Owner Cards */}
      <section>
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
          <Users size={17} className="text-primary" />
          Dashboard Owners
        </h2>
        <OwnerCards />
      </section>

      {/* Filters */}
      <FilterPanel
        selectedOwner={selectedOwner}
        setSelectedOwner={setSelectedOwner}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
      />

      {/* Charts */}
      <section>
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
          <BarChart3 size={17} className="text-primary" />
          Analytics ({filteredData.length} tasks)
        </h2>
        <DashboardCharts filteredData={filteredData} />
      </section>

      {/* All Tasks Table */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">All Tasks</h2>
        <TasksTable tasks={filteredData} />
      </section>
    </div>
  );
}
