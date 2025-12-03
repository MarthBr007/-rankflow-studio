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
  LayoutDashboard
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

