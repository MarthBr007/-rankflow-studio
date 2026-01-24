'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  Calendar,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

function SidebarContent({ activeType, onTypeChange, isCollapsed = false, onToggleCollapse, className = '' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSettings = pathname === '/settings';
  const isLibrary = pathname === '/library';
  const isPlanner = pathname === '/planner';
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
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${className}`}>
      <div className="sidebar-header">
        <div className="sidebar-header-content">
          {isCollapsed ? (
            <div className="sidebar-logo-row sidebar-logo-row-collapsed">
              <img
                src="/rankflow-icoon.png"
                alt="RankFlow Studio icon"
                width={32}
                height={32}
                style={{ display: 'block' }}
              />
            </div>
          ) : (
            <>
              <div className="sidebar-logo-row">
                <img
                  src="/logo.png"
                  alt="RankFlow Studio logo"
                  width={160}
                  height={40}
                  style={{ objectFit: 'contain', display: 'block', maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </>
          )}
        </div>
        {onToggleCollapse && (
          <button 
            className="sidebar-toggle"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Sidebar uitklappen' : 'Sidebar inklappen'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>
      <nav className="sidebar-nav">
        {/* Main Navigation Section */}
        <div className="sidebar-section">
          {!isCollapsed && (
            <div className="sidebar-section-label">Navigatie</div>
          )}
          <Link 
            href="/" 
            className={`sidebar-item ${isDashboard ? 'active' : ''}`}
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                router.push('/');
              }
            }}
            title={isCollapsed ? 'Dashboard' : ''}
            style={{ 
              textDecoration: 'none', 
              display: 'block',
              color: 'inherit'
            }}
          >
            {isCollapsed && (
              <div className="sidebar-item-icon">
                <LayoutDashboard size={20} />
              </div>
            )}
            {!isCollapsed && (
              <div className="sidebar-item-content">
                <div className="sidebar-item-label">Dashboard</div>
              </div>
            )}
          </Link>
        </div>

        {/* Content Types Section */}
        <div className="sidebar-section">
          {!isCollapsed && (
            <div className="sidebar-section-label">Content Types</div>
          )}
          {contentTypes.map((type) => (
            <Link
              key={type.id}
              href={`/?type=${type.id}`}
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault();
                  onTypeChange(type.id);
                }
              }}
              className={`sidebar-item ${activeType === type.id && !isSettings && !isLibrary && !isDashboard ? 'active' : ''}`}
              title={isCollapsed ? type.label : ''}
              style={{ 
                textDecoration: 'none', 
                display: 'block',
                color: 'inherit'
              }}
            >
              {isCollapsed && (
                <div className="sidebar-item-icon">
                  <type.icon size={20} />
                </div>
              )}
              {!isCollapsed && (
                <div className="sidebar-item-content">
                  <div className="sidebar-item-label">{type.label}</div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Tools Section */}
        <div className="sidebar-section">
          {!isCollapsed && (
            <div className="sidebar-section-label">Tools</div>
          )}
          <Link 
            href="/library" 
            className={`sidebar-item ${isLibrary ? 'active' : ''}`}
            title={isCollapsed ? 'Content Library' : ''}
            style={{ 
              textDecoration: 'none', 
              display: 'block',
              color: 'inherit'
            }}
          >
            {isCollapsed && (
              <div className="sidebar-item-icon">
                <Library size={20} />
              </div>
            )}
            {!isCollapsed && (
              <div className="sidebar-item-content">
                <div className="sidebar-item-label">Content Library</div>
              </div>
            )}
          </Link>
          <Link 
            href="/planner" 
            className={`sidebar-item ${isPlanner ? 'active' : ''}`}
            title={isCollapsed ? 'Social Planner' : ''}
            style={{ 
              textDecoration: 'none', 
              display: 'block',
              color: 'inherit'
            }}
          >
            {isCollapsed && (
              <div className="sidebar-item-icon">
                <Calendar size={20} />
              </div>
            )}
            {!isCollapsed && (
              <div className="sidebar-item-content">
                <div className="sidebar-item-label">Social Planner</div>
              </div>
            )}
          </Link>
          <Link 
            href="/templates" 
            className={`sidebar-item ${pathname === '/templates' ? 'active' : ''}`}
            title={isCollapsed ? 'Templates' : ''}
            style={{ 
              textDecoration: 'none', 
              display: 'block',
              color: 'inherit'
            }}
          >
            {isCollapsed && (
              <div className="sidebar-item-icon">
                <LayoutTemplate size={20} />
              </div>
            )}
            {!isCollapsed && (
              <div className="sidebar-item-content">
                <div className="sidebar-item-label">Templates</div>
              </div>
            )}
          </Link>
          <Link 
            href="/analytics" 
            className={`sidebar-item ${pathname === '/analytics' ? 'active' : ''}`}
            title={isCollapsed ? 'Analytics' : ''}
            style={{ 
              textDecoration: 'none', 
              display: 'block',
              color: 'inherit'
            }}
          >
            {isCollapsed && (
              <div className="sidebar-item-icon">
                <BarChart3 size={20} />
              </div>
            )}
            {!isCollapsed && (
              <div className="sidebar-item-content">
                <div className="sidebar-item-label">Analytics</div>
              </div>
            )}
          </Link>
        </div>

        {/* Settings Section */}
        <div className="sidebar-section">
          {!isCollapsed && (
            <div className="sidebar-section-label">Instellingen</div>
          )}
          <Link 
            href="/settings" 
            className={`sidebar-item ${isSettings ? 'active' : ''}`}
            title={isCollapsed ? 'Instellingen' : ''}
            style={{ 
              textDecoration: 'none', 
              display: 'block',
              color: 'inherit'
            }}
          >
            {isCollapsed && (
              <div className="sidebar-item-icon">
                <Settings size={20} />
              </div>
            )}
            {!isCollapsed && (
              <div className="sidebar-item-content">
                <div className="sidebar-item-label">Instellingen</div>
              </div>
            )}
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={
      <div className={`sidebar ${props.isCollapsed ? 'collapsed' : ''} ${props.className || ''}`}>
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

