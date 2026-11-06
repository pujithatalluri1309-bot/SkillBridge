import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: Student | null;
  role: 'student' | 'admin' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Student>) => Promise<void>;
  refreshUser: () => Promise<void>;
  switchUser: (studentId: number | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Student | null>(null);
  const [role, setRole] = useState<'student' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session or initialize with default demo student
    const saved = localStorage.getItem('skillmate_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user);
        setRole(parsed.role || 'student');
      } catch (e) {
        console.error('Session restore failed', e);
      }
    } else {
      // Auto-load Aarav Sharma as default active peer learner/mentor for smooth first run
      api
        .getStudents()
        .then((students) => {
          if (students.length > 0) {
            setUser(students[0]);
            setRole('student');
            localStorage.setItem(
              'skillmate_session',
              JSON.stringify({ user: students[0], role: 'student' })
            );
          }
        })
        .catch(() => {});
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setUser(res.user);
    setRole(res.role as any);
    localStorage.setItem(
      'skillmate_session',
      JSON.stringify({ user: res.user, role: res.role })
    );
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setUser(res.student);
    setRole('student');
    localStorage.setItem(
      'skillmate_session',
      JSON.stringify({ user: res.student, role: 'student' })
    );
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('skillmate_session');
  };

  const updateProfile = async (data: Partial<Student>) => {
    if (!user) return;
    const res = await api.updateStudent(user.id, data);
    setUser(res.student);
    localStorage.setItem(
      'skillmate_session',
      JSON.stringify({ user: res.student, role })
    );
  };

  const refreshUser = async () => {
    if (!user) return;
    if (role === 'admin') return;
    try {
      const refreshed = await api.getStudent(user.id);
      setUser(refreshed);
      localStorage.setItem(
        'skillmate_session',
        JSON.stringify({ user: refreshed, role })
      );
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  const switchUser = async (target: number | 'admin') => {
    if (target === 'admin') {
      await login('admin@skillmate.edu', 'admin123');
    } else {
      const student = await api.getStudent(target);
      setUser(student);
      setRole('student');
      localStorage.setItem(
        'skillmate_session',
        JSON.stringify({ user: student, role: 'student' })
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
