import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  GraduationCap,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  mode: 'login' | 'register';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

export const AuthModal: React.FC<Props> = ({
  mode,
  isOpen,
  onClose,
  onSuccess,
  onSwitchMode,
}) => {
  const { login, register } = useAuth();

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register({
          student_id_number: studentIdNumber.trim(),
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          department,
          year_of_study: yearOfStudy,
          bio: bio.trim(),
          profile_photo:
            profilePhoto ||
            `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoStudent = (emailStr: string) => {
    setEmail(emailStr);
    setPassword('student123');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@skillmate.edu');
    setPassword('admin123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {mode === 'login' ? 'Sign in to SkillMate' : 'Create Student Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'login'
                  ? 'Access your learning and teaching dashboard'
                  : 'Join university peers to teach and learn'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Credentials Bar */}
          {mode === 'login' && (
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Quick Evaluation Logins (Click to autofill):
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => fillDemoStudent('aarav.sharma@skillmate.edu')}
                  className="px-2 py-1 bg-white border border-indigo-200 hover:border-indigo-400 rounded-lg text-[11px] font-semibold text-slate-700 transition"
                >
                  Aarav (Mentor)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoStudent('priya.patel@skillmate.edu')}
                  className="px-2 py-1 bg-white border border-indigo-200 hover:border-indigo-400 rounded-lg text-[11px] font-semibold text-slate-700 transition"
                >
                  Priya (SQL Tutor)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoStudent('vikram.m@skillmate.edu')}
                  className="px-2 py-1 bg-white border border-indigo-200 hover:border-indigo-400 rounded-lg text-[11px] font-semibold text-slate-700 transition"
                >
                  Vikram (Learner)
                </button>
                <button
                  type="button"
                  onClick={fillDemoAdmin}
                  className="px-2 py-1 bg-purple-100 border border-purple-200 hover:border-purple-400 rounded-lg text-[11px] font-bold text-purple-800 transition"
                >
                  Admin Portal
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student ID Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentIdNumber}
                      onChange={(e) => setStudentIdNumber(e.target.value)}
                      placeholder="e.g. STU-2024-089"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Siddharth Rao"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department *
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Design & Media">Design & Media</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Year of Study *
                    </label>
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    >
                      <option value="1st Year">1st Year (Freshman)</option>
                      <option value="2nd Year">2nd Year (Sophomore)</option>
                      <option value="3rd Year">3rd Year (Junior)</option>
                      <option value="4th Year">4th Year (Senior)</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Short Bio (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other students what you are interested in learning and teaching..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student University Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@skillmate.edu"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400">
                {mode === 'register' && 'Minimum 6 characters.'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 mt-2"
            >
              {isLoading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign in to Account'
                : 'Complete Student Registration'}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="pt-3 text-center border-t border-slate-100 text-xs text-slate-600">
            {mode === 'login' ? (
              <p>
                Don't have a student account yet?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchMode('register')}
                  className="font-bold text-indigo-600 hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchMode('login')}
                  className="font-bold text-indigo-600 hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
