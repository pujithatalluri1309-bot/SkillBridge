import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Send,
  Check,
  X,
  Clock,
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  User,
} from 'lucide-react';
import { LearningRequest } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onNavigateToSessions: () => void;
}

export const LearningRequestsView: React.FC<Props> = ({ onNavigateToSessions }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [requests, setRequests] = useState<LearningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [responseNote, setResponseNote] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const loadRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getRequests(user.id, activeTab);
      setRequests(data);
    } catch (e) {
      console.error('Failed to load requests', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user, activeTab]);

  const handleRespond = async (requestId: number, status: 'accepted' | 'rejected') => {
    setActionError(null);
    try {
      await api.respondRequest(requestId, {
        status,
        response_note: responseNote.trim() || undefined,
        schedule_session: status === 'accepted', // Automatically schedule session into calendar upon acceptance!
      });
      setRespondingId(null);
      setResponseNote('');
      await loadRequests();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update request.');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Inbox className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">Learning Requests Hub</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage inbound peer tutoring requests from learners, or track requests you sent to other
            mentors.
          </p>
        </div>

        <button
          onClick={onNavigateToSessions}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition"
        >
          View Scheduled Sessions Calendar →
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 p-1.5 bg-slate-200/70 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'received'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Received (As Mentor)</span>
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'sent'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Sent (As Learner)</span>
        </button>
      </div>

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">
            {activeTab === 'received' ? 'No incoming requests yet' : 'You haven’t sent any requests'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'received'
              ? 'When learners view your teaching demonstration videos, their session requests will appear here.'
              : 'Explore peer mentors and request tutoring on topics you want to master.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isReceived = activeTab === 'received';
            const otherPartyName = isReceived ? req.learner_name : req.mentor_name;
            const otherPartyPhoto = isReceived ? req.learner_photo : req.mentor_photo;
            const otherPartyDept = isReceived ? req.learner_department : req.mentor_department;

            return (
              <div
                key={req.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all space-y-4"
              >
                {/* Top Request Meta */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        otherPartyPhoto ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={otherPartyName}
                      className="w-10 h-10 rounded-full object-cover border border-indigo-200"
                    />
                    <div>
                      <div className="text-xs text-slate-400 font-semibold uppercase">
                        {isReceived ? 'Learner Request From:' : 'Sent to Mentor:'}
                      </div>
                      <div className="text-sm font-bold text-slate-900">{otherPartyName}</div>
                      <div className="text-[11px] text-slate-500">{otherPartyDept}</div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {req.status === 'pending' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Review
                      </span>
                    )}
                    {req.status === 'accepted' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accepted & Scheduled
                      </span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject & Message Box */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Topic:</span>
                    <span className="text-sm font-extrabold text-slate-900">{req.subject}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">"{req.message}"</p>

                  {/* Preferred Date & Time */}
                  {(req.preferred_date || req.preferred_time) && (
                    <div className="pt-2 flex items-center gap-4 text-xs text-slate-500 font-mono">
                      {req.preferred_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          Preferred Date: {req.preferred_date}
                        </span>
                      )}
                      {req.preferred_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          Time: {req.preferred_time}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Mentor Response Note (if any) */}
                  {req.response_note && (
                    <div className="mt-2 p-3 bg-white rounded-lg border border-slate-200 text-xs">
                      <strong className="text-indigo-700">Mentor Response:</strong>{' '}
                      <span className="text-slate-700">{req.response_note}</span>
                    </div>
                  )}
                </div>

                {/* Actions for Received Pending Requests */}
                {isReceived && req.status === 'pending' && (
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                    {respondingId === req.id ? (
                      <div className="w-full p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-3">
                        <label className="block text-xs font-bold text-indigo-950">
                          Add a message for the learner (Optional):
                        </label>
                        <input
                          type="text"
                          value={responseNote}
                          onChange={(e) => setResponseNote(e.target.value)}
                          placeholder="e.g. Excited to meet! Please bring your VS Code setup."
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setRespondingId(null)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRespond(req.id, 'rejected')}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleRespond(req.id, 'accepted')}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Accept & Auto-Schedule
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setRespondingId(req.id);
                            setResponseNote('Looking forward to teaching you this topic!');
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept Request</span>
                        </button>
                        <button
                          onClick={() => {
                            setRespondingId(req.id);
                            setResponseNote('Sorry, I am unavailable at this specific slot.');
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <X className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
