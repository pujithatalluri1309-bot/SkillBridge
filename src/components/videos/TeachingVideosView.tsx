import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Upload,
  Play,
  Clock,
  Eye,
  Search,
  Filter,
  Calendar,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { TeachingVideo, Student } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onSelectVideo: (video: TeachingVideo) => void;
  onRequestSessionWithMentor: (mentor: Student, subject: string, skillId?: number | null) => void;
}

export const TeachingVideosView: React.FC<Props> = ({
  onSelectVideo,
  onRequestSessionWithMentor,
}) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<TeachingVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('2');
  const [durationSeconds, setDurationSeconds] = useState('0');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [demoSampleUrl, setDemoSampleUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // In-browser webcam/screen recorder state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);

  const loadVideos = async () => {
    setIsLoading(true);
    try {
      const data = await api.getVideos({ search: searchQuery });
      setVideos(data);
    } catch (e) {
      console.error('Failed to load videos', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [searchQuery]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        const file = new File([blob], `teaching-demo-${Date.now()}.webm`, { type: 'video/webm' });
        setVideoFile(file);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 180) {
            // Cap at 3 minutes as required
            handleStopRecording();
            return 180;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      alert('Camera access denied or unavailable: ' + err.message);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsRecording(false);
      clearInterval(timerRef.current);
      setDurationMinutes(Math.floor(recordingSeconds / 60).toString());
      setDurationSeconds((recordingSeconds % 60).toString());
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const totalSeconds = parseInt(durationMinutes, 10) * 60 + parseInt(durationSeconds, 10);
    if (totalSeconds < 60 || totalSeconds > 180) {
      setUploadError('Teaching video duration must be between 1 and 3 minutes (60–180 seconds).');
      return;
    }

    if (!videoFile && !demoSampleUrl) {
      setUploadError('Please select a video file (MP4/WebM), record a clip, or pick a demo stream.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('student_id', user.id.toString());
      formData.append('title', title.trim());
      formData.append('subject_name', subjectName.trim());
      formData.append('description', description.trim());
      formData.append('duration_seconds', totalSeconds.toString());

      if (videoFile) {
        formData.append('video_file', videoFile);
      } else if (demoSampleUrl) {
        formData.append('direct_url', demoSampleUrl);
      }

      await api.uploadVideo(formData);
      await loadVideos();
      setIsUploadModalOpen(false);
      // Reset form
      setTitle('');
      setSubjectName('');
      setDescription('');
      setVideoFile(null);
      setRecordedBlob(null);
      setDemoSampleUrl('');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload teaching demonstration.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this teaching demonstration?')) return;
    try {
      await api.deleteVideo(videoId);
      await loadVideos();
    } catch (err: any) {
      alert(err.message || 'Failed to delete video');
    }
  };

  // Distinct subjects for filter
  const subjects = ['All', ...Array.from(new Set(videos.map((v) => v.subject_name)))];

  const filteredVideos = videos.filter((v) => {
    if (selectedSubject !== 'All' && v.subject_name !== selectedSubject) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-indigo-800 text-white rounded-2xl shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/20 text-white">
              <Video className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Special Core Feature
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Teaching Demonstration Videos</h1>
          <p className="text-xs text-indigo-200 max-w-xl">
            Short 1–3 minute explanation videos uploaded by student mentors. Watch how peers explain
            concepts before requesting a 1-on-1 peer session.
          </p>
        </div>

        <button
          onClick={() => {
            setUploadError(null);
            setIsUploadModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 shrink-0"
        >
          <Upload className="w-4 h-4 text-purple-600" />
          <span>Upload 1–3 Min Demo</span>
        </button>
      </div>

      {/* Search & Subject Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teaching videos by title, topic, or keyword..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Subject:
          </span>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                selectedSubject === sub
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <FileVideo className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No teaching videos found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Be the first peer mentor to upload a short explanation video in this category!
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl"
          >
            Upload Demo Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((vid) => {
            const minutes = Math.floor(vid.duration_seconds / 60);
            const seconds = vid.duration_seconds % 60;
            const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            const isOwner = user?.id === vid.student_id;

            return (
              <div
                key={vid.id}
                onClick={() => onSelectVideo(vid)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-purple-300 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                    <img
                      src={
                        vid.thumbnail_url ||
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/15 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-purple-600 group-hover:bg-purple-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 fill-white" />
                      </div>
                    </div>
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formattedDuration}
                    </span>

                    {isOwner && (
                      <button
                        onClick={(e) => handleDeleteVideo(vid.id, e)}
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 transition"
                        title="Delete your video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[11px]">
                        {vid.subject_name}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {vid.views_count} views
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-purple-600 transition line-clamp-2">
                      {vid.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {vid.description}
                    </p>
                  </div>
                </div>

                {/* Footer Mentor Profile */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        vid.student_photo ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={vid.student_name}
                      className="w-7 h-7 rounded-full object-cover border border-purple-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{vid.student_name}</div>
                      <div className="text-[10px] text-slate-400">{vid.student_department}</div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    <span>Watch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Video Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Upload Teaching Demo Video</h3>
                  <p className="text-xs text-slate-400">1 to 3 Minutes • MP4 / WebM • Max 100 MB</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUploadSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Video Demonstration Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Understanding React useEffect Hook in 2 Minutes"
                  className="w-full px-3.5 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Subject / Topic */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject or Skill Name *
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Web Development, Database & SQL, Algorithms, Calculus"
                  className="w-full px-3.5 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Duration (Enforce 1-3 mins) */}
              <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    Video Duration (Must be 1–3 Minutes) *
                  </label>
                  <span className="text-[11px] font-mono font-bold text-purple-700">
                    Total:{' '}
                    {parseInt(durationMinutes, 10) * 60 + (parseInt(durationSeconds, 10) || 0)}s (
                    {durationMinutes}m {durationSeconds}s)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase">
                      Minutes (1–3)
                    </label>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                    >
                      <option value="1">1 Minute</option>
                      <option value="2">2 Minutes</option>
                      <option value="3">3 Minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase">
                      Seconds (0–59)
                    </label>
                    <select
                      value={durationSeconds}
                      onChange={(e) => setDurationSeconds(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                    >
                      <option value="0">00 sec</option>
                      <option value="15">15 sec</option>
                      <option value="30">30 sec</option>
                      <option value="45">45 sec</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Explanation Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what concept you demonstrate in this video and how it helps students prepare..."
                  className="w-full px-3.5 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Video Source Options */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Select Video Demonstration Source *
                </label>

                {/* File Upload Option */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    Option A: Upload MP4 / WebM File (Max 100 MB)
                  </div>
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setVideoFile(e.target.files[0]);
                        setDemoSampleUrl('');
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                  />
                  {videoFile && (
                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                    </div>
                  )}
                </div>

                {/* Webcam Recorder Option */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-purple-600" />
                    Option B: Record Live 1-Minute Demonstration using Webcam
                  </div>
                  <div className="flex items-center gap-3">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Start Recording</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 animate-pulse"
                      >
                        <span>Stop Recording ({recordingSeconds}s)</span>
                      </button>
                    )}
                    {recordedBlob && (
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Live recording saved ({recordingSeconds}s WebM)
                      </span>
                    )}
                  </div>
                </div>

                {/* Demo Curated Streams */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700">
                    Option C: Pick Ready-to-Test Academic Demo Video Stream
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        setDemoSampleUrl(
                          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                        );
                        setVideoFile(null);
                        setTitle('React Component Life-cycle & State Tutorial');
                        setSubjectName('Web Development');
                      }}
                      className="p-1.5 bg-white border border-slate-200 hover:border-purple-400 rounded text-left truncate"
                    >
                      ▶ React State Tutorial (2 Min)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDemoSampleUrl(
                          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
                        );
                        setVideoFile(null);
                        setTitle('MySQL Indexing & Joins Demonstration');
                        setSubjectName('Database & SQL');
                      }}
                      className="p-1.5 bg-white border border-slate-200 hover:border-purple-400 rounded text-left truncate"
                    >
                      ▶ SQL Joins Demo (2 Min)
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading to MySQL & Storage...' : 'Publish Teaching Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
