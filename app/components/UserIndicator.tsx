'use client';

import { useState, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserIndicator() {
  const [user, setUser] = useState<{ email: string; name?: string; role?: string } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

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

  const handleLogout = async () => {
    if (!confirm('Weet je zeker dat je wilt uitloggen?')) {
      return;
    }
    
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading state or login prompt if no user
  if (!user) {
    return (
      <div className="user-indicator">
        <a 
          href="/login" 
          className="user-indicator-avatar"
          style={{ 
            background: '#6b7280',
            textDecoration: 'none',
            fontSize: '0.75rem'
          }}
          title="Inloggen"
        >
          <User size={16} />
        </a>
      </div>
    );
  }

  const initials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div 
      className="user-indicator"
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className="user-indicator-avatar">
        {initials}
      </div>
      {showMenu && (
        <div className="user-indicator-menu">
          <div className="user-indicator-menu-caret"></div>
          <div className="user-indicator-menu-content">
            <div className="user-indicator-menu-header">
              <div className="user-indicator-menu-name">{user.name || user.email}</div>
              {user.name && (
                <div className="user-indicator-menu-email">{user.email}</div>
              )}
              {user.role && (
                <div className="user-indicator-menu-role">
                  <span className={`user-role-badge user-role-${user.role}`}>
                    {user.role === 'admin' ? 'Admin' : 'Gebruiker'}
                  </span>
                </div>
              )}
            </div>
            <div className="user-indicator-menu-divider"></div>
            <button 
              className="user-indicator-menu-logout"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Uitloggen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

