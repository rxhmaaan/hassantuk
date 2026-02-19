import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ActionItem } from '../types/actionPlan';
import {
  parseExcelFile,
  saveDataToStorage,
  loadDataFromStorage,
  savePhotosToStorage,
  loadPhotosFromStorage,
  readFileAsDataUrl,
  photoFileToKey,
  loadDefaultExcelData,
} from '../utils/dataUtils';

interface AppContextType {
  data: ActionItem[];
  photos: Record<string, string>;
  isLoaded: boolean;
  uploadFiles: (excelFile: File | null, photoFiles: File[], photoKeyOverride?: string) => Promise<void>;
  uploading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ActionItem[]>([]);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const savedPhotos = loadPhotosFromStorage();
      if (savedPhotos) setPhotos(savedPhotos);

      // Try localStorage first; if empty, load the bundled default Excel
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

  return (
    <AppContext.Provider value={{ data, photos, isLoaded, uploadFiles, uploading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used within AppProvider');
  return ctx;
}
