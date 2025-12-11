'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import ContentForm from './components/ContentForm';
import Sidebar from './components/Sidebar';
import DashboardView from './components/Dashboard';
import { useToast } from './components/ToastContainer';
import LoadingSpinner from './components/LoadingSpinner';
import PresenceBar from './components/PresenceBar';
import UserIndicator from './components/UserIndicator';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [contentType, setContentType] = useState<string>('landing');
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [tenantConfig, setTenantConfig] = useState<{ organizationId?: string; apiKey?: string; model?: string; provider?: string } | null>(null);
  const { showToast } = useToast();

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

  // Lees type uit URL bij mount
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl && ['landing', 'categorie', 'product', 'blog', 'social'].includes(typeFromUrl)) {
      setContentType(typeFromUrl);
    }
  }, [searchParams]);

  // Laad tenant config uit localStorage (white-label key per klant)
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

  const handleTypeChange = (type: string) => {
    setContentType(type);
    setResult(null);
    setError(null);
    // Update URL zonder page reload
    router.push(`/?type=${type}`, { scroll: false });
  };

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setContentType(formData.type);

    const notifySlack = async (status: 'success' | 'error', message: string) => {
      try {
        await fetch('/api/notify/slack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            message,
            contentType: formData.type,
            meta: {
              productName: formData.productName,
              category: formData.category,
              topic: formData.topic,
              subject: formData.subject,
            },
          }),
        });
      } catch (err) {
        console.warn('Slack notification failed', err);
      }
    };

    try {
      // Timeout controller voor fetch (3 minuten timeout)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 180000); // 3 minuten

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          organizationId: tenantConfig?.organizationId,
          apiKeyOverride: tenantConfig?.apiKey,
          modelOverride: tenantConfig?.model,
          providerOverride: tenantConfig?.provider,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Probeer JSON te parsen, anders gebruik de status text
        let errorMessage = `Fout ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Als het geen JSON is (bijv. HTML error page), gebruik de status
          const text = await response.text();
          console.error('Non-JSON error response:', text.substring(0, 200));
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Sla data op in sessionStorage en navigeer naar result pagina
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('generatedContent', JSON.stringify(data));
        sessionStorage.setItem('contentType', formData.type);
      }

      // Slack: succesvolle generatie
      await notifySlack('success', 'Nieuwe content gegenereerd');
      router.push(`/result?type=${formData.type}`);
    } catch (err: any) {
      let errorMessage = 'Er is een fout opgetreden bij het genereren van content';
      
      if (err.name === 'AbortError') {
        errorMessage = 'De request duurde te lang (>3 minuten). Dit kan gebeuren bij complexe content. Probeer het opnieuw of gebruik een sneller model.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
      // Slack: foutmelding
      await notifySlack('error', errorMessage);
      console.error('Error:', err);
      setIsLoading(false);
    } finally {
      // Als het geen navigation error was, zorg dat de loader stopt
      setIsLoading(false);
    }
  };


  // Check of er een type in de URL staat - dan dashboard verbergen
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    setShowDashboard(!typeFromUrl);
  }, [searchParams]);

  return (
    <div className="app-layout">
      <Sidebar 
        activeType={showDashboard ? 'dashboard' : contentType} 
        onTypeChange={handleTypeChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {showDashboard ? (
          <DashboardView onStartGenerating={() => setShowDashboard(false)} />
        ) : (
          <>
            <div className="header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1>RankFlow Studio</h1>
                  <p>Genereer SEO-geoptimaliseerde content voor je verhuurbedrijf</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <UserIndicator />
                  <button 
                    onClick={() => setShowDashboard(true)}
                    className="button" 
                    style={{ backgroundColor: '#6c757d' }}
                  >
                    ← Dashboard
                  </button>
                </div>
              </div>
            </div>

            <PresenceBar />

            {error && (
              <div className="error">
                <strong>Fout:</strong> {error}
              </div>
            )}

            <ContentForm onSubmit={handleSubmit} isLoading={isLoading} defaultType={contentType as any} />

            {isLoading && (
              <div className="loading-overlay">
                <div className="loading-popup">
                  <LoadingSpinner size={32} text="Content wordt gegenereerd..." />
                  <div className="loading-progress">
                    <div className="loading-progress-bar" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
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
      <HomeContent />
    </Suspense>
  );
}

