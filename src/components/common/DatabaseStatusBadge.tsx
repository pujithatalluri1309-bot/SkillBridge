import React, { useState, useEffect } from 'react';
import { Database, Sparkles, Terminal } from 'lucide-react';
import { api } from '../../services/api';

interface Props {
  onOpenExplorer: () => void;
}

export const DatabaseStatusBadge: React.FC<Props> = ({ onOpenExplorer }) => {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    api.getDbStatus().then(setStatus).catch(() => {});
    const interval = setInterval(() => {
      api.getDbStatus().then(setStatus).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = status?.connected;

  return (
    <button
      onClick={onOpenExplorer}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border shadow-xs transition-all duration-200 hover:shadow-md group bg-white/90 backdrop-blur-xs border-indigo-200/80 hover:border-indigo-400"
      title="Click to open MySQL Database & Academic SQL Explorer"
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isConnected ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />
      </span>

      <span className="flex items-center gap-1.5 text-slate-700 group-hover:text-indigo-600 font-semibold text-[11px]">
        <Database className="w-3.5 h-3.5 text-indigo-500" />
        <span>{isConnected ? 'MySQL (3306) Connected' : 'MySQL Relational Store'}</span>
      </span>

      <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100 transition">
        <Terminal className="w-2.5 h-2.5" />
        SQL Hub
      </span>
    </button>
  );
};
