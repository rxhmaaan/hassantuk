import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ActionItem, OwnerInfo, ColumnConfig, DEFAULT_OWNERS, DEFAULT_COLUMNS,
  ThemeConfig, DEFAULT_THEME, LayoutConfig, DEFAULT_LAYOUT,
  BrandingConfig, DEFAULT_BRANDING, StatusConfig, DEFAULT_STATUS_CONFIG,
  KpiConfig, DEFAULT_KPI_CONFIG,
} from '../types/actionPlan';
import {
  parseExcelFile, readFileAsDataUrl, photoFileToKey, loadDefaultExcelData,
  DashboardConfig, DEFAULT_DASHBOARD_CONFIG,
} from '../utils/dataUtils';
import {
  dbLoadAllTasks, dbSaveAllTasks, dbUpdateTask, dbAddTask, dbDeleteTask,
  dbLoadSetting, dbSaveSetting,
  dbLoadAllPhotos, dbSavePhotos,
} from '../utils/dbService';

// Setting keys
const SK = {
  owners: 'owners_config',
  columns: 'columns_config',
  dashboard: 'dashboard_config',
  theme: 'theme_config',
  layout: 'layout_config',
  branding: 'branding_config',
  status: 'status_config',
  kpi: 'kpi_config',
};

interface AppContextType {
  data: ActionItem[];
  photos: Record<string, string>;
  isLoaded: boolean;
  uploadFiles: (excelFile: File | null, photoFiles: File[], photoKeyOverride?: string) => Promise<void>;
  uploading: boolean;
  owners: OwnerInfo[];
  setOwners: (v: OwnerInfo[]) => void;
  columns: ColumnConfig[];
  setColumns: (v: ColumnConfig[]) => void;
  dashboardConfig: DashboardConfig;
  setDashboardConfig: (v: DashboardConfig) => void;
  themeConfig: ThemeConfig;
  setThemeConfig: (v: ThemeConfig) => void;
  layoutConfig: LayoutConfig;
  setLayoutConfig: (v: LayoutConfig) => void;
  brandingConfig: BrandingConfig;
  setBrandingConfig: (v: BrandingConfig) => void;
  statusConfig: StatusConfig[];
  setStatusConfig: (v: StatusConfig[]) => void;
  kpiConfig: KpiConfig;
  setKpiConfig: (v: KpiConfig) => void;
  updateTask: (id: number, updates: Partial<ActionItem>) => void;
  addTask: (task: ActionItem) => void;
  deleteTask: (id: number) => void;
  clearData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ActionItem[]>([]);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [owners, setOwnersState] = useState<OwnerInfo[]>(DEFAULT_OWNERS);
  const [columns, setColumnsState] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [dashboardConfig, setDashboardConfigState] = useState<DashboardConfig>(DEFAULT_DASHBOARD_CONFIG);
  const [themeConfig, setThemeConfigState] = useState<ThemeConfig>(DEFAULT_THEME);
  const [layoutConfig, setLayoutConfigState] = useState<LayoutConfig>(DEFAULT_LAYOUT);
  const [brandingConfig, setBrandingConfigState] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [statusConfig, setStatusConfigState] = useState<StatusConfig[]>(DEFAULT_STATUS_CONFIG);
  const [kpiConfig, setKpiConfigState] = useState<KpiConfig>(DEFAULT_KPI_CONFIG);

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const h = themeConfig.primaryHue;
    const s = themeConfig.primarySaturation;
    const l = themeConfig.primaryLightness;
    root.style.setProperty('--primary', `${h} ${s}% ${l}%`);
    root.style.setProperty('--primary-light', `${h} ${s}% ${Math.min(l + 12, 90)}%`);
    root.style.setProperty('--primary-dark', `${h} ${s}% ${Math.max(l - 12, 10)}%`);
    root.style.setProperty('--ring', `${h} ${s}% ${l}%`);
    root.style.setProperty('--sidebar-background', `${h} ${s}% ${Math.max(l - 16, 8)}%`);
    root.style.setProperty('--sidebar-accent', `${h} ${s}% ${Math.max(l - 8, 12)}%`);
    root.style.setProperty('--sidebar-border', `${h} ${s}% ${Math.max(l - 8, 12)}%`);
    root.style.setProperty('--sidebar-ring', `${h} ${s}% ${Math.min(l + 23, 80)}%`);
    root.style.setProperty('--gradient-hero', `linear-gradient(135deg, hsl(${h} ${s}% ${Math.max(l - 16, 8)}%), hsl(${h} ${s}% ${l}%))`);
    root.style.setProperty('--radius', `${themeConfig.borderRadius}rem`);
    root.style.setProperty('--shadow-card', `0 2px 8px hsla(${h}, 20%, 20%, 0.08), 0 0 0 1px hsla(${h}, 20%, 20%, 0.05)`);
    root.style.setProperty('--shadow-card-hover', `0 8px 24px hsla(${h}, 20%, 20%, 0.15), 0 0 0 1px hsla(${h}, 20%, 20%, 0.1)`);
    document.body.style.fontFamily = `'${themeConfig.fontFamily}', system-ui, sans-serif`;

    const sizeMap = { sm: '14px', base: '16px', lg: '18px' };
    root.style.fontSize = sizeMap[themeConfig.fontSize];

