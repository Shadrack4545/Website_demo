import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useContext';
import { useChatRequests } from '../hooks/useContext';
import { useDirectory } from '../hooks/useContext';

export default function ChatRequestManagementPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { pendingRequests, approvedRequests, rejectChatRequest, approveChatRequest, groupChats } = useChatRequests();
  const { members } = useDirectory();

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'chats'>('pending');

  const handleApprove = (requestId: string) => {
    if (currentUser) {
      approveChatRequest(requestId, currentUser.id, currentUser.name);
    }
  };

  const handleReject = (requestId: string) => {
    if (!rejectionReason.trim()) {
      alert(t('chat.provideRejectionReason'));
      return;
    }
    rejectChatRequest(requestId, rejectionReason);
    setRejectingId(null);
    setRejectionReason('');
  };

  const getMemberNames = (memberIds: string[]) => {
    return memberIds
      .map((id) => {
        const member = members.find((m) => m.id === id);
        return member ? member.name : id;
      })
      .join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">💬 {t('chat.manageTitle')}</h1>
        <p className="text-gray-600 mt-1">{t('chat.manageSubtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          ⏳ {t('chat.pendingTab')} ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'approved'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          ✓ {t('chat.approvedTab')} ({approvedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('chats')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'chats'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          💬 {t('chat.activeChatsTab')} ({groupChats.length})
        </button>
      </div>

      {/* Pending Requests */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <p className="text-lg">✓ {t('chat.noPendingRequests')}</p>
              <p className="text-sm mt-2">{t('chat.allRequestsReviewed')}</p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <div key={request.id} className="card p-6 border-l-4 border-yellow-500">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Chat Name</p>
                    <h3 className="text-xl font-bold text-gray-900">{request.name}</h3>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">{t('chat.requestedBy')}</p>
                    <p className="text-lg font-semibold text-gray-900">{request.requestedByName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">{t('chat.submitted')}</p>
                    <p className="text-sm text-gray-700">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">{request.description}</p>
                </div>

                {/* Members */}
                {request.members.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-2">{t('chat.proposedMembers')}</p>
                    <p className="text-sm text-gray-600">{getMemberNames(request.members)}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
                  >
                    ✓ {t('chat.approve')}
                  </button>
                  <button
                    onClick={() => setRejectingId(request.id)}
                    className="btn btn-sm btn-outline"
                  >
                    ✕ {t('chat.reject')}
                  </button>
                </div>

                {/* Rejection Form */}
                {rejectingId === request.id && (
                  <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder={t('chat.rejectionReasonPlaceholder')}
                      className="input-field w-full text-sm"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleReject(request.id)}
                        className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                      >
                        {t('chat.sendRejection')}
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectionReason('');
                        }}
                        className="btn btn-sm btn-outline"
                      >
                        {t('chat.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Approved Requests */}
      {activeTab === 'approved' && (
        <div className="space-y-4">
          {approvedRequests.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <p className="text-lg">{t('chat.noApprovedRequests')}</p>
            </div>
          ) : (
            approvedRequests.map((request) => (
              <div key={request.id} className="card p-6 bg-green-50 border border-green-200">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Chat Name</p>
                    <h3 className="text-xl font-bold text-gray-900">{request.name}</h3>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Requested By</p>
                    <p className="text-lg font-semibold text-gray-900">{request.requestedByName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Approved By</p>
                    <p className="text-sm text-gray-700">{request.approvedByName}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">{request.description}</p>
                </div>

                {/* Members */}
                <div className="mb-4 p-3 bg-white rounded border border-green-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('chat.membersLabel')} ({request.members.length}):
                  </p>
                  <p className="text-sm text-gray-600">
                    {request.members.length > 0 ? getMemberNames(request.members) : t('chat.adminManaged')}
                  </p>
                </div>

                <div className="flex gap-2 text-xs text-gray-500">
                  <span>✓ {t('chat.approvedAt')} {new Date(request.approvedAt || 0).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Active Chats */}
      {activeTab === 'chats' && (
        <div className="space-y-4">
          {groupChats.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <p className="text-lg">{t('chat.noActiveChats')}</p>
              <p className="text-sm mt-2">{t('chat.approveRequestsToActivateChats')}</p>
            </div>
          ) : (
            groupChats.map((chat) => (
              <div key={chat.id} className="card p-6 bg-blue-50 border border-blue-200">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Chat Name</p>
                    <h3 className="text-xl font-bold text-gray-900">{chat.name}</h3>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">{t('chat.createdBy')}</p>
                    <p className="text-lg font-semibold text-gray-900">{chat.createdByName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">{t('chat.members')}</p>
                    <p className="text-lg font-semibold text-gray-900">👥 {chat.members.length}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">{chat.description}</p>
                </div>

                {/* Members List */}
                <div className="mb-4 p-3 bg-white rounded border border-blue-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('chat.currentMembers')}</p>
                  <div className="flex flex-wrap gap-2">
                    {chat.members.map((memberId) => {
                      const member = members.find((m) => m.id === memberId);
                      return (
                        <span key={memberId} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {member?.name || memberId}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 text-xs text-gray-500">
                  <span>{t('chat.created')} {new Date(chat.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
