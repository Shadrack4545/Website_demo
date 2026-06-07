import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, useDirectory, useNotifications } from '../hooks/useContext';
import { createId } from '../utils/ids';

export default function DirectoryPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { members, addMember } = useDirectory();
  const { addNotification } = useNotifications();

  const isLeader = currentUser?.role === 'leader' || currentUser?.role === 'admin' || currentUser?.role === 'super-admin';
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    program: '',
  });
  const [error, setError] = useState('');

  const countries = useMemo(() => ['all', ...new Set(members.map((member) => member.country))], [members]);
  const programs = useMemo(() => ['all', ...new Set(members.map((member) => member.program))], [members]);

  const filteredMembers = members.filter((member) => {
    const textMatch =
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase());
    const countryMatch = countryFilter === 'all' || member.country === countryFilter;
    const programMatch = programFilter === 'all' || member.program === programFilter;
    return textMatch && countryMatch && programMatch;
  });

  const selectedMember = members.find((member) => member.id === selectedMemberId);

  const handleAddMember = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.country || !formData.program) {
      setError(t('common.allFieldsRequired'));
      return;
    }
    if (!formData.email.includes('@')) {
      setError(t('common.validEmailRequired'));
      return;
    }

    const newMember = addMember({
      userId: createId('user'),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      country: formData.country.trim(),
      program: formData.program.trim(),
      feePaid: false,
      interests: [],
      verificationStatus: 'pending',
      membershipStatus: 'active',
    });

    addNotification({
      recipientId: 'all',
      recipientScope: 'all',
      recipientRole: 'leader',
      type: 'memberJoined',
      title: t('common.newMemberAdded'),
      message: `${newMember.name} ${t('common.joinedDirectory')}.`,
      relatedId: newMember.id,
      read: false,
    });

    setFormData({ name: '', email: '', country: '', program: '' });
    setShowAddForm(false);
    setSelectedMemberId(newMember.id);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold text-gray-900">{t('common.directory')}</h2>
        {isLeader && (
          <button onClick={() => setShowAddForm((prev) => !prev)} className="btn-primary">
            {showAddForm ? t('common.closeForm') : t('common.addMember')}
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input-field"
          placeholder={t('common.searchByNameOrEmail')}
        />
        <select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)} className="input-field">
          {countries.map((country) => (
            <option key={country} value={country}>
              {country === 'all' ? t('common.allCountries') : country}
            </option>
          ))}
        </select>
        <select value={programFilter} onChange={(event) => setProgramFilter(event.target.value)} className="input-field">
          {programs.map((program) => (
            <option key={program} value={program}>
              {program === 'all' ? t('common.allPrograms') : program}
            </option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddMember} className="card space-y-3">
          <h3 className="text-lg font-semibold">{t('common.addNewMember')}</h3>
          {error && <p className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="input-field"
              placeholder={t('common.fullName')}
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              className="input-field"
              placeholder={t('common.email')}
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
            />
            <input
              className="input-field"
              placeholder={t('common.country')}
              value={formData.country}
              onChange={(event) => setFormData((prev) => ({ ...prev, country: event.target.value }))}
            />
            <input
              className="input-field"
              placeholder={t('common.program')}
              value={formData.program}
              onChange={(event) => setFormData((prev) => ({ ...prev, program: event.target.value }))}
            />
          </div>
          <button className="btn-primary" type="submit">
            {t('common.saveMember')}
          </button>
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <article key={member.id} className="card">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>
              <span className="badge-primary capitalize">
                {member.verificationStatus === 'pending'
                  ? t('directory.pending')
                  : member.verificationStatus === 'verified'
                  ? t('directory.verified')
                  : member.verificationStatus === 'rejected'
                  ? t('directory.rejected')
                  : member.verificationStatus}
              </span>
            </div>
            <p className="text-sm text-gray-700">{member.country} . {member.program}</p>
            <div className="mt-4 flex justify-between text-xs text-gray-500">
              <span>{t('common.joined')} {new Date(member.joinedAt).toLocaleDateString()}</span>
              <button className="text-primary-700" onClick={() => setSelectedMemberId(member.id)}>
                {t('common.viewProfile')}
              </button>
            </div>
          </article>
        ))}
      </div>

      {selectedMember && (
        <div className="card">
          <h3 className="text-xl font-semibold">{t('common.memberProfile')}</h3>
          <p className="mt-2 text-sm text-gray-700"><strong>{t('common.name')}:</strong> {selectedMember.name}</p>
          <p className="text-sm text-gray-700"><strong>{t('common.email')}:</strong> {selectedMember.email}</p>
          <p className="text-sm text-gray-700"><strong>{t('common.country')}:</strong> {selectedMember.country}</p>
          <p className="text-sm text-gray-700"><strong>{t('common.program')}:</strong> {selectedMember.program}</p>
          <p className="text-sm text-gray-700"><strong>{t('common.status')}:</strong> {selectedMember.membershipStatus === 'active' ? t('directory.statusActive') : selectedMember.membershipStatus === 'inactive' ? t('directory.statusInactive') : selectedMember.membershipStatus}</p>
        </div>
      )}
    </section>
  );
}
