'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CopyButton from '../components/CopyButton';
import { useToast } from '../components/ToastContainer';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('ai-config');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEditingSeoRules, setIsEditingSeoRules] = useState(false);
  const [seoRulesText, setSeoRulesText] = useState('');

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
  
  // AI Config state
  const [aiConfig, setAiConfig] = useState({
    apiKey: '',
    model: 'gpt-4o-mini',
    provider: 'openai',
  });
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const { showToast } = useToast();
  
  // Tenant / white-label configuratie (client-side opslag)
  type TenantConfig = {
    organizationId: string;
    apiKey: string;
    model: string;
    provider: string;
  };
  const [tenantConfig, setTenantConfig] = useState<TenantConfig>({
    organizationId: '',
    apiKey: '',
    model: 'gpt-4o-mini',
    provider: 'openai',
  });
  const [hasTenantKey, setHasTenantKey] = useState(false);
  const [isSavingTenant, setIsSavingTenant] = useState(false);
  
  // Default prompts (fallback als er geen custom prompts zijn)
  const defaultBaseInstruction = `Jij schrijft SEO- en contentteksten voor Broers Verhuur, een verhuurbedrijf voor evenementen en horeca.

DEZE SCHRIJFSTIJL IS VERPLICHT EN STAAT ALTIJD BOVEN ALLE ANDERE INSTRUCTIES.
Als iets niet door deze stijlregels wordt toegestaan, mag je het niet gebruiken in de tekst.

Gebruik altijd deze schrijfstijl en tone of voice:
- Schrijf in praktische en hedendaagse taal in de jij-vorm
- Gebruik korte, duidelijke en directe zinnen
- Combineer altijd informatie + advies + inspiratie in één tekst
- Gebruik voorbeelden, situaties, locaties en scenario's zoals: thuis, tuinfeest, diner, kerst, feestdagen, kantoor, catering, borrel
- Schrijf oplossingsgericht en altijd vanuit de klant: jij huurt, wij regelen, we helpen mee
- Gebruik deze elementen regelmatig: tips, uitleg, keuzes, stappen, scenario's, combinaties, materialen
- Beschrijf concrete producten en materialen: servies, glazen, tafelkleden, bar, bloemstuk, verlichting, statafels, koelingen
- Vermijd marketingwoorden en superlatieven zoals: premium, ultiem, beste, unieke beleving, luxe ervaring, topkwaliteit
- Gebruik servicegerichte woorden: makkelijk, zonder gedoe, direct, wij regelen, combineren
- De toon is vriendelijk, behulpzaam en inspirerend, niet verkoperig
- Gebruik altijd regio's: Haarlem en de ingevulde extra regio's
- Gebruik waar passend advies in stappen: hoe werkt het, hoe pak je het aan, hoe combineer je materialen, styling ideeën
- Schrijf altijd vanuit beleving en ervaringen: diner, feest, aankleding, sfeer, setting, momenten, tafels, gasten
- gebruik geen streepjes in de uiteindelijke tekst`;

  const [prompts, setPrompts] = useState<Record<string, string>>({
    base: defaultBaseInstruction,
    landing: '',
    categorie: '',
    product: '',
    blog: '',
    social: '',
  });

  // Default SEO rules text
  const defaultSeoRulesText = `✅ RankFlow Studio – SEO-regels (geoptimaliseerd)

Deze regels worden automatisch toegepast tijdens genereren én verbeteren van content. Ze combineren best practices van RankMath Pro, Google, Yoast en Semrush.

1. Page Title (SEO Title)

Vereisten
- Maximaal 60 tekens
- MOET bevatten:
  - focus keyword
  - power word
  - getal of concrete claim (3 tips, compleet, eenvoudig, checklist)
  - regio (Haarlem verplicht)

Aanbevolen power words
- eenvoudig, compleet, direct, snel, checklist, gids, voorbeeld, inspiratie

Voorbeelden
- Servies huren in Haarlem – 5 handige tips eenvoudig geregeld
- Glaswerk huren in Haarlem – snel en zonder gedoe

2. Meta Description

Vereisten
- Max 155 tekens
- Bevat:
  - focus keyword
  - voordeel + actie
  - alle 3 regio's (Haarlem + 2 andere)
  - service belofte

Voorbeeld:
Huur glaswerk in Haarlem, Hoofddorp en Amsterdam. Wij regelen materiaal en styling. Reserveer direct.

Extra kwaliteitseisen
- Geen aanhalingstekens
- Geen streepjes
- Geen overdreven marketingtaal

3. Focus Keyword

Format:
- {onderwerp} huren

Voorbeelden:
- statafels huren
- servies huren
- glaswerk huren

Moet verplicht voorkomen in:
- SEO Title
- Meta description
- URL slug
- H1
- Intro alinea
- Minimaal 1 subheading
- CTA
- Minimaal 3 image alt teksten

Keyword density (Google update aligned)
- Minimaal 6 vermeldingen in de volledige tekst
- Natuurlijk verwerkt

4. Secondary Keywords

Vereisten
- Minimaal 9 secondary keywords
- Natuurlijk geïnjecteerd in tekst
- Altijd long-tail
- Geen dubbele varianten

Categorieën:
- locatie: Haarlem, Amsterdam, Hoofddorp
- scenario's
- materiaal
- evenement
- huren

Voorbeelden:
- tafelsetting huren
- glaswerk huren Amsterdam
- feestmateriaal zonder gedoe

5. URL Slug

Format:
- {onderwerp}-huren-haarlem

Regels:
- altijd lowercase
- altijd verbindingsstreepjes
- geen stopwoorden
- geen speciale tekens

6. Content Structuur

Headings:
- H1 bevat focus keyword
- H2's bevatten long-tail en scenario's

Scoring (RankMath style)
De content moet minimaal bevatten:
- 1 volledig scenario
- 1 storytelling scene
- 1 CTA
- 1 advies of tips block
- 5 FAQ's

Regio's:
- Haarlem + Region1 + Region2
- Minimaal 2 keer in de lopende tekst

7. Internal Links

4–6 interne links verplicht.

Regels:
- relevant
- niet commercieel van toon
- anchors zoals:
  - Bekijk glaswerk
  - Meer over servies

Nooit:
- klik hier
- beste deal
- goedkoop huren

8. External Links

Minimaal 1 externe bron.
Toegestane domeintypes:
- .nl, .gov, .edu, .org, branche websites

Voorbeeld:
- Wikipedia
- Gemeente website
- KHN
- Wedding planners

Dit verhoogt EEAT.

9. Image SEO

Altijd minimaal 4-6 afbeeldingen:

Alt text regels:
- bevat scenario
- bevat regio
- bevat het topic
- Geen streepjes, geen marketingwoorden.

10. Quality signals (Google EEAT compliant)

Content moet automatisch voldoen aan:
- Expertise: concrete materialen, aantallen, hoeveelheden
- Experience: realistisch scenario
- Authority: professioneel advies
- Trustworthiness: service beloftes

De AI voegt automatisch toe:
- "wij leveren alles schoon en klaar voor gebruik"
- "wij doen de afwas"
- "wij denken mee over aantallen"
- "wij regelen levering en retour"

11. Duplicate content protection

De applicatie:
- herschrijft automatisch te korte of dubbele zinnen
- voegt variaties toe voor SEO
- voorkomt herhaling

12. Add-ons (automatisch toegepast)

✔ Keyword clustering volgens Google HCU
✔ Humanized writing
✔ Semantische variatie
✔ NLP terms (entity SEO)
✔ Scenario injectie
✔ Regio injectie
✔ CTA injectie
✔ Internal linking generator
✔ Image ALT optimizer`;

  // Laad prompts en config bij mount
  useEffect(() => {
    loadPrompts();
    loadConfig();
    loadSeoRules();
  }, []);

  // Laad tenant config (client-side) bij mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('rankflow-tenant-config');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TenantConfig;
        setTenantConfig({
          organizationId: parsed.organizationId || '',
          apiKey: parsed.apiKey || '',
          model: parsed.model || 'gpt-4o-mini',
          provider: parsed.provider || 'openai',
        });
        setHasTenantKey(!!parsed.apiKey);
      } catch (e) {
        console.error('Fout bij laden tenant config:', e);
      }
    }
  }, []);

  const loadSeoRules = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('seoRules');
      if (saved) {
        setSeoRulesText(saved);
      } else {
        setSeoRulesText(defaultSeoRulesText);
      }
    }
  };

  const saveSeoRules = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('seoRules', seoRulesText);
      }
      showToast('SEO-regels succesvol opgeslagen!', 'success');
      setIsEditingSeoRules(false);
      setSaveMessage(null);
    } catch (error: any) {
      const errorMsg = `Fout: ${error.message}`;
      setSaveMessage(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const loadPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      const data = await response.json();
      if (data.prompts) {
        // Gebruik opgeslagen prompts, vul lege velden aan met defaults
        const merged = {
          base: data.prompts.base || defaultBaseInstruction,
          landing: data.prompts.landing || data.defaults?.landing || '',
          categorie: data.prompts.categorie || data.defaults?.categorie || '',
          product: data.prompts.product || data.defaults?.product || '',
          blog: data.prompts.blog || data.defaults?.blog || '',
          social: data.prompts.social || data.defaults?.social || '',
        };
        setPrompts(merged);
      } else if (data.defaults) {
        // Geen opgeslagen prompts, gebruik defaults
        setPrompts({
          base: data.defaults.base || defaultBaseInstruction,
          landing: data.defaults.landing || '',
          categorie: data.defaults.categorie || '',
          product: data.defaults.product || '',
          blog: data.defaults.blog || '',
          social: data.defaults.social || '',
        });
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
    }
  };

  const savePrompts = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompts }),
      });

      if (!response.ok) {
        throw new Error('Fout bij het opslaan');
      }

      showToast('Prompts succesvol opgeslagen!', 'success');
      setIsEditing(false);
      setSaveMessage(null);
    } catch (error: any) {
      const errorMsg = `Fout: ${error.message}`;
      setSaveMessage(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getFullPrompt = (tab: string) => {
    if (tab === 'base') {
      return prompts.base || defaultBaseInstruction;
    }
    if (tab === 'landing' || tab === 'categorie' || tab === 'product') {
      return `${prompts.base || defaultBaseInstruction}\n\n${prompts[tab] || ''}`;
    }
    return prompts[tab] || '';
  };

  const getCurrentPrompt = (tab: string) => {
    if (tab === 'base') {
      return prompts.base || defaultBaseInstruction;
    }
    return prompts[tab] || '';
  };

  const updatePrompt = (tab: string, value: string) => {
    setPrompts(prev => ({ ...prev, [tab]: value }));
  };

  // Laad AI configuratie
  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      // API key wordt altijd leeg geladen (veiligheid), maar we weten of er een is via apiKeyLength
      setAiConfig({
        apiKey: '', // Laad niet de echte key (veiligheid)
        model: data.model || 'gpt-4o-mini',
        provider: data.provider || 'openai',
      });
      setHasApiKey(!!data.apiKeyLength);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  // Sla AI configuratie op
  const saveConfig = async () => {
    setIsSavingConfig(true);
    setSaveMessage(null);
    
    try {
      // Stuur alleen API key mee als deze is ingevuld
      const payload: any = {
        model: aiConfig.model,
        provider: aiConfig.provider,
      };
      
      // Voeg alleen API key toe als deze is ingevuld
      if (aiConfig.apiKey && aiConfig.apiKey.trim() !== '') {
        payload.apiKey = aiConfig.apiKey;
      }
      
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fout bij het opslaan');
      }

      showToast('AI configuratie succesvol opgeslagen!', 'success');
      setIsEditingConfig(false);
      setSaveMessage(null);
      // Reset API key veld na opslaan
      setAiConfig(prev => ({ ...prev, apiKey: '' }));
      await loadConfig(); // Herlaad om status te updaten
    } catch (error: any) {
      const errorMsg = `Fout: ${error.message}`;
      setSaveMessage(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Opslaan tenant-config (client-side, white-label gebruik)
  const saveTenantConfig = () => {
    setIsSavingTenant(true);
    try {
      const cleaned = {
        organizationId: tenantConfig.organizationId.trim(),
        apiKey: tenantConfig.apiKey.trim(),
        model: (tenantConfig.model || 'gpt-4o-mini').trim(),
        provider: (tenantConfig.provider || 'openai').trim(),
      };
      localStorage.setItem('rankflow-tenant-config', JSON.stringify(cleaned));
      setTenantConfig(cleaned);
      setHasTenantKey(!!cleaned.apiKey);
      showToast('Tenant key opgeslagen (client-side)', 'success');
    } catch (error) {
      console.error('Fout bij opslaan tenant config:', error);
      showToast('Fout bij opslaan tenant config', 'error');
    } finally {
      setIsSavingTenant(false);
    }
  };

  const clearTenantConfig = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rankflow-tenant-config');
    }
    setTenantConfig({
      organizationId: '',
      apiKey: '',
      model: 'gpt-4o-mini',
      provider: 'openai',
    });
    setHasTenantKey(false);
    showToast('Tenant key verwijderd', 'success');
  };

  return (
    <div className="app-layout">
      <Sidebar 
        activeType="settings" 
        onTypeChange={() => {}}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="header">
          <h1>Instellingen - Prompts & SEO-regels</h1>
          <p>Beheer AI-configuratie, schrijfprompts en bekijk de belangrijkste RankFlow / RankMath SEO-regels.</p>
        </div>

        {saveMessage && (
          <div className={`message ${saveMessage.includes('Fout') ? 'error' : 'success'}`}>
            {saveMessage}
          </div>
        )}

        <div className="settings-container">
          <div className="settings-tabs">
            <button
              className={`settings-tab ${activeTab === 'ai-config' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai-config')}
            >
              AI Configuratie
            </button>
            <button
              className={`settings-tab ${activeTab === 'base' ? 'active' : ''}`}
              onClick={() => setActiveTab('base')}
            >
              Basis Instructie
            </button>
            <button
              className={`settings-tab ${activeTab === 'landing' ? 'active' : ''}`}
              onClick={() => setActiveTab('landing')}
            >
              Landingspagina
            </button>
            <button
              className={`settings-tab ${activeTab === 'categorie' ? 'active' : ''}`}
              onClick={() => setActiveTab('categorie')}
            >
              Categoriepagina
            </button>
            <button
              className={`settings-tab ${activeTab === 'product' ? 'active' : ''}`}
              onClick={() => setActiveTab('product')}
            >
              Productpagina
            </button>
            <button
              className={`settings-tab ${activeTab === 'blog' ? 'active' : ''}`}
              onClick={() => setActiveTab('blog')}
            >
              Blog
            </button>
            <button
              className={`settings-tab ${activeTab === 'social' ? 'active' : ''}`}
              onClick={() => setActiveTab('social')}
            >
              Social Media
            </button>
            <button
              className={`settings-tab ${activeTab === 'seo-rules' ? 'active' : ''}`}
              onClick={() => setActiveTab('seo-rules')}
            >
              SEO Regels
            </button>
          </div>

          <div className="settings-content">
            {activeTab === 'ai-config' ? (
              <div className="prompt-viewer">
                <div className="prompt-header">
                  <h2>AI Configuratie</h2>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {!isEditingConfig && (
                      <button
                        className="button"
                        onClick={() => setIsEditingConfig(true)}
                      >
                        Bewerken
                      </button>
                    )}
                    {isEditingConfig && (
                      <>
                        <button
                          className="button"
                          onClick={saveConfig}
                          disabled={isSavingConfig}
                        >
                          {isSavingConfig ? 'Opslaan...' : 'Opslaan'}
                        </button>
                        <button
                          className="button"
                          style={{ backgroundColor: '#6c757d' }}
                          onClick={() => {
                            setIsEditingConfig(false);
                            loadConfig(); // Reset naar opgeslagen versie
                          }}
                          disabled={isSavingConfig}
                        >
                          Annuleren
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="prompt-content">
                  {isEditingConfig ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                          AI Provider
                        </label>
                        <select
                          value={aiConfig.provider}
                          onChange={(e) => setAiConfig(prev => ({ ...prev, provider: e.target.value }))}
                          style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                          <option value="openai">OpenAI (ChatGPT)</option>
                          <option value="anthropic">Anthropic (Claude)</option>
                          <option value="google">Google (Gemini)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                          Model
                        </label>
                        <select
                          value={aiConfig.model}
                          onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
                          style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                          {aiConfig.provider === 'openai' && (
                            <>
                              <option value="gpt-4o">GPT-4o</option>
                              <option value="gpt-4o-mini">GPT-4o Mini</option>
                              <option value="gpt-4-turbo">GPT-4 Turbo</option>
                              <option value="gpt-4">GPT-4</option>
                              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            </>
                          )}
                          {aiConfig.provider === 'anthropic' && (
                            <>
                              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                              <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                              <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                              <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                            </>
                          )}
                          {aiConfig.provider === 'google' && (
                            <>
                              <option value="gemini-pro">Gemini Pro</option>
                              <option value="gemini-pro-vision">Gemini Pro Vision</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                          API Key
                        </label>
                        <input
                          type="password"
                          value={aiConfig.apiKey}
                          onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                          placeholder="Voer je API key in..."
                          style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                          Je API key wordt veilig opgeslagen lokaal. Laat dit veld leeg om de huidige key te behouden.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div>
                        <strong>Provider:</strong> {aiConfig.provider === 'openai' ? 'OpenAI (ChatGPT)' : aiConfig.provider === 'anthropic' ? 'Anthropic (Claude)' : 'Google (Gemini)'}
                      </div>
                      <div>
                        <strong>Model:</strong> {aiConfig.model}
                      </div>
                      <div>
                        <strong>API Key:</strong> {hasApiKey ? '✓ Geconfigureerd' : 'Niet geconfigureerd'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tenant / white-label keys (client-side) */}
              <div className="prompt-viewer" style={{ marginTop: '1rem' }}>
                <div className="prompt-header">
                  <h2>Tenant / White-label API Key</h2>
                  {hasTenantKey && (
                    <span style={{ color: '#2e7d32', fontSize: '0.9rem' }}>✓ opgeslagen (client-side)</span>
                  )}
                </div>
                <div className="prompt-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Organisatie / Tenant ID
                    </label>
                    <input
                      type="text"
                      value={tenantConfig.organizationId}
                      onChange={(e) => setTenantConfig(prev => ({ ...prev, organizationId: e.target.value }))}
                      placeholder="bijv. klant-123"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <p style={{ marginTop: '0.35rem', fontSize: '0.875rem', color: '#666' }}>
                      Wordt meegestuurd met generate-calls; kies een unieke ID per klant.
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      API Key (client-side opslag)
                    </label>
                    <input
                      type="password"
                      value={tenantConfig.apiKey}
                      onChange={(e) => setTenantConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="sk-..."
                      style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    {hasTenantKey && (
                      <p style={{ marginTop: '0.35rem', fontSize: '0.875rem', color: '#666' }}>
                        Opslag in localStorage (mask): ****{tenantConfig.apiKey.slice(-4)}
                      </p>
                    )}
                    <p style={{ marginTop: '0.35rem', fontSize: '0.875rem', color: '#c0392b' }}>
                      Voor productie multi-tenant: gebruik server-side opslag (DB/KMS). Deze variant is client-side.
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Provider
                    </label>
                    <select
                      value={tenantConfig.provider}
                      onChange={(e) => setTenantConfig(prev => ({ ...prev, provider: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Model
                    </label>
                    <input
                      type="text"
                      value={tenantConfig.model}
                      onChange={(e) => setTenantConfig(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="bijv. gpt-4o-mini"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="button" onClick={saveTenantConfig} disabled={isSavingTenant} style={{ minWidth: '160px' }}>
                      {isSavingTenant ? 'Opslaan...' : 'Opslaan (tenant)'}
                    </button>
                    <button className="button ghost" type="button" onClick={clearTenantConfig} style={{ minWidth: '140px' }}>
                      Verwijder
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'seo-rules' ? (
              <div className="prompt-viewer">
                <div className="prompt-header">
                  <h2>RankFlow SEO-regels</h2>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {!isEditingSeoRules && (
                      <>
                        <CopyButton text={seoRulesText} />
                        <button
                          className="button"
                          onClick={() => setIsEditingSeoRules(true)}
                        >
                          Bewerken
                        </button>
                      </>
                    )}
                    {isEditingSeoRules && (
                      <>
                        <button
                          className="button"
                          onClick={saveSeoRules}
                          disabled={isSaving}
                        >
                          {isSaving ? 'Opslaan...' : 'Opslaan'}
                        </button>
                        <button
                          className="button"
                          style={{ backgroundColor: '#6c757d' }}
                          onClick={() => {
                            setIsEditingSeoRules(false);
                            loadSeoRules(); // Reset naar opgeslagen versie
                          }}
                          disabled={isSaving}
                        >
                          Annuleren
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="prompt-content prompt-content-seo-rules">
                  {isEditingSeoRules ? (
                    <textarea
                      className="prompt-editor"
                      value={seoRulesText}
                      onChange={(e) => setSeoRulesText(e.target.value)}
                      placeholder="Voer de SEO-regels in..."
                      style={{ minHeight: '600px' }}
                    />
                  ) : (
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', margin: 0, fontFamily: 'inherit', fontSize: '0.9375rem', lineHeight: '1.7', color: 'var(--color-text)' }}>{seoRulesText}</pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="prompt-viewer">
                <div className="prompt-header">
                  <h2>
                    {activeTab === 'base' && 'Basis Instructie (gebruikt door alle types)'}
                    {activeTab === 'landing' && 'Landingspagina Prompt'}
                    {activeTab === 'categorie' && 'Categoriepagina Prompt'}
                    {activeTab === 'product' && 'Productpagina Prompt'}
                    {activeTab === 'blog' && 'Blog Prompt'}
                    {activeTab === 'social' && 'Social Media Prompt'}
                    {activeTab === 'seo-rules' && 'SEO Regels'}
                  </h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {!isEditing && (
                    <>
                      <CopyButton text={getFullPrompt(activeTab)} />
                      <button
                        className="button"
                        onClick={() => setIsEditing(true)}
                      >
                        Bewerken
                      </button>
                    </>
                  )}
                  {isEditing && (
                    <>
                      <button
                        className="button"
                        onClick={savePrompts}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Opslaan...' : 'Opslaan'}
                      </button>
                      <button
                        className="button"
                        style={{ backgroundColor: '#6c757d' }}
                        onClick={() => {
                          setIsEditing(false);
                          loadPrompts(); // Reset naar opgeslagen versie
                        }}
                        disabled={isSaving}
                      >
                        Annuleren
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="prompt-content">
                {isEditing ? (
                  <textarea
                    className="prompt-editor"
                    value={getCurrentPrompt(activeTab)}
                    onChange={(e) => updatePrompt(activeTab, e.target.value)}
                    placeholder="Voer de prompt in..."
                  />
                ) : (
                  <pre>{getFullPrompt(activeTab)}</pre>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
