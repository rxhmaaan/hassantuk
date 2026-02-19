import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const AUTH_KEY = 'hassantuk_auth_unlocked';
const VALID_USER = 'amr';
const VALID_PASS = '6363';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [unlocked, setUnlocked] = useState(() => {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (unlocked) return <>{children}</>;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === VALID_USER && password === VALID_PASS) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setUnlocked(true);
      setError('');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="bg-card rounded-2xl shadow-card border border-border/50 w-full max-w-sm overflow-hidden">
        <div className="gradient-hero px-6 py-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3">
            <Lock size={26} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Restricted Access</h2>
          <p className="text-white/70 text-sm mt-1">Please sign in to continue</p>
        </div>
        <form onSubmit={handleLogin} className="px-6 py-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-xs text-status-rejected bg-status-rejected/10 rounded-lg px-3 py-2">
              <AlertCircle size={13} />
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full gradient-hero text-primary-foreground font-semibold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
