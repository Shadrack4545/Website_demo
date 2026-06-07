/**
 * DashboardPage - Main dashboard with metrics
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, useEvents } from '../hooks/useContext';
import { useDirectory } from '../hooks/useContext';
import type { Announcement, UserRole } from '../types';
import { getData, setData, STORAGE_KEYS } from '../utils/storage';
import { downloadTextFile } from '../utils/export';
import { createId } from '../utils/ids';

interface RoleRequest {
  id: string;
  userId: string;
  userName: string;
  requestedRole: Exclude<UserRole, 'admin'>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { events } = useEvents();
  const { members } = useDirectory();
  const announcements = getData<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []) ?? [];
  const resources = getData<unknown[]>(STORAGE_KEYS.RESOURCES, []) ?? [];
  const questions = getData<unknown[]>(STORAGE_KEYS.QUESTIONS, []) ?? [];
  const finance = getData<{ amount: number; type: string }[]>(STORAGE_KEYS.FINANCE_ENTRIES, []) ?? [];
  const roleRequests = getData<RoleRequest[]>(STORAGE_KEYS.ROLE_REQUESTS, []) ?? [];
  const [roleRequestState, setRoleRequestState] = useState<RoleRequest[]>(roleRequests);
  const [requestMessage, setRequestMessage] = useState('');
  const isLeader = currentUser?.role === 'leader' || currentUser?.role === 'admin' || currentUser?.role === 'super-admin';
  const myPendingRoleRequest = useMemo(
    () =>
      roleRequestState.find(
    (request) => request.userId === currentUser?.id && request.status === 'pending'
      ),
    [roleRequestState, currentUser?.id]
  );

  const upcomingEvents = events.filter((e) => e.status === 'upcoming').length;
  const completedEvents = events.filter((e) => e.status === 'completed').length;
  const activeMembers = members.filter((m) => m.membershipStatus === 'active').length;
  const attendanceRate = completedEvents
    ? Math.round(
        (events
          .filter((event) => event.status === 'completed')
          .reduce((sum, event) => sum + (event.attendees.length / Math.max(1, event.capacity)) * 100, 0) /
          completedEvents)
      )
    : 0;

  const stats = [
    { label: t('dashboard.totalMembers'), value: activeMembers, icon: '👥', color: 'bg-blue-100 text-blue-600' },
    { label: t('dashboard.upcomingEvents'), value: upcomingEvents, icon: '📅', color: 'bg-purple-100 text-purple-600' },
    { label: t('events.past'), value: completedEvents, icon: '✅', color: 'bg-green-100 text-green-600' },
    { label: t('dashboard.attendanceRate'), value: `${attendanceRate}%`, icon: '📈', color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h2>
        {isLeader && (
          <button
            className="btn-secondary"
            onClick={() => {
              const report = {
                generatedAt: new Date().toISOString(),
                generatedBy: currentUser?.name ?? 'unknown',
                totals: {
                  members: members.length,
                  activeMembers: activeMembers,
                  events: events.length,
                  announcements: announcements.length,
                  resources: resources.length,
                  forumQuestions: questions.length,
                  financeEntries: finance.length,
                },
                financeSummary: {
                  income: finance
                    .filter((entry) => ['membership_fee', 'donation', 'sponsorship'].includes(entry.type))
                    .reduce((sum, entry) => sum + Number(entry.amount), 0),
                  expense: finance
                    .filter((entry) => entry.type === 'expense')
                    .reduce((sum, entry) => sum + Number(entry.amount), 0),
                },
                eventSummary: events.map((event) => ({
                  id: event.id,
                  title: event.title,
                  date: event.date,
                  status: event.status,
                  rsvpCount: Object.keys(event.rsvps).length,
                  attendanceCount: event.attendees.length,
                  noShowCount: event.noShows.length,
                })),
              };
              downloadTextFile(
                `leadership-handover-${Date.now()}.json`,
                JSON.stringify(report, null, 2),
                'application/json'
              );
            }}
          >
            {t('dashboard.exportHandoverReport')}
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="card">
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl mb-4`}>
              {stat.icon}
            </div>
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('events.upcoming')}</h3>
          {events.slice(0, 5).length === 0 ? (
            <p className="text-gray-600 text-sm">{t('events.noEvents')}</p>
          ) : (
            <ul className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <li key={event.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-600">{t('dashboard.eventDateAt', { date: event.date, time: event.time })}</p>
                  </div>
                    <span className="text-sm font-semibold text-primary-600">{t('dashboard.rsvps', { count: Object.keys(event.rsvps).length })}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.quickActions')}</h3>
          <div className="space-y-2">
            {currentUser && (
              <div className="mb-2 rounded bg-gray-50 p-2">
                <p className="text-xs text-gray-500">{t('dashboard.currentRole')}</p>
                  <p className="text-sm font-semibold text-primary-700">{t(`verification.role_${currentUser.role}`)}</p>
              </div>
            )}
            <p className="text-sm text-gray-600">{t('dashboard.totalAnnouncements')}: {announcements.length}</p>
            <p className="text-sm text-gray-600">{t('dashboard.verifiedMembers')}: {members.filter((m) => m.verificationStatus === 'verified').length}</p>
            <p className="text-sm text-gray-600">{t('dashboard.noShowsTracked')}: {events.reduce((sum, event) => sum + event.noShows.length, 0)}</p>
            {currentUser?.role === 'member' && (
              <div className="pt-2">
                {myPendingRoleRequest ? (
                    <p className="text-xs text-amber-700">{t('dashboard.roleRequestPending')}</p>
                ) : (
                  <button
                    className="btn-secondary w-full"
                    onClick={() => {
                      const next: RoleRequest[] = [
                        {
                          id: createId('roleRequest'),
                          userId: currentUser.id,
                          userName: currentUser.name,
                          requestedRole: 'leader',
                          status: 'pending',
                          createdAt: Date.now(),
                        },
                        ...roleRequestState,
                      ];
                      setData(STORAGE_KEYS.ROLE_REQUESTS, next);
                      setRoleRequestState(next);
                      setRequestMessage('dashboard.roleRequestSubmitted');
                    }}
                  >
                    {t('dashboard.requestLeaderRole')}
                  </button>
                )}
                {requestMessage && <p className="mt-2 text-xs text-green-700">{t(requestMessage)}</p>}
              </div>
            )}
            <div className="mt-2">
              <p className="mb-1 text-xs text-gray-500">{t('dashboard.attendanceTrend')}</p>
              <div className="h-3 w-full rounded-full bg-gray-100">
                <div className="h-3 rounded-full bg-primary-600" style={{ width: `${Math.min(100, attendanceRate)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}