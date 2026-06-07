/**
 * App.tsx - Root Application Component
 * 
 * Sets up all providers and routing
 */

import { useAuth } from './hooks/useContext';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { NotificationProvider } from './context/NotificationContext';
import { DirectoryProvider } from './context/DirectoryContext';
import { AchievementProvider } from './context/AchievementContext';
import { ChatRequestProvider } from './context/ChatRequestContext';
import { RoleManagementProvider } from './context/RoleManagementContext';
import { ThemeProvider } from './context/ThemeContext';
import { useState, useEffect } from 'react';
import AuthPages from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import { setDefaultSEO, addStructuredData, generateStructuredData } from './utils/seo';
import { initializeMockData } from './utils/mockData';

function AppContent() {
  const { currentUser, isLoading } = useAuth();
  const [showAuthPage, setShowAuthPage] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 animate-spin">
            <div className="w-8 h-8 rounded-full border-4 border-primary-200 border-t-primary-600"></div>
          </div>
          <p className="mt-4 text-primary-600 dark:text-primary-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show dashboard
  if (currentUser) {
    return <Dashboard />;
  }

  // If auth page is requested, show login/signup
  if (showAuthPage) {
    return <AuthPages />;
  }

  // Otherwise show landing page
  return <LandingPage onLoginClick={() => setShowAuthPage(true)} />;
}

function App() {
  // Initialize SEO and mock data on app load
  useEffect(() => {
    setDefaultSEO();
    // Add structured data for organization
    addStructuredData(generateStructuredData('Organization'));
    // Initialize mock data for testing EventPredictor
    initializeMockData();
  }, []);

  return (
    <ThemeProvider>
      {/* Overlay used for theme crossfade (toggled by ThemeToggle) */}
      <div className="theme-fade-overlay" aria-hidden="true" />
      <AuthProvider>
        <EventProvider>
          <NotificationProvider>
            <DirectoryProvider>
              <AchievementProvider>
                <ChatRequestProvider>
                  <RoleManagementProvider>
                    <AppContent />
                  </RoleManagementProvider>
                </ChatRequestProvider>
              </AchievementProvider>
            </DirectoryProvider>
          </NotificationProvider>
        </EventProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;