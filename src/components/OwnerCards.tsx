import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppContext';
import { OWNERS, OwnerInfo } from '../types/actionPlan';
import { ArrowRight, User } from 'lucide-react';

interface OwnerCardProps {
  owner: OwnerInfo;
  tasks: { update: string }[];
  photo: string | null;
}

function ProgressBar({ tasks }: { tasks: { update: string }[] }) {
  const total = tasks.length;
  if (total === 0) return <div className="h-2 bg-muted rounded-full" />;

  const segments = tasks.map((t) => {
    const s = t.update;
    if (s === 'Done') return 'done';
    if (s === 'Rejected') return 'rejected';
    if (s === 'Partially Done') return 'partial';
    if (s === 'In Progress') return 'inprogress';
    return 'pending';
  });

  const colorMap: Record<string, string> = {
    done: 'bg-status-done',
    rejected: 'bg-status-rejected',
    partial: 'bg-status-partially-done',
    inprogress: 'bg-status-in-progress',
    pending: 'bg-status-pending',
  };

  return (
    <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden">
      {segments.map((seg, i) => (
        <div
          key={i}
          className={`flex-1 ${colorMap[seg] || 'bg-muted'} transition-all`}
          title={tasks[i].update || '—'}
        />
      ))}
    </div>
  );
}

function OwnerCard({ owner, tasks, photo }: OwnerCardProps) {
  const navigate = useNavigate();
  // KPI grouping: Completed=Done, Rejected=Rejected, Pending=Pending, InProgress=everything else
  const completed  = tasks.filter((t) => t.update === 'Done').length;
  const rejected   = tasks.filter((t) => t.update === 'Rejected').length;
  const pending    = tasks.filter((t) => t.update === 'Pending').length;
  const inProgress = tasks.filter((t) => t.update !== 'Done' && t.update !== 'Rejected' && t.update !== 'Pending').length;
  const donePercent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col overflow-hidden border border-border/50">
      {/* Top color stripe */}
      <div className="h-1.5 gradient-hero" />
      
      <div className="p-6 flex flex-col flex-1">
        {/* Avatar + Info */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative shrink-0">
            {photo ? (
              <img
                src={photo}
                alt={owner.name}
                className="w-[72px] h-[72px] rounded-full object-cover border-2 border-primary/20 shadow-md"
              />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full gradient-hero flex items-center justify-center border-2 border-primary/20 shadow-md">
                <User size={32} className="text-primary-foreground/80" />
              </div>
            )}
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

        {/* Progress */}
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-semibold text-foreground">{donePercent}%</span>
          </div>
          <ProgressBar tasks={tasks} />
        </div>

        {/* Stats — 4 KPI boxes */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-status-done">{completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-status-pending">{pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-status-in-progress">{inProgress}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-status-rejected">{rejected}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
        </div>

        {/* View Button */}
        <button
          onClick={() => navigate(`/owner/${encodeURIComponent(owner.name)}`)}
          className="mt-auto w-full gradient-hero text-primary-foreground text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          View Tasks <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

export function OwnerCards() {
  const { data, photos } = useAppData();

  // OWNERS is already in alphabetical order
  const cardData = useMemo(() => {
    return OWNERS.map((owner) => {
      // Match exactly by dashboardOwner name
      const tasks = data.filter((item) => item.dashboardOwner === owner.name);
      const photo = photos[owner.photoKey] || null;
      return { owner, tasks, photo };
    });
  }, [data, photos]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cardData.map(({ owner, tasks, photo }) => (
        <OwnerCard key={owner.name} owner={owner} tasks={tasks} photo={photo} />
      ))}
    </div>
  );
}
