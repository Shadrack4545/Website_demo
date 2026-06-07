/**
 * Dashboard - Main App Layout
 * Serves as the root component for authenticated users
 */

import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import EventsPage from './EventsPage';
import AnnouncementsPage from './AnnouncementsPage';
import DirectoryPage from './DirectoryPage';
import ResourceLibraryPage from './ResourceLibraryPage';
import ForumPage from './ForumPage';
import FinancePage from './FinancePage';
import DocumentArchivePage from './DocumentArchivePage';
import MemberVerificationPage from './MemberVerificationPage';
import ActivityAnalyticsPage from './ActivityAnalyticsPage';
import AdminProfilesPage from './AdminProfilesPage';
import AchievementsPage from './AchievementsPage';
import ProfilePage from './ProfilePage';
import DashboardPage from './DashboardPage';
import ChatRequestsPage from './ChatRequestsPage';
import ChatRequestManagementPage from './ChatRequestManagementPage';
import EventPredictorPage from './EventPredictorPage';
import AdminSeedDataPage from './AdminSeedDataPage';
import RoleManagementPage from './RoleManagementPage';
import { useAuth } from '../hooks/useContext';
import { recordLogin } from '../utils/activity';

export type PageType =
  | 'dashboard'
  | 'events'
  | 'announcements'
  | 'directory'
  | 'resources'
  | 'forum'
  | 'finance'
  | 'documents'
  | 'verification'
  | 'analytics'
  | 'admin-profiles'
  | 'achievements'
  | 'profile'
  | 'chat-requests'
  | 'chat-management'
  | 'event-predictor'
  | 'admin-seed'
  | 'role-management';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [pageHistory, setPageHistory] = useState<PageType[]>([]);
  const canGoBack = pageHistory.length > 0;

  const handlePageChange = (newPage: PageType) => {
    if (newPage !== currentPage) {
      setPageHistory([...pageHistory, currentPage]);
      setCurrentPage(newPage);
    }
  };

  const handleGoBack = () => {
    if (canGoBack) {
      const previousPage = pageHistory[pageHistory.length - 1];
      setPageHistory(pageHistory.slice(0, -1));
      setCurrentPage(previousPage);
    }
  };

  const handleHomeClick = () => {
    setCurrentPage('dashboard');
    setPageHistory([]);
  };

  // Record login on mount
  useEffect(() => {
    if (currentUser) {
      recordLogin(currentUser.id);
    }
  }, [currentUser?.id]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'events':
        return <EventsPage />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'directory':
        return <DirectoryPage />;
      case 'resources':
        return <ResourceLibraryPage />;
      case 'forum':
        return <ForumPage />;
      case 'finance':
        return <FinancePage />;
      case 'documents':
        return <DocumentArchivePage />;
      case 'verification':
        return <MemberVerificationPage />;
      case 'analytics':
        return <ActivityAnalyticsPage />;
      case 'admin-profiles':
        return <AdminProfilesPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'chat-requests':
        return <ChatRequestsPage />;
      case 'chat-management':
        return <ChatRequestManagementPage />;
      case 'event-predictor':
        // Only render predictor for admin or super-admin. Otherwise show access card.
        if (!currentUser || !(currentUser.role === 'admin' || currentUser.role === 'super-admin')) {
          return (
            <div className="max-w-4xl mx-auto p-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-2">Access restricted</h2>
                <p className="text-sm text-slate-600">This page is available to administrators only. Contact a site administrator if you believe this is an error.</p>
              </div>
            </div>
          );
        }

        return <EventPredictorPage />;
      case 'admin-seed':
        return <AdminSeedDataPage />;
      case 'role-management':
        return <RoleManagementPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onProfileClick={() => handlePageChange('profile')} onBackClick={handleGoBack} onHomeClick={handleHomeClick} canGoBack={canGoBack} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}