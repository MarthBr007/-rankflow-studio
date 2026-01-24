'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import ContentResult from '../components/ContentResult';
import { useToast } from '../components/ToastContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import { Save, Calendar, ArrowLeft, Download, FileText, Code, Sparkles } from 'lucide-react';
import UserIndicator from '../components/UserIndicator';
import Breadcrumbs from '../components/Breadcrumbs';
import MobileMenuButton from '../components/MobileMenuButton';
import ThemeToggle from '../components/ThemeToggle';
import { useIsMobile } from '../lib/useMediaQuery';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tenantConfig, setTenantConfig] = useState<{ organizationId?: string; apiKey?: string; model?: string; provider?: string } | null>(null);
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const [selfCheck, setSelfCheck] = useState<string[]>([]);
  const [linkSuggestions, setLinkSuggestions] = useState<Array<{ title: string; url: string; source: string }>>([]);
  const [linkFilter, setLinkFilter] = useState('');
  const [sitemapUrl, setSitemapUrl] = useState('');

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

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const res = await fetch('/api/internal-links');
        if (res.ok) {
          const data = await res.json();
          setLinkSuggestions(data);
        }
      } catch (e) {
        console.warn('Kon interne links niet laden', e);
      }
    };
    loadLinks();
  }, []);

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

  const handleSaveToPlanner = async () => {
    if (!result || contentType !== 'social') return;
    setIsSaving(true);
    try {
      const socialData = result as any;
      
      // Maak posts aan voor elk platform/type
      const postsToCreate = [];
      
      // Get imageId from result metadata if available
      const imageId = (result as any).imageId || (result as any).selectedImageId || null;
      const imageUrl = (result as any).imageUrl || null;

      // Instagram Carousel
      if (socialData.carousel) {
        postsToCreate.push({
          platform: 'instagram',
          contentType: 'carousel',
          title: socialData.topic || 'Instagram Carousel',
          content: {
            carousel: socialData.carousel,
          },
          hashtags: socialData.carousel.hashtags ? socialData.carousel.hashtags.split(' ') : [],
          imageId: imageId,
          imageUrl: imageUrl,
          status: 'draft',
        });
      }
      
      // Instagram Reel
      if (socialData.reel) {
        postsToCreate.push({
          platform: 'instagram',
          contentType: 'reel',
          title: socialData.topic || 'Instagram Reel',
          content: {
            reel: socialData.reel,
          },
          hashtags: socialData.reel.hashtags ? socialData.reel.hashtags.split(' ') : [],
          imageId: imageId,
          imageUrl: imageUrl,
          status: 'draft',
        });
      }
      
      // LinkedIn Post
      if (socialData.linkedin) {
        postsToCreate.push({
          platform: 'linkedin',
          contentType: 'linkedin_post',
          title: socialData.topic || 'LinkedIn Post',
          content: {
            linkedin: socialData.linkedin,
          },
          hashtags: socialData.linkedin.hashtags ? socialData.linkedin.hashtags.split(' ') : [],
          imageId: imageId,
          imageUrl: imageUrl,
          status: 'draft',
        });
      }
      
      // Story
      if (socialData.story) {
        postsToCreate.push({
          platform: 'instagram',
          contentType: 'story',
          title: socialData.topic || 'Instagram Story',
          content: {
            story: socialData.story,
          },
          imageId: imageId,
          imageUrl: imageUrl,
          status: 'draft',
        });
      }

      // Maak alle posts aan
      const promises = postsToCreate.map(post => 
        fetch('/api/social-posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...post,
            organizationId: tenantConfig?.organizationId || null,
          }),
        })
      );

      await Promise.all(promises);
      showToast(`${postsToCreate.length} post(s) opgeslagen in planner`, 'success');
    } catch (err: any) {
      showToast('Fout bij opslaan in planner: ' + (err.message || 'Onbekende fout'), 'error');
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
    const ogTitle = result.ogTitle || result.seo?.ogTitle || title;
    if ((ogTitle || '').length > 80) warnings.push('OG title is lang (>80 tekens).');
    const ogDesc = result.ogDescription || result.seo?.ogDescription || meta;
    if (!ogDesc) warnings.push('OG description ontbreekt.');
    const ogImage = result.ogImage || result.seo?.ogImage;
    if (!ogImage) warnings.push('OG image ontbreekt (bijv. 1200x630).');
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
      <div className={`app-layout ${isMobileMenuOpen && isMobile ? 'mobile-sidebar-open' : ''}`}>
        {isMobile && isMobileMenuOpen && (
          <div 
            className="sidebar-overlay active"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <Sidebar 
          activeType={contentType} 
          onTypeChange={() => {}}
          isCollapsed={isMobile ? false : isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          className={isMobile && isMobileMenuOpen ? 'mobile-open' : ''}
        />
        <div className={`main-content ${isSidebarCollapsed && !isMobile ? 'sidebar-collapsed' : ''}`}>
          <div className="loading">
            <p>Resultaat wordt geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className={`app-layout ${isMobileMenuOpen && isMobile ? 'mobile-sidebar-open' : ''}`}>
        {isMobile && isMobileMenuOpen && (
          <div 
            className="sidebar-overlay active"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <Sidebar 
          activeType={contentType} 
          onTypeChange={() => {}}
          isCollapsed={isMobile ? false : isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          className={isMobile && isMobileMenuOpen ? 'mobile-open' : ''}
        />
        <div className={`main-content ${isSidebarCollapsed && !isMobile ? 'sidebar-collapsed' : ''}`}>
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
        {/* Modern Header */}
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

        {/* Page Content */}
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Sparkles size={28} style={{ color: 'var(--color-primary)' }} />
              <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Gegenereerde Content
              </h1>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', margin: 0 }}>
              {contentType === 'landing' && 'Landingspagina'}
              {contentType === 'categorie' && 'Categoriepagina'}
              {contentType === 'product' && 'Productpagina'}
              {contentType === 'blog' && 'Blog artikel'}
              {contentType === 'social' && 'Social Media Posts'}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '0.75rem', 
            flexWrap: 'wrap',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            {contentType === 'social' && (
              <button
                onClick={handleSaveToPlanner}
                disabled={isSaving}
                className="button"
                type="button"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Calendar size={18} />
                Opslaan in Planner
              </button>
            )}
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
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Code size={18} />
              Download JSON
            </button>
            <button
              onClick={downloadMarkdown}
              className="button button-secondary"
              type="button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FileText size={18} />
              Download MD
            </button>
            {contentType !== 'social' && (
              <>
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
                      const r = await res.json();
                      showToast(r.link ? `WordPress draft aangemaakt: ${r.link}` : 'WordPress export gelukt', 'success');
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
                      const r = await res.json();
                      showToast(r.id ? `Webflow draft aangemaakt (id ${r.id})` : 'Webflow export gelukt', 'success');
                    } catch (e: any) {
                      showToast(e.message || 'Fout bij Webflow export', 'error');
                    }
                  }}
                  className="button button-secondary"
                  type="button"
                >
                  Export Webflow
                </button>
              </>
            )}
            <button
              onClick={() => handleSave()}
              disabled={isSaving}
              className="button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={18} />
              {isSaving ? 'Opslaan...' : 'Opslaan'}
            </button>
            <Link href="/" className="button button-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={18} />
              Nieuw genereren
            </Link>
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
            <div style={{
              padding: '1rem 1.5rem',
              backgroundColor: 'var(--color-bg-panel)',
              border: '1px solid var(--color-warning)',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>Self-check aandachtspunten:</strong>
                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', color: 'var(--color-text)' }}>
                  {selfCheck.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Content Result */}
          <ContentResult
            type={contentType}
            editedResult={result}
            onRefine={handleRefine}
            isRefining={isRefining}
          />

          {/* SEO & OG previews - alleen voor niet-social content */}
          {contentType !== 'social' && (
            <div className="settings-card" style={{ marginTop: '2rem' }}>
              <div className="settings-card-header">
                <div className="settings-card-title">
                  <h2>SEO & Social Preview</h2>
                </div>
              </div>
              <div className="settings-card-body">
                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                  <div style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '12px', background: 'var(--color-bg-panel)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>SERP Preview</h3>
                    <div style={{ fontSize: '0.95rem', color: '#202124', lineHeight: 1.4 }}>
                      <div style={{ color: '#1a0dab', fontSize: '1.05rem', marginBottom: '0.2rem', fontWeight: 500 }}>
                        {result.seoTitle || result.seo?.seoTitle || result.title || buildTitle()}
                      </div>
                      <div style={{ color: '#006621', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                        broersverhuur.nl/{result.urlSlug || result.seo?.urlSlug || 'example'}
                      </div>
                      <div style={{ color: '#4d5156', fontSize: '0.9rem' }}>
                        {result.metaDescription || result.seo?.metaDescription || 'Meta description voorbeeld'}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '12px', background: 'var(--color-bg-panel)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>Social / OG Preview</h3>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--color-bg-light)', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        {result.ogImage || result.seo?.ogImage ? 'OG Image' : 'OG Image (1200x630) ontbreekt'}
                      </div>
                      <div style={{ padding: '0.85rem', background: '#fff' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem', color: '#111827' }}>
                          {result.ogTitle || result.seo?.ogTitle || result.seoTitle || buildTitle()}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                          {result.ogDescription || result.seo?.ogDescription || result.metaDescription || 'OG description voorbeeld'}
                        </div>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                          broersverhuur.nl/{result.urlSlug || result.seo?.urlSlug || 'example'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interne link suggesties - alleen voor niet-social content */}
          {contentType !== 'social' && (
            <div className="settings-card" style={{ marginTop: '2rem' }}>
          <div className="prompt-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <h2>Interne link suggesties</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Filter op titel/url"
                value={linkFilter}
                onChange={(e) => setLinkFilter(e.target.value)}
                className="search-input"
                style={{ maxWidth: '240px', paddingLeft: '0.75rem' }}
              />
              <input
                type="text"
                placeholder="Optioneel: sitemap URL"
                value={sitemapUrl}
                onChange={(e) => setSitemapUrl(e.target.value)}
                className="search-input"
                style={{ maxWidth: '320px', paddingLeft: '0.75rem' }}
              />
              <button
                className="button button-secondary"
                onClick={async () => {
                  try {
                    const url = sitemapUrl.trim();
                    const res = await fetch(`/api/internal-links${url ? `?sitemapUrl=${encodeURIComponent(url)}` : ''}`);
                    if (res.ok) {
                      const data = await res.json();
                      setLinkSuggestions(data);
                      showToast('Sitemap geladen', 'success');
                    } else {
                      showToast('Sitemap laden mislukt', 'error');
                    }
                  } catch (e: any) {
                    showToast(e.message || 'Sitemap laden mislukt', 'error');
                  }
                }}
              >
                Laden
              </button>
            </div>
          </div>
          <div className="prompt-content" style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            {linkSuggestions
              .filter((l) => {
                if (!linkFilter) return true;
                const q = linkFilter.toLowerCase();
                return l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q);
              })
              .map((l, idx) => (
                <div key={idx} style={{ border: '1px solid var(--color-border)', borderRadius: '10px', padding: '0.85rem', background: 'var(--color-bg-panel)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{l.title}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-primary)', wordBreak: 'break-all' }}>{l.url}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <span>{l.source === 'sitemap' ? 'Sitemap' : 'Library'}</span>
                    <button
                      className="button button-secondary"
                      onClick={() => navigator.clipboard.writeText(l.url)}
                      type="button"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      Kopieer
                    </button>
                  </div>
                </div>
              ))}
              {linkSuggestions.length === 0 && (
                <div style={{ color: 'var(--color-text-muted)' }}>Geen suggesties gevonden.</div>
              )}
            </div>
          </div>
          )}
        </div>

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

