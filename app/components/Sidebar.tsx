'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  FileText, 
  Folder, 
  Package, 
  PenTool, 
  Share2, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Library,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  User
} from 'lucide-react';

interface SidebarProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarContent({ activeType, onTypeChange, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSettings = pathname === '/settings';
  const isLibrary = pathname === '/library';
  // Dashboard is actief als we op home zijn en geen type parameter hebben
  const isDashboard = pathname === '/' && !searchParams.get('type');
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);

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
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const contentTypes = [
    { id: 'landing', label: 'Landingspagina', description: 'Tafelgerei, 21-diner, feestdagen', icon: FileText },
    { id: 'categorie', label: 'Categoriepagina', description: 'Servies huren, glaswerk huren', icon: Folder },
    { id: 'product', label: 'Productpagina', description: 'Statafel basic, partykoelkast', icon: Package },
    { id: 'blog', label: 'Blog', description: 'Blogartikelen', icon: PenTool },
    { id: 'social', label: 'Social Media', description: 'Instagram, LinkedIn posts', icon: Share2 },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-header-content">
          {isCollapsed ? (
            <div className="sidebar-logo-row">
              <div className="sidebar-logo-mark">
                <Image
                  src="/rankflow-icoon.png"
                  alt="RankFlow Studio icon"
                  width={28}
                  height={28}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="sidebar-logo-row">
                <Image
                  src="/logo.png"
                  alt="RankFlow Studio logo"
                  width={160}
                  height={40}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <nav className="sidebar-nav">
        <Link 
          href="/" 
          className={`sidebar-item ${isDashboard ? 'active' : ''}`}
          onClick={(e) => {
            if (pathname === '/') {
              e.preventDefault();
              // Clear type from URL to show dashboard
              router.push('/');
            }
          }}
          style={{ 
            textDecoration: 'none', 
            display: 'block',
            color: 'inherit'
          }}
        >
          <div className="sidebar-item-icon">
            <LayoutDashboard size={20} />
          </div>
          {!isCollapsed && (
            <div className="sidebar-item-label">Dashboard</div>
          )}
        </Link>
        {contentTypes.map((type) => (
          <Link
            key={type.id}
            href={`/?type=${type.id}`}
            onClick={(e) => {
              // Als we al op de home pagina zijn, gebruik de onTypeChange handler voor instant update
              if (pathname === '/') {
                e.preventDefault();
                onTypeChange(type.id);
              }
              // Anders laat de Link zijn werk doen (navigeer naar home met type)
            }}
            className={`sidebar-item ${activeType === type.id && !isSettings && !isLibrary && !isDashboard ? 'active' : ''}`}
            style={{ 
              textDecoration: 'none', 
              display: 'block',
              color: 'inherit'
            }}
          >
            <div className="sidebar-item-icon">
              <type.icon size={20} />
            </div>
            {!isCollapsed && (
              <div className="sidebar-item-label">{type.label}</div>
            )}
          </Link>
        ))}
        <Link 
          href="/library" 
          className={`sidebar-item ${isLibrary ? 'active' : ''}`}
          style={{ 
            textDecoration: 'none', 
            display: 'block',
            color: 'inherit'
          }}
        >
          <div className="sidebar-item-icon">
            <Library size={20} />
          </div>
          {!isCollapsed && (
            <div className="sidebar-item-label">Content Library</div>
          )}
        </Link>
        <Link 
          href="/templates" 
          className={`sidebar-item ${pathname === '/templates' ? 'active' : ''}`}
          style={{ 
            textDecoration: 'none', 
            display: 'block',
            color: 'inherit'
          }}
        >
          <div className="sidebar-item-icon">
            <LayoutTemplate size={20} />
          </div>
          {!isCollapsed && (
            <div className="sidebar-item-label">Templates</div>
          )}
        </Link>
        <Link 
          href="/analytics" 
          className={`sidebar-item ${pathname === '/analytics' ? 'active' : ''}`}
          style={{ 
            textDecoration: 'none', 
            display: 'block',
            color: 'inherit'
          }}
        >
          <div className="sidebar-item-icon">
            📊
          </div>
          {!isCollapsed && (
            <div className="sidebar-item-label">Analytics</div>
          )}
        </Link>
        <Link 
          href="/settings" 
          className={`sidebar-item ${isSettings ? 'active' : ''}`}
          style={{ 
            textDecoration: 'none', 
            display: 'block',
            color: 'inherit'
          }}
        >
          <div className="sidebar-item-icon">
            <Settings size={20} />
          </div>
          {!isCollapsed && (
            <div className="sidebar-item-label">Instellingen</div>
          )}
        </Link>
      </nav>
      <div className="sidebar-footer">
        {user && !isCollapsed && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-icon">
              <User size={16} />
            </div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">{user.name || user.email}</div>
              {user.name && (
                <div className="sidebar-user-email">{user.email}</div>
              )}
            </div>
          </div>
        )}
        <button 
          className="sidebar-logout"
          onClick={handleLogout}
          title="Uitloggen"
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Uitloggen</span>}
        </button>
      </div>
      {onToggleCollapse && (
        <button 
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Sidebar uitklappen' : 'Sidebar inklappen'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      )}
    </div>
  );
}

export default function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={
      <div className={`sidebar ${props.isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-content">
            {!props.isCollapsed && (
              <>
                <h2>Content Types</h2>
                <p>Kies een type om content te genereren</p>
              </>
            )}
          </div>
        </div>
      </div>
    }>
      <SidebarContent {...props} />
    </Suspense>
  );
}

