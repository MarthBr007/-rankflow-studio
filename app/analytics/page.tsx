'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Sidebar from '../components/Sidebar';
import UserIndicator from '../components/UserIndicator';
import Breadcrumbs from '../components/Breadcrumbs';
import MobileMenuButton from '../components/MobileMenuButton';
import ThemeToggle from '../components/ThemeToggle';
import { useIsMobile } from '../lib/useMediaQuery';

interface LogItem {
  id: string;
  organizationId: string | null;
  contentType: string;
  provider: string;
  model: string;
  duration: number;
  tokensUsed?: number | null;
  success: boolean;
  errorMessage?: string | null;
  createdAt: string;
}

interface LogResponse {
  total: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgDuration: number;
  totalTokens: number;
  items: LogItem[];
}

export default function AnalyticsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    organizationId: '',
    type: '',
    from: '',
    to: '',
  });
  const [logs, setLogs] = useState<LogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.organizationId) params.append('organizationId', filters.organizationId);
      if (filters.type) params.append('type', filters.type);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      params.append('limit', '200');
      const res = await fetch(`/api/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) setIsSidebarCollapsed(JSON.parse(saved));
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.sidebar') && !target.closest('.mobile-menu-button')) {
          setIsMobileMenuOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen, isMobile]);

  return (
    <div className={`app-layout ${isMobileMenuOpen && isMobile ? 'mobile-sidebar-open' : ''}`}>
      {isMobile && isMobileMenuOpen && (
        <div 
          className="sidebar-overlay active"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <Sidebar
        activeType="analytics"
        onTypeChange={() => {}}
        isCollapsed={isMobile ? false : isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        className={isMobile && isMobileMenuOpen ? 'mobile-open' : ''}
      />
      <div className={`main-content ${isSidebarCollapsed && !isMobile ? 'sidebar-collapsed' : ''}`}>
        <div className="header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isMobile && (
                <MobileMenuButton 
                  isOpen={isMobileMenuOpen} 
                  onClick={toggleMobileMenu} 
                />
              )}
              <Suspense fallback={<div style={{ minHeight: '24px' }} />}>
                <Breadcrumbs />
              </Suspense>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ThemeToggle />
              <UserIndicator />
            </div>
          </div>
        </div>

        <div className="settings-container" style={{ gap: '1.5rem' }}>
          <div className="prompt-viewer">
            <div className="prompt-header">
              <h2>Filters</h2>
              <button className="button" onClick={loadLogs} disabled={isLoading}>
                {isLoading ? 'Laden...' : 'Toepassen'}
              </button>
            </div>
            <div className="prompt-content" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '200px', flex: '1' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Tenant</label>
                <input
                  type="text"
                  value={filters.organizationId}
                  onChange={(e) => setFilters(prev => ({ ...prev, organizationId: e.target.value }))}
                  placeholder="bijv. klant-123"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-bg-panel)', color: 'var(--color-text)' }}
                />
              </div>
              <div style={{ minWidth: '160px' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-bg-panel)', color: 'var(--color-text)' }}
                >
                  <option value="">Alle</option>
                  <option value="landing">Landing</option>
                  <option value="product">Product</option>
                  <option value="categorie">Categorie</option>
                  <option value="blog">Blog</option>
                  <option value="social">Social</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Vanaf</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))}
                  style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Tot</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
                  style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>

          {logs && (
            <div className="prompt-viewer">
              <div className="prompt-header">
                <h2>Samenvatting</h2>
              </div>
              <div className="prompt-content" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Metric label="Totaal" value={logs.total} />
                <Metric label="Success" value={logs.successCount} />
                <Metric label="Errors" value={logs.errorCount} />
                <Metric label="Success rate" value={`${logs.successRate}%`} />
                <Metric label="Gem. duur" value={`${logs.avgDuration} ms`} />
                <Metric label="Tokens" value={logs.totalTokens} />
              </div>
            </div>
          )}

          {logs && (
            <div className="prompt-viewer">
              <div className="prompt-header">
                <h2>Logs</h2>
              </div>
              <div className="prompt-content" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                  <thead>
                    <tr>
                      <Th>Datum</Th>
                      <Th>Tenant</Th>
                      <Th>Type</Th>
                      <Th>Provider/Model</Th>
                      <Th>Duur (ms)</Th>
                      <Th>Tokens</Th>
                      <Th>Status</Th>
                      <Th>Error</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.items.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <Td>{new Date(log.createdAt).toLocaleString('nl-NL')}</Td>
                        <Td>{log.organizationId || '–'}</Td>
                        <Td>{log.contentType}</Td>
                        <Td>{log.provider} / {log.model}</Td>
                        <Td>{log.duration} ms</Td>
                        <Td>{log.tokensUsed ?? '–'}</Td>
                        <Td style={{ color: log.success ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
                          {log.success ? 'OK' : 'Error'}
                        </Td>
                        <Td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.errorMessage || '–'}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        background: 'var(--color-bg-panel)',
        borderRadius: '8px',
        minWidth: '140px',
        border: '1px solid var(--color-border)',
      }}
    >
      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{label}</div>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ textAlign: 'left', padding: '0.6rem', background: 'var(--color-bg-light)', borderBottom: '1px solid var(--color-border)' }}>
      {children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: '0.6rem', ...(style || {}) }}>
      {children}
    </td>
  );
}

