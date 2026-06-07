/**
 * RoleManagementPage - Admin Panel for Leadership Management
 * 
 * SUPER-ADMIN ONLY PAGE
 * Allows super admin (you) to:
 * - Promote/demote members to admin
 * - Manage leadership terms (for annual elections)
 * - View audit logs of all role changes
 * - Track leadership history
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, useDirectory, useRoleManagement } from '../hooks/useContext';
import { getData, STORAGE_KEYS } from '../utils/storage';
import type { User } from '../types';

export default function RoleManagementPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { getAllMembers } = useDirectory();
  const { promoteToAdmin, demoteFromAdmin, getAuditLogs, leadershipTerms } =
    useRoleManagement();

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('Admin');
  const [roleChangeReason, setRoleChangeReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Get members from users list directly (more reliable than directory)
  const allUsers = useMemo(() => getData<User[]>(STORAGE_KEYS.USERS, []) ?? [], []);
  const positions = ['President', 'Vice President', 'Treasurer', 'Secretary', 'Event Coordinator', 'Admin'];

  // Check super admin access (only role 'super-admin' can access)
  if (!currentUser || currentUser.role !== 'super-admin') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-red-900 mb-2">🔐 Access Denied</h2>
        <p className="text-red-700">
          Only super administrators can access this page.
        </p>
      </div>
    );
  }

  const handlePromote = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return;

    try {
      promoteToAdmin(currentUser.id, user, selectedPosition, roleChangeReason);
      setMessage({ type: 'success', text: `✅ ${user.name} promoted to ${selectedPosition}` });
      setSelectedUserId('');
      setRoleChangeReason('');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const handleDemote = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return;

    try {
      demoteFromAdmin(currentUser.id, user, roleChangeReason);
      setMessage({ type: 'success', text: `✅ ${user.name} demoted to member` });
      setSelectedUserId('');
      setRoleChangeReason('');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const auditLogs = getAuditLogs(20);
  const admins = allUsers.filter((u) => u.role === 'admin' || u.role === 'leader');
  const members = allUsers.filter((u) => u.role === 'member');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">🔐 Leadership Management</h2>
        <p className="text-gray-600">Manage admin roles and leadership terms for annual elections</p>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-600 mb-2">{admins.length}</div>
          <p className="text-sm text-blue-700">Active Leaders</p>
          <p className="text-xs text-blue-600 mt-1">Including admins</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-purple-600 mb-2">{members.length}</div>
          <p className="text-sm text-purple-700">Members</p>
          <p className="text-xs text-purple-600 mt-1">Available for promotion</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-600 mb-2">{auditLogs.length}</div>
          <p className="text-sm text-green-700">Role Changes</p>
          <p className="text-xs text-green-600 mt-1">Audit log entries</p>
        </div>
      </div>

      {/* Role Change Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Promote Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Promote to Admin</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Member
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">-- Choose a member --</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={roleChangeReason}
                onChange={(e) => setRoleChangeReason(e.target.value)}
                placeholder="e.g., Elected as president 2026"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            <button
              onClick={() => handlePromote(selectedUserId)}
              disabled={!selectedUserId}
              className={`w-full py-2 rounded-lg font-medium transition ${
                selectedUserId
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              ✅ Promote to {selectedPosition}
            </button>
          </div>
        </div>

        {/* Current Admins Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">👑 Current Leaders</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {admins.length === 0 ? (
              <p className="text-gray-500 text-sm">No leaders yet</p>
            ) : (
              admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{admin.name}</p>
                    <p className="text-xs text-gray-600">{admin.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUserId(admin.id);
                      handleDemote(admin.id);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                    title="Remove admin role"
                  >
                    📉 Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">📋 Role Change History</h3>
          <button
            onClick={() => setShowAuditLog(!showAuditLog)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {showAuditLog ? 'Hide' : 'Show'}
          </button>
        </div>

        {showAuditLog && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900">User</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900">Action</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900">Old Role</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900">New Role</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900">Reason</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No role changes yet
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-700">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3">
                        <div>
                          <p className="font-medium text-gray-900">{log.targetUserName}</p>
                          <p className="text-xs text-gray-600">{log.targetUserEmail}</p>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            log.action === 'promote'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-700">{log.oldRole}</td>
                      <td className="py-2 px-3 text-gray-700">{log.newRole}</td>
                      <td className="py-2 px-3 text-gray-700">{log.reason || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">📝 How to Use</h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li>1. Select a member from the "Promote to Admin" dropdown</li>
          <li>2. Choose their position (President, Treasurer, etc.)</li>
          <li>3. Add optional reason (e.g., "Elected in annual elections")</li>
          <li>4. Click "Promote" button</li>
          <li>5. To remove admin role, click "Remove" next to their name</li>
          <li>6. All changes are logged in the audit history</li>
        </ol>
      </div>
    </div>
  );
}
