/**
 * ProfilePage - User Profile Management
 * 
 * Allows users to view and edit their profile including picture, bio, and other details
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useContext';
import { generateAvatarFromInitials } from '../utils/image';
import ProfilePictureUpload from '../components/shared/ProfilePictureUpload';
import { setData, STORAGE_KEYS } from '../utils/storage';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    country: currentUser?.country || '',
    program: currentUser?.program || '',
    bio: currentUser?.bio || '',
    avatar: currentUser?.avatar || '',
  });

  if (!currentUser) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  const defaultAvatar = generateAvatarFromInitials(formData.name);
  const displayAvatar = formData.avatar || currentUser.avatar || defaultAvatar;

  const handleSaveProfile = () => {
    // Update current user in storage
    const updatedUser = {
      ...currentUser,
      ...formData,
      updatedAt: Date.now(),
    };

    setData(STORAGE_KEYS.CURRENT_USER, updatedUser);

    // Also update in users list
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]') || [];
    const updatedUsers = users.map((user: any) =>
      user.id === currentUser.id ? updatedUser : user
    );
    setData(STORAGE_KEYS.USERS, updatedUsers);

    // Mark that user was updated so AuthContext refreshes
    setIsEditing(false);
    // Dispatch a custom event to notify AuthContext to refresh
    window.dispatchEvent(new Event('authUserUpdated'));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{t('common.profile')}</h2>
        <p className="text-gray-600 mt-2">{t('common.profileDescription')}</p>
      </div>

      {/* Profile Card */}
      <div className="card space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          {isEditing ? (
            <ProfilePictureUpload
              currentImage={formData.avatar || currentUser.avatar}
              userName={formData.name}
              onImageChange={(base64) => setFormData((prev) => ({ ...prev, avatar: base64 }))}
            />
          ) : (
            <>
              <img
                src={displayAvatar}
                alt={formData.name}
                className="w-40 h-40 rounded-full object-cover border-4 border-gray-200 mb-4"
              />
            </>
          )}
        </div>

        {/* Profile Info Section */}
        {isEditing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveProfile();
            }}
            className="space-y-4"
          >
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.name')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="input-field"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="input-field bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.country')}
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                className="input-field"
              />
            </div>

            {/* Program */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.program')}
              </label>
              <input
                type="text"
                value={formData.program}
                onChange={(e) => setFormData((prev) => ({ ...prev, program: e.target.value }))}
                className="input-field"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                rows={4}
                placeholder="Tell the community about yourself..."
                className="input-field"
              />
            </div>

            {/* Role (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.register')}
              </label>
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 capitalize font-medium">
                {currentUser.role}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn-primary flex-1">
                {t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: currentUser.name,
                    country: currentUser.country,
                    program: currentUser.program,
                    bio: currentUser.bio || '',
                    avatar: currentUser.avatar || '',
                  });
                }}
                className="btn-secondary flex-1"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Display Mode */}
            <div className="space-y-3 border-t border-gray-200 pt-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                  {t('auth.name')}
                </p>
                <p className="text-lg font-medium text-gray-900">{formData.name}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                  {t('auth.email')}
                </p>
                <p className="text-gray-700">{currentUser.email}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                    {t('auth.country')}
                  </p>
                  <p className="text-gray-700">{formData.country}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                    {t('auth.program')}
                  </p>
                  <p className="text-gray-700">{formData.program}</p>
                </div>
              </div>

              {formData.bio && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                    Bio
                  </p>
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.bio}</p>
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                  Role
                </p>
                <p className="text-gray-700 capitalize font-medium">{currentUser.role}</p>
              </div>

              <div className="text-xs text-gray-500">
                <p>Created: {new Date(currentUser.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(currentUser.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary w-full mt-4"
            >
              {t('common.edit')} {t('common.profile')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