    statusConfig.forEach((sc) => {
      if (!sc?.key || !sc?.color) return;
      const cssKey = sc.key.toLowerCase().replace(/\s+/g, '-');
      root.style.setProperty(`--status-${cssKey}`, sc.color);
    });
  }, [themeConfig, statusConfig]);

  // Load everything from DB on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Load photos
        const dbPhotos = await dbLoadAllPhotos();
        if (Object.keys(dbPhotos).length > 0) setPhotos(dbPhotos);

        // Load settings
        const savedOwners = await dbLoadSetting<OwnerInfo[]>(SK.owners);
        if (Array.isArray(savedOwners) && savedOwners.length > 0) setOwnersState(savedOwners);

        const savedColumns = await dbLoadSetting<ColumnConfig[]>(SK.columns);
        if (Array.isArray(savedColumns) && savedColumns.length > 0) setColumnsState(savedColumns);

        const savedDashConfig = await dbLoadSetting<DashboardConfig>(SK.dashboard);
        if (savedDashConfig && typeof savedDashConfig === 'object') setDashboardConfigState(savedDashConfig);

        const savedTheme = await dbLoadSetting<ThemeConfig>(SK.theme);
        if (savedTheme && typeof savedTheme === 'object') setThemeConfigState(savedTheme);

        const savedLayout = await dbLoadSetting<LayoutConfig>(SK.layout);
        if (savedLayout && typeof savedLayout === 'object') setLayoutConfigState(savedLayout);

        const savedBranding = await dbLoadSetting<BrandingConfig>(SK.branding);
        if (savedBranding && typeof savedBranding === 'object') setBrandingConfigState(savedBranding);

        const savedStatusCfg = await dbLoadSetting<StatusConfig[]>(SK.status);
        const safeStatusCfg = Array.isArray(savedStatusCfg)
          ? savedStatusCfg.filter(
              (sc): sc is StatusConfig =>
                Boolean(sc) && typeof sc === 'object' && typeof sc.key === 'string' &&
                typeof sc.color === 'string' && typeof sc.label === 'string'
            )
          : null;
        if (safeStatusCfg && safeStatusCfg.length > 0) setStatusConfigState(safeStatusCfg);

        const savedKpi = await dbLoadSetting<KpiConfig>(SK.kpi);
        if (savedKpi && typeof savedKpi === 'object') setKpiConfigState(savedKpi);

        // Load tasks
        const dbTasks = await dbLoadAllTasks();
        if (dbTasks.length > 0) {
          setData(dbTasks);
        } else {
          // Try loading default Excel data
          const defaultData = await loadDefaultExcelData();
          if (defaultData.length > 0) {
            setData(defaultData);
            await dbSaveAllTasks(defaultData);
          }
        }
      } catch (error) {
        console.error('Failed to initialize app state from DB:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    init();
  }, []);

  const uploadFiles = useCallback(async (excelFile: File | null, photoFiles: File[], photoKeyOverride?: string) => {
    setUploading(true);
    try {
      if (excelFile) {
        const items = await parseExcelFile(excelFile);
        setData(items);
        await dbSaveAllTasks(items);
      }
      if (photoFiles.length > 0) {
        const newPhotos: Record<string, string> = {};
        for (const file of photoFiles) {
          const key = (photoKeyOverride && photoFiles.length === 1) ? photoKeyOverride : photoFileToKey(file.name);
          newPhotos[key] = await readFileAsDataUrl(file);
        }
        setPhotos((prev) => ({ ...prev, ...newPhotos }));
        await dbSavePhotos(newPhotos);
      }
    } finally { setUploading(false); }
  }, []);

  // Config setter factory — updates state + saves to DB
  const makeConfigSetter = <T,>(
    setState: React.Dispatch<React.SetStateAction<T>>,
    settingKey: string,
  ) =>
    useCallback((v: T) => {
      setState(v);
      dbSaveSetting(settingKey, v);
    }, []);

  const setOwners = makeConfigSetter(setOwnersState, SK.owners);
  const setColumns = makeConfigSetter(setColumnsState, SK.columns);
  const setDashboardConfig = makeConfigSetter(setDashboardConfigState, SK.dashboard);
  const setThemeConfig = makeConfigSetter(setThemeConfigState, SK.theme);
  const setLayoutConfig = makeConfigSetter(setLayoutConfigState, SK.layout);
  const setBrandingConfig = makeConfigSetter(setBrandingConfigState, SK.branding);
  const setStatusConfig = makeConfigSetter(setStatusConfigState, SK.status);
  const setKpiConfig = makeConfigSetter(setKpiConfigState, SK.kpi);

  const updateTask = useCallback((id: number, updates: Partial<ActionItem>) => {
    setData((prev) => prev.map((item) => item.id === id ? { ...item, ...updates } : item));
    dbUpdateTask(id, updates);
  }, []);

  const addTask = useCallback((task: ActionItem) => {
    setData((prev) => [...prev, task]);
    dbAddTask(task);
  }, []);

  const deleteTask = useCallback((id: number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    dbDeleteTask(id);
  }, []);

  const clearData = useCallback(() => {
    setData([]);
    dbSaveAllTasks([]);
  }, []);

  return (
    <AppContext.Provider value={{
      data, photos, isLoaded, uploadFiles, uploading,
      owners, setOwners, columns, setColumns,
      dashboardConfig, setDashboardConfig,
      themeConfig, setThemeConfig,
      layoutConfig, setLayoutConfig,
      brandingConfig, setBrandingConfig,
      statusConfig, setStatusConfig,
      kpiConfig, setKpiConfig,
      updateTask, addTask, deleteTask, clearData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used within AppProvider');
  return ctx;
}
