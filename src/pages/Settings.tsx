import React, { useRef, useState } from 'react';
import { useAppData } from '../context/AppContext';
import { OwnerInfo, DEFAULT_OWNERS, DEFAULT_COLUMNS, ColumnConfig, ALL_STATUSES, ActionItem } from '../types/actionPlan';
import { DEFAULT_DASHBOARD_CONFIG, DashboardConfig, clearAllData } from '../utils/dataUtils';
import {
  User, Upload, CheckCircle2, Settings as SettingsIcon, Camera, Plus, Trash2, Edit2, Save,
  Eye, EyeOff, LayoutDashboard, Columns, Users, Database, X, RotateCcw, FileText, ChevronDown
} from 'lucide-react';

export default function Settings() {
  const {
    photos, uploadFiles, uploading, owners, setOwners,
    columns, setColumns, dashboardConfig, setDashboardConfig,
    data, updateTask, deleteTask, clearData,
  } = useAppData();

  const [activeTab, setActiveTab] = useState<'owners' | 'columns' | 'dashboard' | 'tasks' | 'data'>('owners');
  const [savedOwner, setSavedOwner] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Owner management state
  const [editingOwner, setEditingOwner] = useState<number | null>(null);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerDesignation, setNewOwnerDesignation] = useState('');
  const [addingOwner, setAddingOwner] = useState(false);
  const [addName, setAddName] = useState('');
  const [addDesignation, setAddDesignation] = useState('');

  // Dashboard config state
  const [dashTitle, setDashTitle] = useState(dashboardConfig.title);
  const [dashSubtitle, setDashSubtitle] = useState(dashboardConfig.subtitle);
  const [dashDate, setDashDate] = useState(dashboardConfig.dateLabel);

  // Task editing state
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [taskEdits, setTaskEdits] = useState<Partial<ActionItem>>({});

  const handlePhotoChange = async (ownerPhotoKey: string, file: File) => {
    await uploadFiles(null, [file], ownerPhotoKey);
    setSavedOwner(ownerPhotoKey);
    setTimeout(() => setSavedOwner(null), 2000);
  };

  const handleAddOwner = () => {
    if (!addName.trim()) return;
    const photoKey = addName.trim().replace(/\s+/g, '-');
    const newOwner: OwnerInfo = { name: addName.trim(), designation: addDesignation.trim(), photoKey };
    const updated = [...owners, newOwner].sort((a, b) => a.name.localeCompare(b.name));
    setOwners(updated);
    setAddName('');
    setAddDesignation('');
    setAddingOwner(false);
  };

  const handleRemoveOwner = (idx: number) => {
    const updated = owners.filter((_, i) => i !== idx);
    setOwners(updated);
  };

  const handleSaveOwnerEdit = (idx: number) => {
    const updated = [...owners];
    updated[idx] = { ...updated[idx], name: newOwnerName, designation: newOwnerDesignation };
    setOwners(updated.sort((a, b) => a.name.localeCompare(b.name)));
    setEditingOwner(null);
  };

  const handleToggleColumn = (key: keyof ActionItem) => {
    const updated = columns.map((c) => c.key === key ? { ...c, visible: !c.visible } : c);
    setColumns(updated);
  };

  const handleSaveDashboard = () => {
    setDashboardConfig({ title: dashTitle, subtitle: dashSubtitle, dateLabel: dashDate });
  };

  const handleSaveTask = (id: number) => {
    updateTask(id, taskEdits);
    setEditingTask(null);
    setTaskEdits({});
  };

  const handleResetAll = () => {
    if (confirm('This will reset all settings to defaults and clear uploaded data. Continue?')) {
      clearAllData();
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'owners' as const, label: 'Owners', icon: Users },
    { id: 'columns' as const, label: 'Columns', icon: Columns },
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' as const, label: 'Edit Tasks', icon: Edit2 },
    { id: 'data' as const, label: 'Data', icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center shadow">
          <SettingsIcon size={20} className="text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage owners, columns, dashboard, and tasks</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 border border-border/50 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'gradient-hero text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========== OWNERS TAB ========== */}
      {activeTab === 'owners' && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <div className="gradient-hero px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-primary-foreground flex items-center gap-2">
                <Camera size={18} />
                Dashboard Owners ({owners.length})
              </h2>
              <p className="text-xs text-primary-foreground/70 mt-0.5">Add, edit, remove owners and upload photos</p>
            </div>
            <button
              onClick={() => setAddingOwner(true)}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={14} /> Add Owner
            </button>
          </div>

          {/* Add Owner Form */}
          {addingOwner && (
            <div className="px-6 py-4 bg-muted/30 border-b border-border flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[150px]">
                <label className="text-xs font-medium text-muted-foreground block mb-1">Name</label>
                <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Full name" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="text-xs font-medium text-muted-foreground block mb-1">Designation</label>
                <input value={addDesignation} onChange={(e) => setAddDesignation(e.target.value)} placeholder="Role/Department" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <button onClick={handleAddOwner} disabled={!addName.trim()} className="gradient-hero text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                <Save size={13} className="inline mr-1" /> Save
              </button>
              <button onClick={() => setAddingOwner(false)} className="text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg border border-border">Cancel</button>
            </div>
          )}

          <div className="divide-y divide-border">
            {owners.map((owner, idx) => {
              const photo = photos[owner.photoKey] || null;
              const isSaved = savedOwner === owner.photoKey;
              const isEditing = editingOwner === idx;

              return (
                <div key={owner.name + idx} className="flex items-center gap-4 px-6 py-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {photo ? (
                      <img src={photo} alt={owner.name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shadow" />
                    ) : (
                      <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center border-2 border-primary/20 shadow opacity-50">
                        <User size={24} className="text-primary-foreground/70" />
                      </div>
                    )}
                    {isSaved && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-status-done flex items-center justify-center shadow">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex flex-wrap gap-2">
                        <input value={newOwnerName} onChange={(e) => setNewOwnerName(e.target.value)} className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <input value={newOwnerDesignation} onChange={(e) => setNewOwnerDesignation(e.target.value)} className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <button onClick={() => handleSaveOwnerEdit(idx)} className="text-xs text-status-done font-semibold px-2 py-1"><Save size={13} /></button>
                        <button onClick={() => setEditingOwner(null)} className="text-xs text-muted-foreground px-2 py-1"><X size={13} /></button>
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold text-foreground text-sm">{owner.name}</div>
                        <div className="text-xs italic text-muted-foreground mt-0.5">{owner.designation}</div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setEditingOwner(idx); setNewOwnerName(owner.name); setNewOwnerDesignation(owner.designation); }}
                      className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleRemoveOwner(idx)}
                      className="p-2 text-muted-foreground hover:text-status-rejected rounded-lg hover:bg-muted transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => fileRefs.current[owner.photoKey]?.click()}
                      disabled={uploading}
                      className="flex items-center gap-1.5 gradient-hero text-primary-foreground text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow"
                    >
                      <Upload size={12} />
                      {photo ? 'Replace' : 'Upload'}
                    </button>
                    <input
                      ref={(el) => { fileRefs.current[owner.photoKey] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoChange(owner.photoKey, file);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-3 bg-muted/30 border-t border-border">
            <button onClick={() => setOwners([...DEFAULT_OWNERS].sort((a, b) => a.name.localeCompare(b.name)))} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RotateCcw size={12} /> Reset to defaults
            </button>
          </div>
        </div>
      )}

      {/* ========== COLUMNS TAB ========== */}
      {activeTab === 'columns' && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <div className="gradient-hero px-6 py-4">
            <h2 className="text-base font-bold text-primary-foreground flex items-center gap-2">
              <Columns size={18} />
              Column Visibility
            </h2>
            <p className="text-xs text-primary-foreground/70 mt-0.5">Choose which columns appear in the tasks table</p>
          </div>
          <div className="divide-y divide-border">
            {columns.map((col) => (
              <div key={col.key} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <div className="text-sm font-medium text-foreground">{col.label}</div>
                  <div className="text-xs text-muted-foreground font-mono">{col.key}</div>
                </div>
                <button
                  onClick={() => handleToggleColumn(col.key)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    col.visible
                      ? 'bg-status-done/15 text-status-done border border-status-done/30'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {col.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  {col.visible ? 'Visible' : 'Hidden'}
                </button>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-muted/30 border-t border-border">
            <button onClick={() => setColumns([...DEFAULT_COLUMNS])} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RotateCcw size={12} /> Reset to defaults
            </button>
          </div>
        </div>
      )}

      {/* ========== DASHBOARD TAB ========== */}
      {activeTab === 'dashboard' && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <div className="gradient-hero px-6 py-4">
            <h2 className="text-base font-bold text-primary-foreground flex items-center gap-2">
              <LayoutDashboard size={18} />
              Dashboard Settings
            </h2>
            <p className="text-xs text-primary-foreground/70 mt-0.5">Customize the dashboard title, subtitle, and date</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Dashboard Title</label>
              <input value={dashTitle} onChange={(e) => setDashTitle(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Subtitle</label>
              <input value={dashSubtitle} onChange={(e) => setDashSubtitle(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Date Label</label>
              <input value={dashDate} onChange={(e) => setDashDate(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveDashboard} className="gradient-hero text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                <Save size={14} className="inline mr-1.5" /> Save Changes
              </button>
              <button onClick={() => { setDashTitle(DEFAULT_DASHBOARD_CONFIG.title); setDashSubtitle(DEFAULT_DASHBOARD_CONFIG.subtitle); setDashDate(DEFAULT_DASHBOARD_CONFIG.dateLabel); setDashboardConfig(DEFAULT_DASHBOARD_CONFIG); }} className="text-xs text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border border-border">
                <RotateCcw size={12} className="inline mr-1" /> Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== TASKS TAB ========== */}
      {activeTab === 'tasks' && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <div className="gradient-hero px-6 py-4">
            <h2 className="text-base font-bold text-primary-foreground flex items-center gap-2">
              <Edit2 size={18} />
              Edit Tasks ({data.length})
            </h2>
            <p className="text-xs text-primary-foreground/70 mt-0.5">Modify status, remarks, owner, or delete tasks</p>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground w-10">#</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground min-w-[200px]">Planned Action</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground w-32">Owner</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground w-28">Status</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground min-w-[150px]">Remarks</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((task) => {
                  const isEditing = editingTask === task.id;
                  return (
                    <tr key={task.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-3 py-2 text-xs text-muted-foreground">{task.id}</td>
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <textarea
                            value={taskEdits.plannedActions ?? task.plannedActions}
                            onChange={(e) => setTaskEdits({ ...taskEdits, plannedActions: e.target.value })}
                            className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                            rows={2}
                          />
                        ) : (
                          <p className="text-xs text-foreground line-clamp-2">{task.plannedActions}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <input
                            value={taskEdits.dashboardOwner ?? task.dashboardOwner}
                            onChange={(e) => setTaskEdits({ ...taskEdits, dashboardOwner: e.target.value })}
                            className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                          />
                        ) : (
                          <span className="text-xs text-foreground">{task.dashboardOwner}</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <div className="relative">
                            <select
                              value={taskEdits.update ?? task.update}
                              onChange={(e) => setTaskEdits({ ...taskEdits, update: e.target.value })}
                              className="w-full appearance-none bg-background border border-border rounded px-2 py-1 pr-6 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                            >
                              <option value="">—</option>
                              {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          </div>
                        ) : (
                          <span className="text-xs">{task.update || '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <textarea
                            value={taskEdits.remarks ?? task.remarks}
                            onChange={(e) => setTaskEdits({ ...taskEdits, remarks: e.target.value })}
                            className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                            rows={2}
                          />
                        ) : (
                          <p className="text-xs text-muted-foreground line-clamp-2">{task.remarks || '—'}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <button onClick={() => handleSaveTask(task.id)} className="p-1.5 text-status-done hover:bg-status-done/10 rounded transition-colors" title="Save">
                                <Save size={13} />
                              </button>
                              <button onClick={() => { setEditingTask(null); setTaskEdits({}); }} className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors" title="Cancel">
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditingTask(task.id); setTaskEdits({}); }} className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors" title="Edit">
                                <Edit2 size={13} />
                              </button>
                              <button onClick={() => { if (confirm('Delete this task?')) deleteTask(task.id); }} className="p-1.5 text-muted-foreground hover:text-status-rejected rounded hover:bg-muted transition-colors" title="Delete">
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== DATA TAB ========== */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
            <div className="gradient-hero px-6 py-4">
              <h2 className="text-base font-bold text-primary-foreground flex items-center gap-2">
                <Database size={18} />
                Data Management
              </h2>
              <p className="text-xs text-primary-foreground/70 mt-0.5">Upload new data or reset everything</p>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <FileText size={15} className="text-primary" />
                  Current Data
                </h3>
                <p className="text-xs text-muted-foreground">
                  <strong>{data.length}</strong> tasks loaded · <strong>{owners.length}</strong> owners configured
                </p>
              </div>

              <div className="bg-status-rejected/5 rounded-xl p-4 border border-status-rejected/20">
                <h3 className="text-sm font-semibold text-foreground mb-2">⚠️ Danger Zone</h3>
                <p className="text-xs text-muted-foreground mb-3">These actions cannot be undone.</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => { if (confirm('Clear all task data?')) clearData(); }}
                    className="flex items-center gap-1.5 bg-status-rejected/10 hover:bg-status-rejected/20 text-status-rejected text-xs font-semibold px-4 py-2 rounded-lg border border-status-rejected/30 transition-colors"
                  >
                    <Trash2 size={13} /> Clear Task Data
                  </button>
                  <button
                    onClick={handleResetAll}
                    className="flex items-center gap-1.5 bg-status-rejected/10 hover:bg-status-rejected/20 text-status-rejected text-xs font-semibold px-4 py-2 rounded-lg border border-status-rejected/30 transition-colors"
                  >
                    <RotateCcw size={13} /> Factory Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl px-5 py-4 border border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">💡 Tip:</span> All settings, owner configs, column visibility, and dashboard customizations are saved locally in your browser. Use the <span className="font-semibold text-foreground">Upload Data</span> button in the top navigation to upload a new Excel file.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
