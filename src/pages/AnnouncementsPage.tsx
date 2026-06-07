/**
 * AnnouncementsPage - View and manage announcements
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useContext';
import type { Announcement, AnnouncementCategory } from '../types';
import { getData, setData, STORAGE_KEYS } from '../utils/storage';
import { createId } from '../utils/ids';

export default function AnnouncementsPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const isLeader = currentUser?.role === 'leader' || currentUser?.role === 'admin' || currentUser?.role === 'super-admin';
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    getData<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []) ?? []
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | AnnouncementCategory>('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'admin' as AnnouncementCategory,
    isPinned: false,
  });

  const filtered = announcements
    .filter((announcement) => category === 'all' || announcement.category === category)
    .filter((announcement) => {
      const q = search.toLowerCase();
      return announcement.title.toLowerCase().includes(q) || announcement.content.toLowerCase().includes(q);
    })
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt - a.createdAt);

  const persistAnnouncements = (next: Announcement[]) => {
    setAnnouncements(next);
    setData(STORAGE_KEYS.ANNOUNCEMENTS, next);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{t('announcements.title')}</h2>
        {isLeader ? (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            {t('announcements.createAnnouncement')}
          </button>
        ) : (
          <span className="text-xs text-gray-500">{t('common.leaderAdminOnly')}</span>
        )}
      </div>

      {/* Create Form (stub) */}
      {showCreateForm && (
        <form
          className="card mb-8 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!currentUser || !formData.title || !formData.content) return;
            const next: Announcement[] = [
              {
                id: createId('announcement'),
                title: formData.title,
                content: formData.content,
                category: formData.category,
                isPinned: formData.isPinned,
                createdBy: currentUser.id,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
              ...announcements,
            ];
            persistAnnouncements(next);
            setFormData({ title: '', content: '', category: 'admin', isPinned: false });
            setShowCreateForm(false);
          }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('announcements.createAnnouncement')}</h3>
          <input
            className="input-field"
            placeholder={t('common.title')}
            value={formData.title}
            onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
          />
          <textarea
            className="input-field"
            rows={3}
            placeholder={t('common.content')}
            value={formData.content}
            onChange={(event) => setFormData((prev) => ({ ...prev, content: event.target.value }))}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <select
              className="input-field"
              value={formData.category}
              onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value as AnnouncementCategory }))}
            >
              <option value="events">{t('announcements.categories.events')}</option>
              <option value="admin">{t('announcements.categories.admin')}</option>
              <option value="resources">{t('announcements.categories.resources')}</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(event) => setFormData((prev) => ({ ...prev, isPinned: event.target.checked }))}
              />
              {t('announcements.pin')}
            </label>
          </div>
          <button className="btn-primary" type="submit">{t('announcements.createButton')}</button>
        </form>
      )}

      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <input className="input-field" placeholder={t('announcements.search')} value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="input-field" value={category} onChange={(event) => setCategory(event.target.value as 'all' | AnnouncementCategory)}>
          <option value="all">{t('announcements.allCategories')}</option>
          <option value="events">{t('announcements.categories.events')}</option>
          <option value="admin">{t('announcements.categories.admin')}</option>
          <option value="resources">{t('announcements.categories.resources')}</option>
        </select>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-600">{t('announcements.noAnnouncements')}</p>
          </div>
        ) : (
          filtered.map((announcement) => (
            <div key={announcement.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                  <p className="text-gray-600 text-sm mt-2">{announcement.content}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="badge-primary">{announcement.category}</span>
                    {announcement.isPinned && <span className="badge-warning">{t('announcements.pinned')}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="badge-primary text-xs">{new Date(announcement.createdAt).toLocaleDateString()}</span>
                  {isLeader && (
                    <button
                      className="text-xs text-primary-700"
                      onClick={() => {
                        const next = announcements.map((entry) =>
                          entry.id === announcement.id
                            ? { ...entry, isPinned: !entry.isPinned, updatedAt: Date.now() }
                            : entry
                        );
                        persistAnnouncements(next);
                      }}
                    >
                      {announcement.isPinned ? t('announcements.unpin') : t('announcements.pin')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}