'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FileText, Folder, Package, PenTool, Share2, Settings, Library, Zap, Target, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import ActivityFeed from './ActivityFeed';

interface DashboardViewProps {
  onStartGenerating: () => void;
}

interface Metrics {
  total: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgDuration: number;
  totalTokens: number;
}

interface RecentItem {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardView({ onStartGenerating }: DashboardViewProps) {
  const contentTypes = [
    { 
      id: 'landing', 
      label: 'Landingspagina', 
      description: 'Tafelgerei, 21-diner, feestdagen',
      icon: FileText,
      color: '#4a90e2'
    },
    { 
      id: 'categorie', 
      label: 'Categoriepagina', 
      description: 'Servies huren, glaswerk huren',
      icon: Folder,
      color: '#28a745'
    },
    { 
      id: 'product', 
      label: 'Productpagina', 
      description: 'Statafel basic, partykoelkast',
      icon: Package,
      color: '#ffc107'
    },
    { 
      id: 'blog', 
      label: 'Blog', 
      description: 'Blogartikelen',
      icon: PenTool,
      color: '#dc3545'
    },
    { 
      id: 'social', 
      label: 'Social Media', 
      description: 'Instagram, LinkedIn posts',
      icon: Share2,
      color: '#6f42c1'
    },
  ];

