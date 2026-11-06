import React, { useState, useEffect } from 'react';
import { X, Send, Calendar, Clock, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { Student } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Props {
  mentor: Student | null;
  initialSubject?: string;
  initialSkillId?: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RequestSessionModal: React.FC<Props> = ({
  mentor,
  initialSubject = '',
  initialSkillId = null,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('14:00');
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(initialSkillId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubject) setSubject(initialSubject);
    if (initialSkillId) setSelectedSkillId(initialSkillId);
    // Default tomorrow's date
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setPreferredDate(tomorrow);
  }, [initialSubject, initialSkillId, isOpen]);

  if (!isOpen || !mentor || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Please provide a subject and message detailing what you would like to learn.');
      return;
    }

    if (user.id === mentor.id) {
      setError('You cannot send a learning request to yourself.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.sendRequest({
        learner_id: user.id,
        mentor_id: mentor.id,
        skill_id: selectedSkillId,
        subject: subject.trim(),
        message: message.trim(),
        preferred_date: preferredDate || undefined,
        preferred_time: preferredTime || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send learning request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <img
              src={mentor.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={mentor.full_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400"
            />
            <div>
              <h3 className="text-base font-bold">Request Learning Session</h3>
              <p className="text-xs text-slate-400">
                Mentor: {mentor.full_name} ({mentor.department})
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject / Topic */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Subject or Topic to Learn *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. React useEffect, MySQL 3NF Normalization, Calculus Derivatives"
              className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Quick Select from Mentor's Registered Skills */}
          {mentor.skills && mentor.skills.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Select Mentor's Teaching Skill:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {mentor.skills.map((sk) => (
                  <button
                    type="button"
                    key={sk.id}
                    onClick={() => {
                      setSubject(sk.skill_name || '');
                      setSelectedSkillId(sk.skill_id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                      selectedSkillId === sk.skill_id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {sk.skill_name} ({sk.proficiency})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preferred Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Preferred Date
              </label>
              <input
                type="date"
                required
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Preferred Time
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="13:00">01:00 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="17:00">05:00 PM</option>
                <option value="18:30">06:30 PM</option>
              </select>
            </div>
          </div>

          {/* Message to Mentor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Message to Peer Mentor *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I watched your teaching demonstration video and would love your guidance on..."
              className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending Request...' : 'Send Learning Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
