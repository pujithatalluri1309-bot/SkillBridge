import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ExternalLink,
  Plus,
  CheckCircle2,
  XCircle,
  Star,
  Users,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { Session, Student } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onOpenFeedback: (session: Session) => void;
}

export const SessionSchedulingView: React.FC<Props> = ({ onOpenFeedback }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mentorsList, setMentorsList] = useState<Student[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Booking Form State
  const [selectedMentorId, setSelectedMentorId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [locationType, setLocationType] = useState<any>('Online Meeting');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    try {
      const [sessionsData, studentsData] = await Promise.all([
        api.getSessions(user.id),
        api.getStudents(),
      ]);
      setSessions(sessionsData);
      setMentorsList(studentsData.filter((s) => s.id !== user.id));
    } catch (e) {
      console.error('Failed to load sessions', e);
    }
  };

  useEffect(() => {
    loadData();
    // Default tomorrow date
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setSessionDate(tomorrow);
  }, [user]);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedMentorId === '') return;

    if (startTime >= endTime) {
      setBookingError('Session end time must be after start time.');
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      await api.bookSession({
        mentor_id: Number(selectedMentorId),
        learner_id: user.id,
        title: title.trim(),
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime,
        location_type: locationType,
        notes: notes.trim(),
      });
      await loadData();
      setIsBookModalOpen(false);
      setTitle('');
      setNotes('');
    } catch (err: any) {
      setBookingError(err.message || 'Booking conflict or error.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleStatusUpdate = async (sessionId: number, newStatus: 'Completed' | 'Cancelled') => {
    try {
      await api.updateSessionStatus(sessionId, { status: newStatus });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update session');
    }
  };

  if (!user) return null;

  const filteredSessions = sessions.filter((s) => {
    if (activeFilter === 'Upcoming') return s.status === 'Accepted' || s.status === 'Requested';
    if (activeFilter === 'Completed') return s.status === 'Completed';
    if (activeFilter === 'Cancelled') return s.status === 'Cancelled';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <CalendarIcon className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">Session Scheduling & Calendar</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Book collision-free peer tutoring appointments. The system automatically detects mentor
            time conflicts.
          </p>
        </div>

        <button
          onClick={() => {
            setBookingError(null);
            if (mentorsList.length > 0 && selectedMentorId === '') {
              setSelectedMentorId(mentorsList[0].id);
            }
            setIsBookModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Direct Session</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeFilter === filter
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filter} Sessions
          </button>
        ))}
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No sessions found in this view</h3>
          <p className="text-xs text-slate-400 mt-1">
            Schedule a session with a peer mentor to start your learning journey.
          </p>
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
          >
            Book a Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => {
            const isMentor = session.mentor_id === user.id;
            const peerName = isMentor ? session.learner_name : session.mentor_name;
            const peerPhoto = isMentor ? session.learner_photo : session.mentor_photo;
            const peerDept = isMentor ? session.learner_department : session.mentor_department;

            return (
              <div
                key={session.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Status & Location Pill */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      <MapPin className="w-3 h-3 text-indigo-600" />
                      {session.location_type}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        session.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : session.status === 'Accepted'
                          ? 'bg-blue-100 text-blue-800'
                          : session.status === 'Cancelled'
                          ? 'bg-slate-100 text-slate-500 line-through'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>

                  {/* Title & Subject */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{session.title}</h3>
                    {session.skill_name && (
                      <span className="text-xs font-semibold text-indigo-600">
                        {session.skill_name}
                      </span>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-indigo-950 font-bold">
                      <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{session.session_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-800 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        {session.start_time.substring(0, 5)} – {session.end_time.substring(0, 5)}
                      </span>
                    </div>
                  </div>

                  {/* Peer Info */}
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={
                        peerPhoto ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={peerName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        {isMentor ? 'Learner Student:' : 'Peer Mentor:'}
                      </div>
                      <div className="text-xs font-bold text-slate-900">{peerName}</div>
                      <div className="text-[10px] text-slate-500">{peerDept}</div>
                    </div>
                  </div>

                  {/* Meeting link */}
                  {session.meeting_link && session.status !== 'Cancelled' && (
                    <div className="pt-2">
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition border border-indigo-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Launch Online Meeting Room</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Session Status Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                  {session.status === 'Accepted' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStatusUpdate(session.id, 'Completed')}
                        className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Done</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(session.id, 'Cancelled')}
                        className="py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}

                  {session.status === 'Completed' && (
                    <div>
                      {session.has_feedback ? (
                        <div className="text-center py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Feedback & Rating Submitted</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenFeedback(session)}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>Rate & Review Peer ({session.mentor_name})</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Session Modal with Conflict Collision Detection */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Schedule Peer Session</h3>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookSession} className="p-6 space-y-4">
              {bookingError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Mentor Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Peer Mentor *
                </label>
                <select
                  required
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {mentorsList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.department}) - Rating: {m.average_rating || 5.0}★
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Session Title or Subject *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MySQL Indexing Review, React Custom Hooks Walkthrough"
                  className="w-full px-3.5 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Date *</label>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Location Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location *</label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl outline-none"
                >
                  <option value="Online Meeting">Online Meeting (Google Meet / Zoom demo)</option>
                  <option value="Library Study Room">Campus Library Study Room 3A</option>
                  <option value="Lab 4B">Computer Science Lab 4B</option>
                  <option value="Campus Lounge">Student Activity Center Lounge</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preparation Notes for Mentor
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please review my SQL join queries beforehand."
                  className="w-full px-3.5 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isBooking ? 'Checking Conflicts & Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
