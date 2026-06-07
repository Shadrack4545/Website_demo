import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useContext';
import { getData, setData, STORAGE_KEYS } from '../utils/storage';
import { createId } from '../utils/ids';
import { downloadTextFile, toCsv } from '../utils/export';
import { formatRUB } from '../utils/currency';

type EntryType = 'membership_fee' | 'donation' | 'expense' | 'sponsorship';

interface FinanceEntry {
  id: string;
  type: EntryType;
  description: string;
  amount: number;
  memberName?: string;
  createdAt: number;
}

export default function FinancePage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState<FinanceEntry[]>(
    getData<FinanceEntry[]>(STORAGE_KEYS.FINANCE_ENTRIES, []) ?? []
  );
  const [form, setForm] = useState({ type: 'membership_fee' as EntryType, description: '', amount: 0, memberName: '' });
  const isLeader = currentUser?.role === 'leader' || currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  const save = (next: FinanceEntry[]) => {
    setEntries(next);
    setData(STORAGE_KEYS.FINANCE_ENTRIES, next);
  };

  const totals = useMemo(() => {
    const income = entries
      .filter((entry) => entry.type === 'membership_fee' || entry.type === 'donation' || entry.type === 'sponsorship')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const expense = entries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
    return { income, expense, balance: income - expense };
  }, [entries]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">{t('navigation.finance')}</h2>
        {isLeader && (
          <button
            className="btn-secondary"
            onClick={() => {
              const csv = toCsv(
                entries.map((entry) => ({
                  date: new Date(entry.createdAt).toISOString(),
                  type: entry.type,
                  description: entry.description,
                  amount: entry.amount,
                  memberName: entry.memberName ?? '',
                }))
              );
              downloadTextFile(`finance-report-${Date.now()}.csv`, csv, 'text/csv');
            }}
          >
            {t('finance.exportCSV')}
          </button>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card"><p className="text-sm text-gray-600">{t('finance.income')}</p><p className="text-2xl font-semibold text-green-700">{formatRUB(totals.income)}</p></div>
        <div className="card"><p className="text-sm text-gray-600">{t('finance.expenses')}</p><p className="text-2xl font-semibold text-red-700">{formatRUB(totals.expense)}</p></div>
        <div className="card"><p className="text-sm text-gray-600">{t('finance.balance')}</p><p className="text-2xl font-semibold text-primary-700">{formatRUB(totals.balance)}</p></div>
      </div>

      {isLeader ? (
        <form
          className="card grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.description || form.amount <= 0) return;
            save([
              {
                id: createId('finance'),
                type: form.type,
                description: form.description,
                amount: form.amount,
                memberName: form.memberName || undefined,
                createdAt: Date.now(),
              },
              ...entries,
            ]);
            setForm({ type: 'membership_fee', description: '', amount: 0, memberName: '' });
          }}
        >
          <select className="input-field" value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as EntryType }))}>
            <option value="membership_fee">{t('finance.membershipFee')}</option>
            <option value="donation">{t('finance.donation')}</option>
            <option value="sponsorship">{t('finance.sponsorship')}</option>
            <option value="expense">{t('finance.expense')}</option>
          </select>
          <input className="input-field" placeholder={t('finance.description')} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          <input className="input-field" type="number" min={0} step="0.01" placeholder={t('finance.amount')} value={form.amount || ''} onChange={(event) => setForm((prev) => ({ ...prev, amount: Number(event.target.value) }))} />
          <input className="input-field" placeholder={t('finance.memberName')} value={form.memberName} onChange={(event) => setForm((prev) => ({ ...prev, memberName: event.target.value }))} />
          <button className="btn-primary md:col-span-2" type="submit">{t('finance.addEntry')}</button>
        </form>
      ) : (
        <div className="card text-sm text-gray-600">{t('finance.restrictedToLeaders')}</div>
      )}

      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="card flex items-start justify-between">
            <div>
              <p className="font-medium">{entry.description}</p>
              <p className="text-xs text-gray-500 capitalize">{entry.type.replace('_', ' ')} {entry.memberName ? `· ${entry.memberName}` : ''}</p>
            </div>
            <p className={`font-semibold ${entry.type === 'expense' ? 'text-red-700' : 'text-green-700'}`}>
              {entry.type === 'expense' ? '-' : '+'}
              {formatRUB(entry.amount)}
            </p>
          </div>
        ))}
        {entries.length === 0 && <div className="card text-sm text-gray-600">{t('finance.noFinanceRecords')}</div>}
      </div>
    </section>
  );
}
