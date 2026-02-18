import React, { useRef, useState } from 'react';
import { Upload, X, CheckCircle2, Loader2 } from 'lucide-react';
import { useAppData } from '../context/AppContext';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

export function UploadModal({ open, onClose }: UploadModalProps) {
  const { uploadFiles, uploading } = useAppData();
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [done, setDone] = useState(false);
  const excelRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    await uploadFiles(excelFile, photoFiles);
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setExcelFile(null);
      setPhotoFiles([]);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card text-card-foreground rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="gradient-hero px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
            <Upload size={20} />
            Upload Data Files
          </h2>
          <button onClick={onClose} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Excel Upload */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Excel File (.xlsx) <span className="text-muted-foreground font-normal">— Action Plan data</span>
            </label>
            <div
              onClick={() => excelRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-4 cursor-pointer transition-colors text-center"
            >
              {excelFile ? (
                <div className="flex items-center justify-center gap-2 text-primary font-medium">
                  <CheckCircle2 size={18} className="text-status-done" />
                  <span className="text-sm truncate max-w-xs">{excelFile.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setExcelFile(null); }} className="text-muted-foreground hover:text-destructive ml-1">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Click to select Excel file</p>
              )}
            </div>
            <input ref={excelRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => setExcelFile(e.target.files?.[0] || null)} />
          </div>

          {/* Photos Upload */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Owner Photos <span className="text-muted-foreground font-normal">— up to 6 photos (jpg/png)</span>
            </label>
            <div
              onClick={() => photosRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-4 cursor-pointer transition-colors"
            >
              {photoFiles.length > 0 ? (
                <div className="space-y-1">
                  {photoFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={14} className="text-status-done shrink-0" />
                      <span className="truncate text-foreground">{f.name}</span>
                    </div>
                  ))}
                  <button
                    onClick={(e) => { e.stopPropagation(); setPhotoFiles([]); }}
                    className="text-xs text-muted-foreground hover:text-destructive mt-1"
                  >Clear all</button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">Click to select owner photos</p>
              )}
            </div>
            <input ref={photosRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))} />
            <p className="text-xs text-muted-foreground mt-1">
              Expected: Ahmed-Fathy.jpg, Hatem-Gado.jpg, Azzam.jpg, Amr-Fahmy.jpg, Ashraf-Hassan.jpg, Amr-Rashwan.jpg
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={(!excelFile && photoFiles.length === 0) || uploading}
              className="flex-1 py-2.5 rounded-lg gradient-hero text-primary-foreground text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
            >
              {uploading ? <><Loader2 size={16} className="animate-spin" />Uploading…</> :
               done ? <><CheckCircle2 size={16} />Saved!</> : 'Upload & Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
