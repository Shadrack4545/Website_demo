/**
 * MembersPage - View and manage members
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMembers } from '../hooks/useContext';
import { useAuth } from '../hooks/useContext';

export default function MembersPage() {
  const { t } = useTranslation();
  const { getAllMembers } = useMembers();
  const { currentUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const allMembers = getAllMembers();
  const filteredMembers = allMembers.filter((m) =>
    m.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLeader = currentUser?.role === 'leader' || currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{t('members.title')}</h2>
        {isLeader && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            {t('members.addMember')}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t('members.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Add Form (stub) */}
      {showAddForm && (
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('members.addMember')}</h3>
          <p className="text-gray-600">{t('members.addFormComingSoon')}</p>
        </div>
      )}

      {/* Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.length === 0 ? (
          <div className="card text-center py-8 col-span-full">
            <p className="text-gray-600">{t('members.noMembers')}</p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div key={member.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-full"></div>
                {member.feePaid && <span className="badge-success">✓ {t('members.paid')}</span>}
              </div>
              <p className="font-semibold text-gray-900">{member.userId}</p>
              <p className="text-sm text-gray-600">
                {t('members.joinDate')} {new Date(member.joinedAt).toLocaleDateString()}
              </p>
              <div className="mt-4 flex gap-2">
                <button className="btn-small bg-primary-100 text-primary-700 hover:bg-primary-200 text-xs flex-1">
                  {t('members.view')}
                </button>
                {isLeader && (
                  <button className="btn-small bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs flex-1">
                    {t('members.manage')}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}