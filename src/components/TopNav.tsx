import React, { useState } from 'react';
import { Upload, LayoutDashboard, Lock } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UploadModal } from './UploadModal';
import { useAppData } from '../context/AppContext';

const AUTH_KEY = 'hassantuk_auth_unlocked';

export function TopNav() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data } = useAppData();
  const location = useLocation();
  const navigate = useNavigate();

  const handleUploadClick = () => {
    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
      setUploadOpen(true);
    } else {
      navigate('/settings');
    }
  };

  return (
    <>
      <nav className="gradient-hero text-primary-foreground shadow-lg sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold tracking-wide leading-none">Hassantuk</div>
              <div className="text-xs text-white/70 leading-tight">Action Plan Tracker</div>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1 ml-4">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/settings"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname === '/settings' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Lock size={13} />
              Settings
            </Link>
          </div>

          <div className="flex-1" />

          {/* Data badge */}
          {data.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg text-xs text-primary-foreground/80">
              <span className="w-1.5 h-1.5 rounded-full bg-status-done inline-block"></span>
              {data.length} tasks loaded
            </div>
          )}

          {/* Upload Button - requires auth */}
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Upload size={15} />
            <span className="hidden sm:inline">Upload Data</span>
          </button>
        </div>
      </nav>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
