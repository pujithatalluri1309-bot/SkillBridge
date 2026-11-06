import React, { useEffect, useRef } from 'react';
import { X, Play, Clock, Eye, Calendar, User, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { TeachingVideo } from '../../types';
import { api } from '../../services/api';

interface Props {
  video: TeachingVideo | null;
  onClose: () => void;
  onRequestSession?: (mentorId: number, subject: string, skillId?: number | null) => void;
}

export const VideoPlayerModal: React.FC<Props> = ({ video, onClose, onRequestSession }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (video) {
      api.incrementVideoView(video.id).catch(() => {});
    }
  }, [video]);

  if (!video) return null;

  const minutes = Math.floor(video.duration_seconds / 60);
  const seconds = video.duration_seconds % 60;
  const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const formattedDate = new Date(video.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Teaching Demonstration Video (1-3 Mins)
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative bg-black aspect-video w-full flex items-center justify-center">
          <video
            ref={videoRef}
            src={video.video_url}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Details & Mentor Profile */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                  {video.subject_name}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {formattedDuration} min demonstration
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 leading-snug">{video.title}</h3>
            </div>

            {onRequestSession && (
              <button
                onClick={() => {
                  onClose();
                  onRequestSession(video.student_id, video.subject_name, video.skill_id);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:shadow-indigo-500/25"
              >
                <span>Request Session with Mentor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Description */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Explanation Summary
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">{video.description}</p>
          </div>

          {/* Mentor Profile Bar */}
          <div className="flex items-center justify-between p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-3">
              <img
                src={
                  video.student_photo ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                }
                alt={video.student_name}
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{video.student_name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                    Peer Mentor
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {video.student_department || 'Computer Science'} • {video.student_year || 'Undergraduate'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {video.views_count + 1} views
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
