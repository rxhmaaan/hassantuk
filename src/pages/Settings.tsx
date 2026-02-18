import React, { useRef, useState } from 'react';
import { useAppData } from '../context/AppContext';
import { OWNERS } from '../types/actionPlan';
import { User, Upload, CheckCircle2, Settings as SettingsIcon, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { photos, uploadFiles, uploading } = useAppData();
  const navigate = useNavigate();
  const [savedOwner, setSavedOwner] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handlePhotoChange = async (ownerPhotoKey: string, file: File) => {
    await uploadFiles(null, [file], ownerPhotoKey);
    setSavedOwner(ownerPhotoKey);
    setTimeout(() => setSavedOwner(null), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center shadow">
          <SettingsIcon size={20} className="text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage owner photos and app data</p>
        </div>
      </div>

      {/* Owner Photos Section */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        <div className="gradient-hero px-6 py-4">
          <h2 className="text-base font-bold text-primary-foreground flex items-center gap-2">
            <Camera size={18} />
            Owner Photos
          </h2>
          <p className="text-xs text-primary-foreground/70 mt-0.5">
            Upload a photo for each dashboard owner individually
          </p>
        </div>

        <div className="divide-y divide-border">
          {OWNERS.map((owner) => {
            const photo = photos[owner.photoKey] || null;
            const isSaved = savedOwner === owner.photoKey;

            return (
              <div key={owner.name} className="flex items-center gap-5 px-6 py-5">
                {/* Avatar Preview */}
                <div className="relative shrink-0">
                  {photo ? (
                    <img
                      src={photo}
                      alt={owner.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shadow"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center border-2 border-primary/20 shadow opacity-50">
                      <User size={28} className="text-primary-foreground/70" />
                    </div>
                  )}
                  {isSaved && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-status-done flex items-center justify-center shadow">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Owner Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground text-sm">{owner.name}</div>
                  <div className="text-xs italic text-muted-foreground mt-0.5">{owner.designation}</div>
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    Expected file: <span className="font-mono text-muted-foreground">{owner.photoKey}.jpg</span>
                  </div>
                </div>

                {/* Upload / Status */}
                <div className="shrink-0">
                  {isSaved ? (
                    <div className="flex items-center gap-1.5 text-status-done text-sm font-semibold">
                      <CheckCircle2 size={16} />
                      Saved!
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRefs.current[owner.photoKey]?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 gradient-hero text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow"
                    >
                      <Upload size={13} />
                      {photo ? 'Replace Photo' : 'Upload Photo'}
                    </button>
                  )}
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
      </div>

      {/* Note */}
      <div className="bg-muted/50 rounded-xl px-5 py-4 border border-border/50">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">💡 Tip:</span> Photos are stored locally in your browser and will persist across sessions. 
          You can also upload all 6 photos at once using the <span className="font-semibold text-foreground">Upload Data</span> button in the top navigation.
        </p>
      </div>
    </div>
  );
}
