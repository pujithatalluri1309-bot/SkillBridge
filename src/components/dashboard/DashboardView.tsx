import React, { useState, useEffect } from 'react';
import {
  Award,
  Video,
  Inbox,
  Calendar as CalendarIcon,
  Star,
  Users,
  PlusCircle,
  Play,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Student, TeachingVideo, Session, LearningRequest } from '../../types';
import { api } from '../../services/api';

interface Props {
  onNavigate: (view: string) => void;
  onSelectVideo: (video: TeachingVideo) => void;
  onRequestSessionWithMentor: (mentor: Student) => void;
  onOpenSqlExplorer: () => void;
}

export const DashboardView: React.FC<Props> = ({
  onNavigate,
  onSelectVideo,
  onRequestSessionWithMentor,
  onOpenSqlExplorer,
}) => {
  const { user } = useAuth();
  const [recommendedMentors, setRecommendedMentors] = useState<Student[]>([]);
  const [recentVideos, setRecentVideos] = useState<TeachingVideo[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LearningRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      api.getStudents(),
      api.getVideos(),
      api.getSessions(user.id),
      api.getRequests(user.id, 'received'),
    ])
      .then(([allStudents, allVideos, allSessions, allRequests]) => {
        // Exclude current student from recommended mentors
        const others = allStudents.filter((s) => s.id !== user.id);
        setRecommendedMentors(others.slice(0, 3));
        setRecentVideos(allVideos.slice(0, 3));
        setUpcomingSessions(
          allSessions.filter((s) => s.status === 'Accepted' || s.status === 'Requested').slice(0, 3)
        );
        setPendingRequests(allRequests.filter((r) => r.status === 'pending'));
      })
      .catch((err) => console.error('Dashboard load error', err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const totalSkillsRegistered = user.skills?.length || 0;
  const avgRating = user.average_rating || 5.0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Student Hero Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl text-white shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {user.student_id_number}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active Peer Tutor & Learner
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.full_name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
              {user.department} • {user.year_of_study}. You are actively registered as both a teacher and a learner in the SkillMate system.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('skills')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold rounded-xl shadow-md transition"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Register New Skill</span>
            </button>
            <button
              onClick={() => onNavigate('videos')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md border border-indigo-400/40 transition"
            >
              <Video className="w-4 h-4" />
              <span>Upload Demo Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards (SonicSpace dashboard style) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Skills */}
        <div
          onClick={() => onNavigate('skills')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Registered Skills
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalSkillsRegistered}</div>
          <div className="text-[11px] text-slate-500 mt-1">Teaching & learning</div>
        </div>

        {/* Learning Requests */}
        <div
          onClick={() => onNavigate('requests')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{pendingRequests.length}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Awaiting your response</div>
        </div>

        {/* Teaching Sessions */}
        <div
          onClick={() => onNavigate('sessions')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Completed Sessions
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{user.sessions_completed || 0}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Peer lessons delivered</div>
        </div>

        {/* Upcoming Sessions */}
        <div
          onClick={() => onNavigate('sessions')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Upcoming Bookings
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{upcomingSessions.length}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">On calendar schedule</div>
        </div>

        {/* Average Rating */}
        <div
          onClick={() => onNavigate('profile')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Peer Rating
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 flex items-center gap-1.5">
            <span>{avgRating}</span>
            <span className="text-amber-400 text-base">★</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Based on student reviews</div>
        </div>
      </div>

      {/* Main Content Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recommended Mentors & Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Your Upcoming Peer Sessions</h2>
              </div>
              <button
                onClick={() => onNavigate('sessions')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
              >
                View Full Calendar →
              </button>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                <p>No upcoming sessions scheduled right now.</p>
                <button
                  onClick={() => onNavigate('mentors')}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold transition hover:bg-indigo-700"
                >
                  Find a Peer Mentor to Schedule
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-slate-50 hover:bg-indigo-50/40 rounded-xl border border-slate-200 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700">
                          {session.location_type}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{session.title}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {session.session_date} at {session.start_time.substring(0, 5)}
                        </span>
                        <span>•</span>
                        <span>
                          Peer: {session.mentor_id === user.id ? session.learner_name : session.mentor_name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {session.meeting_link && (
                        <a
                          href={session.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1"
                        >
                          <span>Join</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        onClick={() => onNavigate('sessions')}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Peer Mentors */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Recommended Peer Mentors</h2>
              </div>
              <button
                onClick={() => onNavigate('mentors')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
              >
                Browse All Mentors →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendedMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="p-4 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          mentor.profile_photo ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={mentor.full_name}
                        className="w-10 h-10 rounded-full object-cover border border-indigo-200"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {mentor.full_name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {mentor.department}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">{mentor.average_rating || 5.0}</span>
                      <span className="text-[10px] text-slate-400">({mentor.rating_count || 1})</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {mentor.skills?.slice(0, 2).map((sk) => (
                        <span
                          key={sk.id}
                          className="px-2 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700"
                        >
                          {sk.skill_name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onRequestSessionWithMentor(mentor)}
                    className="mt-4 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    Request Session
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Teaching Demo Videos & Quick Actions */}
        <div className="space-y-8">
          {/* Quick Actions Card */}
          <div className="bg-indigo-50/70 rounded-2xl border border-indigo-100 p-6 space-y-4">
            <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Quick Student Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('skills')}
                className="w-full p-2.5 bg-white hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold text-slate-700 shadow-2xs border border-indigo-100 transition flex items-center justify-between group"
              >
                <span>Add Skill to Profile</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:text-white" />
              </button>
              <button
                onClick={() => onNavigate('videos')}
                className="w-full p-2.5 bg-white hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold text-slate-700 shadow-2xs border border-indigo-100 transition flex items-center justify-between group"
              >
                <span>Upload 1–3 Min Teaching Demo</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:text-white" />
              </button>
              <button
                onClick={() => onNavigate('sessions')}
                className="w-full p-2.5 bg-white hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold text-slate-700 shadow-2xs border border-indigo-100 transition flex items-center justify-between group"
              >
                <span>Book Peer Session</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:text-white" />
              </button>
              <button
                onClick={onOpenSqlExplorer}
                className="w-full p-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-between"
              >
                <span>Open MySQL SQL Hub</span>
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recently Uploaded Teaching Videos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Teaching Demos</h3>
              </div>
              <button
                onClick={() => onNavigate('videos')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                All Videos →
              </button>
            </div>

            <div className="space-y-3">
              {recentVideos.map((vid) => {
                const minutes = Math.floor(vid.duration_seconds / 60);
                const seconds = vid.duration_seconds % 60;
                return (
                  <div
                    key={vid.id}
                    onClick={() => onSelectVideo(vid)}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 transition cursor-pointer flex items-center gap-3 group"
                  >
                    <div className="relative w-16 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                      <img
                        src={
                          vid.thumbnail_url ||
                          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={vid.title}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white group-hover:scale-110 transition" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition">
                        {vid.title}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{vid.subject_name}</span>
                        <span>•</span>
                        <span>
                          {minutes}:{seconds.toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
