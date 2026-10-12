import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentGrades } from './components/student/StudentGrades';
import { ChatPanel } from './components/chat/ChatPanel';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { LoginScreen } from './components/auth/LoginScreen';

const AppContent: React.FC = () => {
  const { currentUser, activeTab, isAuthenticated } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If user is not authenticated, show the institutional Login portal
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderActiveView = () => {
    // Shared global views
    if (activeTab === 'chat') {
      return <ChatPanel />;
    }
    if (activeTab === 'profile') {
      return <ProfileSettings />;
    }

    // Role-specific views
    switch (currentUser.role) {
      case 'admin':
        return <AdminDashboard />;

      case 'teacher':
        return <TeacherDashboard />;

      case 'student':
        if (activeTab === 'grades') {
          return <StudentGrades />;
        }
        return <StudentDashboard />;

      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 lg:pl-64 transition-all duration-200">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-64px)]">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
