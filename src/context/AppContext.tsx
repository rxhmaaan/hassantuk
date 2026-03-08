import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ActionItem, OwnerInfo, ColumnConfig, DEFAULT_OWNERS, DEFAULT_COLUMNS } from '../types/actionPlan';
import {
  parseExcelFile,
  saveDataToStorage,
  loadDataFromStorage,
  savePhotosToStorage,
  loadPhotosFromStorage,
  readFileAsDataUrl,
  photoFileToKey,
  loadDefaultExcelData,
  saveOwnersConfig,
  loadOwnersConfig,
  saveColumnsConfig,
  loadColumnsConfig,
  saveDashboardConfig,
  loadDashboardConfig,
  DashboardConfig,
  DEFAULT_DASHBOARD_CONFIG,
} from '../utils/dataUtils';

interface AppContextType {
  data: ActionItem[];
  photos: Record<string, string>;
  isLoaded: boolean;
  uploadFiles: (excelFile: File | null, photoFiles: File[], photoKeyOverride?: string) => Promise<void>;
  uploading: boolean;
  owners: OwnerInfo[];
  setOwners: (owners: OwnerInfo[]) => void;
  columns: ColumnConfig[];
  setColumns: (columns: ColumnConfig[]) => void;
  dashboardConfig: DashboardConfig;
  setDashboardConfig: (config: DashboardConfig) => void;
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

      const savedData = loadDataFromStorage();
      if (savedData && savedData.length > 0) {
        setData(savedData);
      } else {
        const defaultData = await loadDefaultExcelData();
        if (defaultData.length > 0) {
          setData(defaultData);
          saveDataToStorage(defaultData);
        }
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
        setData(items);
        saveDataToStorage(items);
      }

      if (photoFiles.length > 0) {
        const newPhotos: Record<string, string> = {};
        for (let i = 0; i < photoFiles.length; i++) {
          const file = photoFiles[i];
          const key = (photoKeyOverride && photoFiles.length === 1) ? photoKeyOverride : photoFileToKey(file.name);
          const dataUrl = await readFileAsDataUrl(file);
          newPhotos[key] = dataUrl;
        }
        setPhotos((prev) => {
          const merged = { ...prev, ...newPhotos };
          savePhotosToStorage(newPhotos);
          return merged;
        });
      }
    } finally {
      setUploading(false);
    }
  }, []);

  const setOwners = useCallback((newOwners: OwnerInfo[]) => {
    setOwnersState(newOwners);
    saveOwnersConfig(newOwners);
  }, []);

  const setColumns = useCallback((newColumns: ColumnConfig[]) => {
    setColumnsState(newColumns);
    saveColumnsConfig(newColumns);
  }, []);

  const setDashboardConfig = useCallback((config: DashboardConfig) => {
    setDashboardConfigState(config);
    saveDashboardConfig(config);
  }, []);

  const updateTask = useCallback((id: number, updates: Partial<ActionItem>) => {
    setData((prev) => {
      const updated = prev.map((item) => item.id === id ? { ...item, ...updates } : item);
      saveDataToStorage(updated);
      return updated;
    });
  }, []);

  const deleteTask = useCallback((id: number) => {
    setData((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveDataToStorage(updated);
      return updated;
    });
  }, []);

  const clearData = useCallback(() => {
    setData([]);
    saveDataToStorage([]);
  }, []);

  return (
    <AppContext.Provider value={{
      data, photos, isLoaded, uploadFiles, uploading,
      owners, setOwners, columns, setColumns,
      dashboardConfig, setDashboardConfig,
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
