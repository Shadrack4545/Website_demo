import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, useDirectory } from '../hooks/useContext';
import type { User, UserRole } from '../types';
import { getData, setData, STORAGE_KEYS } from '../utils/storage';

interface RoleRequest {
  id: string;
  userId: string;
  userName: string;
  requestedRole: Exclude<UserRole, 'admin'>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
}

interface RemovedMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  reason: string;
  removedAt: number;
  removedBy: string;
}

export default function MemberVerificationPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { members, updateMember } = useDirectory();
  const isLeader = currentUser?.role === 'leader' || currentUser?.role === 'admin' || currentUser?.role === 'super-admin';
  const [users, setUsers] = useState<User[]>(getData<User[]>(STORAGE_KEYS.USERS, []) ?? []);
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>(
    getData<RoleRequest[]>(STORAGE_KEYS.ROLE_REQUESTS, []) ?? []
  );
  const [removedMembers, setRemovedMembers] = useState<RemovedMember[]>(
    getData<RemovedMember[]>('REMOVED_MEMBERS', []) ?? []
  );
  const [removalReason, setRemovalReason] = useState<Record<string, string>>({});
  const [showRemovalConfirm, setShowRemovalConfirm] = useState<string | null>(null);

  const updateRole = (userId: string, newRole: UserRole) => {
    if (!currentUser) return;
    const target = users.find((user) => user.id === userId);
    if (!target) return;

    // Only existing admins can assign admin role.
    if (newRole === 'admin' && currentUser.role !== 'admin') return;

    // Leaders cannot change admins.
    if (currentUser.role === 'leader' && target.role === 'admin') return;

    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, role: newRole, updatedAt: Date.now() } : user
    );
    setUsers(updatedUsers);
    setData(STORAGE_KEYS.USERS, updatedUsers);

    const updatedCurrentUser = updatedUsers.find((user) => user.id === currentUser.id);
    if (updatedCurrentUser) {
      setData(STORAGE_KEYS.CURRENT_USER, updatedCurrentUser);
    }
  };

  const removeMember = (memberId: string, userId: string, memberName: string, email: string, reason: string) => {
    if (!currentUser || !reason.trim()) return;

    // Add to removed members list
    const removed: RemovedMember = {
      id: memberId,
      userId,
      name: memberName,
      email,
      reason,
      removedAt: Date.now(),
      removedBy: currentUser.name,
    };

    const updatedRemoved = [...removedMembers, removed];
    setRemovedMembers(updatedRemoved);
    setData('REMOVED_MEMBERS', updatedRemoved);

    // Remove from users list
    const updatedUsers = users.filter((user) => user.id !== userId);
    setUsers(updatedUsers);
    setData(STORAGE_KEYS.USERS, updatedUsers);

    // Show success feedback
    setShowRemovalConfirm(null);
    setRemovalReason((prev) => ({ ...prev, [memberId]: '' }));
  };

  const pendingMembers = useMemo(
    () => members.filter((member) => member.verificationStatus === 'pending'),
    [members]
  );
  const reviewedMembers = useMemo(
    () => members.filter((member) => member.verificationStatus !== 'pending'),
    [members]
  );

  const roleByUserId = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user.role])) as Record<string, UserRole>,
    [users]
  );

  if (!isLeader) {
    return (
      <section className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">{t('verification.title')}</h2>
        <div className="card text-sm text-gray-600">{t('common.leaderAdminOnly')}</div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">{t('verification.title')}</h2>
      <div className="card text-sm text-gray-700">
        <p><strong>{t('verification.adminRules')}</strong></p>
        <p className="mt-1">
          {t('verification.bootstrapInfo')}
        </p>
      </div>

      <div className="card">
        <h3 className="mb-4 text-lg font-semibold">{t('verification.pendingMembers')}</h3>
        {pendingMembers.length === 0 ? (
          <p className="text-sm text-gray-600">{t('verification.noPendingMembers')}</p>
        ) : (
          <div className="space-y-3">
            {pendingMembers.map((member) => (
              <div key={member.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                    <p className="text-xs text-gray-500">{member.country} · {member.program}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn-small bg-green-100 text-green-700"
                      onClick={() => updateMember(member.id, { verificationStatus: 'verified' })}
                    >
                      {t('verification.approve')}
                    </button>
                    <button
                      className="btn-small bg-red-100 text-red-700"
                      onClick={() => updateMember(member.id, { verificationStatus: 'rejected' })}
                    >
                      {t('verification.reject')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="mb-4 text-lg font-semibold">{t('verification.reviewedMembers')}</h3>
        {reviewedMembers.length === 0 ? (
          <p className="text-sm text-gray-600">{t('verification.noPendingMembers')}</p>
        ) : (
          <div className="space-y-3">
            {reviewedMembers.map((member) => (
              <div key={member.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                  <span
                    className={`badge ${
                      member.verificationStatus === 'verified'
                        ? 'badge-success'
                        : member.verificationStatus === 'rejected'
                        ? 'badge-error'
                        : 'badge-warning'
                    }`}
                  >
                    {member.verificationStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="mb-4 text-lg font-semibold">{t('verification.roleManagement')}</h3>
        <div className="space-y-3">
          {members.map((member) => {
            const currentRole = roleByUserId[member.userId] ?? 'member';
            const roleOptions: UserRole[] =
              currentUser?.role === 'admin' ? ['member', 'leader', 'admin'] : ['member', 'leader'];
            const isProtectedAdmin = currentUser?.role === 'leader' && currentRole === 'admin';
            return (
              <div key={member.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="input-field min-w-[140px]"
                      value={currentRole}
                      disabled={isProtectedAdmin}
                      onChange={(event) => updateRole(member.userId, event.target.value as UserRole)}
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    {currentUser?.role === 'admin' && (
                      <button
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                        onClick={() => setShowRemovalConfirm(member.id)}
                        title="Remove member"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 text-lg font-semibold">{t('verification.removedMembersTitle')}</h3>
        {removedMembers.length === 0 ? (
          <p className="text-sm text-gray-600">{t('verification.noRemovedMembers')}</p>
        ) : (
          <div className="space-y-3">
            {removedMembers.map((member) => (
              <div key={member.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                  <p className="text-xs text-red-600 mt-1"><strong>{t('verification.reason')}</strong> {member.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('verification.removedByText')} {member.removedBy} {t('common.on')} {new Date(member.removedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Removal Confirmation Modal */}
      {showRemovalConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full space-y-4">
            <h3 className="text-lg font-semibold">{t('verification.removeMember')}</h3>
            <p className="text-sm text-gray-600">
              {t('verification.removeConfirmation')}
            </p>
            <textarea
              value={removalReason[showRemovalConfirm] || ''}
              onChange={(e) =>
                setRemovalReason((prev) => ({ ...prev, [showRemovalConfirm]: e.target.value }))
              }
              placeholder={t('verification.removalReasonPlaceholder')}
              rows={3}
              className="input-field"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const member = members.find((m) => m.id === showRemovalConfirm);
                  if (member && removalReason[showRemovalConfirm]) {
                    removeMember(
                      member.id,
                      member.userId,
                      member.name,
                      member.email,
                      removalReason[showRemovalConfirm]
                    );
                  }
                }}
                disabled={!removalReason[showRemovalConfirm]?.trim()}
                className="btn-primary flex-1"
              >
                {t('verification.removeMemberBtn')}
              </button>
              <button
                onClick={() => setShowRemovalConfirm(null)}
                className="btn-secondary flex-1"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
