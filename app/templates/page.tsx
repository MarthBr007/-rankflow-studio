'use client';

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CopyButton from '../components/CopyButton';
import UserIndicator from '../components/UserIndicator';
import Breadcrumbs from '../components/Breadcrumbs';
import MobileMenuButton from '../components/MobileMenuButton';
import ThemeToggle from '../components/ThemeToggle';
import { useIsMobile } from '../lib/useMediaQuery';
import { 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter,
  LayoutTemplate,
  FileCode,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

type Template = {
  id: string;
  name: string;
  type: 'landing' | 'product' | 'categorie' | 'blog' | 'social';
  description: string;
  data: any;
};

const templates: Template[] = [
  {
    id: 'landing-classic',
    name: 'Landing – Classic Broers',
    type: 'landing',
    description: 'Hero + scenario + serviceblok + FAQ',
    data: {
      seo: {
        seoTitle: 'Tafelgerei huren in Haarlem – compleet en schoon geleverd',
        metaDescription: 'Huur tafelgerei in Haarlem en omgeving. Schoon geleverd, wij doen de afwas en helpen met aantallen.',
        focusKeyword: 'tafelgerei huren',
        urlSlug: 'tafelgerei-huren-haarlem'
      },
      content: {
        h1: 'Tafelgerei huren in Haarlem',
        intro: 'Voor jouw diner of feest in Haarlem huur je tafelgerei schoon en compleet.',
        inspirationTitle: 'Scenario',
        inspirationText: 'Diner met 20 gasten, compleet ingedekt met borden, glazen en servetten.',
        detailedScenarioTitle: 'Uitgewerkt scenario',
        detailedScenario: 'Van levering tot retour: wij regelen schoon materiaal, jij dekt in 30 minuten.',
        stylingTipsTitle: 'Styling & aantallen',
        stylingTipsText: 'Reken 3 glazen per persoon, 2 extra borden en servetten per gang.',
        adviceTitle: 'Praktisch advies',
        adviceText: 'Combineer wit servies met neutrale tafelkleden en gebruik water- en wijnglas.',
        personalAdviceTitle: 'Persoonlijk advies',
        personalAdviceText: 'Wij denken mee over aantallen en timing; levering in Haarlem en omgeving.',
        benefitsTitle: 'Waarom huren',
        benefits: ['Schoon en direct inzetbaar', 'Wij doen de afwas', 'Hulp bij aantallen'],
      },
      faq: {
        faqTitle: 'Veelgestelde vragen',
        items: [
          { question: 'Leveren jullie in Haarlem?', answer: 'Ja, levering en retour in Haarlem en omgeving.' },
          { question: 'Doen jullie de afwas?', answer: 'Ja, wij nemen de afwas uit handen.' },
        ],
      },
      cta: {
        ctaTitle: 'Vraag aantallen aan',
        ctaText: 'Vertel je setting en aantal gasten, wij berekenen de aantallen en leveren schoon.',
      },
    },
  },
  {
    id: 'product-basic',
    name: 'Product – Statafel Basic',
    type: 'product',
    description: 'Productpagina voor statafel met gebruikssituaties en advies.',
    data: {
      seoTitle: 'Statafel huren in Haarlem – basic en stabiel',
      metaDescription: 'Huur statafels in Haarlem voor borrel of feest. Schoon geleverd, wij doen de afwas.',
      focusKeyword: 'statafel huren',
      title: 'Statafel basic',
      intro: 'Stabiele statafel voor borrel of feest, met schoon tafelblad.',
      benefitsTitle: 'Voordelen',
      benefits: ['Schoon geleverd', 'Stabiel en opklapbaar', 'Combinerend met stretchhoes'],
      idealTitle: 'Ideaal voor',
      idealFor: ['Borrel', 'Tuinfeest', 'Bedrijfsfeest'],
      useCasesTitle: 'Gebruik',
      useCasesText: 'Plaats 1 statafel per 4-5 gasten; combineer met barkrukken.',
      adviceTitle: 'Advies',
      adviceText: 'Gebruik stretchhoes voor nette uitstraling; reken op 6 glazen per tafel.',
      serviceTitle: 'Service',
      serviceText: 'Levering in Haarlem en retourservice beschikbaar.',
      ctaTitle: 'Reserveer statafels',
      ctaText: 'Geef aantal gasten door, wij adviseren aantallen en leveren schoon.',
    },
  },
  {
    id: 'blog-howto',
    name: 'Blog – How-to',
    type: 'blog',
    description: 'How-to blog indeling met stappen en mistakes.',
    data: {
      seoTitle: 'How-to: glaswerk kiezen voor jouw feest in Haarlem',
      metaDescription: 'Glaswerk kiezen voor borrel of diner in Haarlem? Zo pak je het aan.',
      h1: 'Glaswerk huren voor jouw feest in Haarlem',
      intro: 'Kies het juiste glaswerk per drankje en situatie.',
      sections: [
        { title: 'Stap 1: Drankjes bepalen', text: 'Inventariseer wijn, bier, water, fris, cocktails.' },
        { title: 'Stap 2: Aantallen berekenen', text: 'Reken 3 glazen per gast bij diner, 4-5 bij borrel.' },
      ],
      stepsTitle: 'Stappenplan',
      steps: [
        'Bepaal drankjes en aantallen gasten',
        'Kies glas per dranksoort',
        'Plan levering en retour',
      ],
      mistakesTitle: 'Veelgemaakte fouten',
      mistakes: [
        { mistake: 'Te weinig waterglazen', solution: 'Altijd extra waterglazen per tafel plaatsen.' },
        { mistake: 'Geen verschil tussen wijnglazen', solution: 'Gebruik apart glas voor rood/wit voor betere ervaring.' },
      ],
      scenarioBlocksTitle: 'Situaties',
      scenarioBlocks: [
        { scenario: 'Diner thuis', text: 'Gebruik water- en wijnglas; 3 glazen per gast.' },
        { scenario: 'Borrel', text: 'Voeg bier- en frisglazen toe; reken op 4-5 glazen p.p.' },
      ],
      practicalAdviceTitle: 'Praktisch advies',
      practicalAdvice: 'Altijd 10% extra glazen voor breuk en reserve.',
      materialsTitle: 'Materialen',
      materialsList: ['Waterglas', 'Wijnglas', 'Champagneglas', 'Kannen'],
      ctaTitle: 'Vraag glaswerk aan',
      ctaText: 'Geef drankjes en aantal gasten door; wij doen de aantallen en levering.',
    },
  },
];

function downloadJson(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function TemplatesPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [showPreviews, setShowPreviews] = useState<Set<string>>(new Set());

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
      return next;
    });
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

  React.useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) setIsSidebarCollapsed(JSON.parse(saved));
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter(tpl => {
      const matchesSearch = 
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || tpl.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [searchQuery, typeFilter]);

  const toggleExpand = (templateId: string) => {
    setExpandedTemplates(prev => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  };

  const togglePreview = (templateId: string) => {
    setShowPreviews(prev => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  };

  const renderTemplatePreview = (tpl: Template) => {
    const data = tpl.data;
    const showPreview = showPreviews.has(tpl.id);

    if (!showPreview) return null;

    if (tpl.type === 'landing') {
      const content = data.content || data;
      const seo = data.seo || data;
      return (
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--color-bg-panel)',
          borderTop: '1px solid var(--color-border)',
          maxHeight: '600px',
          overflow: 'auto'
        }}>
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text)' }}>
              {content.h1 || seo.seoTitle || 'Landingspagina Titel'}
            </h1>
            {content.intro && (
              <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {content.intro}
              </p>
            )}
            {content.benefits && content.benefits.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                  {content.benefitsTitle || 'Voordelen'}
                </h2>
                <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {content.benefits.map((benefit: string, index: number) => (
                    <li key={index} style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.faq && data.faq.items && data.faq.items.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                  {data.faq.faqTitle || 'Veelgestelde vragen'}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.faq.items.slice(0, 2).map((item: any, index: number) => (
                    <div key={index} style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: '#111827' }}>
                        {item.question}
                      </h3>
                      <p style={{ fontSize: '0.9375rem', color: '#374151', margin: 0 }}>
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.cta && data.cta.ctaText && (
              <div style={{ 
                padding: '1.5rem', 
                background: 'linear-gradient(135deg, #005BBB 0%, #0A6BE5 100%)', 
                borderRadius: '8px',
                textAlign: 'center',
                color: '#fff'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {data.cta.ctaTitle || 'Call to Action'}
                </h3>
                <p style={{ fontSize: '1rem', margin: 0, opacity: 0.95 }}>
                  {data.cta.ctaText}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (tpl.type === 'blog') {
      return (
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--color-bg-panel)',
          borderTop: '1px solid var(--color-border)',
          maxHeight: '600px',
          overflow: 'auto'
        }}>
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text)' }}>
              {data.h1 || data.seoTitle || 'Blog Titel'}
            </h1>
            {data.intro && (
              <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {data.intro}
              </p>
            )}
            {data.sections && data.sections.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {data.sections.slice(0, 2).map((section: any, index: number) => (
                  <div key={index}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                      {section.title}
                    </h2>
                    <p style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.6 }}>
                      {section.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {data.steps && data.steps.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                  {data.stepsTitle || 'Stappenplan'}
                </h2>
                <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {data.steps.slice(0, 3).map((step: string, index: number) => (
                    <li key={index} style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (tpl.type === 'product') {
      return (
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--color-bg-panel)',
          borderTop: '1px solid var(--color-border)',
          maxHeight: '600px',
          overflow: 'auto'
        }}>
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text)' }}>
              {data.title || data.seoTitle || 'Product Titel'}
            </h1>
            {data.intro && (
              <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {data.intro}
              </p>
            )}
            {data.benefits && data.benefits.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                  {data.benefitsTitle || 'Voordelen'}
                </h2>
                <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {data.benefits.map((benefit: string, index: number) => (
                    <li key={index} style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.idealFor && data.idealFor.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                  {data.idealTitle || 'Ideaal voor'}
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {data.idealFor.map((item: string, index: number) => (
                    <span key={index} style={{ 
                      padding: '0.5rem 1rem', 
                      background: 'var(--color-info-bg)', 
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem',
                      color: 'var(--color-primary)',
                      fontWeight: 500
                    }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.ctaText && (
              <div style={{ 
                padding: '1.5rem', 
                background: 'linear-gradient(135deg, #005BBB 0%, #0A6BE5 100%)', 
                borderRadius: '8px',
                textAlign: 'center',
                color: '#fff'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {data.ctaTitle || 'Call to Action'}
                </h3>
                <p style={{ fontSize: '1rem', margin: 0, opacity: 0.95 }}>
                  {data.ctaText}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      landing: '#3b82f6',
      product: '#10b981',
      categorie: '#f59e0b',
      blog: '#8b5cf6',
      social: '#ec4899',
    };
    return colors[type] || '#6b7280';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      landing: 'Landingspagina',
      product: 'Product',
      categorie: 'Categorie',
      blog: 'Blog',
      social: 'Social Media',
    };
    return labels[type] || type;
  };

  return (
    <div className={`app-layout ${isMobileMenuOpen && isMobile ? 'mobile-sidebar-open' : ''}`}>
      {isMobile && isMobileMenuOpen && (
        <div 
          className="sidebar-overlay active"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <Sidebar
        activeType="templates"
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

        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <LayoutTemplate size={28} style={{ color: 'var(--color-primary)' }} />
              <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Templates Library
              </h1>
            </div>
            <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0 }}>
              Vooraf gedefinieerde contenttemplates per type. Kopieer of download JSON voor gebruik in je content generator.
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '2rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <Search size={18} style={{ 
                position: 'absolute', 
                left: '0.875rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} />
              <input
                type="text"
                placeholder="Zoek templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 91, 187, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} style={{ color: '#6b7280' }} />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 91, 187, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">Alle types</option>
                <option value="landing">Landingspagina</option>
                <option value="product">Product</option>
                <option value="categorie">Categorie</option>
                <option value="blog">Blog</option>
                <option value="social">Social Media</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          {filteredTemplates.length > 0 && (
            <div style={{ 
              marginBottom: '1.5rem', 
              color: '#6b7280', 
              fontSize: '0.875rem' 
            }}>
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} gevonden
            </div>
          )}

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <FileText size={48} style={{ color: '#d1d5db', marginBottom: '1rem' }} />
              <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Geen templates gevonden</h3>
              <p style={{ color: '#6b7280' }}>
                Probeer een andere zoekterm of filter.
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredTemplates.map((tpl) => {
                const isExpanded = expandedTemplates.has(tpl.id);
                const typeColor = getTypeColor(tpl.type);
                
                return (
                  <div 
                    key={tpl.id} 
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Card Header */}
                    <div style={{
                      padding: '1.5rem',
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: '#fafafa'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.25rem 0.625rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: `${typeColor}15`,
                              color: typeColor,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              {getTypeLabel(tpl.type)}
                            </span>
                          </div>
                          <h3 style={{ 
                            fontSize: '1.125rem', 
                            fontWeight: 600, 
                            color: '#111827',
                            margin: 0,
                            marginBottom: '0.25rem'
                          }}>
                            {tpl.name}
                          </h3>
                          <p style={{ 
                            color: '#6b7280', 
                            fontSize: '0.875rem',
                            margin: 0,
                            lineHeight: 1.5
                          }}>
                            {tpl.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <CopyButton text={JSON.stringify(tpl.data, null, 2)} />
                        <button
                          onClick={() => downloadJson(tpl.data, `${tpl.id}.json`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#374151',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                          }}
                        >
                          <Download size={16} />
                          Download JSON
                        </button>
                        <button
                          onClick={() => togglePreview(tpl.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: showPreviews.has(tpl.id) ? '#f0f8ff' : 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: showPreviews.has(tpl.id) ? '#005BBB' : '#374151',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f8ff';
                            e.currentTarget.style.borderColor = '#005BBB';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = showPreviews.has(tpl.id) ? '#f0f8ff' : 'white';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                          }}
                        >
                          {showPreviews.has(tpl.id) ? (
                            <>
                              <EyeOff size={16} />
                              Verberg Preview
                            </>
                          ) : (
                            <>
                              <Eye size={16} />
                              Toon Preview
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => toggleExpand(tpl.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#374151',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                          }}
                        >
                          <FileCode size={16} />
                          {isExpanded ? (
                            <>
                              <ChevronUp size={16} />
                              Verberg JSON
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              Toon JSON
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Content Preview */}
                    {renderTemplatePreview(tpl)}

                    {/* JSON Preview (Collapsible) */}
                    {isExpanded && (
                      <div style={{
                        padding: '1.5rem',
                        backgroundColor: '#f9fafb',
                        borderTop: '1px solid #e5e7eb',
                        maxHeight: '500px',
                        overflow: 'auto'
                      }}>
                        <pre style={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          margin: 0,
                          fontSize: '0.8125rem',
                          lineHeight: 1.6,
                          color: '#374151',
                          fontFamily: 'Monaco, "Courier New", monospace',
                          backgroundColor: 'white',
                          padding: '1rem',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}>
                          {JSON.stringify(tpl.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

