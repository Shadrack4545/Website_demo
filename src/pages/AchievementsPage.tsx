/**
 * AchievementsPage - Display Community & Individual Achievements
 * 
 * Showcases the organization's milestones and individual member accomplishments
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useContext';
import { Achievement } from '../types';
import { getData, setData } from '../utils/storage';
import { createId } from '../utils/ids';

export default function AchievementsPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const isLeader = currentUser?.role === 'leader' || currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  const [achievements, setAchievements] = useState<Achievement[]>(
    getData<Achievement[]>('ACHIEVEMENTS', []) ?? []
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'community' | 'individual'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🏆',
    type: 'community' as 'community' | 'individual' | 'milestone' | 'special',
    badgeColor: '#3B82F6',
    impact: '',
    recipientName: '',
  });

  const saveAchievements = (next: Achievement[]) => {
    setAchievements(next);
    setData('ACHIEVEMENTS', next);
  };

  const filtered = useMemo(() => {
    return achievements
      .filter((ach) => {
        if (filterType === 'all') return true;
        if (filterType === 'community') return ach.communityAchievement || ach.type === 'community';
        return ach.type !== 'community';
      })
      .sort((a, b) => b.date - a.date);
  }, [achievements, filterType]);

  const handleCreateAchievement = () => {
    if (!currentUser || !formData.title || !formData.description) return;

    const newAchievement: Achievement = {
      id: createId('achievement'),
      title: formData.title,
      description: formData.description,
      icon: formData.icon,
      type: formData.type,
      badgeColor: formData.badgeColor,
      communityAchievement: formData.type === 'community',
      impact: formData.impact || undefined,
      recipientId: formData.type === 'individual' ? currentUser.id : undefined,
      recipientName: formData.recipientName || undefined,
      date: Date.now(),
      createdBy: currentUser.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveAchievements([newAchievement, ...achievements]);
    setFormData({
      title: '',
      description: '',
      icon: '🏆',
      type: 'community',
      badgeColor: '#3B82F6',
      impact: '',
      recipientName: '',
    });
    setShowCreateForm(false);
  };

  const deleteAchievement = (id: string) => {
    saveAchievements(achievements.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{t('achievements.title')}</h2>
        <p className="text-gray-600 mt-2">{t('achievements.subtitle')}</p>
      </div>

      {/* Create Achievement Form */}
      {isLeader && (
        <>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            {t('achievements.addAchievement')}
          </button>

          {showCreateForm && (
            <div className="card space-y-4">
              <h3 className="text-lg font-semibold">{t('achievements.addNewAchievement')}</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('achievements.achievementTitle')}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Reached 250 Members"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('achievements.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this achievement..."
                  rows={3}
                  className="input-field"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('achievements.icon')}</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value.slice(0, 2) }))}
                    maxLength={2}
                    placeholder="🏆"
                    className="input-field text-2xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('achievements.type')}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as any }))}
                    className="input-field"
                  >
                    <option value="community">{t('achievements.community')}</option>
                    <option value="individual">{t('achievements.individual')}</option>
                    <option value="milestone">{t('achievements.milestone')}</option>
                    <option value="special">{t('achievements.special')}</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('achievements.badgeColor')}</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.badgeColor}
                      onChange={(e) => setFormData((prev) => ({ ...prev, badgeColor: e.target.value }))}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.badgeColor}
                      onChange={(e) => setFormData((prev) => ({ ...prev, badgeColor: e.target.value }))}
                      className="input-field flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('achievements.impact')}</label>
                  <input
                    type="text"
                    value={formData.impact}
                    onChange={(e) => setFormData((prev) => ({ ...prev, impact: e.target.value }))}
                    placeholder="e.g., 5 events organized"
                    className="input-field"
                  />
                </div>
              </div>

              {formData.type === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('achievements.recipientName')}</label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, recipientName: e.target.value }))}
                    placeholder="Member name"
                    className="input-field"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleCreateAchievement}
                  disabled={!formData.title || !formData.description}
                  className="btn-primary flex-1"
                >
                  {t('achievements.create')}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary flex-1"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'community', 'individual'] as const).map((type) => {
          const filterLabelKey = {
            all: 'achievements.filterAll',
            community: 'achievements.filterCommunity',
            individual: 'achievements.filterIndividual',
          }[type] as any;
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t(filterLabelKey)}
            </button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <p className="text-gray-600">{t('achievements.noAchievements')}</p>
          </div>
        ) : (
          filtered.map((achievement) => (
            <div
              key={achievement.id}
              className="card hover:shadow-lg transition-shadow group"
              style={{ borderTopColor: achievement.badgeColor, borderTopWidth: '4px' }}
            >
              {/* Header with Icon and Type */}
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{achievement.icon}</div>
                <div className="flex gap-1">
                  <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700 capitalize">
                    {achievement.type}
                  </span>
                  {isLeader && (
                    <button
                      onClick={() => deleteAchievement(achievement.id)}
                      className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Title and Description */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">{achievement.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>

              {/* Impact or Recipient */}
              <div className="space-y-2">
                {achievement.impact && (
                  <div className="text-xs font-medium text-gray-700">
                    📊 {achievement.impact}
                  </div>
                )}
                {achievement.recipientName && (
                  <div className="text-xs font-medium text-gray-700">
                    👤 {achievement.recipientName}
                  </div>
                )}
              </div>

              {/* Date */}
              <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                {new Date(achievement.date).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary-600">{achievements.length}</p>
          <p className="text-sm text-gray-600 mt-1">{t('achievements.totalAchievements')}</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">
            {achievements.filter((a) => a.communityAchievement || a.type === 'community').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">{t('achievements.communityMilestones')}</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">
            {achievements.filter((a) => a.type !== 'community').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">{t('achievements.memberRecognitions')}</p>
        </div>
      </div>
    </div>
  );
}
