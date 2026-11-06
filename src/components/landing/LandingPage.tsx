import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Users,
  Video,
  Calendar,
  Star,
  CheckCircle2,
  GraduationCap,
  Play,
  Clock,
  Layers,
  Search,
  Award,
} from 'lucide-react';
import { Student, TeachingVideo, Skill } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onNavigate: (view: string) => void;
  onSelectVideo: (video: TeachingVideo) => void;
  onRequestSessionWithMentor: (mentor: Student) => void;
  onOpenSqlExplorer: () => void;
}

export const LandingPage: React.FC<Props> = ({
  onNavigate,
  onSelectVideo,
  onRequestSessionWithMentor,
  onOpenSqlExplorer,
}) => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Student[]>([]);
  const [videos, setVideos] = useState<TeachingVideo[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.getStudents().then((res) => setMentors(res.slice(0, 4))).catch(() => {});
    api.getVideos().then((res) => setVideos(res.slice(0, 3))).catch(() => {});
    api.getSkills().then((res) => setSkills(res.slice(0, 6))).catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('mentors');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section - SonicSpace inspired polished SaaS look */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Project Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs text-xs font-semibold animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              <span>Student Skill Exchange & Peer Mentorship</span>
              <span className="text-indigo-400">•</span>
              <span className="text-slate-600">Dual Role: Teach & Learn</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Learn together.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Teach together.
              </span>{' '}
              Grow together.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Connect with fellow university peers to exchange academic knowledge. Watch 1–3 minute
              teaching demonstration videos, book collision-free tutoring sessions, and master subjects
              together.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate(user ? 'dashboard' : 'register')}
                className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5"
              >
                <span>{user ? 'Go to Dashboard' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('mentors')}
                className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 shadow-xs transition-all hover:border-slate-300"
              >
                <span>Explore Peer Mentors</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </button>

              <button
                onClick={onOpenSqlExplorer}
                className="flex items-center gap-2 px-4 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs rounded-xl border border-indigo-200 transition"
              >
                <span>Explore MySQL Schema</span>
              </button>
            </div>

            {/* Quick stats pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 max-w-2xl mx-auto">
              <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-xl font-extrabold text-indigo-600">100%</div>
                <div className="text-[11px] text-slate-500 font-medium">Peer-to-Peer</div>
              </div>
              <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-xl font-extrabold text-indigo-600">1–3 Min</div>
                <div className="text-[11px] text-slate-500 font-medium">Demo Videos</div>
              </div>
              <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-xl font-extrabold text-indigo-600">8 Tables</div>
                <div className="text-[11px] text-slate-500 font-medium">MySQL Relational</div>
              </div>
              <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-xl font-extrabold text-indigo-600">5.0 ★</div>
                <div className="text-[11px] text-slate-500 font-medium">Rated Mentors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              Simple 4-Step Process
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How SkillMate Works
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              A single account allows you to register your teaching skills and request tutoring from peers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Register Skills',
                desc: 'Add your skills with proficiency (Beginner, Intermediate, Advanced) and choose whether you teach or learn.',
                icon: Award,
              },
              {
                step: '02',
                title: 'Watch Demo Videos',
                desc: 'View 1–3 min teaching videos uploaded by peer mentors to evaluate their explanation style before booking.',
                icon: Video,
              },
              {
                step: '03',
                title: 'Schedule Session',
                desc: 'Pick a collision-free calendar slot. Mentors accept requests and provide online meeting links or study room rooms.',
                icon: Calendar,
              },
              {
                step: '04',
                title: 'Rate & Provide Feedback',
                desc: 'Submit a 1–5 star rating and written review after completing the session to help top mentors stand out.',
                icon: Star,
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-indigo-600">
                      {step.step}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{step.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Teaching Video Previews (SPECIAL IMPORTANT FEATURE) */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
                <Video className="w-3.5 h-3.5" />
                Special Demonstration Feature
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Peer Teaching Demonstrations (1–3 Mins)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Watch mentors break down complex topics in bite-sized clips before you book a 1-on-1 session.
              </p>
            </div>
            <button
              onClick={() => onNavigate('videos')}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
            >
              <span>View All Videos</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((vid) => {
              const minutes = Math.floor(vid.duration_seconds / 60);
              const seconds = vid.duration_seconds % 60;
              const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
              return (
                <div
                  key={vid.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail with duration badge & play button */}
                    <div
                      onClick={() => onSelectVideo(vid)}
                      className="relative aspect-video w-full bg-slate-900 cursor-pointer overflow-hidden"
                    >
                      <img
                        src={
                          vid.thumbnail_url ||
                          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      />
                      <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 ml-0.5 fill-white" />
                        </div>
                      </div>
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedDuration}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                          {vid.subject_name}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {vid.views_count} views
                        </span>
                      </div>
                      <h4
                        onClick={() => onSelectVideo(vid)}
                        className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition cursor-pointer line-clamp-2"
                      >
                        {vid.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {vid.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Profile Bar */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          vid.student_photo ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={vid.student_name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        {vid.student_name}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectVideo(vid)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                    >
                      Watch Video →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Peer Mentors Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
                Top Student Tutors
              </h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Peer Mentors
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Learn directly from students who excelled in the same courses, labs, and projects.
              </p>
            </div>
            <button
              onClick={() => onNavigate('mentors')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 transition"
            >
              <span>Explore All Mentors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={
                        mentor.profile_photo ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={mentor.full_name}
                      className="w-13 h-13 rounded-full object-cover border-2 border-indigo-200 shadow-xs"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{mentor.full_name}</h4>
                      <p className="text-[11px] text-slate-500">{mentor.department}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-slate-800">
                          {mentor.average_rating || 5.0}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({mentor.rating_count || 1} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {mentor.bio}
                  </p>

                  {/* Skills tags */}
                  <div className="space-y-1 mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Teaches:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {mentor.skills && mentor.skills.length > 0 ? (
                        mentor.skills.slice(0, 3).map((sk) => (
                          <span
                            key={sk.id}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700"
                          >
                            {sk.skill_name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">Peer Academic Mentor</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRequestSessionWithMentor(mentor)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Request Session
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Loved by Students Across Campus
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real feedback from peer learning sessions conducted on SkillMate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ananya Iyer',
                dept: 'Design & Media, 3rd Year',
                quote:
                  'Watching Priya’s 2-minute video on SQL Joins made indexing click before my exam. The peer tutoring session was 10x more helpful than generic online slides.',
                rating: 5,
              },
              {
                name: 'Vikram Malhotra',
                dept: 'Mechanical Engineering, 2nd Year',
                quote:
                  'I was nervous about learning React, but Aarav broke down state and components step-by-step. Now I am already building my first personal web app.',
                rating: 5,
              },
              {
                name: 'Rohan Verma',
                dept: 'Electronics & Comm., 2nd Year',
                quote:
                  'Being able to teach Algorithms while learning UI design on the same account is brilliant. I get teaching experience and master design simultaneously.',
                rating: 5,
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">"{t.quote}"</p>
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{t.name}</div>
                  <div className="text-[10px] text-slate-400">{t.dept}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-14 bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to exchange skills and boost your GPA?
          </h2>
          <p className="text-sm text-indigo-200 max-w-xl mx-auto">
            Join hundreds of university students teaching and learning together on SkillMate.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('register')}
              className="px-6 py-3 bg-white text-indigo-800 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-lg transition"
            >
              Create Student Account
            </button>
            <button
              onClick={onOpenSqlExplorer}
              className="px-5 py-3 bg-indigo-900/60 hover:bg-indigo-900 text-indigo-200 font-bold text-xs rounded-xl border border-indigo-500/40 transition"
            >
              View MySQL Relational Schema
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
