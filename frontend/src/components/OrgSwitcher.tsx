import React, { useState, useEffect } from 'react';
import './OrgSwitcher.css';

interface Org {
  id: string;
  name: string;
}

interface OrgSwitcherProps {
  currentOrgId: string | null;
  currentOrgName: string | null;
  onOrgChange: (orgId: string) => void;
  onLogout: () => void;
}

const OrgSwitcher: React.FC<OrgSwitcherProps> = ({
  currentOrgId,
  currentOrgName,
  onOrgChange,
  onLogout,
}) => {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // For MVP, we'll just show the current org
    // In a full implementation, you'd fetch user's orgs from auth-service
    if (currentOrgId && currentOrgName) {
      setOrgs([{ id: currentOrgId, name: currentOrgName }]);
    }
  }, [currentOrgId, currentOrgName]);

  return (
    <div className="org-switcher">
      <button className="org-switcher-button" onClick={() => setIsOpen(!isOpen)}>
        <span className="org-icon">🏢</span>
        <span className="org-name">{currentOrgName || 'Select Org'}</span>
        <span className="org-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="org-dropdown">
          {orgs.map((org) => (
            <button
              key={org.id}
              className={`org-option ${org.id === currentOrgId ? 'active' : ''}`}
              onClick={() => {
                onOrgChange(org.id);
                setIsOpen(false);
              }}
            >
              {org.name}
            </button>
          ))}
          <div className="org-divider" />
          <button className="org-option logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default OrgSwitcher;

