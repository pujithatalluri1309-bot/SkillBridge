import React, { useState, useEffect } from 'react';
import {
  User,
  Camera,
  Save,
  Award,
  Video,
  BookOpen,
  Calendar,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentSkill, TeachingVideo, Session, Feedback } from '../../types';
import { api } from '../../services/api';

interface Props {
  onSelectVideo: (video: TeachingVideo) => void;
  onNavigateToSkills: () => void;
}

export const ProfileManagementView: React.FC<Props> = ({
  onSelectVideo,
  onNavigateToSkills,
}) => {
  const { user, updateProfile } = useAuth();

  // Editable fields
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Histories
  const [mySkills, setMySkills] = useState<StudentSkill[]>([]);
  const [myVideos, setMyVideos] = useState<TeachingVideo[]>([]);
  const [teachingHistory, setTeachingHistory] = useState<Session[]>([]);
  const [learningHistory, setLearningHistory] = useState<Session[]>([]);
  const [receivedFeedback, setReceivedFeedback] = useState<Feedback[]>([]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setDepartment(user.department);
      setYearOfStudy(user.year_of_study);
      setProfilePhoto(user.profile_photo);
      setBio(user.bio);

      // Load histories
      api.getStudentSkills(user.id).then(setMySkills).catch(() => {});
      api.getVideos({ student_id: user.id }).then(setMyVideos).catch(() => {});
      api.getSessions(user.id, 'mentor').then(setTeachingHistory).catch(() => {});
      api.getSessions(user.id, 'learner').then(setLearningHistory).catch(() => {});
      api.getFeedback(user.id).then(setReceivedFeedback).catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await updateProfile({
        full_name: fullName.trim(),
        department,
        year_of_study: yearOfStudy,
        profile_photo: profilePhoto.trim(),
        bio: bio.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Profile Card */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={profilePhoto || user.profile_photo}
            alt={fullName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-200 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">{fullName}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                Teacher & Learner
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {department} • {yearOfStudy} • ID: <code className="font-mono">{user.student_id_number}</code>
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1 font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {user.average_rating || 5.0} Peer Rating
              </span>
              <span className="text-slate-400 font-medium">
                {teachingHistory.length} Sessions Taught • {learningHistory.length} Sessions Attended
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            const formEl = document.getElementById('profile-edit-form');
            formEl?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition"
        >
          Edit Profile Details ↓
        </button>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Edit Form & Histories */}
        <div className="lg:col-span-2 space-y-8">
          {/* Edit Profile Form */}
          <div id="profile-edit-form" className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Update Student Profile Information
            </h2>

            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Profile details successfully updated in MySQL database.</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student ID (Permanent)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.student_id_number}
                    className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 text-slate-500 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Design & Media">Design & Media</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Year of Study *
                  </label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none"
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share what subjects you love, your teaching philosophy, or what you are looking to learn..."
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Choose Profile Avatar:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {sampleAvatars.map((url, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setProfilePhoto(url)}
                      className={`relative rounded-xl overflow-hidden shrink-0 border-2 transition ${
                        profilePhoto === url
                          ? 'border-indigo-600 scale-105 shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${i}`} className="w-11 h-11 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Updating...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Teaching History & Learning History */}
          <div className="space-y-6">
            {/* Teaching History */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Teaching History (Sessions Taught as Mentor)
              </h3>
              {teachingHistory.length === 0 ? (
                <p className="text-xs text-slate-400">No sessions taught yet.</p>
              ) : (
                <div className="space-y-2">
                  {teachingHistory.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{s.title}</div>
                        <div className="text-[11px] text-slate-500">
                          Learner: {s.learner_name} • {s.session_date}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-800">
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Learning History */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Learning History (Sessions Attended as Learner)
              </h3>
              {learningHistory.length === 0 ? (
                <p className="text-xs text-slate-400">No sessions attended yet.</p>
              ) : (
                <div className="space-y-2">
                  {learningHistory.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{s.title}</div>
                        <div className="text-[11px] text-slate-500">
                          Mentor: {s.mentor_name} • {s.session_date}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800">
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Registered Skills & Uploaded Videos */}
        <div className="space-y-6">
          {/* Registered Skills */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                My Skills ({mySkills.length})
              </h3>
              <button
                onClick={onNavigateToSkills}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-2">
              {mySkills.length === 0 ? (
                <p className="text-xs text-slate-400">No skills registered yet.</p>
              ) : (
                mySkills.map((sk) => (
                  <div
                    key={sk.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{sk.skill_name}</div>
                      <div className="text-[10px] text-slate-500">{sk.proficiency}</div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700">
                      {sk.role_type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Uploaded Videos */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-600" />
              Uploaded Teaching Demos ({myVideos.length})
            </h3>

            <div className="space-y-2">
              {myVideos.length === 0 ? (
                <p className="text-xs text-slate-400">No demonstration videos uploaded yet.</p>
              ) : (
                myVideos.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => onSelectVideo(v)}
                    className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200 transition cursor-pointer flex items-center justify-between text-xs group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-800 group-hover:text-purple-700 truncate">
                        {v.title}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {v.subject_name} • {Math.floor(v.duration_seconds / 60)}m {v.duration_seconds % 60}s
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-purple-600 whitespace-nowrap">
                      Watch →
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Feedback & Reviews Received */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Student Reviews Received ({receivedFeedback.length})
            </h3>

            <div className="space-y-3">
              {receivedFeedback.length === 0 ? (
                <p className="text-xs text-slate-400">No reviews received yet.</p>
              ) : (
                receivedFeedback.map((f) => (
                  <div
                    key={f.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{f.reviewer_name}</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(f.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"{f.review_text}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
