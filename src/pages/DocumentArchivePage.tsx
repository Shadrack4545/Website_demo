import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useContext';
import { getData, setData, STORAGE_KEYS } from '../utils/storage';
import { createId } from '../utils/ids';
import { downloadTextFile } from '../utils/export';

type DocumentCategory = 'handover' | 'finance' | 'events' | 'policy' | 'resources';

interface ArchiveDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  content: string;
  createdBy: string;
  createdAt: number;
}

export default function DocumentArchivePage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<ArchiveDocument[]>(
    getData<ArchiveDocument[]>(STORAGE_KEYS.DOCUMENTS, []) ?? []
  );
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | DocumentCategory>('all');
  const [formData, setFormData] = useState({ title: '', category: 'handover' as DocumentCategory, content: '' });
  const isLeader = currentUser?.role === 'leader' || currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  const filtered = useMemo(
    () =>
      documents
        .filter((doc) => category === 'all' || doc.category === category)
        .filter((doc) => {
          const query = search.toLowerCase();
          return doc.title.toLowerCase().includes(query) || doc.content.toLowerCase().includes(query);
        })
        .sort((a, b) => b.createdAt - a.createdAt),
    [documents, category, search]
  );

  const persist = (next: ArchiveDocument[]) => {
    setDocuments(next);
    setData(STORAGE_KEYS.DOCUMENTS, next);
  };

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">{t('documents.title')}</h2>

      {isLeader ? (
        <form
          className="card space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!currentUser || !formData.title || !formData.content) return;
            const next: ArchiveDocument[] = [
              {
                id: createId('doc'),
                title: formData.title,
                category: formData.category,
                content: formData.content,
                createdBy: currentUser.name,
                createdAt: Date.now(),
              },
              ...documents,
            ];
            persist(next);
            setFormData({ title: '', category: 'handover', content: '' });
          }}
        >
          <h3 className="text-lg font-semibold">{t('documents.addDocument')}</h3>
          <input
            className="input-field"
            placeholder={t('documents.documentTitle')}
            value={formData.title}
            onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
          />
          <select
            className="input-field"
            value={formData.category}
            onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value as DocumentCategory }))}
          >
            <option value="handover">{t('documents.handover')}</option>
            <option value="finance">{t('documents.finance')}</option>
            <option value="events">{t('documents.events')}</option>
            <option value="policy">{t('documents.policy')}</option>
            <option value="resources">{t('documents.resources')}</option>
          </select>
          <textarea
            className="input-field"
            rows={4}
            placeholder={t('documents.documentContent')}
            value={formData.content}
            onChange={(event) => setFormData((prev) => ({ ...prev, content: event.target.value }))}
          />
          <button className="btn-primary" type="submit">{t('documents.saveDocument')}</button>
        </form>
      ) : (
        <div className="card text-sm text-gray-600">{t('documents.onlyLeaders')}</div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <input className="input-field" placeholder={t('documents.searchDocuments')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value as 'all' | DocumentCategory)}>
          <option value="all">{t('documents.allCategories')}</option>
          <option value="handover">{t('documents.handover')}</option>
          <option value="finance">{t('documents.finance')}</option>
          <option value="events">{t('documents.events')}</option>
          <option value="policy">{t('documents.policy')}</option>
          <option value="resources">{t('documents.resources')}</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card text-sm text-gray-600">{t('documents.noDocuments')}</div>
        ) : (
          filtered.map((doc) => (
            <article key={doc.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{doc.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {doc.category} {t('common.by')} {doc.createdBy} {t('common.by')} {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="btn-secondary text-xs"
                  onClick={() =>
                    downloadTextFile(
                      `${doc.title.replace(/\s+/g, '-').toLowerCase()}.txt`,
                      doc.content
                    )
                  }
                >
                  {t('documents.download')}
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{doc.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
