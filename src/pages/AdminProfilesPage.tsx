/**
 * AdminProfilesPage - Display Administrative & Leadership Profiles
 * 
 * Showcase current administrators and leaders with their information
 * Only visible to members of the community
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDirectory } from '../hooks/useContext';
import { generateAvatarFromInitials } from '../utils/image';

export default function AdminProfilesPage() {
  const { t } = useTranslation();
  const { members } = useDirectory();

  const admins = useMemo(() => {
    return members.filter((m) => {
      // In a real app, this would check a role property
      // For now, we'll show members with special designation
      return m.verificationStatus === 'verified' && m.membershipStatus === 'active';
    }).slice(0, 10); // Show top 10 for demo
  }, [members]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{t('admin.title')}</h2>
        <p className="text-gray-600 mt-2">{t('admin.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((member) => {
          const avatar = generateAvatarFromInitials(member.name);
          
          return (
            <div key={member.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header Background */}
              <div className="h-24 bg-gradient-to-r from-primary-600 to-primary-500"></div>

              {/* Profile Section */}
              <div className="px-6 pb-6">
                {/* Avatar */}
                <div className="flex justify-center -mt-12 mb-4">
                  <img
                    src={avatar}
                    alt={member.name}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                </div>

                {/* Info */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-primary-600 font-medium capitalize">
                    {member.membershipStatus === 'active' ? t('common.statusActive') : member.membershipStatus}
                  </p>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600">{t('directory.country')}:</span>
                    <span className="font-medium text-gray-900">{member.country}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600">{t('directory.program')}:</span>
                    <span className="font-medium text-gray-900">{member.program}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600">{t('directory.status')}:</span>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {member.verificationStatus === 'verified' ? t('common.statusVerified') : member.verificationStatus}
                    </span>
                  </div>
                </div>

                {/* Fee Status */}
                {member.feePaid && (
                  <div className="mt-4 p-2 bg-blue-50 rounded text-center">
                    <p className="text-xs text-blue-600 font-medium">✓ {t('finance.membershipFee')}</p>
                  </div>
                )}

                {/* Join Date */}
                <p className="text-xs text-gray-500 mt-4 text-center">
                  {t('members.joinedAt')} {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {admins.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600">{t('admin.noLeadershipProfiles')}</p>
        </div>
      )}

      {/* Leadership Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary-600">{admins.length}</p>
          <p className="text-sm text-gray-600 mt-2">{t('admin.activeLeaders')}</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">
            {admins.filter((a) => a.feePaid).length}
          </p>
          <p className="text-sm text-gray-600 mt-2">{t('admin.feesPaid')}</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">
            {new Set(admins.map((a) => a.country)).size}
          </p>
          <p className="text-sm text-gray-600 mt-2">{t('admin.countriesRepresented')}</p>
        </div>
      </div>
    </div>
  );
}
