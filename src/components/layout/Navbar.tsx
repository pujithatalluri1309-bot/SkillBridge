import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  BookOpen,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DatabaseStatusBadge } from '../common/DatabaseStatusBadge';

interface Props {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenSqlExplorer: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentView,
  onNavigate,
  onOpenSqlExplorer,
  onToggleSidebar,
}) => {
  const { user, role, logout, switchUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Brand */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 bg-clip-text text-transparent">
                  SkillMate
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Peer Exchange
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-slate-400 font-medium tracking-tight">
                Learn together. Teach together. Grow together.
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Live MySQL Database Status Badge */}
          <DatabaseStatusBadge onOpenExplorer={onOpenSqlExplorer} />

          {/* Quick Demo Switcher for Evaluation Viva */}
          <div className="hidden md:flex items-center gap-1 text-xs bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Switch Demo:</span>
            <button
              onClick={() => switchUser(1)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
                user?.id === 1
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Aarav Sharma (React & Algorithms Teacher)"
            >
              Aarav (Mentor)
            </button>
            <button
              onClick={() => switchUser(2)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
                user?.id === 2
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Priya Patel (Database & SQL Specialist)"
            >
              Priya (SQL)
            </button>
            <button
              onClick={() => switchUser(5)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
                user?.id === 5
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vikram Malhotra (Peer Learner)"
            >
              Vikram (Learner)
            </button>
            <button
              onClick={() => switchUser('admin')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
                role === 'admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-100'
              }`}
              title="System Administrator Dashboard"
            >
              Admin
            </button>
          </div>

          {/* Auth Button or User Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full hover:bg-slate-100 transition border border-slate-200"
              >
                <img
                  src={
                    user.profile_photo ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={user.full_name}
                  className="w-7 h-7 rounded-full object-cover border border-indigo-200"
                />
                <div className="hidden sm:block text-left text-xs pr-1">
                  <div className="font-bold text-slate-800 leading-tight flex items-center gap-1">
                    <span>{user.full_name.split(' ')[0]}</span>
                    {role === 'admin' && (
                      <span className="px-1 text-[9px] bg-purple-100 text-purple-700 font-bold rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {user.student_id_number}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">{user.full_name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                    <div className="mt-1 text-[10px] text-indigo-600 font-semibold">
                      {user.department}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('dashboard');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      Student Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('profile');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Profile & History
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('admin');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      Admin Control Panel
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenSqlExplorer();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 rounded-lg flex items-center gap-2 font-semibold"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      SQL Hub & Schema
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        onNavigate('landing');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
              >
                Join SkillMate
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
