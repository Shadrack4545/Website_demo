/**
 * Sidebar Navigation Component
 * Mobile-responsive navigation sidebar
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useContext';
import type { PageType } from '../../pages/Dashboard';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { id: 'dashboard' as PageType, label: t('navigation.dashboard'), icon: '📊' },
    { id: 'events' as PageType, label: t('navigation.events'), icon: '📅' },
    { id: 'announcements' as PageType, label: t('navigation.announcements'), icon: '📢' },
    { id: 'directory' as PageType, label: t('navigation.directory'), icon: '👥' },
    { id: 'admin-profiles' as PageType, label: t('navigation.leadership'), icon: '⭐' },
    { id: 'achievements' as PageType, label: t('navigation.achievements'), icon: '🏆' },
    { id: 'chat-requests' as PageType, label: t('navigation.groupChats'), icon: '💬' },
    { id: 'resources' as PageType, label: t('navigation.resources'), icon: '📚' },
    { id: 'forum' as PageType, label: t('navigation.forum'), icon: '💭' },
    { id: 'finance' as PageType, label: t('navigation.finance'), icon: '💳' },
    { id: 'documents' as PageType, label: t('navigation.documents'), icon: '🗂️' },
    // Event predictor link — visible only to admins and super-admins
    ...(currentUser && (currentUser.role === 'admin' || currentUser.role === 'super-admin')
      ? [{ id: 'event-predictor' as PageType, label: t('navigation:predictions', { defaultValue: 'Predictions' }), icon: '🔮' }]
      : []),
    ...(currentUser?.role === 'admin' || currentUser?.role === 'leader'
      ? [
          { id: 'verification' as PageType, label: t('navigation.verification'), icon: '✅' },
          { id: 'analytics' as PageType, label: t('navigation.analytics'), icon: '📈' },
          { id: 'chat-management' as PageType, label: t('navigation.manageChats'), icon: '⚙️' },
          { id: 'admin-seed' as PageType, label: t('navigation:seedData', { defaultValue: 'Seed Data' }), icon: '🌱' },
        ]
      : []),
    ...(currentUser?.role === 'super-admin' ? [{ id: 'role-management' as PageType, label: t('navigation:roleManagement', { defaultValue: 'Leadership' }), icon: '🔐' }] : []),
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg lg:hidden bg-primary-600 text-white"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-30 w-64 bg-gradient-to-b from-primary-700 to-primary-800 text-white transition-transform duration-300 flex flex-col h-screen`}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-primary-600 flex items-center gap-3">
          <img 
            src={new URL('../../assets/icon.jpg', import.meta.url).href}
            alt="AASV Logo" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h1 className="text-lg font-bold">AASV</h1>
            <p className="text-xs text-primary-200">AFR</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-primary-600">
          <p className="text-sm text-primary-200">Welcome,</p>
          <p className="font-semibold truncate">{currentUser?.name}</p>
          <p className="text-xs text-primary-300">
            {currentUser?.role ? t(`verification.role_${currentUser.role}`) : ''}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                currentPage === item.id
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-200 hover:bg-primary-600 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Help/Info */}
        <div className="p-4 border-t border-primary-600 text-xs text-primary-200 bg-primary-700">
          <p>AASV - African Students</p>
          <p>© 2026 All rights reserved</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}