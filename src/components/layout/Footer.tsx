import React from 'react';
import { GraduationCap, Database, Heart, Terminal, Shield } from 'lucide-react';

interface Props {
  onOpenSqlExplorer: () => void;
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<Props> = ({ onOpenSqlExplorer, onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-extrabold tracking-tight">SkillMate</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Student Skill Exchange and Peer Learning System. Learn together. Teach together. Grow
              together.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-indigo-400 font-mono">
              <Database className="w-3.5 h-3.5" />
              <span>MySQL 8.0 • InnoDB • 8 Tables</span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Peer Learning</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('mentors')}
                  className="hover:text-indigo-400 transition"
                >
                  Find a Peer Mentor
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('videos')}
                  className="hover:text-indigo-400 transition"
                >
                  Teaching Demo Videos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('skills')}
                  className="hover:text-indigo-400 transition"
                >
                  Skills Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('sessions')}
                  className="hover:text-indigo-400 transition"
                >
                  Session Scheduling
                </button>
              </li>
            </ul>
          </div>

          {/* Academic Features */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">DBMS Project Hub</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={onOpenSqlExplorer} className="hover:text-indigo-400 transition flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  Live SQL Terminal
                </button>
              </li>
              <li>
                <button onClick={onOpenSqlExplorer} className="hover:text-indigo-400 transition">
                  Relational Schema (8 Tables)
                </button>
              </li>
              <li>
                <button onClick={onOpenSqlExplorer} className="hover:text-indigo-400 transition">
                  DDL, DML, DQL, DCL, TCL
                </button>
              </li>
              <li>
                <button onClick={onOpenSqlExplorer} className="hover:text-indigo-400 transition">
                  Java Swing JDBC Code
                </button>
              </li>
            </ul>
          </div>

          {/* Coursework & Admin */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Administration</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-indigo-400 transition flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  Admin Dashboard
                </button>
              </li>
              <li>
                <span className="text-slate-500">College DBMS Capstone 2026</span>
              </li>
              <li>
                <span className="text-slate-500">Student ID Verification Active</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} SkillMate. Student Skill Exchange and Peer Learning System.
          </div>
          <div className="flex items-center gap-1">
            Built for Academic Coursework with MySQL Relational Engine
          </div>
        </div>
      </div>
    </footer>
  );
};
