import React, { useState, useEffect } from 'react';
import './TeamSettings.css';

interface Member {
  userId: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

interface TeamSettingsProps {
  orgId: string;
  userRole: string;
  token: string;
  onClose: () => void;
}

const TeamSettings: React.FC<TeamSettingsProps> = ({ orgId, userRole, token, onClose }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canInvite = userRole === 'OWNER' || userRole === 'ADMIN';
  const canManageRoles = userRole === 'OWNER';

  useEffect(() => {
    // For MVP, we'll show a placeholder
    // In full implementation, fetch from auth-service
    setMembers([
      { userId: 'current', email: 'you@example.com', role: userRole as any },
    ]);
  }, [userRole]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInvite) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/auth/orgs/${orgId}/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': 'current', // Would come from token
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Invite sent to ${inviteEmail}. Token: ${data.token}`);
        setInviteEmail('');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to send invite' }));
        setError(errorData.error || 'Failed to send invite');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-settings-overlay" onClick={onClose}>
      <div className="team-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="team-settings-header">
          <h2>Team Settings</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="team-settings-content">
          {canInvite && (
            <div className="invite-section">
              <h3>Invite Team Member</h3>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleInvite}>
                <div className="invite-form">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    disabled={loading}
                  />
                  <button type="submit" disabled={loading} className="primary-button">
                    {loading ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="members-section">
            <h3>Team Members</h3>
            <div className="members-list">
              {members.map((member) => (
                <div key={member.userId} className="member-item">
                  <div className="member-info">
                    <span className="member-email">{member.email}</span>
                    <span className={`member-role role-${member.role.toLowerCase()}`}>
                      {member.role}
                    </span>
                  </div>
                  {canManageRoles && member.role !== 'OWNER' && (
                    <select className="role-select" defaultValue={member.role}>
                      <option value="MEMBER">MEMBER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSettings;

