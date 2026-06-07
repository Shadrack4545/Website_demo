import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useContext';
import { getData, setData, STORAGE_KEYS } from '../utils/storage';
import { createId } from '../utils/ids';

type ResourceCategory = 'visa' | 'housing' | 'jobs' | 'food' | 'admin';

interface ResourceItem {
  id: string;
  title: string;
  category: ResourceCategory;
  content: string;
  createdAt: number;
}

export default function ResourceLibraryPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [resources, setResources] = useState<ResourceItem[]>(
    getData<ResourceItem[]>(STORAGE_KEYS.RESOURCES, []) ?? []
  );
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | ResourceCategory>('all');
  const [form, setForm] = useState({ title: '', content: '', category: 'admin' as ResourceCategory });
  const canManageResources = currentUser?.role === 'leader' || currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  const filtered = useMemo(
    () =>
      resources
        .filter((item) => category === 'all' || item.category === category)
        .filter((item) => {
          const query = search.toLowerCase();
          return item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query);
        })
        .sort((a, b) => b.createdAt - a.createdAt),
    [resources, category, search]
  );

  const save = (next: ResourceItem[]) => {
    setResources(next);
    setData(STORAGE_KEYS.RESOURCES, next);
  };

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">{t('resources.title')}</h2>

      {canManageResources ? (
        <form
          className="card space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.title || !form.content) return;
            save([
              {
                id: createId('resource'),
                title: form.title,
                content: form.content,
                category: form.category,
                createdAt: Date.now(),
              },
              ...resources,
            ]);
            setForm({ title: '', content: '', category: 'admin' });
          }}
        >
          <h3 className="text-lg font-semibold">{t('announcements.createAnnouncement')}</h3>
          <input
            className="input-field"
            placeholder={t('resources.resourceTitle')}
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <select
            className="input-field"
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as ResourceCategory }))}
          >
            <option value="visa">{t('resources.categories.visa')}</option>
            <option value="housing">{t('resources.categories.housing')}</option>
            <option value="jobs">{t('resources.categories.jobs')}</option>
            <option value="food">{t('resources.categories.food')}</option>
            <option value="admin">{t('resources.categories.admin')}</option>
          </select>
          <textarea
            className="input-field"
            rows={3}
            placeholder={t('resources.guidanceDetails')}
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
          />
          <button className="btn-primary" type="submit">
            {t('common.save')}
          </button>
        </form>
      ) : (
        <div className="card text-sm text-gray-600">
          {t('resources.onlyLeadersAdmins')}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="input-field"
          placeholder={t('resources.searchResources')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="input-field" value={category} onChange={(event) => setCategory(event.target.value as 'all' | ResourceCategory)}>
          <option value="all">{t('resources.allCategories')}</option>
          <option value="visa">{t('resources.categories.visa')}</option>
          <option value="housing">{t('resources.categories.housing')}</option>
          <option value="jobs">{t('resources.categories.jobs')}</option>
          <option value="food">{t('resources.categories.food')}</option>
          <option value="admin">{t('resources.categories.admin')}</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card text-sm text-gray-600">{t('resources.noResources')}</div>
        ) : (
          filtered.map((item) => (
            <article key={item.id} className="card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="badge-primary">{item.category}</span>
              </div>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{item.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
