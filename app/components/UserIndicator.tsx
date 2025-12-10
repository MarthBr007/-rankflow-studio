'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

export default function UserIndicator() {
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Load current user
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(err => console.error('Error loading user:', err));
  }, []);

  if (!user) return null;

  const initials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div 
      className="user-indicator"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="user-indicator-avatar">
        {initials}
      </div>
      {showTooltip && (
        <div className="user-indicator-tooltip">
          <div className="user-indicator-tooltip-caret"></div>
          <div className="user-indicator-tooltip-content">
            <div className="user-indicator-tooltip-name">{user.name || user.email}</div>
            {user.name && (
              <div className="user-indicator-tooltip-email">{user.email}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

