import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Star,
  Award,
  Video,
  Play,
  ArrowRight,
  Send,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Student, TeachingVideo } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onSelectVideo: (video: TeachingVideo) => void;
  onRequestSessionWithMentor: (mentor: Student) => void;
}

export const FindMentorView: React.FC<Props> = ({
  onSelectVideo,
  onRequestSessionWithMentor,
}) => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Student[]>([]);
  const [allVideos, setAllVideos] = useState<TeachingVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedProficiency, setSelectedProficiency] = useState('All');
  const [loading, setLoading] = useState(true);

  const departments = [
    'All',
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Design & Media',
    'Mechanical Engineering',
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsData, videosData] = await Promise.all([
        api.getStudents({
          search: searchQuery,
          department: selectedDept !== 'All' ? selectedDept : undefined,
          proficiency: selectedProficiency !== 'All' ? selectedProficiency : undefined,
        }),
        api.getVideos(),
      ]);

      // Only show students who teach skills
      const peerMentors = studentsData.filter(
        (s) => s.role === 'student' && s.skills?.some((sk) => sk.role_type === 'Teaching' || sk.role_type === 'Both')
      );

      setMentors(peerMentors.length > 0 ? peerMentors : studentsData);
      setAllVideos(videosData);
    } catch (e) {
      console.error('Error loading mentors', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedDept, selectedProficiency]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">Find a Peer Mentor</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search peer student tutors by subject, skill, department, or proficiency. Watch their
            teaching demonstration videos before requesting a session.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by mentor name, skill, or topic..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Proficiency Filter */}
          <div>
            <select
              value={selectedProficiency}
              onChange={(e) => setSelectedProficiency(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
            >
              <option value="All">All Proficiency Levels</option>
              <option value="Advanced">Advanced Only</option>
              <option value="Intermediate">Intermediate Only</option>
              <option value="Beginner">Beginner Friendly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mentors Cards Grid */}
      {mentors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No peer mentors found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or department filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => {
            const isSelf = user?.id === mentor.id;
            const mentorVideos = allVideos.filter((v) => v.student_id === mentor.id);

            return (
              <div
                key={mentor.id}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Top Profile Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          mentor.profile_photo ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={mentor.full_name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-200 shadow-xs"
                      />
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-700 transition">
                          {mentor.full_name}
                        </h3>
                        <p className="text-xs text-slate-500">{mentor.department}</p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {mentor.year_of_study}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-amber-900">
                          {mentor.average_rating || 5.0}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {mentor.rating_count || 1} reviews
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {mentor.bio}
                  </p>

                  {/* Registered Teaching Skills */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Teaching Specializations:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.skills && mentor.skills.length > 0 ? (
                        mentor.skills.map((sk) => (
                          <span
                            key={sk.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1"
                          >
                            <span>{sk.skill_name}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-200/60 text-indigo-900">
                              {sk.proficiency}
                            </span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">General Peer Tutor</span>
                      )}
                    </div>
                  </div>

                  {/* Teaching Video Preview Card */}
                  {mentorVideos.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 mb-1.5 flex items-center gap-1">
                        <Video className="w-3 h-3 text-purple-600" />
                        <span>Teaching Demo Available ({mentorVideos.length})</span>
                      </div>

                      <div
                        onClick={() => onSelectVideo(mentorVideos[0])}
                        className="p-2.5 bg-purple-50/70 hover:bg-purple-100/80 rounded-xl border border-purple-200 transition cursor-pointer flex items-center justify-between group/v"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {mentorVideos[0].title}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-purple-700 whitespace-nowrap pl-2">
                          Watch Demo →
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="pt-5 mt-5 border-t border-slate-100">
                  {isSelf ? (
                    <div className="text-center py-2 text-xs font-bold text-slate-400 bg-slate-50 rounded-xl">
                      (Your Own Profile)
                    </div>
                  ) : (
                    <button
                      onClick={() => onRequestSessionWithMentor(mentor)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-transform hover:-translate-y-0.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Learning Session</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