  const [lastType, setLastType] = useState<string>('landing');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem('contentType');
    if (stored && ['landing', 'categorie', 'product', 'blog', 'social'].includes(stored)) {
      setLastType(stored);
    }
  }, []);

  useEffect(() => {
    // Fetch metrics
    fetch('/api/logs?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('Error loading metrics:', data.error);
        } else {
          setMetrics({
            total: data.total || 0,
            successCount: data.successCount || 0,
            errorCount: data.errorCount || 0,
            successRate: data.successRate || 0,
            avgDuration: data.avgDuration || 0,
            totalTokens: data.totalTokens || 0,
          });
        }
      })
      .catch(err => {
        console.error('Error fetching metrics:', err);
      })
      .finally(() => {
        setIsLoadingMetrics(false);
      });

    // Fetch recent items
    fetch('/api/library')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRecentItems(data.slice(0, 5));
        } else if (data.error) {
          console.error('Error loading recent items:', data.error);
        }
      })
      .catch(err => {
        console.error('Error fetching recent items:', err);
      })
      .finally(() => {
        setIsLoadingRecent(false);
      });
  }, []);

  const lastTypeConfig = contentTypes.find((c) => c.id === lastType) || contentTypes[0];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>RankFlow Studio</h1>
          <p>SEO Content Generator Dashboard</p>
        </div>
      </div>

      {/* What's next block */}
      <div className="dashboard-whats-next card">
        <div className="dashboard-whats-main">
          <div>
            <span className="badge-soft">What’s next</span>
            <h2>Ga verder met {lastTypeConfig.label}</h2>
            <p className="dashboard-subtitle">
              Werk verder aan je laatste contenttype of start direct een nieuwe run.
            </p>
            <div className="dashboard-whats-actions">
              <Link
                href={`/?type=${lastTypeConfig.id}`}
                onClick={onStartGenerating}
                className="button"
              >
                Ga verder met {lastTypeConfig.label.toLowerCase()}
              </Link>
              <div className="dashboard-whats-secondary">
                <Link
                  href="/?type=landing"
                  onClick={onStartGenerating}
                >
                  Nieuwe landingspagina
                </Link>
                <span>·</span>
                <Link
                  href="/?type=social"
                  onClick={onStartGenerating}
                >
                  Social post voor vandaag
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-health">
          <h3>Systeemstatus</h3>
          <ul>
            <li><span className="dot dot-success" />AI-configuratie: OK</li>
            <li><span className="dot dot-success" />Library bereikbaar</li>
            <li><span className="dot dot-muted" />Laatste fout: geen</li>
          </ul>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(74, 144, 226, 0.1)' }}>
            <TrendingUp size={40} color="#4a90e2" />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {isLoadingMetrics ? '...' : metrics?.total || 0}
            </div>
            <div className="stat-label">Totaal gegenereerd</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(40, 167, 69, 0.1)' }}>
            <CheckCircle size={40} color="#28a745" />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {isLoadingMetrics ? '...' : `${metrics?.successRate || 0}%`}
            </div>
            <div className="stat-label">Succespercentage</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
            <Zap size={40} color="#ffc107" />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {isLoadingMetrics ? '...' : metrics?.totalTokens ? `${Math.round(metrics.totalTokens / 1000)}k` : '0'}
            </div>
            <div className="stat-label">Tokens gebruikt</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(108, 117, 125, 0.1)' }}>
            <Clock size={40} color="#6c757d" />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {isLoadingMetrics ? '...' : metrics?.avgDuration ? `${metrics.avgDuration}ms` : '0ms'}
            </div>
            <div className="stat-label">Gem. duur</div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Kies een contenttype</h2>
        <p className="dashboard-subtitle">
          Selecteer het type content dat je wilt genereren
        </p>
        <div className="content-type-grid">
          {contentTypes.map((type) => (
            <Link
              key={type.id}
              href={`/?type=${type.id}`}
              onClick={onStartGenerating}
              className="content-type-card"
              style={{ 
                textDecoration: 'none',
                borderLeft: `4px solid ${type.color}`
              }}
            >
              <div className="content-type-icon" style={{ color: type.color }}>
                <type.icon size={32} />
              </div>
              <div className="content-type-info">
                <h3>{type.label}</h3>
                <p>{type.description}</p>
              </div>
              <div className="content-type-arrow">→</div>
            </Link>
          ))}
        </div>
        {/* Template shortcuts */}
        <div className="template-shortcuts">
          <div className="template-header">
            <h3>Snelle templates</h3>
          </div>
          <div className="template-grid">
            <Link
              href="/?type=landing"
              onClick={onStartGenerating}
              className="template-card"
            >
              <div className="template-pill">Landingspagina</div>
              <h4>21-diner pagina</h4>
              <p>Snelle start voor een 21-diner of luxe diner thuis.</p>
            </Link>
            <Link
              href="/?type=product"
              onClick={onStartGenerating}
              className="template-card"
            >
              <div className="template-pill">Productpagina</div>
              <h4>Nieuwe productintro</h4>
              <p>Ideaal voor een nieuw verhuurproduct of variatie.</p>
            </Link>
            <Link
              href="/?type=blog"
              onClick={onStartGenerating}
              className="template-card"
            >
              <div className="template-pill">Blog</div>
              <h4>Event recap blog</h4>
              <p>Gebruik een recent event als case voor een blogartikel.</p>
            </Link>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Snelle Acties</h2>
          <div className="quick-actions">
            <Link href="/library" className="quick-action-card">
              <div className="quick-action-icon">
                <Library size={24} />
              </div>
              <div>
                <h3>Content Library</h3>
                <p>Bekijk opgeslagen content</p>
              </div>
            </Link>
            <Link href="/settings" className="quick-action-card">
              <div className="quick-action-icon">
                <Settings size={24} />
              </div>
              <div>
                <h3>Instellingen</h3>
                <p>Bekijk en bewerk prompts</p>
              </div>
            </Link>
            <Link href="/analytics" className="quick-action-card">
              <div className="quick-action-icon">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3>Analytics</h3>
                <p>Bekijk generatie statistieken</p>
              </div>
            </Link>
            <Link href="/templates" className="quick-action-card">
              <div className="quick-action-icon">
                <FileText size={24} />
              </div>
              <div>
                <h3>Templates</h3>
                <p>Bekijk beschikbare templates</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Recente Content</h2>
          {isLoadingRecent ? (
            <p style={{ color: '#666', padding: '1rem' }}>Laden...</p>
          ) : recentItems.length === 0 ? (
            <p style={{ color: '#666', padding: '1rem' }}>Nog geen opgeslagen content. Start met genereren!</p>
          ) : (
            <div className="recent-items-list">
              {recentItems.map((item) => {
                const typeConfig = contentTypes.find(t => t.id === item.type) || contentTypes[0];
                const Icon = typeConfig.icon;
                const date = new Date(item.createdAt);
                const formattedDate = date.toLocaleDateString('nl-NL', { 
                  day: 'numeric', 
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <Link
                    key={item.id}
                    href={`/library?id=${item.id}`}
                    className="recent-item-card"
                    style={{ borderLeft: `4px solid ${typeConfig.color}` }}
                  >
                    <div className="recent-item-icon" style={{ color: typeConfig.color }}>
                      <Icon size={20} />
                    </div>
                    <div className="recent-item-content">
                      <h4>{item.title}</h4>
                      <p>
                        <span className="recent-item-type">{typeConfig.label}</span>
                        <span className="recent-item-date">{formattedDate}</span>
                      </p>
                    </div>
                    <div className="recent-item-arrow">→</div>
                  </Link>
                );
              })}
            </div>
          )}
          {recentItems.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <Link href="/library" className="link-button">
                Bekijk alle content →
              </Link>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <ActivityFeed limit={5} />
        </div>
      </div>
    </div>
  );
}

