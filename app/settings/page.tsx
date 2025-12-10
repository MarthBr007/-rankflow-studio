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
  
  // Tenant / white-label configuratie (server-side via API)
  type TenantConfig = {
    organizationId: string;
    apiKey: string;
    model: string;
    provider: string;
  };
  type TenantStatus = {
    apiKeyMasked?: string;
    apiKeyLength?: number;
    updatedAt?: string;
    exists: boolean;
  };
  const [tenantConfig, setTenantConfig] = useState<TenantConfig>({
    organizationId: '',
    apiKey: '',
    model: 'gpt-4o-mini',
    provider: 'openai',
  });
  const [tenantStatus, setTenantStatus] = useState<TenantStatus>({ exists: false });
  const [isSavingTenant, setIsSavingTenant] = useState(false);
  const [isLoadingTenant, setIsLoadingTenant] = useState(false);
  
  // Tenant Management state
  const [currentOrganizationId, setCurrentOrganizationId] = useState('');
  const [tenantUsers, setTenantUsers] = useState<Array<{ email: string; role: string; createdAt: string }>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [tenantKeys, setTenantKeys] = useState<Array<{ provider: string; model: string; hasKey: boolean; updatedAt?: string }>>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);

  // User management state (admin only)
  const [currentUser, setCurrentUser] = useState<{ email: string; name?: string; role?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; email: string; name?: string; role: string; createdAt: string; lastLoginAt?: string }>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Load current user on mount
  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (data.user) {
        setCurrentUser(data.user);
        setIsAdmin(data.user.role === 'admin');
        if (data.user.role === 'admin') {
          loadUsers();
        }
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        const errorData = await response.json();
        console.error('Error loading users:', errorData.error);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const addUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      showToast('Email en wachtwoord zijn verplicht', 'error');
      return;
    }

    setIsAddingUser(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          name: newUserName || undefined,
          role: newUserRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Fout bij toevoegen user');
      }

      showToast('User toegevoegd', 'success');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole('user');
      loadUsers();
    } catch (error: any) {
      showToast(error.message || 'Fout bij toevoegen user', 'error');
    } finally {
      setIsAddingUser(false);
    }
  };

  const updateUserRole = async (id: string, newRole: 'user' | 'admin') => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fout bij updaten role');
      }

      showToast('Role bijgewerkt', 'success');
      loadUsers();
    } catch (error: any) {
      showToast(error.message || 'Fout bij updaten role', 'error');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze user wilt verwijderen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fout bij verwijderen user');
      }

      showToast('User verwijderd', 'success');
      loadUsers();
    } catch (error: any) {
      showToast(error.message || 'Fout bij verwijderen user', 'error');
    }
  };

  // Prompt versiebeheer state
  const [promptTenantId, setPromptTenantId] = useState('global');
  const [promptVersions, setPromptVersions] = useState<Array<{ version: number; createdAt: string }>>([]);
  const [selectedPromptVersion, setSelectedPromptVersion] = useState<number | null>(null);
  const [selectedPromptData, setSelectedPromptData] = useState<Record<string, string> | null>(null);
  const [isLoadingPromptVersions, setIsLoadingPromptVersions] = useState(false);
  const [isLoadingPromptVersion, setIsLoadingPromptVersion] = useState(false);
  const [isDiffMode, setIsDiffMode] = useState(false);
  
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

  // Default SEO rules text (2025 update)
  const defaultSeoRulesText = `✅ RankFlow Studio – SEO Regels 2025 (Volledig Geoptimaliseerd)

De meest complete, AI-era SEO set voor Broers Verhuur. Wordt automatisch toegepast bij genereren én verbeteren.

1. SEO Title (Page Title) – 2025
- Max 60 tekens
- MOET bevatten: focus keyword, power word, getal/benefit, regio Haarlem (verplicht), entiteit Broers Verhuur (aanbevolen)
- Power words (niet schreeuwerig): compleet, overzicht, gids, inspiratie, praktische tips, voorbeeld, snel geregeld, zonder gedoe
- Voorbeelden: “Glaswerk huren in Haarlem – compleet overzicht met 5 praktische tips”, “Servies huren Haarlem – snel geregeld met voorbeelden en inspiratie”

2. Meta Description – 2025
- Max 155 tekens
- Bevat: focus keyword, voordeel (1 zin), service-belofte, Haarlem + 2 regio’s, geen quotes/streepjes/marketingtaal
- AI-era: kort, feitelijk, taakgericht (bruikbaar voor AI Overviews)
- Voorbeeld: “Glaswerk huren in Haarlem Hoofddorp Amsterdam. Wij leveren schoon materiaal helpen met aantallen en regelen bezorging en retour. Reserveer eenvoudig.”

3. Focus Keyword – herziene regels
- Format: {onderwerp} huren
- Moet in: SEO title, Meta description, URL, H1, Intro (eerste 2 zinnen), min 1 H2, CTA, min 3 image alts
- Nieuw: semantisch ondersteunen met entiteiten via NLP (Broers Verhuur, eventmateriaal, verhuurservice, glaswerk categorieën)
- Density: min 6, natuurlijk, niet in elke alinea

4. Secondary Keywords – AI-aanpak
- Minimaal 9 long-tail, natuurlijk, geen herhalingen
- Categorieën: locatie, scenario’s, materiaal, evenement, probleemgericht, taakgericht
- Voorbeelden: “hoeveel glaswerk huren voor 50 personen”, “servies huren zonder afwas”, “tafelsetting huren Haarlem tips”, “eventmateriaal voor bruiloften huren in Amsterdam”

5. URL Slug – Check
- Format: {onderwerp}-huren-haarlem
- URL bevat altijd Haarlem (entiteit), kort houden, geen jaartallen/herhalingen, geen stopwoorden/specials

6. Content Structuur – uitgebreid
- Headings: H1 focus keyword; H2 long-tails/scenario’s; H3 stappen/hoeveelheden/checklist
- Verplicht: 1 realistisch scenario, 1 storytelling scenario, 1 praktische adviesblok, 1 CTA, min 5 FAQ’s (vraagvorm)
- Nieuw 2025:
  ✔ AI Summary block bovenaan (2 zinnen samenvatting voor AI Overviews)
  ✔ Structured data matcht headings
  ✔ Entiteit-versterkende termen door de tekst
  ✔ Regio’s min 3 keer natuurlijk

7. Internal Links – uitgebreid
- 4–6 interne links, relevante anchors: “Bekijk glaswerk”, “Meer over servies”, “Bekijk statafels”
- Nieuw: min 1 link naar pillar page, min 1 zijwaartse categorie, geen commerciële toon

8. External Links – E-E-A-T update
- Min 1 bron, contextueel in de tekst
- Toegestaan: .nl/.org/.gov/.edu/branche
- Prefer: KHN, Wikipedia, Gemeente Haarlem, bruiloftsblogs; nooit webshops of commerciële concurrenten

9. Image SEO – bijgewerkt
- 4–6 afbeeldingen; alt bevat scenario, regio, topic
- Geen streepjes, geen marketingwoorden, geen dubbele alts, alt beschrijvend (AI context)
- Voorbeeld: “glaswerk voor 50 personen tijdens diner in Haarlem”

10. Quality Signals – AI & E-E-A-T
- Moet bevatten: Expertise (aantallen, hoeveelheden, materiaalsoorten, situaties), Experience (praktijkvoorbeelden, scenario’s met tijd/locatie/doelgroep), Authority (advies uit ervaring, vergelijkingen), Trust (levering, schoon materiaal, afwas inbegrepen, servicebelofte)
- Injecties: “wij leveren alles schoon en klaar voor gebruik”, “wij doen de afwas”, “wij denken mee over aantallen”, “wij regelen levering en retour”
- Nieuw 2025: transparantieblok “Hoe wij werken”, review snippet (bescheiden), structured data: Service, LocalBusiness, Product

11. Duplicate Content Protection – uitgebreid
- Variaties op zinnen en alineas, scenario’s randomiseren, regio’s afwisselen (Haarlem altijd), FAQ’s herschrijven, patronen verminderen (AI penalty preventie)

12. Add-ons (automatisch)
- Keyword clustering (Google HCU), Humanized writing, Semantische variatie, NLP terms, Scenario injectie, Regio injectie, CTA injectie, Internal linking generator, Image ALT optimizer`;

  // Laad prompts en config bij mount
  useEffect(() => {
    loadPrompts();
    loadConfig();
    loadSeoRules();
  }, []);

  // Laad tenant config (server) bij mount of bij wijziging org/provider
  useEffect(() => {
    if (!tenantConfig.organizationId) return;
    const load = async () => {
      setIsLoadingTenant(true);
      try {
        const params = new URLSearchParams({
          tenantId: tenantConfig.organizationId,
          provider: tenantConfig.provider || 'openai',
        });
        const res = await fetch(`/api/tenant-config?${params.toString()}`);
        const data = await res.json();
        if (data.exists) {
          setTenantStatus({
            exists: true,
            apiKeyMasked: data.apiKeyMasked,
            apiKeyLength: data.apiKeyLength,
            updatedAt: data.updatedAt,
          });
          setTenantConfig(prev => ({
            ...prev,
            model: data.model || prev.model,
          }));
        } else {
          setTenantStatus({ exists: false });
        }
      } catch (e) {
        console.error('Fout bij laden tenant credential:', e);
      } finally {
        setIsLoadingTenant(false);
      }
    };
    load();
  }, [tenantConfig.organizationId, tenantConfig.provider]);

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
      const params = new URLSearchParams();
      if (promptTenantId) params.append('tenantId', promptTenantId);
      const response = await fetch(`/api/prompts?${params.toString()}`);
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
    if (!isAdmin) {
      showToast('Alleen admins kunnen prompts bewerken', 'error');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompts, tenantId: promptTenantId || 'global' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fout bij het opslaan');
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

  const loadPromptVersions = async () => {
    if (!promptTenantId) return;
    setIsLoadingPromptVersions(true);
    try {
      const res = await fetch(`/api/prompts/versions?tenantId=${promptTenantId}`);
      if (res.ok) {
        const data = await res.json();
        setPromptVersions(data);
        // Reset selectie bij tenant wissel
        setSelectedPromptVersion(null);
        setSelectedPromptData(null);
        setIsDiffMode(false);
      }
    } catch (error) {
      console.error('Error loading prompt versions:', error);
    } finally {
      setIsLoadingPromptVersions(false);
    }
  };

  const loadPromptVersionData = async (version: number) => {
    setIsLoadingPromptVersion(true);
    try {
      const res = await fetch(`/api/prompts/versions?tenantId=${promptTenantId}&version=${version}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPromptData(data.prompts || null);
      }
    } catch (error) {
      console.error('Error loading prompt version data:', error);
    } finally {
      setIsLoadingPromptVersion(false);
    }
  };

  const rollbackPromptVersion = async () => {
    if (!selectedPromptVersion || !selectedPromptData) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompts: selectedPromptData, tenantId: promptTenantId || 'global' }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Rollback mislukt');
      }
      showToast(`Rollback uitgevoerd naar versie ${selectedPromptVersion}`, 'success');
      // refresh huidige prompts en versie lijst
      loadPrompts();
      loadPromptVersions();
    } catch (error: any) {
      showToast(error.message || 'Rollback mislukt', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (activeTab === 'ai-config') {
  return (
        <>
              <div className="prompt-viewer">
                <div className="prompt-header">
                  <h2>AI Configuratie</h2>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {!isEditingConfig && (
                  <button className="button" onClick={() => setIsEditingConfig(true)}>
                        Bewerken
                      </button>
                    )}
                    {isEditingConfig && (
                      <>
                    <button className="button" onClick={saveConfig} disabled={isSavingConfig}>
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

          {/* Tenant / white-label keys (server-side) */}
          <div className="prompt-viewer" style={{ marginTop: '1rem' }}>
            <div className="prompt-header">
              <h2>Tenant / White-label API Key (server-side)</h2>
              {tenantStatus.exists && (
                <span style={{ color: '#2e7d32', fontSize: '0.9rem' }}>
                  ✓ opgeslagen {tenantStatus.apiKeyMasked ? `(${tenantStatus.apiKeyMasked})` : ''}
                </span>
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
                {tenantStatus.apiKeyMasked && (
                  <p style={{ marginTop: '0.35rem', fontSize: '0.875rem', color: '#666' }}>
                    Masked: {tenantStatus.apiKeyMasked}
                  </p>
                )}
                <p style={{ marginTop: '0.35rem', fontSize: '0.875rem', color: '#666' }}>
                  Wordt veilig server-side opgeslagen (versleuteld).
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
              {isLoadingTenant && (
                <p style={{ fontSize: '0.85rem', color: '#666' }}>Bezig met laden...</p>
              )}
              {tenantStatus.updatedAt && (
                <p style={{ fontSize: '0.85rem', color: '#666' }}>Laatst bijgewerkt: {new Date(tenantStatus.updatedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'seo-rules') {
      return (
        <div className="prompt-viewer">
          <div className="prompt-header">
            <h2>RankFlow SEO-regels</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {!isEditingSeoRules && (
                <>
                  <CopyButton text={seoRulesText} />
                  <button className="button" onClick={() => setIsEditingSeoRules(true)}>
                    Bewerken
                  </button>
                </>
              )}
              {isEditingSeoRules && (
                <>
                  <button className="button" onClick={saveSeoRules} disabled={isSaving}>
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
      );
    }

    if (activeTab === 'user-management') {
      if (!isAdmin) {
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#666' }}>Alleen admins hebben toegang tot user management.</p>
          </div>
        );
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ marginBottom: '1rem' }}>Gebruikersbeheer</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Beheer alle gebruikers van het systeem. Alleen admins kunnen users aanmaken, bewerken en verwijderen.
            </p>

            {/* Add User Form */}
            <div style={{ 
              background: '#f9f9f9', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '2rem',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Nieuwe User Toevoegen</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Naam (optioneel)
                  </label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Jouw naam"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.9375rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.9375rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Wachtwoord *
                  </label>
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Minimaal 6 tekens"
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.9375rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Rol
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as 'user' | 'admin')}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.9375rem'
                    }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  className="button"
                  onClick={addUser}
                  disabled={isAddingUser || !newUserEmail || !newUserPassword}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {isAddingUser ? 'Toevoegen...' : 'User Toevoegen'}
                </button>
              </div>
            </div>

            {/* Users List */}
            <div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Bestaande Users</h3>
              {isLoadingUsers ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>Laden...</p>
              ) : users.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>Geen users gevonden.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {users.map((user) => (
                    <div
                      key={user.id}
                      style={{
                        background: '#fff',
                        padding: '1.25rem',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          {user.name || user.email}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>
                          {user.name && <div>{user.email}</div>}
                          <div>
                            Rol: <strong>{user.role}</strong> • 
                            Aangemaakt: {new Date(user.createdAt).toLocaleDateString('nl-NL')}
                            {user.lastLoginAt && (
                              <> • Laatste login: {new Date(user.lastLoginAt).toLocaleDateString('nl-NL')}</>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as 'user' | 'admin')}
                          style={{
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '0.875rem'
                          }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        {user.id !== currentUser?.id && (
                          <button
                            className="button"
                            onClick={() => deleteUser(user.id)}
                            style={{ 
                              backgroundColor: '#ef4444',
                              padding: '0.5rem 1rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            Verwijderen
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'tenant-management') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Organization Selector */}
          <div className="prompt-viewer">
            <div className="prompt-header">
              <h2>Tenant Management</h2>
            </div>
            <div className="prompt-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Organisatie / Tenant ID
                </label>
                <input
                  type="text"
                  value={currentOrganizationId}
                  onChange={(e) => setCurrentOrganizationId(e.target.value)}
                  placeholder="bijv. klant-123"
                  style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <p style={{ marginTop: '0.35rem', fontSize: '0.875rem', color: '#666' }}>
                  Selecteer een tenant om users en keys te beheren
                </p>
              </div>
            </div>
          </div>

          {/* Users Management */}
          {currentOrganizationId && (
            <div className="prompt-viewer">
              <div className="prompt-header">
                <h2>Users & Rollen</h2>
              </div>
              <div className="prompt-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Add User Form */}
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Nieuwe User Toevoegen</h3>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="user@example.com"
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div style={{ flex: '1', minWidth: '150px' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        Rol
                      </label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as 'viewer' | 'editor' | 'admin')}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <button
                      className="button"
                      onClick={addTenantUser}
                      disabled={isAddingUser || !newUserEmail}
                    >
                      {isAddingUser ? 'Toevoegen...' : 'Toevoegen'}
                    </button>
                  </div>
                </div>

                {/* Users List */}
                <div>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Bestaande Users</h3>
                  {isLoadingUsers ? (
                    <p>Laden...</p>
                  ) : tenantUsers.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>Geen users gevonden. Voeg een user toe om te beginnen.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {tenantUsers.map((user, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem',
                            background: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                          }}
                        >
                          <div style={{ flex: '1' }}>
                            <div style={{ fontWeight: 'bold' }}>{user.email}</div>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>
                              Rol: <strong>{user.role}</strong> • Toegevoegd: {new Date(user.createdAt).toLocaleDateString('nl-NL')}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.email, e.target.value as 'viewer' | 'editor' | 'admin')}
                              style={{ padding: '0.35rem', fontSize: '0.9rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                              <option value="viewer">Viewer</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              className="button"
                              style={{ backgroundColor: '#dc3545', padding: '0.35rem 0.75rem', fontSize: '0.9rem' }}
                              onClick={() => deleteTenantUser(user.email)}
                            >
                              Verwijder
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Permissions Info */}
                <div style={{ padding: '1rem', background: '#e7f3ff', borderRadius: '4px', fontSize: '0.9rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Rol Permissies:</h4>
                  <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                    <li><strong>Viewer:</strong> Kan content bekijken, geen wijzigingen</li>
                    <li><strong>Editor:</strong> Kan content genereren, bewerken en opslaan</li>
                    <li><strong>Admin:</strong> Volledige toegang, inclusief API keys en prompts beheren</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* API Keys Management */}
          {currentOrganizationId && (
            <div className="prompt-viewer">
              <div className="prompt-header">
                <h2>API Keys per Provider</h2>
              </div>
              <div className="prompt-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {isLoadingKeys ? (
                  <p>Laden...</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tenantKeys.map((key, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem',
                          background: key.hasKey ? '#d4edda' : '#fff',
                          border: `1px solid ${key.hasKey ? '#c3e6cb' : '#ddd'}`,
                          borderRadius: '4px',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{key.provider}</div>
                          <div style={{ fontSize: '0.875rem', color: '#666' }}>
                            Model: {key.model} {key.updatedAt && `• Bijgewerkt: ${new Date(key.updatedAt).toLocaleDateString('nl-NL')}`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '4px', 
                            fontSize: '0.875rem',
                            background: key.hasKey ? '#28a745' : '#6c757d',
                            color: '#fff'
                          }}>
                            {key.hasKey ? '✓ Key ingesteld' : 'Geen key'}
                          </span>
                          <button
                            className="button"
                            style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}
                            onClick={() => {
                              setTenantConfig({
                                organizationId: currentOrganizationId,
                                apiKey: '',
                                model: key.model,
                                provider: key.provider,
                              });
                              setActiveTab('ai-config');
                            }}
                          >
                            {key.hasKey ? 'Wijzig' : 'Toevoegen'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                  Tip: Ga naar "AI Configuratie" tab om keys toe te voegen of te wijzigen voor deze tenant.
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        {/* Prompt versiebeheer */}
        <div className="prompt-viewer">
          <div className="prompt-header">
            <h2>Prompt versies (per tenant)</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="button" onClick={loadPromptVersions} disabled={isLoadingPromptVersions}>
                {isLoadingPromptVersions ? 'Laden...' : 'Ververs lijst'}
              </button>
              <button
                className="button ghost"
                onClick={() => {
                  setPromptTenantId('global');
                  setSelectedPromptVersion(null);
                  setSelectedPromptData(null);
                  setIsDiffMode(false);
                }}
              >
                Reset naar global
              </button>
            </div>
          </div>
          <div className="prompt-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '220px', flex: '1' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                  Tenant ID
                </label>
                <input
                  type="text"
                  value={promptTenantId}
                  onChange={(e) => setPromptTenantId(e.target.value || 'global')}
                  placeholder="global of tenant-id"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ minWidth: '220px' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                  Versie
                </label>
                <select
                  value={selectedPromptVersion ?? ''}
                  onChange={(e) => {
                    const v = e.target.value ? parseInt(e.target.value, 10) : null;
                    setSelectedPromptVersion(v);
                    setSelectedPromptData(null);
                    setIsDiffMode(false);
                    if (v !== null) loadPromptVersionData(v);
                  }}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">Selecteer versie</option>
                  {promptVersions.map((v) => (
                    <option key={v.version} value={v.version}>
                      v{v.version} — {new Date(v.createdAt).toLocaleString('nl-NL')}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                <button
                  className="button ghost"
                  onClick={() => setIsDiffMode((prev) => !prev)}
                  disabled={!selectedPromptData}
                >
                  {isDiffMode ? 'Sluit diff' : 'Toon diff t.o.v. huidig'}
                </button>
                <button
                  className="button"
                  onClick={rollbackPromptVersion}
                  disabled={!selectedPromptVersion || !selectedPromptData || isSaving}
                >
                  {isSaving ? 'Rollback...' : 'Rollback naar versie'}
                </button>
              </div>
            </div>

            {isLoadingPromptVersion && <p style={{ fontSize: '0.9rem', color: '#666' }}>Versie laden...</p>}

            {!isLoadingPromptVersion && selectedPromptData && (
              <div style={{ display: 'grid', gridTemplateColumns: isDiffMode ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>Geselecteerde versie (v{selectedPromptVersion})</h4>
                  <pre
                    style={{
                      background: '#f8f9fa',
                      padding: '1rem',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      minHeight: '260px',
                      fontSize: '0.9rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {JSON.stringify(selectedPromptData, null, 2)}
                  </pre>
                </div>
                {isDiffMode && (
                  <div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Huidige versie (actief)</h4>
                    <pre
                      style={{
                        background: '#fffaf0',
                        padding: '1rem',
                        borderRadius: '4px',
                        border: '1px solid #fbd38d',
                        minHeight: '260px',
                        fontSize: '0.9rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {JSON.stringify(prompts, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

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
                      {isAdmin ? (
                        <button className="button" onClick={() => setIsEditing(true)}>
                          Bewerken
                        </button>
                      ) : (
                        <span style={{ color: '#666', fontSize: '0.875rem' }}>
                          Alleen admins kunnen prompts bewerken
                        </span>
                      )}
                    </>
                  )}
                  {isEditing && (
                    <>
                  <button className="button" onClick={savePrompts} disabled={isSaving}>
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
      </>
    );
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

  // Opslaan tenant-config (server-side)
  const saveTenantConfig = async () => {
    setIsSavingTenant(true);
    try {
      const payload = {
        tenantId: tenantConfig.organizationId.trim(),
        apiKey: tenantConfig.apiKey.trim(),
        model: (tenantConfig.model || 'gpt-4o-mini').trim(),
        provider: (tenantConfig.provider || 'openai').trim(),
      };

      if (!payload.tenantId || !payload.apiKey) {
        showToast('tenantId en apiKey zijn verplicht', 'error');
        setIsSavingTenant(false);
        return;
      }

      const res = await fetch('/api/tenant-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Opslaan mislukt');
      }

      const data = await res.json();
      setTenantStatus({
        exists: true,
        apiKeyMasked: data.apiKeyMasked,
        apiKeyLength: data.apiKeyLength || payload.apiKey.length,
        updatedAt: data.updatedAt,
      });
      setTenantConfig(prev => ({ ...prev, apiKey: '' }));
      showToast('Tenant key opgeslagen (server-side)', 'success');
    } catch (error: any) {
      console.error('Fout bij opslaan tenant config:', error);
      showToast(error.message || 'Fout bij opslaan tenant config', 'error');
    } finally {
      setIsSavingTenant(false);
    }
  };

  const clearTenantConfig = async () => {
    if (!tenantConfig.organizationId) {
      showToast('Vul eerst een tenant ID in', 'error');
      return;
    }
    setIsSavingTenant(true);
    try {
      const params = new URLSearchParams({
        tenantId: tenantConfig.organizationId,
        provider: tenantConfig.provider || 'openai',
      });
      const res = await fetch(`/api/tenant-config?${params.toString()}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Verwijderen mislukt');
      }
      setTenantStatus({ exists: false });
      setTenantConfig(prev => ({ ...prev, apiKey: '' }));
      showToast('Tenant key verwijderd', 'success');
    } catch (error: any) {
      console.error('Fout bij verwijderen tenant config:', error);
      showToast(error.message || 'Fout bij verwijderen tenant config', 'error');
    } finally {
      setIsSavingTenant(false);
    }
  };

  // Tenant Management functions
  const loadTenantUsers = async () => {
    if (!currentOrganizationId) return;
    setIsLoadingUsers(true);
    try {
      const response = await fetch(`/api/access-control?organizationId=${currentOrganizationId}&listUsers=true`);
      if (response.ok) {
        const users = await response.json();
        setTenantUsers(users);
      } else {
        const data = await response.json();
        console.error('Error loading users:', data.error);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadTenantKeys = async () => {
    if (!currentOrganizationId) return;
    setIsLoadingKeys(true);
    try {
      const providers = ['openai', 'anthropic', 'google'];
      const keys = await Promise.all(
        providers.map(async (provider) => {
          try {
            const res = await fetch(`/api/tenant-config?tenantId=${currentOrganizationId}&provider=${provider}`);
            if (res.ok) {
              const data = await res.json();
              return {
                provider,
                model: data.model || 'N/A',
                hasKey: data.exists || false,
                updatedAt: data.updatedAt,
              };
            }
            return { provider, model: 'N/A', hasKey: false };
          } catch {
            return { provider, model: 'N/A', hasKey: false };
          }
        })
      );
      setTenantKeys(keys);
    } catch (error) {
      console.error('Error loading keys:', error);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const addTenantUser = async () => {
    if (!currentOrganizationId || !newUserEmail) {
      showToast('Vul organisatie ID en email in', 'error');
      return;
    }
    setIsAddingUser(true);
    try {
      const response = await fetch('/api/access-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrganizationId,
          email: newUserEmail,
          role: newUserRole,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fout bij toevoegen user');
      }
      showToast('User toegevoegd', 'success');
      setNewUserEmail('');
      setNewUserRole('viewer');
      loadTenantUsers();
    } catch (error: any) {
      showToast(error.message || 'Fout bij toevoegen user', 'error');
    } finally {
      setIsAddingUser(false);
    }
  };

  const updateUserRole = async (email: string, newRole: 'viewer' | 'editor' | 'admin') => {
    if (!currentOrganizationId) return;
    try {
      const response = await fetch('/api/access-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrganizationId,
          email,
          role: newRole,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fout bij updaten role');
      }
      showToast('Rol bijgewerkt', 'success');
      loadTenantUsers();
    } catch (error: any) {
      showToast(error.message || 'Fout bij updaten role', 'error');
    }
  };

  const deleteTenantUser = async (email: string) => {
    if (!currentOrganizationId) return;
    if (!confirm(`Weet je zeker dat je ${email} wilt verwijderen?`)) return;
    try {
      const response = await fetch(`/api/access-control?organizationId=${currentOrganizationId}&email=${email}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fout bij verwijderen user');
      }
      showToast('User verwijderd', 'success');
      loadTenantUsers();
    } catch (error: any) {
      showToast(error.message || 'Fout bij verwijderen user', 'error');
    }
  };

  // Load tenant data when organization ID changes
  useEffect(() => {
    if (currentOrganizationId) {
      loadTenantUsers();
      loadTenantKeys();
    }
  }, [currentOrganizationId]);

  useEffect(() => {
    loadPromptVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptTenantId]);

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
            <button
              className={`settings-tab ${activeTab === 'tenant-management' ? 'active' : ''}`}
              onClick={() => setActiveTab('tenant-management')}
            >
              Tenant Management
            </button>
          </div>

          <div className="settings-content">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
