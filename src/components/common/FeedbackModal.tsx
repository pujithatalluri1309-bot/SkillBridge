import React, { useState } from 'react';
import { X, Star, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Session } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FeedbackModal: React.FC<Props> = ({ session, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !session || !user) return null;

  // Determine recipient: if the logged-in user is the learner, recipient is mentor; otherwise recipient is learner
  const isLearner = session.learner_id === user.id;
  const recipientId = isLearner ? session.mentor_id : session.learner_id;
  const recipientName = isLearner ? session.mentor_name : session.learner_name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setError('Please provide a written review of your learning session experience.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.submitFeedback({
        session_id: session.id,
        reviewer_id: user.id,
        recipient_id: recipientId,
        rating,
        review_text: reviewText.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold">Session Feedback & Rating</h3>
              <p className="text-xs text-slate-400">Rate your peer learning experience</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Session Summary Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="text-slate-500 font-medium">Session Topic:</div>
            <div className="font-bold text-slate-900 text-sm">{session.title}</div>
            <div className="text-slate-600">
              Evaluating Peer: <strong className="text-indigo-600">{recipientName}</strong>
            </div>
          </div>

          {/* 1-5 Star Interactive Selector */}
          <div className="text-center py-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Your Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    type="button"
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        active ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="text-xs font-bold text-slate-700 mt-2">
              {rating === 5 && '⭐⭐⭐⭐⭐ Exceptional – Crystal clear explanation!'}
              {rating === 4 && '⭐⭐⭐⭐ Very Good – Very helpful & engaged!'}
              {rating === 3 && '⭐⭐⭐ Good – Covered the essential points.'}
              {rating === 2 && '⭐⭐ Fair – Needs clearer examples.'}
              {rating === 1 && '⭐ Needs Improvement'}
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Written Feedback & Review *
            </label>
            <textarea
              required
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share what went well during this peer learning session, how clear the mentor was, and topics covered..."
              className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
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
              <CheckCircle className="w-4 h-4" />
              {isSubmitting ? 'Saving Review...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
