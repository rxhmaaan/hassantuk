import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppContext';
import { OwnerInfo } from '../types/actionPlan';
import { ArrowRight, User } from 'lucide-react';

interface OwnerCardProps {
  owner: OwnerInfo;
  tasks: { update: string }[];
  photo: string | null;
  style: 'full' | 'compact' | 'minimal';
  showProgress: boolean;
  showPhoto: boolean;
  kpiLabels: { completed: string; pending: string; inProgress: string; rejected: string };
}

function ProgressBar({ tasks }: { tasks: { update: string }[] }) {
  if (tasks.length === 0) return <div className="h-2 bg-muted rounded-full" />;
  const colorMap: Record<string, string> = { done: 'bg-status-done', rejected: 'bg-status-rejected', partial: 'bg-status-partially-done', inprogress: 'bg-status-in-progress', pending: 'bg-status-pending' };
  const segments = tasks.map((t) => {
    if (t.update === 'Done') return 'done';
    if (t.update === 'Rejected') return 'rejected';
    if (t.update === 'Partially Done') return 'partial';
    if (t.update === 'In Progress') return 'inprogress';
    return 'pending';
  });
  return (
    <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden">
      {segments.map((seg, i) => <div key={i} className={`flex-1 ${colorMap[seg] || 'bg-muted'} transition-all`} title={tasks[i].update || '—'} />)}
    </div>
  );
}

function OwnerCard({ owner, tasks, photo, style, showProgress, showPhoto, kpiLabels }: OwnerCardProps) {
  const navigate = useNavigate();
  const completed = tasks.filter((t) => t.update === 'Done').length;
  const rejected = tasks.filter((t) => t.update === 'Rejected').length;
  const pending = tasks.filter((t) => t.update === 'Pending').length;
  const inProgress = tasks.filter((t) => t.update !== 'Done' && t.update !== 'Rejected' && t.update !== 'Pending').length;
  const donePercent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  if (style === 'minimal') {
    return (
      <div onClick={() => navigate(`/owner/${encodeURIComponent(owner.name)}`)}
        className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 p-4 cursor-pointer border border-border/50 flex items-center gap-3">
        {showPhoto && (photo ? (
          <img src={photo} alt={owner.name} className="w-10 h-10 rounded-full object-cover border border-primary/20" />
        ) : (
          <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center border border-primary/20">
            <User size={18} className="text-primary-foreground/80" />
          </div>
        ))}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate">{owner.name}</h3>
          <p className="text-xs text-muted-foreground">{tasks.length} tasks · {donePercent}%</p>
        </div>
        <ArrowRight size={14} className="text-muted-foreground" />
      </div>
    );
  }

  if (style === 'compact') {
    return (
      <div className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 border border-border/50 overflow-hidden">
        <div className="h-1 gradient-hero" />
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            {showPhoto && (photo ? (
              <img src={photo} alt={owner.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
            ) : (
              <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center border-2 border-primary/20">
                <User size={22} className="text-primary-foreground/80" />
              </div>
            ))}
            <div>
              <h3 className="text-sm font-bold text-foreground">{owner.name}</h3>
              <p className="text-xs text-primary font-semibold">{tasks.length} tasks</p>
            </div>
          </div>
          {showProgress && <ProgressBar tasks={tasks} />}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className="text-status-done font-semibold">{completed}</span>
            <span className="text-status-pending font-semibold">{pending}</span>
            <span className="text-status-in-progress font-semibold">{inProgress}</span>
            <span className="text-status-rejected font-semibold">{rejected}</span>
          </div>
          <button onClick={() => navigate(`/owner/${encodeURIComponent(owner.name)}`)} className="mt-3 w-full gradient-hero text-primary-foreground text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1 hover:opacity-90">
            View <ArrowRight size={12} />
          </button>
        </div>
      </div>
    );
  }

  // Full style (default)
  return (
    <div className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col overflow-hidden border border-border/50">
      <div className="h-1.5 gradient-hero" />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative shrink-0">
            {showPhoto && (photo ? (
              <img src={photo} alt={owner.name} className="w-[72px] h-[72px] rounded-full object-cover border-2 border-primary/20 shadow-md" />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full gradient-hero flex items-center justify-center border-2 border-primary/20 shadow-md">
                <User size={32} className="text-primary-foreground/80" />
              </div>
            ))}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center">
              <div className={`w-2.5 h-2.5 rounded-full ${donePercent === 100 ? 'bg-status-done' : donePercent > 50 ? 'bg-status-partially-done' : 'bg-status-pending'}`} />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground leading-tight">{owner.name}</h3>
            <p className="text-xs italic text-muted-foreground mt-0.5">{owner.designation}</p>
            <p className="text-xs text-primary font-semibold mt-1">{tasks.length} tasks</p>
          </div>
        </div>
        {showProgress && (
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground"><span>Progress</span><span className="font-semibold text-foreground">{donePercent}%</span></div>
            <ProgressBar tasks={tasks} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-center"><div className="text-base font-bold text-status-done">{completed}</div><div className="text-xs text-muted-foreground">{kpiLabels.completed}</div></div>
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-center"><div className="text-base font-bold text-status-pending">{pending}</div><div className="text-xs text-muted-foreground">{kpiLabels.pending}</div></div>
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-center"><div className="text-base font-bold text-status-in-progress">{inProgress}</div><div className="text-xs text-muted-foreground">{kpiLabels.inProgress}</div></div>
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-center"><div className="text-base font-bold text-status-rejected">{rejected}</div><div className="text-xs text-muted-foreground">{kpiLabels.rejected}</div></div>
        </div>
        <button onClick={() => navigate(`/owner/${encodeURIComponent(owner.name)}`)} className="mt-auto w-full gradient-hero text-primary-foreground text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          View Tasks <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

export function OwnerCards() {
  const { data, photos, owners, layoutConfig, kpiConfig } = useAppData();
  const colsClass = layoutConfig.ownerCardColumns === 2 ? 'grid-cols-1 sm:grid-cols-2' : layoutConfig.ownerCardColumns === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  const cardData = useMemo(() => {
    return owners.map((owner) => ({
      owner,
      tasks: data.filter((item) => item.dashboardOwner === owner.name),
      photo: photos[owner.photoKey] || null,
    }));
  }, [data, photos, owners]);

  return (
    <div className={`grid ${colsClass} gap-5`}>
      {cardData.map(({ owner, tasks, photo }) => (
        <OwnerCard
          key={owner.name} owner={owner} tasks={tasks} photo={photo}
          style={layoutConfig.ownerCardStyle}
          showProgress={layoutConfig.showProgressBar}
          showPhoto={layoutConfig.showOwnerPhoto}
          kpiLabels={{
            completed: kpiConfig.completedLabel,
            pending: kpiConfig.pendingLabel,
            inProgress: kpiConfig.inProgressLabel,
            rejected: kpiConfig.rejectedLabel,
          }}
        />
      ))}
    </div>
  );
}
