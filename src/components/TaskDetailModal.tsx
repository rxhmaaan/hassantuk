import React from 'react';
import { X, Calendar, Tag, User, AlertCircle, FileText, Layers } from 'lucide-react';
import { ActionItem, STATUS_COLORS } from '../types/actionPlan';

interface TaskDetailModalProps {
  task: ActionItem | null;
  onClose: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  'Done': 'bg-status-done/15 text-status-done border-status-done/30',
  'Pending': 'bg-status-pending/15 text-status-pending border-status-pending/30',
  'Rejected': 'bg-status-rejected/15 text-status-rejected border-status-rejected/30',
  'In Progress': 'bg-status-in-progress/15 text-status-in-progress border-status-in-progress/30',
  'Partially Done': 'bg-status-partially-done/15 text-status-partially-done border-status-partially-done/30',
  'NA': 'bg-muted text-muted-foreground border-border',
  '': 'bg-muted text-muted-foreground border-border',
};

const PRIORITY_BADGE: Record<string, string> = {
  'P1': 'bg-red-50 text-red-700 border-red-200',
  'P2': 'bg-blue-50 text-blue-700 border-blue-200',
};

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  if (!task) return null;

  const statusLabel = task.update || '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card text-card-foreground rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="gradient-hero px-6 py-4 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRIORITY_BADGE[task.priority] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {task.priority || '—'}
              </span>
              <span className="text-white/60 text-xs">Task #{task.id}</span>
            </div>
            <h2 className="text-base font-bold text-white leading-snug line-clamp-3">
              {task.plannedActions}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white mt-1 shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {/* Status Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center text-sm font-semibold px-3 py-1 rounded-full border ${STATUS_BADGE[task.update] || STATUS_BADGE['']}`}>
              {statusLabel}
            </span>
          </div>

          <Field icon={<User size={15} />} label="Dashboard Owner" value={task.dashboardOwner} />
          <Field icon={<User size={15} />} label="Assigned Owner" value={task.owner} />
          <Field icon={<Calendar size={15} />} label="Expected Completion Date" value={task.ecd} />
          <Field icon={<Layers size={15} />} label="Stream Owner" value={task.streamOwner} />
          <Field icon={<Tag size={15} />} label="Challenge Category" value={task.challengeCategory} />
          <Field icon={<AlertCircle size={15} />} label="Area of Improvement" value={task.areaOfImprovement} />
          {task.remarks && (
            <div className="flex gap-3 py-3">
              <div className="text-muted-foreground mt-0.5 shrink-0"><FileText size={15} /></div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Remarks</div>
                <div className="text-sm text-foreground whitespace-pre-wrap">{task.remarks}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="w-full gradient-hero text-primary-foreground font-semibold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
