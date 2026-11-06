import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Video,
  Award,
  Inbox,
  Calendar,
  UserCheck,
  Shield,
  Terminal,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface Props {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenSqlExplorer: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({
  currentView,
  onNavigate,
  onOpenSqlExplorer,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, role } = useAuth();
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      api
        .getRequests(user.id, 'received')
        .then((reqs) => {
          const pending = reqs.filter((r) => r.status === 'pending').length;
          setPendingRequestsCount(pending);
        })
        .catch(() => {});
    }
  }, [user, currentView]);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'mentors',
      label: 'Find a Peer Mentor',
      icon: Users,
      badge: 'Explore',
    },
    {
      id: 'videos',
      label: 'Teaching Videos',
      icon: Video,
      badge: 'Featured',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'skills',
      label: 'My Skills',
      icon: Award,
      badge: null,
    },
    {
      id: 'requests',
      label: 'Learning Requests',
      icon: Inbox,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : null,
      badgeColor: 'bg-amber-100 text-amber-800 animate-pulse',
    },
    {
      id: 'sessions',
      label: 'Session Scheduling',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'profile',
      label: 'Profile & History',
      icon: UserCheck,
      badge: null,
    },
    {
      id: 'admin',
      label: 'Admin Control Hub',
      icon: Shield,
      badge: 'Admin',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Student Learning Portal
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Academic SQL Runner item */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                onOpenSqlExplorer();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition group"
            >
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>Academic SQL Explorer</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 group-hover:rotate-12 transition" />
            </button>
          </div>
        </div>

        {/* Bottom Student Profile Card */}
        {user && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <img
                src={
                  user.profile_photo ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                }
                alt={user.full_name}
                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/20"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{user.full_name}</div>
                <div className="text-[10px] text-slate-500 truncate font-mono">
                  {user.student_id_number}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-700">
                    Teacher & Learner
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
