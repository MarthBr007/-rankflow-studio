'use client';

import { useState, useEffect, useRef } from 'react';
import { User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserIndicator() {
  const [user, setUser] = useState<{ email: string; name?: string; role?: string } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

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

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMenu) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showMenu]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMenu &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

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
      ref={buttonRef}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
      onClick={(e) => {
        // Toggle menu on click
        if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.user-indicator-avatar')) {
          setShowMenu(!showMenu);
        }
      }}
    >
      <button
        className="user-indicator-avatar"
        aria-label="Gebruikersmenu"
        aria-expanded={showMenu}
        aria-haspopup="true"
        type="button"
      >
        {initials}
      </button>
      {showMenu && (
        <div 
          ref={menuRef}
          className="user-indicator-menu"
          role="menu"
          aria-label="Gebruikersmenu"
          onMouseEnter={() => setShowMenu(true)}
          onMouseLeave={() => setShowMenu(false)}
          onClick={(e) => e.stopPropagation()}
        >
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
            <a
              href="/profile"
              className="user-indicator-menu-item"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                setShowMenu(false);
                router.push('/profile');
              }}
            >
              <User size={16} aria-hidden="true" />
              <span>Profiel</span>
            </a>
            <button 
              className="user-indicator-menu-logout"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(false);
                handleLogout();
              }}
            >
              <LogOut size={16} aria-hidden="true" />
              <span>Uitloggen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

