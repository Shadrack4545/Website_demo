import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useContext';
import { getData, setData, STORAGE_KEYS } from '../utils/storage';
import { createId } from '../utils/ids';

interface Question {
  id: string;
  title: string;
  body: string;
  tags: string[];
  authorName: string;
  answers: { id: string; body: string; authorName: string; createdAt: number }[];
  createdAt: number;
}

export default function ForumPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState<Question[]>(getData<Question[]>(STORAGE_KEYS.QUESTIONS, []) ?? []);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});

  const persist = (next: Question[]) => {
    setQuestions(next);
    setData(STORAGE_KEYS.QUESTIONS, next);
  };

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">{t('forum.title')}</h2>
      <form
        className="card space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!currentUser || !title || !body) return;
          const next: Question[] = [
            {
              id: createId('question'),
              title,
              body,
              tags: tagLine
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
              authorName: currentUser.name,
              answers: [],
              createdAt: Date.now(),
            },
            ...questions,
          ];
          persist(next);
          setTitle('');
          setBody('');
          setTagLine('');
        }}
      >
        <h3 className="text-lg font-semibold">{t('forum.askQuestion')}</h3>
        <input className="input-field" placeholder={t('forum.questionTitle')} value={title} onChange={(event) => setTitle(event.target.value)} />
        <textarea className="input-field" rows={3} placeholder={t('forum.questionDetails')} value={body} onChange={(event) => setBody(event.target.value)} />
        <input className="input-field" placeholder={t('forum.tags')} value={tagLine} onChange={(event) => setTagLine(event.target.value)} />
        <button className="btn-primary" type="submit">{t('forum.postQuestion')}</button>
      </form>

      <div className="space-y-4">
        {questions.map((question) => (
          <article key={question.id} className="card">
            <h3 className="font-semibold">{question.title}</h3>
            <p className="mt-1 text-sm text-gray-700">{question.body}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <span key={tag} className="badge-primary">{tag}</span>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">{t('forum.by')} {question.authorName}</p>

            <div className="mt-3 space-y-2">
              {question.answers.map((answer) => (
                <div key={answer.id} className="rounded bg-gray-50 p-2 text-sm">
                  {answer.body}
                  <p className="mt-1 text-xs text-gray-500">- {answer.authorName}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  className="input-field"
                  placeholder={t('forum.writeAnswer')}
                  value={answerDrafts[question.id] ?? ''}
                  onChange={(event) => setAnswerDrafts((prev) => ({ ...prev, [question.id]: event.target.value }))}
                />
                <button
                  className="btn-secondary"
                  onClick={() => {
                    if (!currentUser) return;
                    const answerText = answerDrafts[question.id]?.trim();
                    if (!answerText) return;
                    const next = questions.map((entry) =>
                      entry.id === question.id
                        ? {
                            ...entry,
                            answers: [
                              ...entry.answers,
                              { id: createId('answer'), body: answerText, authorName: currentUser.name, createdAt: Date.now() },
                            ],
                          }
                        : entry
                    );
                    persist(next);
                    setAnswerDrafts((prev) => ({ ...prev, [question.id]: '' }));
                  }}
                >
                  {t('forum.reply')}
                </button>
              </div>
            </div>
          </article>
        ))}
        {questions.length === 0 && <div className="card text-sm text-gray-600">{t('forum.noQuestions')}</div>}
      </div>
    </section>
  );
}
