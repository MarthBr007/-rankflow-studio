'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FileText, Folder, Package, PenTool, Share2, Settings, Library, Zap, Target } from 'lucide-react';
import ActivityFeed from './ActivityFeed';

interface DashboardViewProps {
  onStartGenerating: () => void;
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem('contentType');
    if (stored && ['landing', 'categorie', 'product', 'blog', 'social'].includes(stored)) {
      setLastType(stored);
    }
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
          <div className="stat-icon">
            <FileText size={40} />
          </div>
          <div className="stat-content">
            <div className="stat-value">5</div>
            <div className="stat-label">Content Types</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Zap size={40} />
          </div>
          <div className="stat-content">
            <div className="stat-value">AI</div>
            <div className="stat-label">Powered</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={40} />
          </div>
          <div className="stat-content">
            <div className="stat-value">SEO</div>
            <div className="stat-label">Geoptimaliseerd</div>
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
          </div>
        </div>

        <div className="dashboard-section">
          <ActivityFeed limit={5} />
        </div>
      </div>
    </div>
  );
}

