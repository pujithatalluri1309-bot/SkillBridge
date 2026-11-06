import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

// Views
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { MySkillsView } from './components/skills/MySkillsView';
import { TeachingVideosView } from './components/videos/TeachingVideosView';
import { FindMentorView } from './components/mentors/FindMentorView';
import { LearningRequestsView } from './components/requests/LearningRequestsView';
import { SessionSchedulingView } from './components/sessions/SessionSchedulingView';
import { ProfileManagementView } from './components/profile/ProfileManagementView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';

// Modals
import { VideoPlayerModal } from './components/common/VideoPlayerModal';
import { RequestSessionModal } from './components/common/RequestSessionModal';
import { FeedbackModal } from './components/common/FeedbackModal';
import { SqlDocumentationModal } from './components/academic/SqlDocumentationModal';
import { AuthModal } from './components/auth/AuthModal';

import { TeachingVideo, Student, Session } from './types';
import { api } from './services/api';

function MainApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Modals state
  const [activeVideo, setActiveVideo] = useState<TeachingVideo | null>(null);
  const [requestMentor, setRequestMentor] = useState<Student | null>(null);
  const [requestSubject, setRequestSubject] = useState<string>('');
  const [requestSkillId, setRequestSkillId] = useState<number | null>(null);
  const [feedbackSession, setFeedbackSession] = useState<Session | null>(null);
  const [isSqlExplorerOpen, setIsSqlExplorerOpen] = useState(false);
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login',
  });

  const handleOpenRequestModal = (mentor: Student, subject = '', skillId: number | null = null) => {
    setRequestMentor(mentor);
    setRequestSubject(subject);
    setRequestSkillId(skillId);
  };

  const handleNavigate = (view: string) => {
    if (view === 'login') {
      setAuthModalState({ isOpen: true, mode: 'login' });
      return;
    }
    if (view === 'register') {
      setAuthModalState({ isOpen: true, mode: 'register' });
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLanding = currentView === 'landing';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSqlExplorer={() => setIsSqlExplorerOpen(true)}
        onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex w-full">
        {/* Sidebar navigation (shown when logged in or navigating inner views) */}
        {!isLanding && (
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            onOpenSqlExplorer={() => setIsSqlExplorerOpen(true)}
            isOpenMobile={isSidebarOpenMobile}
            onCloseMobile={() => setIsSidebarOpenMobile(false)}
          />
        )}

        {/* View Content */}
        <main className={`flex-1 transition-all ${!isLanding ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full' : ''}`}>
          {currentView === 'landing' && (
            <LandingPage
              onNavigate={handleNavigate}
              onSelectVideo={(v) => setActiveVideo(v)}
              onRequestSessionWithMentor={(m) => handleOpenRequestModal(m)}
              onOpenSqlExplorer={() => setIsSqlExplorerOpen(true)}
            />
          )}

          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              onSelectVideo={(v) => setActiveVideo(v)}
              onRequestSessionWithMentor={(m) => handleOpenRequestModal(m)}
              onOpenSqlExplorer={() => setIsSqlExplorerOpen(true)}
            />
          )}

          {currentView === 'skills' && <MySkillsView />}

          {currentView === 'videos' && (
            <TeachingVideosView
              onSelectVideo={(v) => setActiveVideo(v)}
              onRequestSessionWithMentor={(m, sub, skId) => handleOpenRequestModal(m, sub, skId)}
            />
          )}

          {currentView === 'mentors' && (
            <FindMentorView
              onSelectVideo={(v) => setActiveVideo(v)}
              onRequestSessionWithMentor={(m) => handleOpenRequestModal(m)}
            />
          )}

          {currentView === 'requests' && (
            <LearningRequestsView onNavigateToSessions={() => setCurrentView('sessions')} />
          )}

          {currentView === 'sessions' && (
            <SessionSchedulingView onOpenFeedback={(s) => setFeedbackSession(s)} />
          )}

          {currentView === 'profile' && (
            <ProfileManagementView
              onSelectVideo={(v) => setActiveVideo(v)}
              onNavigateToSkills={() => setCurrentView('skills')}
            />
          )}

          {currentView === 'admin' && (
            <AdminDashboardView
              onOpenSqlExplorer={() => setIsSqlExplorerOpen(true)}
              onSelectVideo={(v) => setActiveVideo(v)}
            />
          )}
        </main>
      </div>

      {/* Global Academic & Modals */}
      <VideoPlayerModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
        onRequestSession={(mentorId, subject, skillId) => {
          // Find mentor by id
          api.getStudent(mentorId).then((m: Student) => {
            handleOpenRequestModal(m, subject, skillId);
          });
        }}
      />

      <RequestSessionModal
        mentor={requestMentor}
        initialSubject={requestSubject}
        initialSkillId={requestSkillId}
        isOpen={!!requestMentor}
        onClose={() => setRequestMentor(null)}
        onSuccess={() => {
          setCurrentView('requests');
        }}
      />

      <FeedbackModal
        session={feedbackSession}
        isOpen={!!feedbackSession}
        onClose={() => setFeedbackSession(null)}
        onSuccess={() => {
          setCurrentView('sessions');
        }}
      />

      <SqlDocumentationModal
        isOpen={isSqlExplorerOpen}
        onClose={() => setIsSqlExplorerOpen(false)}
      />

      <AuthModal
        mode={authModalState.mode}
        isOpen={authModalState.isOpen}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onSuccess={() => {
          setCurrentView('dashboard');
        }}
        onSwitchMode={(mode) => setAuthModalState({ isOpen: true, mode })}
      />

      {/* Footer */}
      <Footer
        onOpenSqlExplorer={() => setIsSqlExplorerOpen(true)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
