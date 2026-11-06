import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Award,
  Video,
  Calendar,
  Star,
  Search,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  Database,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
} from 'lucide-react';
import { Student, Skill, TeachingVideo, Session, Feedback, SystemStats } from '../../types';
import { api } from '../../services/api';

interface Props {
  onOpenSqlExplorer: () => void;
  onSelectVideo: (video: TeachingVideo) => void;
}

export const AdminDashboardView: React.FC<Props> = ({ onOpenSqlExplorer, onSelectVideo }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'skills' | 'videos' | 'sessions' | 'feedback'>('students');
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [videos, setVideos] = useState<TeachingVideo[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Skill Creation State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<any>('Programming');
  const [newSkillDesc, setNewSkillDesc] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsData, studentsData, skillsData, videosData, sessionsData, feedbackData] =
        await Promise.all([
          api.getStats(),
          api.getStudents(),
          api.getSkills(),
          api.getVideos(),
          api.getSessions(),
          api.getFeedback(),
        ]);
      setStats(statsData);
      setStudents(studentsData);
      setSkills(skillsData);
      setVideos(videosData);
      setSessions(sessionsData);
      setFeedback(feedbackData);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm('Are you sure you want to permanently delete this student and all their associated records from MySQL?')) return;
    try {
      await api.deleteStudent(studentId);
      setActionMessage('Student record and cascading relational records removed.');
      setTimeout(() => setActionMessage(null), 3000);
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student');
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm('Remove this video from the teaching catalog?')) return;
    try {
      await api.deleteVideo(videoId);
      setActionMessage('Teaching video deleted.');
      setTimeout(() => setActionMessage(null), 3000);
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to delete video');
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await api.createSkill({
        name: newSkillName.trim(),
        category: newSkillCategory,
        description: newSkillDesc.trim(),
      });
      setNewSkillName('');
      setNewSkillDesc('');
      setActionMessage('New academic skill added to MySQL catalog.');
      setTimeout(() => setActionMessage(null), 3000);
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to create skill');
    }
  };

  const handleResetSeeds = async () => {
    if (!confirm('Reset MySQL database to initial academic presentation seed data?')) return;
    try {
      await api.resetDatabaseSeeds();
      setActionMessage('Database restored to initial seed dataset.');
      setTimeout(() => setActionMessage(null), 3000);
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to reset seeds');
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.student_id_number.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.department.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/30 text-purple-300">
              <Shield className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              System Administration
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Control Panel & Audit Hub</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Audit registered students, skills catalog, videos, sessions, and database integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSqlExplorer}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <Terminal className="w-4 h-4" />
            <span>Open SQL Explorer</span>
          </button>
          <button
            onClick={handleResetSeeds}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition"
            title="Reset to initial sample students, videos and sessions"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* System Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Students</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{stats?.total_students || 0}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Catalog Skills</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{stats?.total_skills || 0}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Teaching Videos</div>
          <div className="text-xl font-extrabold text-purple-700 mt-1">{stats?.total_videos || 0}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Requests</div>
          <div className="text-xl font-extrabold text-amber-700 mt-1">{stats?.total_requests || 0}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Peer Sessions</div>
          <div className="text-xl font-extrabold text-blue-700 mt-1">{stats?.total_sessions || 0}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Avg Rating</div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">
            {stats?.average_system_rating || 5.0}★
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeTab === 'students' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students Management ({students.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeTab === 'skills' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Skills Catalog ({skills.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeTab === 'videos' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Teaching Videos Review ({videos.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeTab === 'sessions' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Sessions Audit ({sessions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeTab === 'feedback' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Peer Reviews ({feedback.length})</span>
        </button>
      </div>

      {/* Tab 1: Students Management */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">Registered University Students</h3>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students by name, ID, department..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Full Name & Email</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Year</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Registered Skills</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-indigo-700">{st.student_id_number}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{st.full_name}</div>
                      <div className="text-[11px] text-slate-400">{st.email}</div>
                    </td>
                    <td className="p-3 text-slate-600">{st.department}</td>
                    <td className="p-3 text-slate-500">{st.year_of_study}</td>
                    <td className="p-3 font-bold text-amber-700">{st.average_rating || 5.0}★</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                        {st.skills?.length || 0} Skills
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteStudent(st.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Skills Catalog */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Master Skills Catalog</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Skill Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {skills.map((sk) => (
                    <tr key={sk.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-400">#{sk.id}</td>
                      <td className="p-3 font-bold text-slate-900">{sk.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                          {sk.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">{sk.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Skill Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              Add New Academic Skill
            </h3>
            <form onSubmit={handleCreateSkill} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Flutter Mobile Dev"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="Programming">Programming</option>
                  <option value="Database">Database</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Communication">Communication</option>
                  <option value="Design">Design</option>
                  <option value="Other Skills">Other Skills</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  placeholder="Key concepts included..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
              >
                Insert Skill Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Videos Audit */}
      {activeTab === 'videos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Auditing Student Teaching Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v) => (
              <div
                key={v.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-purple-700">{v.subject_name}</span>
                    <span className="text-slate-400 font-mono">{v.duration_seconds}s</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{v.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{v.description}</p>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Student: {v.student_name} ({v.student_department})
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <button
                    onClick={() => onSelectVideo(v)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Watch Preview</span>
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(v.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Sessions Audit */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Platform Tutoring Sessions Log</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Session Topic</th>
                  <th className="p-3">Mentor</th>
                  <th className="p-3">Learner</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{s.title}</td>
                    <td className="p-3 text-slate-700">{s.mentor_name}</td>
                    <td className="p-3 text-slate-700">{s.learner_name}</td>
                    <td className="p-3 font-mono text-slate-500">
                      {s.session_date} {s.start_time.substring(0, 5)}
                    </td>
                    <td className="p-3 text-slate-500">{s.location_type}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Feedback Reviews */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Student Reviews & Ratings Log</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.map((f) => (
              <div key={f.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900">
                    {f.reviewer_name} ➔ {f.recipient_name}
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{f.rating} / 5</span>
                  </div>
                </div>
                <p className="text-slate-600 italic">"{f.review_text}"</p>
                <div className="text-[10px] text-slate-400">Session: {f.session_title}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
