import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ActionItem, OwnerInfo, ColumnConfig, DEFAULT_OWNERS, DEFAULT_COLUMNS,
  ThemeConfig, DEFAULT_THEME, LayoutConfig, DEFAULT_LAYOUT,
  BrandingConfig, DEFAULT_BRANDING, StatusConfig, DEFAULT_STATUS_CONFIG,
  KpiConfig, DEFAULT_KPI_CONFIG,
} from '../types/actionPlan';
import {
  parseExcelFile, saveDataToStorage, loadDataFromStorage,
  savePhotosToStorage, loadPhotosFromStorage, readFileAsDataUrl, photoFileToKey, loadDefaultExcelData,
  saveOwnersConfig, loadOwnersConfig, saveColumnsConfig, loadColumnsConfig,
  saveDashboardConfig, loadDashboardConfig, DashboardConfig, DEFAULT_DASHBOARD_CONFIG,
  saveThemeConfig, loadThemeConfig, saveLayoutConfig, loadLayoutConfig,
  saveBrandingConfig, loadBrandingConfig, saveStatusConfig, loadStatusConfig,
  saveKpiConfig, loadKpiConfig,
} from '../utils/dataUtils';

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

    // Apply status colors from config
    statusConfig.forEach((sc) => {
      const cssKey = sc.key.toLowerCase().replace(/\s+/g, '-');
      root.style.setProperty(`--status-${cssKey}`, sc.color);
    });
  }, [themeConfig, statusConfig]);

  useEffect(() => {
    const init = async () => {
      const savedPhotos = loadPhotosFromStorage();
      if (savedPhotos) setPhotos(savedPhotos);
      const savedOwners = loadOwnersConfig();
      if (savedOwners) setOwnersState(savedOwners);
      const savedColumns = loadColumnsConfig();
      if (savedColumns) setColumnsState(savedColumns);
      const savedDashConfig = loadDashboardConfig();
      if (savedDashConfig) setDashboardConfigState(savedDashConfig);
      const savedTheme = loadThemeConfig();
      if (savedTheme) setThemeConfigState(savedTheme);
      const savedLayout = loadLayoutConfig();
      if (savedLayout) setLayoutConfigState(savedLayout);
      const savedBranding = loadBrandingConfig();
      if (savedBranding) setBrandingConfigState(savedBranding);
      const savedStatusCfg = loadStatusConfig();
      if (savedStatusCfg) setStatusConfigState(savedStatusCfg);
      const savedKpi = loadKpiConfig();
      if (savedKpi) setKpiConfigState(savedKpi);

      const savedData = loadDataFromStorage();
      const hasNewSchema = savedData && savedData.length > 0 && 'summary' in savedData[0];
      if (savedData && savedData.length > 0 && hasNewSchema) {
        setData(savedData);
      } else {
        const defaultData = await loadDefaultExcelData();
        if (defaultData.length > 0) { setData(defaultData); saveDataToStorage(defaultData); }
      }
      setIsLoaded(true);
    };
    init();
  }, []);

  const uploadFiles = useCallback(async (excelFile: File | null, photoFiles: File[], photoKeyOverride?: string) => {
    setUploading(true);
    try {
      if (excelFile) {
        const items = await parseExcelFile(excelFile);
        setData(items); saveDataToStorage(items);
      }
      if (photoFiles.length > 0) {
        const newPhotos: Record<string, string> = {};
        for (const file of photoFiles) {
          const key = (photoKeyOverride && photoFiles.length === 1) ? photoKeyOverride : photoFileToKey(file.name);
          newPhotos[key] = await readFileAsDataUrl(file);
        }
        setPhotos((prev) => { const merged = { ...prev, ...newPhotos }; savePhotosToStorage(newPhotos); return merged; });
      }
    } finally { setUploading(false); }
  }, []);

  const makeConfigSetter = <T,>(setState: React.Dispatch<React.SetStateAction<T>>, save: (v: T) => void) =>
    useCallback((v: T) => { setState(v); save(v); }, []);

  const setOwners = makeConfigSetter(setOwnersState, saveOwnersConfig);
  const setColumns = makeConfigSetter(setColumnsState, saveColumnsConfig);
  const setDashboardConfig = makeConfigSetter(setDashboardConfigState, saveDashboardConfig);
  const setThemeConfig = makeConfigSetter(setThemeConfigState, saveThemeConfig);
  const setLayoutConfig = makeConfigSetter(setLayoutConfigState, saveLayoutConfig);
  const setBrandingConfig = makeConfigSetter(setBrandingConfigState, saveBrandingConfig);
  const setStatusConfig = makeConfigSetter(setStatusConfigState, saveStatusConfig);
  const setKpiConfig = makeConfigSetter(setKpiConfigState, saveKpiConfig);

  const updateTask = useCallback((id: number, updates: Partial<ActionItem>) => {
    setData((prev) => { const u = prev.map((item) => item.id === id ? { ...item, ...updates } : item); saveDataToStorage(u); return u; });
  }, []);
  const deleteTask = useCallback((id: number) => {
    setData((prev) => { const u = prev.filter((item) => item.id !== id); saveDataToStorage(u); return u; });
  }, []);
  const clearData = useCallback(() => { setData([]); saveDataToStorage([]); }, []);

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
      updateTask, deleteTask, clearData,
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
