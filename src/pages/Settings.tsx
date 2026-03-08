import React, { useRef, useState } from 'react';
import { useAppData } from '../context/AppContext';
import SpreadsheetEditor from '../components/SpreadsheetEditor';
import {
  OwnerInfo, DEFAULT_OWNERS, DEFAULT_COLUMNS, ColumnConfig, ALL_STATUSES, ActionItem,
  ThemeConfig, DEFAULT_THEME, LayoutConfig, DEFAULT_LAYOUT,
  BrandingConfig, DEFAULT_BRANDING, StatusConfig, DEFAULT_STATUS_CONFIG,
  KpiConfig, DEFAULT_KPI_CONFIG, FONT_OPTIONS,
} from '../types/actionPlan';
import { DEFAULT_DASHBOARD_CONFIG, DashboardConfig, clearAllData, readFileAsDataUrl } from '../utils/dataUtils';
import {
  User, Upload, CheckCircle2, Settings as SettingsIcon, Camera, Plus, Trash2, Edit2, Save,
  Eye, EyeOff, LayoutDashboard, Columns, Users, Database, X, RotateCcw, FileText,
  ChevronDown, Palette, Layout, Tag, BarChart3, Image, Type, Sliders, ToggleLeft,
} from 'lucide-react';

export default function Settings() {
  const {
    photos, uploadFiles, uploading, owners, setOwners,
    columns, setColumns, dashboardConfig, setDashboardConfig,
    data, updateTask, deleteTask, clearData,
    themeConfig, setThemeConfig,
    layoutConfig, setLayoutConfig,
    brandingConfig, setBrandingConfig,
    statusConfig, setStatusConfig,
    kpiConfig, setKpiConfig,
  } = useAppData();

  const [activeTab, setActiveTab] = useState<string>('branding');
  const [savedOwner, setSavedOwner] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const logoRef = useRef<HTMLInputElement | null>(null);

  // Owner management
  const [editingOwner, setEditingOwner] = useState<number | null>(null);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerDesignation, setNewOwnerDesignation] = useState('');
  const [addingOwner, setAddingOwner] = useState(false);
  const [addName, setAddName] = useState('');
  const [addDesignation, setAddDesignation] = useState('');

  // Dashboard config
  const [dashTitle, setDashTitle] = useState(dashboardConfig.title);
  const [dashSubtitle, setDashSubtitle] = useState(dashboardConfig.subtitle);
  const [dashDate, setDashDate] = useState(dashboardConfig.dateLabel);

  // Task editing
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [taskEdits, setTaskEdits] = useState<Partial<ActionItem>>({});

  // Branding
  const [bAppName, setBAppName] = useState(brandingConfig.appName);
  const [bAppSub, setBAppSub] = useState(brandingConfig.appSubtitle);
  const [bFooter, setBFooter] = useState(brandingConfig.footerText);
  const [bEmoji, setBEmoji] = useState(brandingConfig.faviconEmoji);

  const handlePhotoChange = async (ownerPhotoKey: string, file: File) => {
    await uploadFiles(null, [file], ownerPhotoKey);
    setSavedOwner(ownerPhotoKey);
    setTimeout(() => setSavedOwner(null), 2000);
  };

  const handleLogoUpload = async (file: File) => {
    const url = await readFileAsDataUrl(file);
    setBrandingConfig({ ...brandingConfig, logoDataUrl: url });
  };

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Image },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'owners', label: 'Owners', icon: Users },
    { id: 'columns', label: 'Columns', icon: Columns },
    { id: 'statuses', label: 'Statuses', icon: Tag },
    { id: 'kpis', label: 'KPIs', icon: BarChart3 },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Edit Tasks', icon: Edit2 },
    { id: 'data', label: 'Data', icon: Database },
  ];

  // Helper for section header
  const SectionHeader = ({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) => (
    <div className="gradient-hero px-6 py-4">
      <h2 className="text-base font-bold text-primary-foreground flex items-center gap-2"><Icon size={18} />{title}</h2>
      <p className="text-xs text-primary-foreground/70 mt-0.5">{desc}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center shadow"><SettingsIcon size={20} className="text-primary-foreground" /></div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Full website builder — customize everything without code</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 border border-border/50 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'gradient-hero text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
            <tab.icon size={13} />{tab.label}
          </button>
        ))}
      </div>

      {/* ========== BRANDING ========== */}
      {activeTab === 'branding' && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <SectionHeader icon={Image} title="Branding" desc="App name, logo, subtitle, and identity" />
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">App Name</label>
                <input value={bAppName} onChange={(e) => setBAppName(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">App Subtitle</label>
                <input value={bAppSub} onChange={(e) => setBAppSub(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Favicon Emoji</label>
                <input value={bEmoji} onChange={(e) => setBEmoji(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" maxLength={4} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Footer Text</label>
                <input value={bFooter} onChange={(e) => setBFooter(e.target.value)} placeholder="Optional footer" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-muted/50 border border-border flex items-center justify-center overflow-hidden">
                  {brandingConfig.logoDataUrl ? (
                    <img src={brandingConfig.logoDataUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Image size={24} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => logoRef.current?.click()} className="gradient-hero text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90">
                    <Upload size={12} className="inline mr-1" /> Upload Logo
                  </button>
                  {brandingConfig.logoDataUrl && (
                    <button onClick={() => setBrandingConfig({ ...brandingConfig, logoDataUrl: '' })} className="text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg border border-border">Remove</button>
                  )}
                </div>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
              </div>
            </div>

            {/* Toggles */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={brandingConfig.showNavBadge} onChange={(e) => setBrandingConfig({ ...brandingConfig, showNavBadge: e.target.checked })} className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30" />
              <span className="text-sm text-foreground">Show task count badge in navigation bar</span>
            </label>

            <button onClick={() => setBrandingConfig({ appName: bAppName, appSubtitle: bAppSub, footerText: bFooter, faviconEmoji: bEmoji, logoDataUrl: brandingConfig.logoDataUrl, showNavBadge: brandingConfig.showNavBadge })}
              className="gradient-hero text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90">
              <Save size={14} className="inline mr-1.5" /> Save Branding
            </button>
          </div>
        </div>
      )}

      {/* ========== THEME ========== */}
      {activeTab === 'theme' && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <SectionHeader icon={Palette} title="Theme & Colors" desc="Primary color, fonts, border radius, and more" />
          <div className="px-6 py-5 space-y-6">
            {/* Color Picker */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Primary Color</label>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-border" style={{ backgroundColor: `hsl(${themeConfig.primaryHue} ${themeConfig.primarySaturation}% ${themeConfig.primaryLightness}%)` }} />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-8">Hue</span>
                    <input type="range" min="0" max="360" value={themeConfig.primaryHue} onChange={(e) => setThemeConfig({ ...themeConfig, primaryHue: Number(e.target.value) })} className="flex-1 accent-primary" />
                    <span className="text-xs text-foreground w-8 text-right">{themeConfig.primaryHue}°</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-8">Sat</span>
                    <input type="range" min="0" max="100" value={themeConfig.primarySaturation} onChange={(e) => setThemeConfig({ ...themeConfig, primarySaturation: Number(e.target.value) })} className="flex-1 accent-primary" />
                    <span className="text-xs text-foreground w-8 text-right">{themeConfig.primarySaturation}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-8">Light</span>
                    <input type="range" min="10" max="60" value={themeConfig.primaryLightness} onChange={(e) => setThemeConfig({ ...themeConfig, primaryLightness: Number(e.target.value) })} className="flex-1 accent-primary" />
                    <span className="text-xs text-foreground w-8 text-right">{themeConfig.primaryLightness}%</span>
                  </div>
                </div>
              </div>
              {/* Quick presets */}
              <div className="flex gap-2 mt-3">
                {[
                  { label: 'Maroon', h: 0, s: 72, l: 32 },
                  { label: 'Blue', h: 220, s: 70, l: 40 },
                  { label: 'Green', h: 150, s: 60, l: 30 },
                  { label: 'Purple', h: 270, s: 65, l: 35 },
                  { label: 'Orange', h: 25, s: 85, l: 45 },
                  { label: 'Teal', h: 180, s: 60, l: 35 },
                  { label: 'Navy', h: 215, s: 50, l: 25 },
                  { label: 'Rose', h: 340, s: 70, l: 40 },
                ].map((p) => (
                  <button key={p.label} onClick={() => setThemeConfig({ ...themeConfig, primaryHue: p.h, primarySaturation: p.s, primaryLightness: p.l })}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                    title={p.label}>
                    <div className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: `hsl(${p.h} ${p.s}% ${p.l}%)` }} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Font Family</label>
                <div className="relative">
                  <select value={themeConfig.fontFamily} onChange={(e) => setThemeConfig({ ...themeConfig, fontFamily: e.target.value })}
                    className="w-full appearance-none bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {FONT_OPTIONS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Font Size</label>
                <div className="relative">
                  <select value={themeConfig.fontSize} onChange={(e) => setThemeConfig({ ...themeConfig, fontSize: e.target.value as 'sm' | 'base' | 'lg' })}
                    className="w-full appearance-none bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="sm">Small</option><option value="base">Normal</option><option value="lg">Large</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Border Radius</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="0" max="1.5" step="0.125" value={themeConfig.borderRadius} onChange={(e) => setThemeConfig({ ...themeConfig, borderRadius: Number(e.target.value) })} className="flex-1 accent-primary" />
                  <span className="text-xs text-foreground w-12 text-right">{themeConfig.borderRadius}rem</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setThemeConfig(DEFAULT_THEME)} className="text-xs text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border border-border flex items-center gap-1">
                <RotateCcw size={12} /> Reset Theme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== LAYOUT ========== */}
      {activeTab === 'layout' && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <SectionHeader icon={Layout} title="Layout & Sections" desc="Control grid, density, visibility, and card styles" />
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Owner Card Columns</label>
                <div className="relative">
                  <select value={layoutConfig.ownerCardColumns} onChange={(e) => setLayoutConfig({ ...layoutConfig, ownerCardColumns: Number(e.target.value) as 2 | 3 | 4 })}
                    className="w-full appearance-none bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value={2}>2 Columns</option><option value={3}>3 Columns</option><option value={4}>4 Columns</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Card Style</label>
                <div className="relative">
                  <select value={layoutConfig.ownerCardStyle} onChange={(e) => setLayoutConfig({ ...layoutConfig, ownerCardStyle: e.target.value as 'full' | 'compact' | 'minimal' })}
                    className="w-full appearance-none bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="full">Full (with KPIs)</option><option value="compact">Compact</option><option value="minimal">Minimal (list)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">KPI Display Style</label>
                <div className="relative">
                  <select value={layoutConfig.kpiStyle} onChange={(e) => setLayoutConfig({ ...layoutConfig, kpiStyle: e.target.value as 'boxes' | 'inline' | 'banner' })}
                    className="w-full appearance-none bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="boxes">Boxes</option><option value="inline">Inline</option><option value="banner">Banner</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><ToggleLeft size={15} className="text-primary" /> Section Visibility</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { key: 'showOwnerCards' as const, label: 'Owner Cards Section' },
                  { key: 'showKpiBoxes' as const, label: 'KPI Summary Boxes' },
                  { key: 'showTasksTable' as const, label: 'All Tasks Table' },
                  { key: 'showProgressBar' as const, label: 'Progress Bar in Cards' },
                  { key: 'showOwnerPhoto' as const, label: 'Owner Photos' },
                ]).map((item) => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer bg-muted/30 rounded-lg px-4 py-3 border border-border/50 hover:bg-muted/50 transition-colors">
                    <input type="checkbox" checked={layoutConfig[item.key]} onChange={(e) => setLayoutConfig({ ...layoutConfig, [item.key]: e.target.checked })} className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30" />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={() => setLayoutConfig(DEFAULT_LAYOUT)} className="text-xs text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border border-border flex items-center gap-1">
              <RotateCcw size={12} /> Reset Layout
            </button>
          </div>
        </div>
      )}

      {/* ========== OWNERS ========== */}
      {activeTab === 'owners' && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <div className="gradient-hero px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-primary-foreground flex items-center gap-2"><Camera size={18} /> Dashboard Owners ({owners.length})</h2>
              <p className="text-xs text-primary-foreground/70 mt-0.5">Add, edit, remove owners and upload photos</p>
            </div>
            <button onClick={() => setAddingOwner(true)} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-lg"><Plus size={14} /> Add Owner</button>
          </div>
          {addingOwner && (
            <div className="px-6 py-4 bg-muted/30 border-b border-border flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[150px]"><label className="text-xs font-medium text-muted-foreground block mb-1">Name</label><input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Full name" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div className="flex-1 min-w-[150px]"><label className="text-xs font-medium text-muted-foreground block mb-1">Designation</label><input value={addDesignation} onChange={(e) => setAddDesignation(e.target.value)} placeholder="Role" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <button onClick={() => { if (!addName.trim()) return; setOwners([...owners, { name: addName.trim(), designation: addDesignation.trim(), photoKey: addName.trim().replace(/\s+/g, '-') }].sort((a, b) => a.name.localeCompare(b.name))); setAddName(''); setAddDesignation(''); setAddingOwner(false); }} disabled={!addName.trim()} className="gradient-hero text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"><Save size={13} className="inline mr-1" /> Save</button>
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
                  <div className="relative shrink-0">
                    {photo ? <img src={photo} alt={owner.name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shadow" /> : <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center border-2 border-primary/20 shadow opacity-50"><User size={24} className="text-primary-foreground/70" /></div>}
                    {isSaved && <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-status-done flex items-center justify-center shadow"><CheckCircle2 size={12} className="text-white" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex flex-wrap gap-2">
                        <input value={newOwnerName} onChange={(e) => setNewOwnerName(e.target.value)} className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <input value={newOwnerDesignation} onChange={(e) => setNewOwnerDesignation(e.target.value)} className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <button onClick={() => { const u = [...owners]; u[idx] = { ...u[idx], name: newOwnerName, designation: newOwnerDesignation }; setOwners(u.sort((a, b) => a.name.localeCompare(b.name))); setEditingOwner(null); }} className="text-xs text-status-done font-semibold px-2 py-1"><Save size={13} /></button>
                        <button onClick={() => setEditingOwner(null)} className="text-xs text-muted-foreground px-2 py-1"><X size={13} /></button>
                      </div>
                    ) : (<><div className="font-semibold text-foreground text-sm">{owner.name}</div><div className="text-xs italic text-muted-foreground mt-0.5">{owner.designation}</div></>)}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { setEditingOwner(idx); setNewOwnerName(owner.name); setNewOwnerDesignation(owner.designation); }} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"><Edit2 size={14} /></button>
                    <button onClick={() => setOwners(owners.filter((_, i) => i !== idx))} className="p-2 text-muted-foreground hover:text-status-rejected rounded-lg hover:bg-muted"><Trash2 size={14} /></button>
                    <button onClick={() => fileRefs.current[owner.photoKey]?.click()} disabled={uploading} className="flex items-center gap-1.5 gradient-hero text-primary-foreground text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 shadow"><Upload size={12} />{photo ? 'Replace' : 'Upload'}</button>
                    <input ref={(el) => { fileRefs.current[owner.photoKey] = el; }} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoChange(owner.photoKey, f); }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-6 py-3 bg-muted/30 border-t border-border"><button onClick={() => setOwners([...DEFAULT_OWNERS])} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><RotateCcw size={12} /> Reset to defaults</button></div>
        </div>
      )}

      {/* ========== COLUMNS ========== */}
      {activeTab === 'columns' && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <SectionHeader icon={Columns} title="Column Visibility" desc="Toggle which columns appear in the tasks table" />
          <div className="divide-y divide-border">
            {columns.map((col) => (
              <div key={col.key} className="flex items-center justify-between px-6 py-3.5">
                <div><div className="text-sm font-medium text-foreground">{col.label}</div><div className="text-xs text-muted-foreground font-mono">{col.key}</div></div>
                <button onClick={() => setColumns(columns.map((c) => c.key === col.key ? { ...c, visible: !c.visible } : c))}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${col.visible ? 'bg-status-done/15 text-status-done border border-status-done/30' : 'bg-muted text-muted-foreground border border-border'}`}>
                  {col.visible ? <Eye size={13} /> : <EyeOff size={13} />}{col.visible ? 'Visible' : 'Hidden'}
                </button>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-muted/30 border-t border-border"><button onClick={() => setColumns([...DEFAULT_COLUMNS])} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><RotateCcw size={12} /> Reset</button></div>
        </div>
      )}

      {/* ========== STATUSES ========== */}
      {activeTab === 'statuses' && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <SectionHeader icon={Tag} title="Status Configuration" desc="Customize status labels, emojis, and colors" />
          <div className="divide-y divide-border">
            {statusConfig.map((sc, idx) => (
              <div key={sc.key} className="flex items-center gap-4 px-6 py-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `hsl(${sc.color} / 0.15)` }}>{sc.emoji}</div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <div><div className="text-xs text-muted-foreground mb-0.5">Key</div><div className="text-sm font-mono text-foreground">{sc.key}</div></div>
                  <div><label className="text-xs text-muted-foreground block mb-0.5">Label</label><input value={sc.label} onChange={(e) => { const u = [...statusConfig]; u[idx] = { ...u[idx], label: e.target.value }; setStatusConfig(u); }} className="w-full bg-muted/50 border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" /></div>
                  <div><label className="text-xs text-muted-foreground block mb-0.5">Emoji</label><input value={sc.emoji} onChange={(e) => { const u = [...statusConfig]; u[idx] = { ...u[idx], emoji: e.target.value }; setStatusConfig(u); }} className="w-full bg-muted/50 border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" maxLength={4} /></div>
                  <div><label className="text-xs text-muted-foreground block mb-0.5">Color (HSL)</label><input value={sc.color} onChange={(e) => { const u = [...statusConfig]; u[idx] = { ...u[idx], color: e.target.value }; setStatusConfig(u); }} className="w-full bg-muted/50 border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" /></div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-muted/30 border-t border-border"><button onClick={() => setStatusConfig([...DEFAULT_STATUS_CONFIG])} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><RotateCcw size={12} /> Reset</button></div>
        </div>
      )}

      {/* ========== KPIs ========== */}
      {activeTab === 'kpis' && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <SectionHeader icon={BarChart3} title="KPI Configuration" desc="Show/hide KPI boxes and customize labels" />
          <div className="px-6 py-5 space-y-4">
            {([
              { showKey: 'showTotal' as const, labelKey: 'totalLabel' as const, title: 'Total' },
              { showKey: 'showCompleted' as const, labelKey: 'completedLabel' as const, title: 'Completed' },
              { showKey: 'showPending' as const, labelKey: 'pendingLabel' as const, title: 'Pending' },
              { showKey: 'showInProgress' as const, labelKey: 'inProgressLabel' as const, title: 'In Progress' },
              { showKey: 'showRejected' as const, labelKey: 'rejectedLabel' as const, title: 'Rejected' },
            ]).map((item) => (
              <div key={item.showKey} className="flex items-center gap-4 bg-muted/30 rounded-lg px-4 py-3 border border-border/50">
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input type="checkbox" checked={kpiConfig[item.showKey]} onChange={(e) => setKpiConfig({ ...kpiConfig, [item.showKey]: e.target.checked })} className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30" />
                  <span className="text-sm text-foreground font-medium w-24">{item.title}</span>
                </label>
                <input value={kpiConfig[item.labelKey]} onChange={(e) => setKpiConfig({ ...kpiConfig, [item.labelKey]: e.target.value })} className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Custom label" />
              </div>
            ))}
            <button onClick={() => setKpiConfig(DEFAULT_KPI_CONFIG)} className="text-xs text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border border-border flex items-center gap-1"><RotateCcw size={12} /> Reset</button>
          </div>
        </div>
      )}

      {/* ========== DASHBOARD ========== */}
      {activeTab === 'dashboard' && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <SectionHeader icon={LayoutDashboard} title="Dashboard Settings" desc="Title, subtitle, and date label" />
          <div className="px-6 py-5 space-y-4">
            <div><label className="text-xs font-medium text-muted-foreground block mb-1">Dashboard Title</label><input value={dashTitle} onChange={(e) => setDashTitle(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-xs font-medium text-muted-foreground block mb-1">Subtitle</label><input value={dashSubtitle} onChange={(e) => setDashSubtitle(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-xs font-medium text-muted-foreground block mb-1">Date Label</label><input value={dashDate} onChange={(e) => setDashDate(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div className="flex gap-3">
              <button onClick={() => setDashboardConfig({ title: dashTitle, subtitle: dashSubtitle, dateLabel: dashDate })} className="gradient-hero text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90"><Save size={14} className="inline mr-1.5" /> Save</button>
              <button onClick={() => { setDashTitle(DEFAULT_DASHBOARD_CONFIG.title); setDashSubtitle(DEFAULT_DASHBOARD_CONFIG.subtitle); setDashDate(DEFAULT_DASHBOARD_CONFIG.dateLabel); setDashboardConfig(DEFAULT_DASHBOARD_CONFIG); }} className="text-xs text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border border-border"><RotateCcw size={12} className="inline mr-1" /> Reset</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <SectionHeader icon={Edit2} title={`Spreadsheet Editor (${data.length} tasks)`} desc="Excel-like editor — double-click any cell to edit, Tab/Enter to navigate" />
          <div className="px-4 py-4">
            <SpreadsheetEditor />
          </div>
        </div>
      )}

      {/* ========== DATA ========== */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
            <SectionHeader icon={Database} title="Data Management" desc="Upload new data or reset everything" />
            <div className="px-6 py-5 space-y-5">
              <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><FileText size={15} className="text-primary" /> Current Data</h3>
                <p className="text-xs text-muted-foreground"><strong>{data.length}</strong> tasks · <strong>{owners.length}</strong> owners · <strong>{columns.filter(c => c.visible).length}</strong> visible columns</p>
              </div>
              <div className="bg-status-rejected/5 rounded-xl p-4 border border-status-rejected/20">
                <h3 className="text-sm font-semibold text-foreground mb-2">⚠️ Danger Zone</h3>
                <p className="text-xs text-muted-foreground mb-3">These actions cannot be undone.</p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => { if (confirm('Clear all task data?')) clearData(); }} className="flex items-center gap-1.5 bg-status-rejected/10 hover:bg-status-rejected/20 text-status-rejected text-xs font-semibold px-4 py-2 rounded-lg border border-status-rejected/30"><Trash2 size={13} /> Clear Tasks</button>
                  <button onClick={() => { if (confirm('Factory reset everything?')) { clearAllData(); window.location.reload(); } }} className="flex items-center gap-1.5 bg-status-rejected/10 hover:bg-status-rejected/20 text-status-rejected text-xs font-semibold px-4 py-2 rounded-lg border border-status-rejected/30"><RotateCcw size={13} /> Factory Reset</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
