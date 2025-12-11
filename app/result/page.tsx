'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import ContentResult from '../components/ContentResult';
import { useToast } from '../components/ToastContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import { Save } from 'lucide-react';

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [contentType, setContentType] = useState<string>('landing');
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tenantConfig, setTenantConfig] = useState<{ organizationId?: string; apiKey?: string; model?: string; provider?: string } | null>(null);
  const { showToast } = useToast();
  const [selfCheck, setSelfCheck] = useState<string[]>([]);

  // Laad sidebar state uit localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  // Sla sidebar state op in localStorage
  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  useEffect(() => {
    // Haal result data op uit sessionStorage
    const type = searchParams.get('type') || 'landing';
    
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('generatedContent');
      const storedType = sessionStorage.getItem('contentType') || type;
      
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          setResult(parsed);
          setContentType(storedType);
        } catch (e) {
          setError('Kon result data niet laden');
        }
      } else {
        setError('Geen result data gevonden');
      }
    }
    setIsLoading(false);
  }, [searchParams]);

  // Laad tenant config uit localStorage (zelfde key voor refine)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('rankflow-tenant-config');
    if (stored) {
      try {
        setTenantConfig(JSON.parse(stored));
      } catch (e) {
        console.error('Fout bij laden tenant config:', e);
      }
    }
  }, []);

  const handleRefine = async () => {
    if (!result) return;

    setIsRefining(true);
    setRefineError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'refine',
          content: result,
          organizationId: tenantConfig?.organizationId,
          apiKeyOverride: tenantConfig?.apiKey,
          modelOverride: tenantConfig?.model,
          providerOverride: tenantConfig?.provider,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Fout ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const text = await response.text();
          console.error('Non-JSON error response:', text.substring(0, 200));
        }
        throw new Error(errorMessage || 'Er is een fout opgetreden bij het verbeteren van content');
      }

      const data = await response.json();
      setResult(data);
      setRefineError(null);
      
      // Update sessionStorage met nieuwe data
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('generatedContent', JSON.stringify(data));
      }
    } catch (err: any) {
      setRefineError(err.message || 'Er is een fout opgetreden bij het verbeteren van content');
      console.error('Refine error:', err);
    } finally {
      setIsRefining(false);
    }
  };

  const buildTitle = () => {
    const dateLabel = new Date().toLocaleDateString('nl-NL');
    if (contentType === 'landing') {
      const seoTitle = result.seo?.seoTitle || result.seoTitle;
      const h1 = result.content?.h1 || result.h1;
      const fk = result.seo?.focusKeyword || result.focusKeyword;
      return seoTitle || h1 || fk || `Landingspagina ${dateLabel}`;
    } else if (contentType === 'categorie') {
      const h1 = result.h1;
      const category = result.category || result.focusKeyword;
      return h1 || category || `Categoriepagina ${dateLabel}`;
    } else if (contentType === 'product') {
      const productTitle = result.title || result.h1 || result.seoTitle;
      return productTitle || `Productpagina ${dateLabel}`;
    } else if (contentType === 'blog') {
      const blogTitle = result.title || result.h1 || result.seoTitle;
      return blogTitle || `Blog ${dateLabel}`;
    } else if (contentType === 'social') {
      const topic = result.topic || result.subject || 'Social post';
      return `${topic} (${dateLabel})`;
    }
    return `Content ${dateLabel}`;
  };

  const handleSave = async (overrideTitle?: string) => {
    if (!result) return;
    setIsSaving(true);
    try {
      const title = overrideTitle || buildTitle();
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: contentType,
          title,
          data: result,
          status: 'draft',
        }),
      });
      if (!response.ok) throw new Error('Fout bij opslaan');
      showToast(`Opgeslagen: ${title}`, 'success');
    } catch (err: any) {
      showToast('Fout bij opslaan: ' + (err.message || 'Onbekende fout'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveVariants = async (count = 3) => {
    if (!result) return;
    setIsSaving(true);
    try {
      const baseTitle = buildTitle();
      for (let i = 1; i <= count; i++) {
        const variantTitle = `${baseTitle} (Variant ${i})`;
        const res = await fetch('/api/library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: contentType,
            title: variantTitle,
            data: result,
            status: 'draft',
          }),
        });
        if (!res.ok) throw new Error('Fout bij opslaan variant');
      }
      showToast(`${count} varianten opgeslagen`, 'success');
    } catch (err: any) {
      showToast('Fout bij varianten: ' + (err.message || 'Onbekende fout'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const runSelfCheck = () => {
    if (!result) return;
    const warnings: string[] = [];
    const title = buildTitle();
    if (title.length > 70) warnings.push('Titel is lang (>70 tekens).');
    const meta = result.metaDescription || result.seo?.metaDescription;
    if (meta && meta.length > 170) warnings.push('Meta description is lang (>170 tekens).');
    if (!meta) warnings.push('Meta description ontbreekt.');
    const h1 = result.h1 || result.content?.h1;
    if (!h1) warnings.push('H1 ontbreekt.');
    const kw = result.focusKeyword || result.seo?.focusKeyword;
    if (!kw) warnings.push('Focus keyword ontbreekt.');
    setSelfCheck(warnings);
    showToast(warnings.length ? 'Self-check: er zijn aandachtspunten' : 'Self-check: OK', warnings.length ? 'warning' : 'success');
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${buildTitle()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMarkdown = () => {
    if (!result) return;
    const blob = new Blob([`# ${buildTitle()}\n\n${JSON.stringify(result, null, 2)}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${buildTitle()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="app-layout">
        <Sidebar 
          activeType={contentType} 
          onTypeChange={() => {}}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="loading">
            <p>Resultaat wordt geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="app-layout">
        <Sidebar 
          activeType={contentType} 
          onTypeChange={() => {}}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="error">
            <strong>Fout:</strong> {error || 'Geen result data beschikbaar'}
          </div>
          <Link href="/" className="button" style={{ marginTop: '1rem', display: 'inline-block' }}>
            ← Terug naar generator
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, label: 'Type kiezen' },
    { id: 2, label: 'Input invullen' },
    { id: 3, label: 'Content genereren' },
    { id: 4, label: 'Preview & blokken' },
  ];

  return (
    <div className="app-layout">
      <Sidebar 
        activeType={contentType} 
        onTypeChange={() => {}}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="result-header">
          <div className="result-header-main">
            <div className="result-header-text">
              <h1>Gegenereerde Content</h1>
              <p className="result-header-sub">
                {contentType === 'landing' && 'Landingspagina'}
                {contentType === 'categorie' && 'Categoriepagina'}
                {contentType === 'product' && 'Productpagina'}
                {contentType === 'blog' && 'Blog artikel'}
                {contentType === 'social' && 'Social Media Posts'}
              </p>
            </div>
            <div className="result-header-actions">
              <button
                onClick={runSelfCheck}
                className="button button-secondary"
                type="button"
              >
                Self-check
              </button>
              <button
                onClick={() => handleSaveVariants(3)}
                disabled={isSaving}
                className="button button-secondary"
                type="button"
              >
                3 varianten
              </button>
              <button
                onClick={downloadJson}
                className="button button-secondary"
                type="button"
              >
                Download JSON
              </button>
              <button
                onClick={downloadMarkdown}
                className="button button-secondary"
                type="button"
              >
                Download MD
              </button>
            <button
              onClick={async () => {
                if (!result) return;
                try {
                  const res = await fetch('/api/export/wordpress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: buildTitle(), data: result }),
                  });
                  if (!res.ok) throw new Error('Export naar WordPress mislukt');
                  showToast('Export (stub) naar WordPress verstuurd', 'success');
                } catch (e: any) {
                  showToast(e.message || 'Fout bij WordPress export', 'error');
                }
              }}
              className="button button-secondary"
              type="button"
            >
              Export WordPress
            </button>
            <button
              onClick={async () => {
                if (!result) return;
                try {
                  const res = await fetch('/api/export/webflow', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: buildTitle(), data: result }),
                  });
                  if (!res.ok) throw new Error('Export naar Webflow mislukt');
                  showToast('Export (stub) naar Webflow verstuurd', 'success');
                } catch (e: any) {
                  showToast(e.message || 'Fout bij Webflow export', 'error');
                }
              }}
              className="button button-secondary"
              type="button"
            >
              Export Webflow
            </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="button"
              >
                <Save size={18} />
                {isSaving ? 'Opslaan...' : 'Opslaan'}
              </button>
              <Link href="/" className="button button-secondary">
                ← Nieuw genereren
              </Link>
            </div>
          </div>
          <div className="result-header-stepper">
            {steps.map((step, index) => {
              const isActive = step.id === 4;
              const isCompleted = step.id < 4;
              return (
                <div
                  key={step.id}
                  className={
                    'result-step' +
                    (isCompleted ? ' result-step-completed' : '') +
                    (isActive ? ' result-step-active' : '')
                  }
                >
                  <div className="result-step-circle">
                    {isCompleted ? '✓' : step.id}
                  </div>
                  <span className="result-step-label">{step.label}</span>
                  {index < steps.length - 1 && <div className="result-step-line" />}
                </div>
              );
            })}
          </div>
        </div>

        {refineError && (
          <div className="error">
            <strong>Fout bij verbeteren:</strong> {refineError}
            <button
              onClick={handleRefine}
              className="button"
              style={{ marginTop: '0.5rem' }}
            >
              Opnieuw proberen
            </button>
          </div>
        )}

        {selfCheck.length > 0 && (
          <div className="message warning">
            <div>
              <strong>Self-check aandachtspunten:</strong>
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>
                {selfCheck.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <ContentResult
          type={contentType}
          result={result}
          onRefine={handleRefine}
          isRefining={isRefining}
          onResultChange={(updated) => {
            setResult(updated);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('generatedContent', JSON.stringify(updated));
            }
          }}
        />

        {isRefining && (
          <div className="loading-overlay">
            <div className="loading-popup">
              <LoadingSpinner size={32} text="Verbeterde versie wordt gegenereerd..." />
              <div className="loading-progress">
                <div className="loading-progress-bar" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="app-layout">
        <div className="main-content">
          <div className="loading">
            <p>Laden...</p>
          </div>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}

