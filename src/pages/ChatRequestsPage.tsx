import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useContext';
import { useChatRequests } from '../hooks/useContext';
import { useDirectory } from '../hooks/useContext';

export default function ChatRequestsPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { createChatRequest, chatRequests, getGroupChatsByMember } = useChatRequests();
  const { members } = useDirectory();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    memberIds: [] as string[],
  });

  const myGroupChats = getGroupChatsByMember(currentUser?.id || '');
  const myRequests = chatRequests.filter((r) => r.requestedBy === currentUser?.id);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberToggle = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter((id) => id !== memberId)
        : [...prev.memberIds, memberId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      alert(t('chat.fillAllFields'));
      return;
    }

    createChatRequest({
      name: formData.name,
      description: formData.description,
      requestedBy: currentUser?.id || '',
      requestedByName: currentUser?.name || '',
      members: formData.memberIds,
      status: 'pending',
    });

    setFormData({ name: '', description: '', memberIds: [] });
    setShowForm(false);
    alert(t('chat.requestSubmitted'));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">💬 {t('chat.title')}</h1>
          <p className="text-gray-600 mt-1">{t('chat.requestOrJoin')}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? t('chat.cancel') : t('chat.requestChat')}
        </button>
      </div>

      {/* Request Form */}
      {showForm && (
        <div className="card p-6 border-2 border-primary-200">
          <h2 className="text-xl font-bold mb-4">{t('chat.requestNewGroupChat')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Chat Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('chat.chatName')} {t('chat.required')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('chat.chatNamePlaceholder')}
                className="input-field w-full"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('chat.description')} {t('chat.required')}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('chat.descriptionPlaceholder')}
                rows={3}
                className="input-field w-full"
              />
            </div>

            {/* Member Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('chat.addSpecificMembers')}
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {members.map((member) => (
                  <label key={member.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.memberIds.includes(member.id)}
                      onChange={() => handleMemberToggle(member.id)}
                      className="rounded"
                    />
                    <span className="ml-3 text-sm">
                      {member.name} <span className="text-gray-500">({member.email})</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t('chat.leaveEmptyForAdmins')}
              </p>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-full">
              {t('chat.submitRequest')}
            </button>
          </form>
        </div>
      )}

      {/* My Requests */}
      <div>
        <h2 className="text-xl font-bold mb-4">{t('chat.myRequests')}</h2>
        {myRequests.length === 0 ? (
          <div className="card p-6 text-center text-gray-500">
            {t('chat.noRequests')}
          </div>
        ) : (
          <div className="grid gap-4">
            {myRequests.map((request) => (
              <div
                key={request.id}
                className={`card p-4 border-l-4 ${
                  request.status === 'approved'
                    ? 'border-green-500 bg-green-50'
                    : request.status === 'rejected'
                      ? 'border-red-500 bg-red-50'
                      : 'border-yellow-500 bg-yellow-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{request.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{request.description}</p>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.status === 'approved'
                            ? 'bg-green-200 text-green-800'
                            : request.status === 'rejected'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-yellow-200 text-yellow-800'
                        }`}
                      >
                        {request.status === 'pending' && `⏳ ${t('chat.pending')}`}
                        {request.status === 'approved' && `✓ ${t('chat.approved')}`}
                        {request.status === 'rejected' && `✕ ${t('chat.rejected')}`}
                      </span>

                      {request.approvedByName && (
                        <span className="text-xs text-gray-600">
                          {t('chat.by')} {request.approvedByName}
                        </span>
                      )}
                    </div>

                    {/* Rejection Reason */}
                    {request.rejectionReason && (
                      <p className="text-sm text-red-700 mt-2">
                        <strong>{t('chat.rejectionReasonLabel')}{t('chat.colon')}</strong> {request.rejectionReason}
                      </p>
                    )}

                    {/* Members Info */}
                    {request.members.length > 0 && (
                      <p className="text-xs text-gray-600 mt-2">
                        {request.members.length} {request.members.length !== 1 ? t('chat.membersInvited') : t('chat.memberInvited')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Chats */}
      <div>
        <h2 className="text-xl font-bold mb-4">{t('chat.myGroupChats')}</h2>
        {myGroupChats.length === 0 ? (
          <div className="card p-6 text-center text-gray-500">
            {t('chat.noGroupChats')}
          </div>
        ) : (
          <div className="grid gap-4">
            {myGroupChats.map((chat) => (
              <div key={chat.id} className="card p-4 bg-primary-50 border border-primary-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-primary-900">{chat.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{chat.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>{chat.members.length} {t('chat.members')}</span>
                      <span>
                        {t('chat.created')} {new Date(chat.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline">
                    {t('chat.openChat')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
