import React, { useState } from 'react';
import { useAppData } from '../context/AppContext';
import { OwnerCards } from '../components/OwnerCards';
import { TasksTable } from '../components/TasksTable';
import { Upload, Users, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { UploadModal } from '../components/UploadModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

export default function Index() {
  const { data, isLoaded, dashboardConfig, layoutConfig, kpiConfig } = useAppData();
  const [uploadOpen, setUploadOpen] = useState(false);

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
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">Upload your Excel spreadsheet and owner photos to activate the dashboard.</p>
            <button onClick={() => setUploadOpen(true)} className="gradient-hero text-primary-foreground font-semibold px-8 py-3 rounded-xl text-sm flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity shadow-lg">
              <Upload size={18} /> Upload Excel + Owner Photos
            </button>
          </div>
        </div>
        <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      </>
    );
  }

  const completedCount = data.filter((d) => d.update === 'Done').length;
  const rejectedCount = data.filter((d) => d.update === 'Rejected').length;
  const pendingCount = data.filter((d) => d.update === 'Pending').length;
  const inProgressCount = data.filter((d) => d.update !== 'Done' && d.update !== 'Rejected' && d.update !== 'Pending').length;

  const kpiItems = [
    { show: kpiConfig.showTotal, value: data.length, label: kpiConfig.totalLabel, colorClass: 'text-primary' },
    { show: kpiConfig.showCompleted, value: completedCount, label: kpiConfig.completedLabel, colorClass: 'text-status-done' },
    { show: kpiConfig.showPending, value: pendingCount, label: kpiConfig.pendingLabel, colorClass: 'text-status-pending' },
    { show: kpiConfig.showInProgress, value: inProgressCount, label: kpiConfig.inProgressLabel, colorClass: 'text-status-in-progress' },
    { show: kpiConfig.showRejected, value: rejectedCount, label: kpiConfig.rejectedLabel, colorClass: 'text-status-rejected' },
  ].filter((k) => k.show);

  const kpiStyleClass = layoutConfig.kpiStyle === 'banner'
    ? 'flex items-center gap-6 bg-card rounded-xl px-6 py-4 shadow-card border border-border/50'
    : layoutConfig.kpiStyle === 'inline'
    ? 'flex items-center gap-4 flex-wrap'
    : 'flex items-center gap-3 flex-wrap';

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{dashboardConfig.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {dashboardConfig.subtitle} — {dashboardConfig.dateLabel} · {data.length} total tasks
          </p>
        </div>

        {layoutConfig.showKpiBoxes && (
          <div className={kpiStyleClass}>
            {kpiItems.map((kpi) => (
              layoutConfig.kpiStyle === 'banner' ? (
                <div key={kpi.label} className="text-center">
                  <div className={`text-2xl font-bold ${kpi.colorClass}`}>{kpi.value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{kpi.label}</div>
                </div>
              ) : layoutConfig.kpiStyle === 'inline' ? (
                <span key={kpi.label} className={`text-sm font-semibold ${kpi.colorClass}`}>
                  {kpi.value} {kpi.label}
                </span>
              ) : (
                <div key={kpi.label} className="bg-card rounded-xl px-4 py-2.5 shadow-card border border-border/50 text-center min-w-[80px]">
                  <div className={`text-2xl font-bold ${kpi.colorClass}`}>{kpi.value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{kpi.label}</div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {layoutConfig.showOwnerCards && (
        <section>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
            <Users size={17} className="text-primary" /> Dashboard Owners
          </h2>
          <OwnerCards />
        </section>
      )}

      {layoutConfig.showTasksTable && (
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">All Tasks ({data.length})</h2>
          <TasksTable tasks={data} />
        </section>
      )}
    </div>
  );
}
