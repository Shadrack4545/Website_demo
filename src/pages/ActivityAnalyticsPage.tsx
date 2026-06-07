/**
 * ActivityAnalyticsPage - Admin Dashboard for Member Activity
 * 
 * Displays member engagement metrics, visit frequency, and activity trends
 * Available only to admins and leaders
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, useDirectory } from '../hooks/useContext';
import {
  getActivityStatistics,
  getTopActiveMembers,
  getInactiveMembers,
  getMembersByLastLogin,
  getAllActivitySummaries,
} from '../utils/activity';

export default function ActivityAnalyticsPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { members } = useDirectory();

  const isLeader = currentUser?.role === 'leader' || currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  const statistics = useMemo(() => getActivityStatistics(), []);
  const topActive = useMemo(() => getTopActiveMembers(10), []);
  const inactiveMembers = useMemo(() => getInactiveMembers(30), []);
  const thisMonthActive = useMemo(() => getMembersByLastLogin(30), []);
  const allActivities = useMemo(() => getAllActivitySummaries(), []);

  // Map activity IDs to member details
  const getMemberName = (userId: string): string => {
    const member = members.find((m) => m.userId === userId);
    return member?.name || userId;
  };

  if (!isLeader) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-600">{t('analytics.accessDenied')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{t('analytics.title')}</h2>
        <p className="text-gray-600 mt-2">{t('analytics.subtitle')}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">{t('analytics.totalMembers')}</p>
          <p className="text-3xl font-bold text-primary-600 mt-2">{statistics.totalMembers}</p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-600">{t('analytics.activeThisMonth')}</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{statistics.activeThisMonth}</p>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.totalMembers > 0
              ? ((statistics.activeThisMonth / statistics.totalMembers) * 100).toFixed(1)
              : 0}
            % {t('analytics.engagement')}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-600">{t('analytics.totalActivities')}</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{statistics.totalActivities}</p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-600">{t('analytics.avgPerMember')}</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {statistics.avgActivitiesPerMember.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{t('analytics.activityBreakdown')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(statistics.activitiesByType).map(([type, count]) => (
            <div key={type} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Active Members */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{t('analytics.topActiveMembers')}</h3>
        {topActive.length === 0 ? (
          <p className="text-sm text-gray-600">{t('analytics.noActivityData')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 font-medium text-gray-700">{t('analytics.member')}</th>
                  <th className="text-right py-2 font-medium text-gray-700">{t('analytics.totalActivitiesHeader')}</th>
                  <th className="text-right py-2 font-medium text-gray-700">{t('analytics.lastActive')}</th>
                  <th className="text-right py-2 font-medium text-gray-700">{t('analytics.logins')}</th>
                </tr>
              </thead>
              <tbody>
                {topActive.map((activity, idx) => (
                  <tr key={activity.userId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <span className="font-medium text-gray-900">
                        #{idx + 1} - {getMemberName(activity.userId)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="font-medium text-blue-600">{activity.totalActivities}</span>
                    </td>
                    <td className="text-right text-gray-600">
                      {new Date(activity.lastActivity).toLocaleDateString()}
                    </td>
                    <td className="text-right text-gray-600">{activity.totalLogins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active This Month */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">{t('analytics.activeThisMonthList')} ({thisMonthActive.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {thisMonthActive.slice(0, 10).map((activity) => (
              <div key={activity.userId} className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm font-medium text-gray-900">{getMemberName(activity.userId)}</span>
                <span className="text-xs text-green-600">{activity.totalActivities} {t('analytics.activities')}</span>
              </div>
            ))}
            {thisMonthActive.length > 10 && (
              <p className="text-xs text-gray-500 py-2">
                +{thisMonthActive.length - 10} {t('analytics.moreMembers')}
              </p>
            )}
          </div>
        </div>

        {/* Inactive Members */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">{t('analytics.inactiveMembers')} ({inactiveMembers.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {inactiveMembers.slice(0, 10).map((activity) => (
              <div key={activity.userId} className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-sm font-medium text-gray-900">{getMemberName(activity.userId)}</span>
                <span className="text-xs text-red-600">
                  {Math.floor((Date.now() - activity.lastActivity) / (24 * 60 * 60 * 1000))} {t('analytics.daysAgo')}
                </span>
              </div>
            ))}
            {inactiveMembers.length > 10 && (
              <p className="text-xs text-gray-500 py-2">
                +{inactiveMembers.length - 10} {t('analytics.moreInactive')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* All Members Activity Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{t('analytics.allMembersOverview')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-2 font-medium text-gray-700">{t('analytics.member')}</th>
                <th className="text-right py-2 font-medium text-gray-700">{t('analytics.activities')}</th>
                <th className="text-right py-2 font-medium text-gray-700">{t('analytics.logins')}</th>
                <th className="text-right py-2 font-medium text-gray-700">{t('analytics.lastActive')}</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(allActivities)
                .sort((a, b) => b.lastActivity - a.lastActivity)
                .slice(0, 20)
                .map((activity) => (
                  <tr key={activity.userId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-gray-900">{getMemberName(activity.userId)}</td>
                    <td className="text-right">{activity.totalActivities}</td>
                    <td className="text-right">{activity.totalLogins}</td>
                    <td className="text-right text-gray-600">
                      {new Date(activity.lastActivity).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
