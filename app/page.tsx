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
import Breadcrumbs from './components/Breadcrumbs';
import ThemeToggle from './components/ThemeToggle';
import MobileMenuButton from './components/MobileMenuButton';
import { useIsMobile } from './lib/useMediaQuery';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [contentType, setContentType] = useState<string>('landing');
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [tenantConfig, setTenantConfig] = useState<{ organizationId?: string; apiKey?: string; model?: string; provider?: string } | null>(null);
  const { showToast } = useToast();
  const isMobile = useIsMobile();

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

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
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

  // Laad beschikbare tenants voor selector
  const [availableTenants, setAvailableTenants] = useState<Array<{ tenantId: string; providers: Array<{ provider: string; model: string }> }>>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);

  useEffect(() => {
    const loadTenants = async () => {
      setIsLoadingTenants(true);
      try {
        const res = await fetch('/api/tenant-config?list=true');
        if (res.ok) {
          const data = await res.json();
          setAvailableTenants(data.tenants || []);
        }
      } catch (e) {
        console.error('Fout bij laden tenants:', e);
      } finally {
        setIsLoadingTenants(false);
      }
    };
    loadTenants();
  }, []);

  const handleTenantChange = async (tenantId: string) => {
    if (!tenantId || tenantId === 'none') {
      localStorage.removeItem('rankflow-tenant-config');
      setTenantConfig(null);
      return;
    }

    // Laad de eerste provider configuratie van deze tenant
    const tenant = availableTenants.find(t => t.tenantId === tenantId);
    if (tenant && tenant.providers.length > 0) {
      const firstProvider = tenant.providers[0];
      try {
        const res = await fetch(`/api/tenant-config?tenantId=${tenantId}&provider=${firstProvider.provider}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            const config = {
              organizationId: data.tenantId,
              model: data.model,
              provider: data.provider,
            };
            localStorage.setItem('rankflow-tenant-config', JSON.stringify(config));
            setTenantConfig(config);
            showToast(`Tenant "${tenantId}" geselecteerd`, 'success');
          }
        }
      } catch (e) {
        console.error('Fout bij laden tenant config:', e);
        showToast('Fout bij laden tenant configuratie', 'error');
      }
    }
  };

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

    const notifySlack = async (status: 'success' | 'error', message: string, contentData?: any) => {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        const resultUrl = contentData ? `${appUrl}/result?type=${formData.type}` : undefined;

        const res = await fetch('/api/notify/slack', {
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
              resultUrl,
            },
            content: contentData, // Volledige content data
          }),
        });
        if (!res.ok) {
          console.warn('Slack notification failed with status', res.status);
          showToast('Slack melding faalde', 'warning');
        }
      } catch (err) {
        console.warn('Slack notification failed', err);
        showToast('Slack melding faalde', 'warning');
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

      // Slack: succesvolle generatie met volledige content
      await notifySlack('success', 'Nieuwe content gegenereerd', data);
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
    <div className={`app-layout ${isMobileMenuOpen && isMobile ? 'mobile-sidebar-open' : ''}`}>
      {isMobile && isMobileMenuOpen && (
        <div 
          className="sidebar-overlay active"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <Sidebar 
        activeType={showDashboard ? 'dashboard' : contentType} 
        onTypeChange={handleTypeChange}
        isCollapsed={isMobile ? false : isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        className={isMobile && isMobileMenuOpen ? 'mobile-open' : ''}
      />
      <div className={`main-content ${isSidebarCollapsed && !isMobile ? 'sidebar-collapsed' : ''}`}>
        {/* Header - altijd zichtbaar */}
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
              {/* Tenant Selector - alleen bij content form */}
              {!showDashboard && availableTenants.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label htmlFor="tenant-select" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    Tenant:
                  </label>
                  <select
                    id="tenant-select"
                    value={tenantConfig?.organizationId || 'none'}
                    onChange={(e) => handleTenantChange(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.875rem',
                      backgroundColor: 'var(--color-bg-panel)',
                      color: 'var(--color-text)',
                    }}
                  >
                    <option value="none">Standaard (geen tenant)</option>
                    {availableTenants.map((tenant) => (
                      <option key={tenant.tenantId} value={tenant.tenantId}>
                        {tenant.tenantId} ({tenant.providers.map(p => `${p.provider}/${p.model}`).join(', ')})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <ThemeToggle />
              <UserIndicator />
            </div>
          </div>
        </div>

        {showDashboard ? (
          <DashboardView onStartGenerating={() => setShowDashboard(false)} />
        ) : (
          <>

            <PresenceBar />

            {error && (
              <div className="error">
                <strong>Fout:</strong> {error}
              </div>
            )}

            <ContentForm 
              onSubmit={handleSubmit} 
              isLoading={isLoading} 
              defaultType={contentType as any}
              organizationId={tenantConfig?.organizationId || null}
            />

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

