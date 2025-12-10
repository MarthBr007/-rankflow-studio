'use client';

import React from 'react';
import CopyButton from './CopyButton';

// Product pagina interface
interface ProductResult {
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  urlSlug: string;
  title: string;
  intro: string;
  benefitsTitle: string;
  benefits: string[];
  idealTitle: string;
  idealFor: string[];
  materialsTitle: string;
  materialsText: string;
  useCasesTitle: string;
  useCasesText: string;
  adviceTitle: string;
  adviceText: string;
  serviceTitle: string;
  serviceText: string;
  ctaTitle: string;
  ctaText: string;
  imageSEO?: Array<{
    alt: string;
    title: string;
  }>;
  internalLinks?: Array<{
    anchor: string;
    url: string;
  }>;
  ctaSuggestions?: string[];
  schema?: any;
}

// Categorie pagina interface
interface CategorieResult {
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  urlSlug: string;
  h1: string;
  intro: string;
  benefitsTitle: string;
  benefits: string[];
  scenariosTitle: string;
  scenarios: string[];
  inspirationTitle: string;
  inspirationText: string;
  adviceTitle: string;
  adviceText: string;
  ctaTitle: string;
  ctaText: string;
  imageSEO?: Array<{
    alt: string;
    title: string;
  }>;
  internalLinks?: Array<{
    anchor: string;
    url: string;
  }>;
  ctaSuggestions?: string[];
  schema?: any;
}

// Landing pagina interface (ondersteunt zowel oude als nieuwe structuur)
interface LandingResult {
  // Nieuwe geneste structuur
  seo?: {
    seoTitle: string;
    metaDescription: string;
    focusKeyword: string;
    secondaryKeywords: string[];
    urlSlug: string;
    searchIntent?: string;
    searchIntentExplanation?: string;
  };
  headings?: Array<{
    level: string;
    text: string;
    containsFocusKeyword: boolean;
  }>;
  content?: {
    h1: string;
    intro: string;
    benefitsTitle: string;
    benefits: string[];
    idealTitle: string;
    idealFor: string[];
    completeSetupTitle: string;
    completeSetupText: string;
    subcategoriesTitle: string;
    subcategoriesIntro: string;
    subcategories: Array<{ name: string; description: string }>;
    inspirationTitle: string;
    inspirationText: string;
    situationsTitle: string;
    situations: string[];
    detailedScenarioTitle: string;
    detailedScenario: string;
    storytellingSceneTitle: string;
    storytellingScene: string;
    stylingTipsTitle: string;
    stylingTipsText: string;
    personalAdviceTitle: string;
    personalAdviceText: string;
    adviceTitle: string;
    adviceText: string;
    localBlock?: {
      title: string;
      text: string;
    };
  };
  faq?: {
    faqTitle: string;
    items: Array<{ question: string; answer: string }>;
    schemaFAQType?: string;
  };
  cta?: {
    ctaTitle: string;
    ctaText: string;
    ctaSuggestions: string[];
    nextSteps?: string[];
  };
  imageSEO?: {
    images: Array<{ alt: string; title: string }>;
  };
  links?: {
    internalLinks: Array<{ anchor: string; url: string }>;
    externalLinks?: Array<{ anchor: string; suggestedType: string; reason: string }>;
  };
  clusters?: {
    contentClusterIdeas: string[];
  };
  readabilityHints?: {
    maxSentenceLength?: number;
    avoidPassiveVoice?: boolean;
    paragraphLengthHint?: string;
    toneReminder?: string;
  };
  // Oude flat structuur (backward compatibility)
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  urlSlug?: string;
  h1?: string;
  intro?: string;
  benefitsTitle?: string;
  benefits?: string[];
  idealTitle?: string;
  idealFor?: string[];
  completeSetupTitle?: string;
  completeSetupText?: string;
  subcategoriesTitle?: string;
  subcategoriesIntro?: string;
  subcategories?: Array<{ name: string; description: string }>;
  inspirationTitle?: string;
  inspirationText?: string;
  situationsTitle?: string;
  situations?: string[];
  detailedScenarioTitle?: string;
  detailedScenario?: string;
  storytellingSceneTitle?: string;
  storytellingScene?: string;
  stylingTipsTitle?: string;
  stylingTipsText?: string;
  personalAdviceTitle?: string;
  personalAdviceText?: string;
  adviceTitle: string;
  adviceText: string;
  faqTitle?: string;
  // Oude faq structuur verwijderd - gebruik faq.items in plaats daarvan voor backward compatibility
  // faq: Array<{ question: string; answer: string }>; // Verwijderd - gebruik faq.items in plaats daarvan
  ctaTitle?: string;
  ctaText?: string;
  // Oude imageSEO structuur verwijderd - gebruik imageSEO.images in plaats daarvan voor backward compatibility
  // imageSEO?: Array<{ alt: string; title: string }>; // Verwijderd - gebruik imageSEO.images in plaats daarvan
  // Oude internalLinks structuur verwijderd - gebruik links.internalLinks in plaats daarvan voor backward compatibility
  // internalLinks?: Array<{ anchor: string; url: string }>; // Verwijderd - gebruik links.internalLinks in plaats daarvan
  ctaSuggestions?: string[];
  schema?: any;
  aiSummary?: string;
}

// Blog interface
interface BlogResult {
  seoTitle: string;
  metaDescription: string;
  keyword: string;
  h1: string;
  intro: string;
  sections: Array<{ title: string; text: string }>;
  stepsTitle: string;
  steps: string[];
  mistakesTitle: string;
  mistakes: Array<{ mistake: string; solution: string }>;
  scenarioBlocksTitle: string;
  scenarioBlocks: Array<{ scenario: string; text: string }>;
  practicalAdviceTitle: string;
  practicalAdvice: string;
  materialsTitle: string;
  materialsList: string[];
  internalLinks?: Array<{
    anchor: string;
    url: string;
  }>;
  ctaTitle: string;
  ctaText: string;
  images?: Array<{
    alt: string;
    title: string;
  }>;
  schema?: any;
}

// Social interface
interface SocialResult {
  topic: string;
  region1: string;
  region2: string;
  contentType: string;
  carousel: {
    hook: string;
    slides: string[];
    cta: string;
  };
  reel: {
    caption: string;
    hashtags: string;
  };
  linkedin: {
    hook: string;
    post: string;
    valueBlock: string;
    scenario: string;
    advice: string;
    cta: string;
    hashtags: string;
  };
  story: {
    text: string;
  };
  // Optionele afbeeldingen per social-blok (alleen voor preview/export)
  carouselImageUrl?: string;
  reelImageUrl?: string;
  linkedinImageUrl?: string;
  storyImageUrl?: string;
}

type ContentResult = ProductResult | CategorieResult | LandingResult | BlogResult | SocialResult;

interface ContentResultProps {
  type: string;
  result: ContentResult;
  onRefine?: () => void;
  isRefining?: boolean;
  onResultChange?: (updated: ContentResult) => void;
}

// Landing blok editor types
type LandingBlockKind =
  | 'h1'
  | 'intro'
  | 'benefits'
  | 'ideal'
  | 'completeSetup'
  | 'subcategories'
  | 'inspiration'
  | 'situations'
  | 'detailedScenario'
  | 'storytelling'
  | 'stylingTips'
  | 'personalAdvice'
  | 'advice'
  | 'local'
  | 'faq'
  | 'cta'
  | 'nextSteps';

interface LandingBlock {
  id: LandingBlockKind;
  label: string;
  type: 'text' | 'textarea' | 'bullets' | 'subcategories' | 'faq' | 'cta' | 'nextSteps';
  visible: boolean;
}

// Product blok editor types
type ProductBlockKind =
  | 'title'
  | 'intro'
  | 'benefits'
  | 'ideal'
  | 'materials'
  | 'useCases'
  | 'advice'
  | 'service'
  | 'cta';

interface ProductBlock {
  id: ProductBlockKind;
  label: string;
  type: 'text' | 'textarea' | 'bullets';
  visible: boolean;
}

// Blog blok editor types
type BlogBlockKind =
  | 'h1'
  | 'intro'
  | 'sections'
  | 'steps'
  | 'mistakes'
  | 'scenarioBlocks'
  | 'practicalAdvice'
  | 'materials'
  | 'cta';

interface BlogBlock {
  id: BlogBlockKind;
  label: string;
  type: 'text' | 'textarea' | 'bullets';
  visible: boolean;
}

function getLengthStatus(length: number, min: number, max: number) {
  if (!length) return 'empty';
  if (length < min) return 'short';
  if (length > max) return 'long';
  return 'ok';
}

// Helper om landing content te normaliseren (oude + nieuwe structuur)
function normalizeLanding(landing: LandingResult) {
  const seo = landing.seo || {
    seoTitle: landing.seoTitle || '',
    metaDescription: landing.metaDescription || '',
    focusKeyword: landing.focusKeyword || '',
    secondaryKeywords: landing.secondaryKeywords || [],
    urlSlug: landing.urlSlug || '',
    searchIntent: '',
    searchIntentExplanation: ''
  };

  const content = landing.content || {
    h1: landing.h1 || '',
    intro: landing.intro || '',
    benefitsTitle: landing.benefitsTitle || '',
    benefits: landing.benefits || [],
    idealTitle: landing.idealTitle || '',
    idealFor: landing.idealFor || [],
    completeSetupTitle: landing.completeSetupTitle || '',
    completeSetupText: landing.completeSetupText || '',
    subcategoriesTitle: landing.subcategoriesTitle || '',
    subcategoriesIntro: landing.subcategoriesIntro || '',
    subcategories: landing.subcategories || [],
    inspirationTitle: landing.inspirationTitle || '',
    inspirationText: landing.inspirationText || '',
    situationsTitle: landing.situationsTitle || '',
    situations: landing.situations || [],
    detailedScenarioTitle: landing.detailedScenarioTitle || '',
    detailedScenario: landing.detailedScenario || '',
    storytellingSceneTitle: landing.storytellingSceneTitle || '',
    storytellingScene: landing.storytellingScene || '',
    stylingTipsTitle: landing.stylingTipsTitle || '',
    stylingTipsText: landing.stylingTipsText || '',
    personalAdviceTitle: landing.personalAdviceTitle || '',
    personalAdviceText: landing.personalAdviceText || '',
    adviceTitle: landing.adviceTitle || '',
    adviceText: landing.adviceText || '',
    localBlock: (landing as any).content?.localBlock
  };

  const faq = landing.faq || {
    faqTitle: landing.faqTitle || '',
    items: landing.faq || [],
    schemaFAQType: 'FAQPage'
  };

  const cta = landing.cta || {
    ctaTitle: landing.ctaTitle || '',
    ctaText: landing.ctaText || '',
    ctaSuggestions: landing.ctaSuggestions || [],
    nextSteps: []
  };

  const imageSEO: Array<{ alt: string; title: string }> = Array.isArray(landing.imageSEO)
    ? landing.imageSEO
    : (landing.imageSEO?.images || (landing as any).imageSEO || []);
  const internalLinks: Array<{ anchor: string; url: string }> =
    landing.links?.internalLinks || (landing as any).internalLinks || [];
  const externalLinks = landing.links?.externalLinks || [];
  const clusters = landing.clusters?.contentClusterIdeas || [];
  const headings = landing.headings || [];
  const aiSummary = landing.aiSummary || '';

  return { seo, content, faq, cta, imageSEO, internalLinks, externalLinks, clusters, headings, aiSummary };
}

function createLandingBlocks(normalized: ReturnType<typeof normalizeLanding>): LandingBlock[] {
  const { content, faq, cta } = normalized;

  const blocks: LandingBlock[] = [
    { id: 'h1', label: 'H1 – hoofdheadline', type: 'text', visible: !!content.h1 },
    { id: 'intro', label: 'Intro', type: 'textarea', visible: !!content.intro },
    { id: 'benefits', label: content.benefitsTitle || 'Voordelen', type: 'bullets', visible: content.benefits?.length > 0 },
    { id: 'ideal', label: content.idealTitle || 'Voor wie?', type: 'bullets', visible: content.idealFor?.length > 0 },
    {
      id: 'completeSetup',
      label: content.completeSetupTitle || 'Complete opstelling',
      type: 'textarea',
      visible: !!content.completeSetupText
    },
    {
      id: 'subcategories',
      label: content.subcategoriesTitle || 'Subcategorieën',
      type: 'subcategories',
      visible: content.subcategories?.length > 0
    },
    {
      id: 'inspiration',
      label: content.inspirationTitle || 'Inspiratie',
      type: 'textarea',
      visible: !!content.inspirationText
    },
    {
      id: 'situations',
      label: content.situationsTitle || 'Situaties',
      type: 'bullets',
      visible: content.situations?.length > 0
    },
    {
      id: 'detailedScenario',
      label: content.detailedScenarioTitle || 'Uitgewerkt scenario',
      type: 'textarea',
      visible: !!content.detailedScenario
    },
    {
      id: 'storytelling',
      label: content.storytellingSceneTitle || 'Storytelling scene',
      type: 'textarea',
      visible: !!content.storytellingScene
    },
    {
      id: 'stylingTips',
      label: content.stylingTipsTitle || 'Styling tips',
      type: 'textarea',
      visible: !!content.stylingTipsText
    },
    {
      id: 'personalAdvice',
      label: content.personalAdviceTitle || 'Persoonlijk advies',
      type: 'textarea',
      visible: !!content.personalAdviceText
    },
    {
      id: 'advice',
      label: content.adviceTitle || 'Adviesblok',
      type: 'textarea',
      visible: !!content.adviceText
    },
    {
      id: 'local',
      label: content.localBlock?.title || 'Lokaal blok',
      type: 'textarea',
      visible: !!content.localBlock?.text
    },
    {
      id: 'faq',
      label: faq.faqTitle || 'FAQ',
      type: 'faq',
      visible: faq.items?.length > 0
    },
    {
      id: 'cta',
      label: cta.ctaTitle || 'Call to action',
      type: 'cta',
      visible: !!cta.ctaText
    },
    {
      id: 'nextSteps',
      label: 'Volgende stappen',
      type: 'nextSteps',
      // Gebruik een veilige check zodat TypeScript niet klaagt over mogelijk undefined
      visible: Array.isArray(cta.nextSteps) && cta.nextSteps.length > 0
    }
  ];

  return blocks;
}

function createProductBlocks(product: ProductResult): ProductBlock[] {
  return [
    { id: 'title', label: 'Titel (H1)', type: 'text', visible: !!product.title },
    { id: 'intro', label: 'Intro', type: 'textarea', visible: !!product.intro },
    {
      id: 'benefits',
      label: product.benefitsTitle || 'Voordelen',
      type: 'bullets',
      visible: product.benefits?.length > 0
    },
    {
      id: 'ideal',
      label: product.idealTitle || 'Ideaal voor',
      type: 'bullets',
      visible: product.idealFor?.length > 0
    },
    {
      id: 'materials',
      label: product.materialsTitle || 'Materialen',
      type: 'textarea',
      visible: !!product.materialsText
    },
    {
      id: 'useCases',
      label: product.useCasesTitle || 'Gebruikssituaties',
      type: 'textarea',
      visible: !!product.useCasesText
    },
    {
      id: 'advice',
      label: product.adviceTitle || 'Advies',
      type: 'textarea',
      visible: !!product.adviceText
    },
    {
      id: 'service',
      label: product.serviceTitle || 'Service',
      type: 'textarea',
      visible: !!product.serviceText
    },
    {
      id: 'cta',
      label: product.ctaTitle || 'Call to action',
      type: 'textarea',
      visible: !!product.ctaText
    }
  ];
}

// Export functie
async function exportContent(content: any, format: string, contentType: string) {
  try {
    const response = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, format, contentType }),
    });

    if (!response.ok) {
      throw new Error('Export mislukt');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const extension = format === 'wordpress' ? 'html' : format === 'markdown' ? 'md' : format;
    a.download = `content-${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Export error:', error);
    alert('Export mislukt. Probeer het opnieuw.');
    return false;
  }
}

// Download helper for JSON
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

export default function ContentResult({ type, result, onRefine, isRefining, onResultChange }: ContentResultProps) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [editedResult, setEditedResult] = React.useState<ContentResult>(result);

  // Sync wanneer er een nieuwe result binnenkomt (nieuw gegenereerd)
  React.useEffect(() => {
    setEditedResult(result);
  }, [result]);

  // Bellen naar boven wanneer de bewerkte versie verandert (voor opslaan / library)
  React.useEffect(() => {
    if (onResultChange && editedResult) {
      onResultChange(editedResult);
    }
  }, [editedResult, onResultChange]);

  // Landing blok editor + preview state
  const [landingBlocks, setLandingBlocks] = React.useState<LandingBlock[] | null>(null);
  const [draggedBlockId, setDraggedBlockId] = React.useState<LandingBlockKind | null>(null);
  const [deviceMode, setDeviceMode] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [landingLayoutMode, setLandingLayoutMode] = React.useState<'blocks' | 'template'>('template');
  const [landingPaneMode, setLandingPaneMode] = React.useState<'both' | 'blocks' | 'preview'>('both');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = React.useState(false);
  const [productBlocks, setProductBlocks] = React.useState<ProductBlock[] | null>(null);
  const [blogBlocks, setBlogBlocks] = React.useState<BlogBlock[] | null>(null);
  
  // Template sectie mapping: welke content-velden komen in welke secties
  type TemplateSectionField = 
    | 'detailedScenario' | 'completeSetupText' | 'inspirationText' | 'personalAdviceText' 
    | 'adviceText' | 'stylingTipsText' | 'storytellingScene' | 'benefits' | 'idealFor'
    | 'detailedScenarioTitle' | 'benefitsTitle' | 'inspirationTitle' | 'adviceTitle' | 'situationsTitle';
  
  interface TemplateSectionMapping {
    section1Title: TemplateSectionField;
    section1Content: TemplateSectionField;
    section2Title: TemplateSectionField;
    section2Content: TemplateSectionField;
    galleryCol1: TemplateSectionField;
    galleryCol2: TemplateSectionField;
    productsTitle: TemplateSectionField;
    productsText: TemplateSectionField;
    section4Title: TemplateSectionField;
    section4Content: TemplateSectionField;
    quoteText: TemplateSectionField;
  }
  
  const [templateMapping, setTemplateMapping] = React.useState<TemplateSectionMapping>({
    section1Title: 'detailedScenarioTitle',
    section1Content: 'detailedScenario',
    section2Title: 'inspirationTitle',
    section2Content: 'inspirationText',
    galleryCol1: 'storytellingScene',
    galleryCol2: 'personalAdviceText',
    productsTitle: 'situationsTitle',
    productsText: 'adviceText',
    section4Title: 'adviceTitle',
    section4Content: 'adviceText',
    quoteText: 'personalAdviceText',
  });

  // Template sectie editor: drag & drop volgorde en visibility
  type TemplateSectionId = 
    | 'hero' | 'fullImage' | 'section1' | 'section2' | 'gallery' 
    | 'products' | 'section4' | 'quote' | 'faq';

  interface TemplateSection {
    id: TemplateSectionId;
    label: string;
    visible: boolean;
    order: number;
  }

  // Template interface voor opslag
  interface SavedTemplate {
    id: string;
    name: string;
    description?: string;
    sections: TemplateSection[];
    mapping: TemplateSectionMapping;
    customCSS?: string;
    createdAt: string;
    updatedAt: string;
    organizationId?: string; // Voor multi-tenant
  }

  const [templateSections, setTemplateSections] = React.useState<TemplateSection[]>([
    { id: 'hero', label: 'Hero sectie', visible: true, order: 0 },
    { id: 'fullImage', label: 'Full-width afbeelding', visible: true, order: 1 },
    { id: 'section1', label: 'Sectie 1 (tekst/beeld)', visible: true, order: 2 },
    { id: 'section2', label: 'Sectie 2 (beeld/tekst)', visible: true, order: 3 },
    { id: 'gallery', label: 'Galerij met tekst', visible: true, order: 4 },
    { id: 'products', label: 'Productrij', visible: true, order: 5 },
    { id: 'section4', label: 'Sectie 4 (how-to)', visible: true, order: 6 },
    { id: 'quote', label: 'Quote/Service', visible: true, order: 7 },
    { id: 'faq', label: 'FAQ sectie', visible: true, order: 8 },
  ]);

  const [draggedSectionId, setDraggedSectionId] = React.useState<TemplateSectionId | null>(null);

  // Template library state
  const [savedTemplates, setSavedTemplates] = React.useState<SavedTemplate[]>([]);
  const [currentTemplateId, setCurrentTemplateId] = React.useState<string | null>(null);
  const [showTemplateLibrary, setShowTemplateLibrary] = React.useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = React.useState(false);
  const [templateName, setTemplateName] = React.useState('');
  const [templateDescription, setTemplateDescription] = React.useState('');
  const [customCSS, setCustomCSS] = React.useState('');
  const [currentOrganizationId, setCurrentOrganizationId] = React.useState<string>('');
  const [libraryOrganizationFilter, setLibraryOrganizationFilter] = React.useState<string>('all');

  // Template storage functies
  const loadTemplates = React.useCallback(() => {
    try {
      const stored = localStorage.getItem('rankflow-templates');
      if (stored) {
        const templates = JSON.parse(stored) as SavedTemplate[];
        setSavedTemplates(templates);
      }
    } catch (error) {
      console.error('Fout bij laden templates:', error);
    }
  }, []);

  const saveTemplate = React.useCallback(() => {
    if (!templateName.trim()) {
      alert('Geef de template een naam');
      return;
    }

    const template: SavedTemplate = {
      id: currentTemplateId || `template-${Date.now()}`,
      name: templateName.trim(),
      description: templateDescription.trim(),
      sections: [...templateSections],
      mapping: { ...templateMapping },
      customCSS: customCSS.trim() || undefined,
      organizationId: currentOrganizationId.trim() || undefined,
      createdAt: currentTemplateId 
        ? savedTemplates.find(t => t.id === currentTemplateId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = currentTemplateId
      ? savedTemplates.map(t => t.id === currentTemplateId ? template : t)
      : [...savedTemplates, template];

    try {
      localStorage.setItem('rankflow-templates', JSON.stringify(updated));
      setSavedTemplates(updated);
      setCurrentTemplateId(template.id);
      setShowTemplateEditor(false);
      alert('Template opgeslagen!');
    } catch (error) {
      console.error('Fout bij opslaan template:', error);
      alert('Fout bij opslaan template');
    }
  }, [templateName, templateDescription, templateSections, templateMapping, customCSS, currentTemplateId, savedTemplates]);

  const loadTemplate = React.useCallback((templateId: string) => {
    const template = savedTemplates.find(t => t.id === templateId);
    if (template) {
      setTemplateSections(template.sections);
      setTemplateMapping(template.mapping);
      setCustomCSS(template.customCSS || '');
      setCurrentTemplateId(template.id);
      setTemplateName(template.name);
      setTemplateDescription(template.description || '');
      setCurrentOrganizationId(template.organizationId || '');
      setShowTemplateLibrary(false);
    }
  }, [savedTemplates]);

  const deleteTemplate = React.useCallback((templateId: string) => {
    if (confirm('Weet je zeker dat je deze template wilt verwijderen?')) {
      const updated = savedTemplates.filter(t => t.id !== templateId);
      try {
        localStorage.setItem('rankflow-templates', JSON.stringify(updated));
        setSavedTemplates(updated);
        if (currentTemplateId === templateId) {
          setCurrentTemplateId(null);
          setTemplateName('');
          setTemplateDescription('');
          setCustomCSS('');
        }
      } catch (error) {
        console.error('Fout bij verwijderen template:', error);
        alert('Fout bij verwijderen template');
      }
    }
  }, [savedTemplates, currentTemplateId]);

  const duplicateTemplate = React.useCallback((templateId: string) => {
    const template = savedTemplates.find(t => t.id === templateId);
    if (template) {
      const newTemplate: SavedTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        name: `${template.name} (kopie)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [...savedTemplates, newTemplate];
      try {
        localStorage.setItem('rankflow-templates', JSON.stringify(updated));
        setSavedTemplates(updated);
        loadTemplate(newTemplate.id);
      } catch (error) {
        console.error('Fout bij dupliceren template:', error);
        alert('Fout bij dupliceren template');
      }
    }
  }, [savedTemplates, loadTemplate]);

  // Laad templates bij mount
  React.useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Initialiseer of reset blokken wanneer type of resultaat verandert
  React.useEffect(() => {
    if (type === 'landing') {
      const landing = editedResult as LandingResult;
      const normalized = normalizeLanding(landing);
      setLandingBlocks(createLandingBlocks(normalized));
      setProductBlocks(null);
      setBlogBlocks(null);
    } else if (type === 'product') {
      const product = editedResult as ProductResult;
      setProductBlocks(createProductBlocks(product));
      setLandingBlocks(null);
      setBlogBlocks(null);
    } else if (type === 'blog') {
      const blog = editedResult as BlogResult;
      const blocks: BlogBlock[] = [
        { id: 'h1', label: 'H1 – hoofdheadline', type: 'text', visible: !!blog.h1 },
        { id: 'intro', label: 'Intro', type: 'textarea', visible: !!blog.intro },
        {
          id: 'sections',
          label: 'Hoofdsecties',
          type: 'textarea',
          visible: blog.sections?.length > 0
        },
        {
          id: 'steps',
          label: blog.stepsTitle || 'Stappenplan',
          type: 'bullets',
          visible: blog.steps?.length > 0
        },
        {
          id: 'mistakes',
          label: blog.mistakesTitle || 'Veelgemaakte fouten',
          type: 'textarea',
          visible: blog.mistakes?.length > 0
        },
        {
          id: 'scenarioBlocks',
          label: blog.scenarioBlocksTitle || 'Scenario blokken',
          type: 'textarea',
          visible: blog.scenarioBlocks?.length > 0
        },
        {
          id: 'practicalAdvice',
          label: blog.practicalAdviceTitle || 'Praktisch advies',
          type: 'textarea',
          visible: !!blog.practicalAdvice
        },
        {
          id: 'materials',
          label: blog.materialsTitle || 'Materialen',
          type: 'bullets',
          visible: blog.materialsList?.length > 0
        },
        {
          id: 'cta',
          label: blog.ctaTitle || 'Call to action',
          type: 'textarea',
          visible: !!blog.ctaText
        }
      ];
      setBlogBlocks(blocks);
      setLandingBlocks(null);
      setProductBlocks(null);
    } else {
      setLandingBlocks(null);
      setProductBlocks(null);
      setBlogBlocks(null);
    }
  }, [type, editedResult]);
  
  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      await exportContent(editedResult, format, type);
    } finally {
      setIsExporting(false);
    }
  };

  // Check voor warnings (van lengte validatie)
  const warnings = (editedResult as any)._warnings || [];
  const renderSection = (title: string, content: string | string[] | Array<{ question: string; answer: string }> | Array<{ heading: string; content: string }> | Array<{ name: string; description: string }>, showCopy = true) => {
    let displayContent: string;
    
    if (Array.isArray(content)) {
      if (content.length > 0 && typeof content[0] === 'object') {
        // FAQ
        if ('question' in content[0]) {
          displayContent = (content as Array<{ question: string; answer: string }>)
            .map((item) => `V: ${item.question}\nA: ${item.answer}`)
            .join('\n\n');
        }
        // Sections
        else if ('heading' in content[0]) {
          displayContent = (content as Array<{ heading: string; content: string }>)
            .map((item) => `${item.heading}\n\n${item.content}`)
            .join('\n\n');
        }
        // Subcategories
        else if ('name' in content[0]) {
          displayContent = (content as Array<{ name: string; description: string }>)
            .map((item) => `${item.name}: ${item.description}`)
            .join('\n\n');
        }
        else {
          displayContent = '';
        }
      } else {
        displayContent = (content as string[]).join('\n\n');
      }
    } else {
      displayContent = content;
    }

    return (
      <div key={title} className="result-section">
        <h3>
          {title}
          {showCopy && <CopyButton text={displayContent} />}
        </h3>
        <div className="result-content">{displayContent}</div>
      </div>
    );
  };

  const renderBullets = (title: string, bullets: string[] | string | undefined | null) => {
    // Normaliseer naar array van strings
    const bulletArray: string[] = Array.isArray(bullets)
      ? bullets.map((b) => (typeof b === 'string' ? b : String(b)))
      : bullets
      ? [String(bullets)]
      : [];

    const content = bulletArray.join('\n• ');
    return (
      <div className="result-section">
        <h3>
          {title}
          <CopyButton text={content} />
        </h3>
        <div className="result-content">
          <ul className="bullets-list">
            {bulletArray.map((bullet, index) => (
              <li key={index}>{bullet}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // Render warnings en export buttons wrapper
  const renderWrapper = (content: React.ReactNode) => {
    return (
      <div className="result-container">
        {/* Warnings banner */}
        {warnings.length > 0 && (
          <div className="warnings-banner">
            <h3>⚠️ Waarschuwingen</h3>
            {warnings.map((warning: any, index: number) => (
              <div key={index} className="warning-item">
                <strong>{warning.type}:</strong> {warning.message}
                {warning.wordCount && (
                  <span className="word-count">
                    ({warning.wordCount} woorden, doel: {warning.minWords}-{warning.maxWords})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Export buttons */}
        <div className="export-buttons">
          <button 
            onClick={() => handleExport('json')} 
            disabled={isExporting}
            className="export-btn"
          >
            {isExporting ? 'Exporteren...' : '📥 Export JSON'}
          </button>
          <button 
            onClick={() => handleExport('csv')} 
            disabled={isExporting}
            className="export-btn"
          >
            {isExporting ? 'Exporteren...' : '📊 Export CSV'}
          </button>
          <button 
            onClick={() => handleExport('wordpress')} 
            disabled={isExporting}
            className="export-btn"
          >
            {isExporting ? 'Exporteren...' : '🌐 Export WordPress'}
          </button>
          <button 
            onClick={() => handleExport('markdown')} 
            disabled={isExporting}
            className="export-btn"
          >
            {isExporting ? 'Exporteren...' : '📝 Export Markdown'}
          </button>
        </div>

        {content}
      </div>
    );
  };

  // Product pagina
  if (type === 'product') {
    const product = editedResult as ProductResult;
    const blocks = productBlocks || createProductBlocks(product);
    const visibleBlocks = blocks.filter((b) => b.visible);

    const handleBlockVisibilityToggle = (id: ProductBlockKind) => {
      setProductBlocks((prev) => {
        const current = prev || blocks;
        return current.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b));
      });
    };

    const handleProductDragStart = (id: ProductBlockKind, event: React.DragEvent<HTMLDivElement>) => {
      // We hergebruiken draggedBlockId generiek niet voor landing hier;
      event.dataTransfer.effectAllowed = 'move';
      // Gebruik tijdelijke dataTransfer id; drag reordering gebeurt in onDrop
      event.dataTransfer.setData('text/plain', id);
    };

    const handleProductDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    };

    const handleProductDrop = (targetId: ProductBlockKind, event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const draggedId = event.dataTransfer.getData('text/plain') as ProductBlockKind;
      if (!draggedId || draggedId === targetId) return;
      setProductBlocks((prev) => {
        const current = prev || blocks;
        const fromIndex = current.findIndex((b) => b.id === draggedId);
        const toIndex = current.findIndex((b) => b.id === targetId);
        if (fromIndex === -1 || toIndex === -1) return current;
        const updated = [...current];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      });
    };

    const handleProductTextChange = (id: ProductBlockKind, value: string) => {
      setEditedResult((prev) => {
        const prevProduct = prev as ProductResult;
        const updated: ProductResult = { ...prevProduct };

        switch (id) {
          case 'title':
            updated.title = value;
            break;
          case 'intro':
            updated.intro = value;
            break;
          case 'materials':
            updated.materialsText = value;
            break;
          case 'useCases':
            updated.useCasesText = value;
            break;
          case 'advice':
            updated.adviceText = value;
            break;
          case 'service':
            updated.serviceText = value;
            break;
          case 'cta':
            updated.ctaText = value;
            break;
          default:
            break;
        }

        return updated as ContentResult;
      });
    };

    const handleProductBulletsChange = (id: ProductBlockKind, value: string) => {
      const items = value
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean);

      setEditedResult((prev) => {
        const prevProduct = prev as ProductResult;
        const updated: ProductResult = { ...prevProduct };

        switch (id) {
          case 'benefits':
            updated.benefits = items;
            break;
          case 'ideal':
            updated.idealFor = items;
            break;
          default:
            break;
        }

        return updated as ContentResult;
      });
    };

    const getProductBlockValue = (block: ProductBlock) => {
      switch (block.id) {
        case 'title':
          return product.title || '';
        case 'intro':
          return product.intro || '';
        case 'benefits':
          return (product.benefits || []).join('\n');
        case 'ideal':
          return (product.idealFor || []).join('\n');
        case 'materials':
          return product.materialsText || '';
        case 'useCases':
          return product.useCasesText || '';
        case 'advice':
          return product.adviceText || '';
        case 'service':
          return product.serviceText || '';
        case 'cta':
          return product.ctaText || '';
        default:
          return '';
      }
    };

    return renderWrapper((
      <div className="landing-builder">
        {onRefine && (
          <div className="refine-section">
            <button
              onClick={onRefine}
              disabled={isRefining}
              className="button refine-button"
            >
              {isRefining ? 'Verbeteren...' : 'Verbeter deze tekst'}
            </button>
          </div>
        )}

        <div className="result-section seo-section">
          <h3>SEO Metadata</h3>
          <div className="result-content">
            <div style={{ marginBottom: '1rem' }}>
              <strong>Page Title:</strong> {product.seoTitle}{' '}
              <CopyButton text={product.seoTitle} />
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                {product.seoTitle.length} / 60 karakters
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Meta Description:</strong> {product.metaDescription}{' '}
              <CopyButton text={product.metaDescription} />
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                {product.metaDescription.length} / 155 karakters
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Focus Keyword:</strong> {product.focusKeyword}{' '}
              <CopyButton text={product.focusKeyword} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Secondary Keywords:</strong> {product.secondaryKeywords.join(', ')}{' '}
              <CopyButton text={product.secondaryKeywords.join(', ')} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>URL Slug:</strong> {product.urlSlug}{' '}
              <CopyButton text={product.urlSlug} />
            </div>
          </div>
        </div>

        <div className="landing-builder-columns">
          {/* Blok-editor links */}
          <div className="landing-block-editor">
            <h3 className="landing-block-editor-title">Productpagina blokken</h3>
            <p className="landing-block-editor-subtitle">
              Versleep blokken om de volgorde te wijzigen en pas teksten direct aan.
            </p>
            <div className="landing-block-list">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className={
                    'landing-block' + (block.visible ? '' : ' landing-block-hidden')
                  }
                  draggable
                  onDragStart={(e) => handleProductDragStart(block.id, e)}
                  onDragOver={handleProductDragOver}
                  onDrop={(e) => handleProductDrop(block.id, e)}
                >
                  <div className="landing-block-header">
                    <span className="landing-block-drag-handle">⋮⋮</span>
                    <div className="landing-block-labels">
                      <span className="landing-block-label">{block.label}</span>
                      <span className="landing-block-type">
                        {block.type === 'bullets' && 'Bullets'}
                        {block.type === 'text' && 'Kop'}
                        {block.type === 'textarea' && 'Paragraaf'}
                      </span>
        </div>
                    <label className="landing-block-toggle">
                      <input
                        type="checkbox"
                        checked={block.visible}
                        onChange={() => handleBlockVisibilityToggle(block.id)}
                      />
                      <span>{block.visible ? 'Zichtbaar' : 'Verborgen'}</span>
                    </label>
                  </div>

                  <div className="landing-block-body">
                    {block.type === 'text' && (
                      <input
                        className="landing-block-input"
                        value={getProductBlockValue(block)}
                        onChange={(e) => handleProductTextChange(block.id, e.target.value)}
                      />
                    )}
                    {block.type !== 'text' && (
                      <textarea
                        className="landing-block-textarea"
                        value={getProductBlockValue(block)}
                        onChange={(e) => {
                          if (block.type === 'bullets') {
                            handleProductBulletsChange(block.id, e.target.value);
                          } else {
                            handleProductTextChange(block.id, e.target.value);
                          }
                        }}
                      />
                    )}
                    {block.type === 'bullets' && (
                      <div className="landing-block-hint">
                        Eén bullet per regel. Lege regels worden genegeerd.
                      </div>
                    )}
                  </div>
              </div>
            ))}
          </div>
          </div>

          {/* Preview rechts */}
          <div className={isPreviewModalOpen ? 'landing-preview-shell landing-preview-shell-overlay' : 'landing-preview-shell'}>
            <div className="landing-preview">
              <div className="landing-preview-header">
                <div>
                  <h3>Live product preview</h3>
                  <p>Bekijk hoe deze productpagina er ongeveer uitziet op de site.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="landing-preview-fullscreen-button"
                    onClick={() => setIsPreviewModalOpen((prev) => !prev)}
                  >
                    {isPreviewModalOpen ? 'Sluit fullscreen' : 'Open fullscreen'}
                  </button>
                  <div className="landing-preview-device-toggle">
                <button
                  type="button"
                  className={
                    'landing-preview-device-button' +
                    (deviceMode === 'desktop' ? ' landing-preview-device-button-active' : '')
                  }
                  onClick={() => setDeviceMode('desktop')}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  className={
                    'landing-preview-device-button' +
                    (deviceMode === 'tablet' ? ' landing-preview-device-button-active' : '')
                  }
                  onClick={() => setDeviceMode('tablet')}
                >
                  Tablet
                </button>
                <button
                  type="button"
                  className={
                    'landing-preview-device-button' +
                    (deviceMode === 'mobile' ? ' landing-preview-device-button-active' : '')
                  }
                  onClick={() => setDeviceMode('mobile')}
                >
                  Mobile
                </button>
                  </div>
                </div>
              </div>

            <div
              className={
                'landing-preview-viewport ' +
                (deviceMode === 'desktop'
                  ? 'landing-preview-viewport-desktop'
                  : deviceMode === 'tablet'
                  ? 'landing-preview-viewport-tablet'
                  : 'landing-preview-viewport-mobile')
              }
            >
              <div className="landing-preview-page">
                {/* SERP snippet */}
                <div className="landing-preview-serp">
                  <div className="landing-preview-serp-url">
                    broersverhuur.nl › {product.urlSlug || 'product'}
                  </div>
                  <div className="landing-preview-serp-title">
                    {product.seoTitle || 'Product titel'}
                  </div>
                  <div className="landing-preview-serp-description">
                    {product.metaDescription || 'Meta description voor deze productpagina.'}
                  </div>
                  <div className="landing-preview-serp-metrics">
                    <span
                      className={
                        'serp-length serp-length-' +
                        getLengthStatus(product.seoTitle.length, 30, 60)
                      }
                    >
                      Title: {product.seoTitle.length} tekens
                    </span>
                    <span
                      className={
                        'serp-length serp-length-' +
                        getLengthStatus(product.metaDescription.length, 80, 160)
                      }
                    >
                      Description: {product.metaDescription.length} tekens
                    </span>
                  </div>
                </div>

                <header className="landing-preview-hero">
                  <div className="landing-preview-hero-content">
                    <p className="landing-preview-hero-label">Broers Verhuur · Product</p>
                    <h1 className="landing-preview-h1">
                      {visibleBlocks.find((b) => b.id === 'title') ? product.title : ''}
                    </h1>
                    {visibleBlocks.find((b) => b.id === 'intro') && (
                      <p className="landing-preview-intro">{product.intro}</p>
                    )}
                    {visibleBlocks.find((b) => b.id === 'cta') && (
                      <button className="landing-preview-cta">
                        {product.ctaTitle || 'Vraag direct een offerte aan'}
                      </button>
                    )}
                  </div>
                </header>

                <main className="landing-preview-main">
                  {visibleBlocks.find((b) => b.id === 'benefits') && (
                    <section className="landing-preview-section">
                      <h2>{product.benefitsTitle || 'Daarom kies je dit product'}</h2>
                      <ul className="landing-preview-list">
                        {(product.benefits || []).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {visibleBlocks.find((b) => b.id === 'ideal') && (
                    <section className="landing-preview-section">
                      <h2>{product.idealTitle || 'Ideaal voor'}</h2>
                      <ul className="landing-preview-list">
                        {(product.idealFor || []).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {visibleBlocks.find((b) => b.id === 'materials') && (
                    <section className="landing-preview-section">
                      <h2>{product.materialsTitle || 'Materialen & kwaliteit'}</h2>
                      <p>{product.materialsText}</p>
                    </section>
                  )}

                  {visibleBlocks.find((b) => b.id === 'useCases') && (
                    <section className="landing-preview-section">
                      <h2>{product.useCasesTitle || 'Gebruikssituaties'}</h2>
                      <p>{product.useCasesText}</p>
                    </section>
                  )}

                  {visibleBlocks.find((b) => b.id === 'advice') && (
                    <section className="landing-preview-section">
                      <h2>{product.adviceTitle || 'Praktisch advies'}</h2>
                      <p>{product.adviceText}</p>
                    </section>
                  )}

                  {visibleBlocks.find((b) => b.id === 'service') && (
                    <section className="landing-preview-section">
                      <h2>{product.serviceTitle || 'Service & levering'}</h2>
                      <p>{product.serviceText}</p>
                    </section>
                  )}

                  {visibleBlocks.find((b) => b.id === 'cta') && (
                    <section className="landing-preview-section landing-preview-cta-section">
                      <div className="landing-preview-cta-card">
                        <h2>{product.ctaTitle || 'Klaar om dit product te reserveren?'}</h2>
                        <p>{product.ctaText}</p>
                        <button className="landing-preview-cta">
                          {product.ctaTitle || 'Vraag direct een offerte aan'}
                        </button>
                      </div>
                    </section>
                  )}

                  {product.imageSEO && product.imageSEO.length > 0 && (
                    <section className="landing-preview-section landing-preview-meta">
                      <h2>Image SEO</h2>
                      <ul className="landing-preview-list">
                        {product.imageSEO.map((img, index) => (
                          <li key={index}>
                            <strong>Alt:</strong> {img.alt} &mdash; <strong>Title:</strong>{' '}
                            {img.title}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

        {product.internalLinks && product.internalLinks.length > 0 && (
                    <section className="landing-preview-section landing-preview-meta">
                      <h2>Interne links</h2>
                      <ul className="landing-preview-list">
                {product.internalLinks.map((link, index) => (
                  <li key={index}>
                            <strong>{link.anchor}</strong> – <code>{link.url}</code>
                  </li>
                ))}
              </ul>
                    </section>
        )}

        {product.ctaSuggestions && product.ctaSuggestions.length > 0 && (
                    <section className="landing-preview-section landing-preview-meta">
                      <h2>CTA suggesties</h2>
                      <ul className="landing-preview-list">
                        {product.ctaSuggestions.map((ctaText, index) => (
                          <li key={index}>{ctaText}</li>
                ))}
              </ul>
                    </section>
                  )}
                </main>
            </div>
          </div>
          </div>
        </div>

        {product.schema && (
          <div className="result-section">
            <h3>Schema.org Markup</h3>
            <div className="result-content">
              <pre style={{ fontSize: '0.875rem', overflow: 'auto' }}>
                {JSON.stringify(product.schema, null, 2)}
              </pre>
              <CopyButton
                text={`<script type="application/ld+json">\n${JSON.stringify(
                  product.schema,
                  null,
                  2
                )}\n</script>`}
              />
            </div>
          </div>
        )}
      </div>
    ));
  }

  // Categorie pagina
  if (type === 'categorie') {
    const categorie = editedResult as CategorieResult;
    return renderWrapper((
      <div>
        {onRefine && (
          <div className="refine-section">
            <button
              onClick={onRefine}
              disabled={isRefining}
              className="button refine-button"
            >
              {isRefining ? 'Verbeteren...' : 'Verbeter deze tekst'}
            </button>
          </div>
        )}
        <div className="result-section seo-section">
          <h3>SEO Metadata</h3>
          <div className="result-content">
            <div style={{ marginBottom: '1rem' }}>
              <strong>Page Title:</strong> {categorie.seoTitle} <CopyButton text={categorie.seoTitle} />
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                {categorie.seoTitle.length} / 60 karakters
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Meta Description:</strong> {categorie.metaDescription} <CopyButton text={categorie.metaDescription} />
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                {categorie.metaDescription.length} / 155 karakters
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Focus Keyword:</strong> {categorie.focusKeyword} <CopyButton text={categorie.focusKeyword} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Secondary Keywords:</strong> {categorie.secondaryKeywords.join(', ')} <CopyButton text={categorie.secondaryKeywords.join(', ')} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>URL Slug:</strong> {categorie.urlSlug} <CopyButton text={categorie.urlSlug} />
            </div>
          </div>
        </div>
        {renderSection('H1', categorie.h1)}
        {renderSection('Intro', categorie.intro)}
        {renderBullets(categorie.benefitsTitle, categorie.benefits)}
        {renderBullets(categorie.scenariosTitle, categorie.scenarios)}
        {renderSection(categorie.inspirationTitle, categorie.inspirationText)}
        {renderSection(categorie.adviceTitle, categorie.adviceText)}
        <div className="result-section">
          <h3>
            {categorie.ctaTitle}
            <CopyButton text={categorie.ctaText} />
          </h3>
          <div className="result-content">{categorie.ctaText}</div>
        </div>
        {categorie.imageSEO && categorie.imageSEO.length > 0 && (
          <div className="result-section">
            <h3>Image SEO</h3>
            {categorie.imageSEO.map((img, index) => (
              <div key={index} style={{ marginBottom: '1rem' }}>
                <CopyButton text={`Alt: ${img.alt}\nTitle: ${img.title}`} />
                <p><strong>Alt tekst:</strong> {img.alt}</p>
                <p><strong>Title:</strong> {img.title}</p>
              </div>
            ))}
          </div>
        )}
        {categorie.internalLinks && categorie.internalLinks.length > 0 && (
          <div className="result-section">
            <h3>Interne Links</h3>
            <div className="result-content">
              <ul className="bullets-list">
                {categorie.internalLinks.map((link, index) => (
                  <li key={index}>
                    <strong>{link.anchor}</strong> → <code>{link.url}</code>
                    <CopyButton text={`[${link.anchor}](${link.url})`} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {categorie.ctaSuggestions && categorie.ctaSuggestions.length > 0 && (
          <div className="result-section">
            <h3>CTA Suggesties</h3>
            <div className="result-content">
              <ul className="bullets-list">
                {categorie.ctaSuggestions.map((cta, index) => (
                  <li key={index}>
                    {cta} <CopyButton text={cta} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {categorie.schema && (
          <div className="result-section">
            <h3>Schema.org Markup</h3>
            <div className="result-content">
              <pre style={{ fontSize: '0.875rem', overflow: 'auto' }}>
                {JSON.stringify(categorie.schema, null, 2)}
              </pre>
              <CopyButton text={`<script type="application/ld+json">\n${JSON.stringify(categorie.schema, null, 2)}\n</script>`} />
            </div>
          </div>
        )}
      </div>
    ));
  }

  // Landing pagina
  if (type === 'landing') {
    const landing = editedResult as LandingResult;
    const normalized = normalizeLanding(landing);
    const { seo, content, faq, cta, imageSEO, internalLinks, externalLinks, clusters, headings, aiSummary } = normalized;

    // Gebruik focus keyword om een kort onderwerp-label te tonen in de hero (bijv. "bruiloft", "feestdagen")
    const focusKeyword = seo?.focusKeyword || '';
    const topicLabel =
      (focusKeyword && focusKeyword.replace(/\s+huren$/i, '').trim()) ||
      (content?.h1 || '').split(' ')[0] ||
      '';

    const blocks = landingBlocks || createLandingBlocks(normalized);

    const handleBlockVisibilityToggle = (id: LandingBlockKind) => {
      setLandingBlocks((prev) => {
        const current = prev || blocks;
        return current.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b));
      });
    };

    const handleBlockDragStart = (id: LandingBlockKind, event: React.DragEvent<HTMLDivElement>) => {
      setDraggedBlockId(id);
      event.dataTransfer.effectAllowed = 'move';
    };

    const handleBlockDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    };

    const handleBlockDrop = (targetId: LandingBlockKind, event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!draggedBlockId || draggedBlockId === targetId) {
        setDraggedBlockId(null);
        return;
      }
      setLandingBlocks((prev) => {
        const current = prev || blocks;
        const fromIndex = current.findIndex((b) => b.id === draggedBlockId);
        const toIndex = current.findIndex((b) => b.id === targetId);
        if (fromIndex === -1 || toIndex === -1) return current;
        const updated = [...current];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      });
      setDraggedBlockId(null);
    };

    const handleBlockDragEnd = () => {
      setDraggedBlockId(null);
    };

    // Template sectie drag & drop handlers
    const handleSectionDragStart = (id: TemplateSectionId, event: React.DragEvent<HTMLDivElement>) => {
      setDraggedSectionId(id);
      event.dataTransfer.effectAllowed = 'move';
    };

    const handleSectionDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    };

    const handleSectionDrop = (targetId: TemplateSectionId, event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!draggedSectionId || draggedSectionId === targetId) {
        setDraggedSectionId(null);
        return;
      }
      setTemplateSections((prev) => {
        const fromIndex = prev.findIndex((s) => s.id === draggedSectionId);
        const toIndex = prev.findIndex((s) => s.id === targetId);
        if (fromIndex === -1 || toIndex === -1) return prev;
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        // Update order numbers
        return updated.map((s, idx) => ({ ...s, order: idx }));
      });
      setDraggedSectionId(null);
    };

    const handleSectionDragEnd = () => {
      setDraggedSectionId(null);
    };

    const handleSectionVisibilityToggle = (id: TemplateSectionId) => {
      setTemplateSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
      );
    };

    const updateContentField = (updater: (current: ReturnType<typeof normalizeLanding>) => ReturnType<typeof normalizeLanding>) => {
      setEditedResult((prev) => {
        const prevLanding = prev as LandingResult;
        const normalizedPrev = normalizeLanding(prevLanding);
        const updatedNormalized = updater(normalizedPrev);

        // Schrijf terug in LandingResult structuur
        const updatedLanding: LandingResult = {
          ...prevLanding,
          seo: updatedNormalized.seo,
          content: {
            ...updatedNormalized.content
          },
          faq: {
            ...updatedNormalized.faq
          },
          cta: {
            ...updatedNormalized.cta
          },
          imageSEO: { images: updatedNormalized.imageSEO },
          links: {
            internalLinks: updatedNormalized.internalLinks,
            externalLinks: updatedNormalized.externalLinks
          },
          clusters: {
            contentClusterIdeas: updatedNormalized.clusters
          },
          headings: updatedNormalized.headings,
          readabilityHints: prevLanding.readabilityHints
        };

        return updatedLanding as ContentResult;
      });
    };

    const handleTextChange = (id: LandingBlockKind, value: string) => {
      updateContentField((current) => {
        const next = { ...current, content: { ...current.content }, faq: { ...current.faq }, cta: { ...current.cta } };
        switch (id) {
          case 'h1':
            next.content.h1 = value;
            break;
          case 'intro':
            next.content.intro = value;
            break;
          case 'completeSetup':
            next.content.completeSetupText = value;
            break;
          case 'inspiration':
            next.content.inspirationText = value;
            break;
          case 'detailedScenario':
            next.content.detailedScenario = value;
            break;
          case 'storytelling':
            next.content.storytellingScene = value;
            break;
          case 'stylingTips':
            next.content.stylingTipsText = value;
            break;
          case 'personalAdvice':
            next.content.personalAdviceText = value;
            break;
          case 'advice':
            next.content.adviceText = value;
            break;
          case 'local':
            next.content.localBlock = {
              ...(next.content.localBlock || { title: 'Lokaal blok' }),
              text: value
            };
            break;
          case 'cta':
            next.cta.ctaText = value;
            break;
          default:
            break;
        }
        return next;
      });
    };

    const handleBulletsChange = (id: LandingBlockKind, value: string) => {
      const items = value
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean);

      updateContentField((current) => {
        const next = { ...current, content: { ...current.content } };
        switch (id) {
          case 'benefits':
            next.content.benefits = items;
            break;
          case 'ideal':
            next.content.idealFor = items;
            break;
          case 'situations':
            next.content.situations = items;
            break;
          default:
            break;
        }
        return next;
      });
    };

    const handleNextStepsChange = (value: string) => {
      const items = value
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean);

      updateContentField((current) => {
        const next = { ...current, cta: { ...current.cta } };
        next.cta.nextSteps = items;
        return next;
      });
    };

    const handleFaqChange = (value: string) => {
      const parts = value.split(/\n\n+/).filter(Boolean);
      const items = parts.map((block) => {
        const [qLine, ...rest] = block.split('\n');
        const question = qLine?.replace(/^V:\s*/i, '').trim() || '';
        const answer = rest.join('\n').replace(/^A:\s*/i, '').trim();
        return { question, answer };
      });

      updateContentField((current) => {
        const next = { ...current, faq: { ...current.faq } };
        next.faq.items = items;
        return next;
      });
    };

    const getBlockValue = (block: LandingBlock) => {
      switch (block.id) {
        case 'h1':
          return content.h1 || '';
        case 'intro':
          return content.intro || '';
        case 'benefits':
          return Array.isArray(content.benefits)
            ? content.benefits.join('\n')
            : content.benefits
            ? String(content.benefits)
            : '';
        case 'ideal':
          return Array.isArray(content.idealFor)
            ? content.idealFor.join('\n')
            : content.idealFor
            ? String(content.idealFor)
            : '';
        case 'completeSetup':
          return content.completeSetupText || '';
        case 'subcategories':
          return `${content.subcategoriesIntro || ''}\n\n${(content.subcategories || [])
            .map((s) => `${s.name}: ${s.description}`)
            .join('\n')}`;
        case 'inspiration':
          return content.inspirationText || '';
        case 'situations':
          return Array.isArray(content.situations)
            ? content.situations.join('\n')
            : content.situations
            ? String(content.situations)
            : '';
        case 'detailedScenario':
          return content.detailedScenario || '';
        case 'storytelling':
          return content.storytellingScene || '';
        case 'stylingTips':
          return content.stylingTipsText || '';
        case 'personalAdvice':
          return content.personalAdviceText || '';
        case 'advice':
          return content.adviceText || '';
        case 'local':
          return content.localBlock?.text || '';
        case 'faq':
          return (faq.items || [])
            .map((item) => `V: ${item.question}\nA: ${item.answer}`)
            .join('\n\n');
        case 'cta':
          return cta.ctaText || '';
        case 'nextSteps':
          return (cta.nextSteps || []).join('\n');
        default:
          return '';
      }
    };

    const visibleOrderedBlocks = blocks.filter((b) => b.visible);

    // Helper: haal content op basis van field naam
    const getContentByField = (field: TemplateSectionField): string => {
      switch (field) {
        case 'detailedScenario':
          return content.detailedScenario || '';
        case 'detailedScenarioTitle':
          return content.detailedScenarioTitle || '';
        case 'completeSetupText':
          return content.completeSetupText || '';
        case 'inspirationText':
          return content.inspirationText || '';
        case 'inspirationTitle':
          return content.inspirationTitle || '';
        case 'personalAdviceText':
          return content.personalAdviceText || '';
        case 'adviceText':
          return content.adviceText || '';
        case 'adviceTitle':
          return content.adviceTitle || '';
        case 'stylingTipsText':
          return content.stylingTipsText || '';
        case 'storytellingScene':
          return content.storytellingScene || '';
        case 'benefits':
          return Array.isArray(content.benefits) 
            ? content.benefits.join(' ') 
            : String(content.benefits || '');
        case 'benefitsTitle':
          return content.benefitsTitle || '';
        case 'idealFor':
          return Array.isArray(content.idealFor)
            ? content.idealFor.join(' ')
            : String(content.idealFor || '');
        case 'situationsTitle':
          return content.situationsTitle || '';
        default:
          return '';
      }
    };

    // Beschikbare content velden voor dropdowns
    const availableContentFields: { value: TemplateSectionField; label: string }[] = [
      { value: 'detailedScenario', label: 'Gedetailleerd scenario' },
      { value: 'detailedScenarioTitle', label: 'Scenario titel' },
      { value: 'completeSetupText', label: 'Complete opstelling' },
      { value: 'inspirationText', label: 'Inspiratie tekst' },
      { value: 'inspirationTitle', label: 'Inspiratie titel' },
      { value: 'personalAdviceText', label: 'Persoonlijk advies' },
      { value: 'adviceText', label: 'Praktisch advies' },
      { value: 'adviceTitle', label: 'Advies titel' },
      { value: 'stylingTipsText', label: 'Styling tips' },
      { value: 'storytellingScene', label: 'Storytelling scene' },
      { value: 'benefits', label: 'Voordelen' },
      { value: 'benefitsTitle', label: 'Voordelen titel' },
      { value: 'idealFor', label: 'Ideaal voor' },
      { value: 'situationsTitle', label: 'Situaties titel' },
    ];

    return renderWrapper((
      <div className="landing-builder">
        {onRefine && (
          <div className="refine-section">
            <button
              onClick={onRefine}
              disabled={isRefining}
              className="button refine-button"
            >
              {isRefining ? 'Verbeteren...' : 'Verbeter deze tekst'}
            </button>
          </div>
        )}

        {/* SEO + headings boven de editor */}
        <div className="result-section seo-section">
          <h3>SEO Metadata</h3>
          <div className="result-content">
            <div style={{ marginBottom: '1rem' }}>
              <strong>Page Title:</strong> {seo.seoTitle} <CopyButton text={seo.seoTitle} />
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                {seo.seoTitle.length} / 60 karakters
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Meta Description:</strong> {seo.metaDescription}{' '}
              <CopyButton text={seo.metaDescription} />
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                {seo.metaDescription.length} / 155 karakters
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Focus Keyword:</strong> {seo.focusKeyword}{' '}
              <CopyButton text={seo.focusKeyword} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Secondary Keywords:</strong> {seo.secondaryKeywords.join(', ')}{' '}
              <CopyButton text={seo.secondaryKeywords.join(', ')} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>URL Slug:</strong> {seo.urlSlug} <CopyButton text={seo.urlSlug} />
            </div>
            {seo.searchIntent && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Search Intent:</strong> {seo.searchIntent}
                {seo.searchIntentExplanation && (
                  <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                    {seo.searchIntentExplanation}
              </div>
            )}
          </div>
            )}
        </div>
        </div>

        {headings.length > 0 && (
          <div className="result-section">
            <h3>Headings Structuur</h3>
            <div className="result-content">
              <ul className="bullets-list">
                {headings.map((heading, index) => (
                  <li key={index}>
                    <strong>{heading.level.toUpperCase()}:</strong> {heading.text}
                    {heading.containsFocusKeyword && (
                      <span style={{ color: '#4caf50', marginLeft: '0.5rem' }}>
                        ✓ (bevat focus keyword)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {landing.schema && (
          <div className="result-section">
            <h3>Schema.org Markup (JSON-LD)</h3>
            <div className="result-content">
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <CopyButton text={JSON.stringify(landing.schema, null, 2)} />
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => downloadJson(landing.schema, `${landing.seo?.urlSlug || 'schema'}.json`)}
                >
                  Download JSON
                </button>
              </div>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '1rem', 
                borderRadius: '4px', 
                overflow: 'auto',
                fontSize: '0.875rem',
                maxHeight: '400px'
              }} data-testid="schema-json">
                {JSON.stringify(landing.schema, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Toggle om ruimte te geven: beide panelen, alleen blokken of alleen preview */}
        <div className="landing-view-toggle">
          <span className="landing-view-toggle-label">Weergave</span>
          <div className="landing-view-toggle-buttons">
            <button
              type="button"
              className={
                'landing-view-toggle-button' +
                (landingPaneMode === 'both' ? ' landing-view-toggle-button-active' : '')
              }
              onClick={() => setLandingPaneMode('both')}
            >
              Beide
            </button>
            <button
              type="button"
              className={
                'landing-view-toggle-button' +
                (landingPaneMode === 'blocks' ? ' landing-view-toggle-button-active' : '')
              }
              onClick={() => setLandingPaneMode('blocks')}
            >
              Alleen blokken
            </button>
            <button
              type="button"
              className={
                'landing-view-toggle-button' +
                (landingPaneMode === 'preview' ? ' landing-view-toggle-button-active' : '')
              }
              onClick={() => setLandingPaneMode('preview')}
            >
              Alleen preview
            </button>
          </div>
        </div>

        {/* Template beheer knoppen (alleen in template mode) */}
        {landingLayoutMode === 'template' && landingPaneMode !== 'blocks' && (
          <div className="landing-template-actions">
            <div className="landing-template-org">
              <label className="landing-template-org-label">
                Klant / merk
                <input
                  type="text"
                  value={currentOrganizationId}
                  onChange={(e) => setCurrentOrganizationId(e.target.value)}
                  placeholder="Bijv. Broers Verhuur, RankFlow Studio..."
                  className="landing-template-org-input"
                />
              </label>
            </div>
            <div className="landing-template-actions-buttons">
              <button
                type="button"
                className="landing-template-action-button"
                onClick={() => {
                  setTemplateName(currentTemplateId ? savedTemplates.find(t => t.id === currentTemplateId)?.name || '' : '');
                  setTemplateDescription(currentTemplateId ? savedTemplates.find(t => t.id === currentTemplateId)?.description || '' : '');
                  setCustomCSS(currentTemplateId ? savedTemplates.find(t => t.id === currentTemplateId)?.customCSS || '' : '');
                  setShowTemplateEditor(true);
                }}
              >
                💾 {currentTemplateId ? 'Template opslaan' : 'Template opslaan als...'}
              </button>
              <button
                type="button"
                className="landing-template-action-button"
                onClick={() => setShowTemplateLibrary(true)}
              >
                📚 Template library
              </button>
              {currentTemplateId && (
                <button
                  type="button"
                  className="landing-template-action-button landing-template-action-button-danger"
                  onClick={() => {
                    if (confirm('Weet je zeker dat je de huidige template wilt resetten?')) {
                      setCurrentTemplateId(null);
                      setTemplateName('');
                      setTemplateDescription('');
                      setCustomCSS('');
                    }
                  }}
                >
                  🔄 Reset template
                </button>
              )}
            </div>
            {currentTemplateId && (
              <div className="landing-template-current">
                Huidige template: <strong>{savedTemplates.find(t => t.id === currentTemplateId)?.name || 'Onbekend'}</strong>
              </div>
            )}
          </div>
        )}

        {/* Template sectie editor: drag & drop volgorde en visibility (alleen in template mode) */}
        {landingLayoutMode === 'template' && landingPaneMode !== 'blocks' && (
          <div className="landing-template-section-editor">
            <h4 className="landing-template-section-editor-title">Template secties beheren</h4>
            <p className="landing-template-section-editor-subtitle">
              Sleep secties om de volgorde te wijzigen. Schakel secties uit om ze te verbergen.
            </p>
            <div className="landing-template-section-list">
              {templateSections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div
                    key={section.id}
                    className={
                      'landing-template-section-item' +
                      (section.visible ? '' : ' landing-template-section-hidden') +
                      (draggedSectionId === section.id ? ' landing-template-section-dragging' : '')
                    }
                    draggable
                    onDragStart={(e) => handleSectionDragStart(section.id, e)}
                    onDragOver={handleSectionDragOver}
                    onDrop={(e) => handleSectionDrop(section.id, e)}
                    onDragEnd={handleSectionDragEnd}
                  >
                    <div className="landing-template-section-header">
                      <span className="landing-template-section-drag-handle">⋮⋮</span>
                      <span className="landing-template-section-label">{section.label}</span>
                      <label className="landing-template-section-toggle">
                        <input
                          type="checkbox"
                          checked={section.visible}
                          onChange={() => handleSectionVisibilityToggle(section.id)}
                        />
                        <span>{section.visible ? 'Zichtbaar' : 'Verborgen'}</span>
                      </label>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Template sectie mapping (alleen zichtbaar in template mode) */}
        {landingLayoutMode === 'template' && landingPaneMode !== 'blocks' && (
          <div className="landing-template-mapping">
            <h4 className="landing-template-mapping-title">Template secties aanpassen</h4>
            <p className="landing-template-mapping-subtitle">
              Kies per sectie welk content-veld je wilt tonen
            </p>
            <div className="landing-template-mapping-grid">
              <div className="landing-template-mapping-item">
                <label>Sectie 1 - Titel:</label>
                <select
                  value={templateMapping.section1Title}
                  onChange={(e) =>
                    setTemplateMapping({ ...templateMapping, section1Title: e.target.value as TemplateSectionField })
                  }
                  className="landing-template-mapping-select"
                >
                  {availableContentFields
                    .filter((f) => f.value.includes('Title'))
                    .map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                </select>
              </div>
              <div className="landing-template-mapping-item">
                <label>Sectie 1 - Inhoud:</label>
                <select
                  value={templateMapping.section1Content}
                  onChange={(e) =>
                    setTemplateMapping({ ...templateMapping, section1Content: e.target.value as TemplateSectionField })
                  }
                  className="landing-template-mapping-select"
                >
                  {availableContentFields
                    .filter((f) => !f.value.includes('Title'))
                    .map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                </select>
              </div>
              <div className="landing-template-mapping-item">
                <label>Sectie 2 - Titel:</label>
                <select
                  value={templateMapping.section2Title}
                  onChange={(e) =>
                    setTemplateMapping({ ...templateMapping, section2Title: e.target.value as TemplateSectionField })
                  }
                  className="landing-template-mapping-select"
                >
                  {availableContentFields
                    .filter((f) => f.value.includes('Title'))
                    .map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                </select>
              </div>
              <div className="landing-template-mapping-item">
                <label>Sectie 2 - Inhoud:</label>
                <select
                  value={templateMapping.section2Content}
                  onChange={(e) =>
                    setTemplateMapping({ ...templateMapping, section2Content: e.target.value as TemplateSectionField })
                  }
                  className="landing-template-mapping-select"
                >
                  {availableContentFields
                    .filter((f) => !f.value.includes('Title'))
                    .map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                </select>
              </div>
              <div className="landing-template-mapping-item">
                <label>Gallery - Kolom 1:</label>
                <select
                  value={templateMapping.galleryCol1}
                  onChange={(e) =>
                    setTemplateMapping({ ...templateMapping, galleryCol1: e.target.value as TemplateSectionField })
                  }
                  className="landing-template-mapping-select"
                >
                  {availableContentFields
                    .filter((f) => !f.value.includes('Title'))
                    .map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                </select>
              </div>
              <div className="landing-template-mapping-item">
                <label>Gallery - Kolom 2:</label>
                <select
                  value={templateMapping.galleryCol2}
                  onChange={(e) =>
                    setTemplateMapping({ ...templateMapping, galleryCol2: e.target.value as TemplateSectionField })
                  }
                  className="landing-template-mapping-select"
                >
                  {availableContentFields
                    .filter((f) => !f.value.includes('Title'))
                    .map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className={`landing-builder-columns landing-pane-${landingPaneMode}`}>
          {/* Linkerzijde: blok-editor */}
          <div className="landing-block-editor">
            <h3 className="landing-block-editor-title">Blok-indeling</h3>
            <p className="landing-block-editor-subtitle">
              Sleep blokken om de volgorde te wijzigen. Schakel blokken uit om ze te verbergen in de
              preview.
            </p>
            <div className="landing-block-list">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className={
                    'landing-block' +
                    (block.visible ? '' : ' landing-block-hidden') +
                    (draggedBlockId === block.id ? ' landing-block-dragging' : '')
                  }
                  draggable
                  onDragStart={(e) => handleBlockDragStart(block.id, e)}
                  onDragOver={handleBlockDragOver}
                  onDrop={(e) => handleBlockDrop(block.id, e)}
                  onDragEnd={handleBlockDragEnd}
                >
                  <div className="landing-block-header">
                    <span className="landing-block-drag-handle">⋮⋮</span>
                    <div className="landing-block-labels">
                      <span className="landing-block-label">{block.label}</span>
                      <span className="landing-block-type">
                        {block.type === 'bullets' && 'Bullets'}
                        {block.type === 'text' && 'Kop'}
                        {block.type === 'textarea' && 'Paragraaf'}
                        {block.type === 'faq' && 'FAQ'}
                        {block.type === 'subcategories' && 'Subcategorieën'}
                        {block.type === 'cta' && 'CTA'}
                        {block.type === 'nextSteps' && 'Volgende stappen'}
                      </span>
            </div>
                    <label className="landing-block-toggle">
                      <input
                        type="checkbox"
                        checked={block.visible}
                        onChange={() => handleBlockVisibilityToggle(block.id)}
                      />
                      <span>{block.visible ? 'Zichtbaar' : 'Verborgen'}</span>
                    </label>
          </div>

                  <div className="landing-block-body">
                    {block.type === 'text' && (
                      <input
                        className="landing-block-input"
                        value={getBlockValue(block)}
                        onChange={(e) => handleTextChange(block.id, e.target.value)}
                      />
                    )}
                    {(block.type === 'textarea' ||
                      block.type === 'bullets' ||
                      block.type === 'subcategories' ||
                      block.type === 'faq' ||
                      block.type === 'cta' ||
                      block.type === 'nextSteps') && (
                      <textarea
                        className="landing-block-textarea"
                        value={getBlockValue(block)}
                        onChange={(e) => {
                          if (block.type === 'bullets') {
                            handleBulletsChange(block.id, e.target.value);
                          } else if (block.type === 'faq') {
                            handleFaqChange(e.target.value);
                          } else if (block.id === 'nextSteps') {
                            handleNextStepsChange(e.target.value);
                          } else {
                            handleTextChange(block.id, e.target.value);
                          }
                        }}
                      />
                    )}
                    {block.id === 'subcategories' && (
                      <div className="landing-block-hint">
                        Gebruik het formaat: <code>Naam: beschrijving</code> per regel.
            </div>
                    )}
                    {block.type === 'bullets' && (
                      <div className="landing-block-hint">
                        Eén bullet per regel. Lege regels worden genegeerd.
          </div>
        )}
                    {block.type === 'faq' && (
                      <div className="landing-block-hint">
                        Gebruik blokken als:
                        <br />
                        <code>V: Vraag...</code>
                        <br />
                        <code>A: Antwoord...</code>
                        <br />
                        Gescheiden door een lege regel.
                      </div>
                    )}
                  </div>
              </div>
            ))}
              </div>
          </div>

          {/* Rechterzijde: live preview */}
          <div className={isPreviewModalOpen ? 'landing-preview-shell landing-preview-shell-overlay' : 'landing-preview-shell'}>
            <div className="landing-preview">
              <div className="landing-preview-header">
                <div>
                  <h3>Live preview</h3>
                  <p>Zo ziet de pagina er ongeveer uit op de site.</p>
                </div>
                <div className="landing-preview-header-actions">
                  <div className="landing-preview-layout-toggle">
                    <button
                      type="button"
                      className={
                        'landing-preview-layout-button' +
                        (landingLayoutMode === 'template'
                          ? ' landing-preview-layout-button-active'
                          : '')
                      }
                      onClick={() => setLandingLayoutMode('template')}
                    >
                      Template (Broers-stijl)
                    </button>
                    <button
                      type="button"
                      className={
                        'landing-preview-layout-button' +
                        (landingLayoutMode === 'blocks'
                          ? ' landing-preview-layout-button-active'
                          : '')
                      }
                      onClick={() => setLandingLayoutMode('blocks')}
                    >
                      Losse blokken
                    </button>
                  </div>
                  <div className="landing-preview-device-toggle">
                    <button
                      type="button"
                      className={
                        'landing-preview-device-button' +
                        (deviceMode === 'desktop' ? ' landing-preview-device-button-active' : '')
                      }
                      onClick={() => setDeviceMode('desktop')}
                    >
                      Desktop
                    </button>
                    <button
                      type="button"
                      className={
                        'landing-preview-device-button' +
                        (deviceMode === 'tablet' ? ' landing-preview-device-button-active' : '')
                      }
                      onClick={() => setDeviceMode('tablet')}
                    >
                      Tablet
                    </button>
                    <button
                      type="button"
                      className={
                        'landing-preview-device-button' +
                        (deviceMode === 'mobile' ? ' landing-preview-device-button-active' : '')
                      }
                      onClick={() => setDeviceMode('mobile')}
                    >
                      Mobile
                    </button>
                  </div>
                  <button
                    type="button"
                    className="landing-preview-fullscreen-button"
                    onClick={() => setIsPreviewModalOpen((prev) => !prev)}
                  >
                    {isPreviewModalOpen ? 'Sluit fullscreen' : 'Open fullscreen'}
                  </button>
                </div>
              </div>

            <div
              className={
                'landing-preview-viewport ' +
                (deviceMode === 'desktop'
                  ? 'landing-preview-viewport-desktop'
                  : deviceMode === 'tablet'
                  ? 'landing-preview-viewport-tablet'
                  : 'landing-preview-viewport-mobile')
              }
            >
              {landingLayoutMode === 'template' ? (
                <div className="landing-preview-page landing-preview-page-template">
                  {/* Custom CSS voor deze template */}
                  {customCSS && (
                    <style dangerouslySetInnerHTML={{ __html: customCSS }} />
                  )}
                  {/* Google SERP snippet */}
                  <div className="landing-preview-serp">
                    <div className="landing-preview-serp-url">
                      broersverhuur.nl › {seo.urlSlug || '...'}
                    </div>
                    <div className="landing-preview-serp-title">
                      {seo.seoTitle || 'Pagina titel'}
                    </div>
                    <div className="landing-preview-serp-description">
                      {seo.metaDescription || 'Meta description voor deze pagina.'}
                    </div>
                  </div>

                  {/* AI Summary blok */}
                  {aiSummary && (
                    <div className="landing-preview-ai-summary">
                      <div className="landing-preview-ai-summary-label">AI Samenvatting</div>
                      <p className="landing-preview-ai-summary-text">{aiSummary}</p>
          </div>
        )}

                  {/* Dynamisch renderen van secties op basis van templateSections */}
                  {templateSections
                    .sort((a, b) => a.order - b.order)
                    .filter((section) => section.visible)
                    .map((section) => {
                      // Helper functie om per sectie de juiste JSX te renderen
                      switch (section.id) {
                        case 'hero':
                          return (
                            <header key="hero" className="landing-preview-hero landing-template-hero">
                    <div className="landing-template-hero-logo">BROERS</div>
                    <div className="landing-preview-hero-content">
                      <p className="landing-preview-hero-label">
                        {topicLabel ? topicLabel.toLowerCase() : 'landingspagina'}
                      </p>
                      <h1 className="landing-preview-h1">
                        {content.h1 || 'De feestdagen vier je in stijl met Broers Verhuur.'}
                      </h1>
                      {content.intro && (
                        <p className="landing-preview-intro">{content.intro}</p>
                      )}
                      {cta.ctaTitle && (
                        <button className="landing-preview-cta">
                          {cta.ctaTitle || 'Vraag direct een offerte aan'}
                        </button>
                      )}
        </div>
                            </header>
                          );
                        case 'fullImage':
                          return (
                            <section key="fullImage" className="landing-template-strip landing-template-strip-full">
                              <div className="landing-template-image-placeholder">
                                Afbeelding volle breedte (hero)
                              </div>
                            </section>
                          );
                        case 'section1':
                          return (
                            <section key="section1" className="landing-template-strip landing-template-strip-split">
                              <div className="landing-template-col landing-template-col-text">
                                <h2>
                                  {getContentByField(templateMapping.section1Title) || 'Eerste contentblok'}
                                </h2>
                                <p>
                                  {getContentByField(templateMapping.section1Content)}
                                </p>
        {cta.nextSteps && cta.nextSteps.length > 0 && (
                                  <ul className="landing-template-next-steps">
                                    {cta.nextSteps.slice(0, 3).map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
                                )}
            </div>
                              <div className="landing-template-col landing-template-col-image">
                                <div className="landing-template-image-placeholder">
                                  Afbeelding (bijv. mooi gedekte tafel)
          </div>
                              </div>
                            </section>
                          );
                        case 'section2':
                          return (
                            <section key="section2" className="landing-template-strip landing-template-strip-split landing-template-strip-reverse">
                              <div className="landing-template-col landing-template-col-image">
                                <div className="landing-template-image-placeholder">
                                  Afbeelding (bijv. mix &amp; match setting)
                                </div>
                              </div>
                              <div className="landing-template-col landing-template-col-text">
                                <h2>{getContentByField(templateMapping.section2Title) || 'Mix en match voor jouw setting'}</h2>
                                <p>
                                  {getContentByField(templateMapping.section2Content)}
                                </p>
                                {cta.ctaText && (
                                  <p className="landing-template-cta-text">{cta.ctaText}</p>
                                )}
                              </div>
                            </section>
                          );
                        case 'gallery':
                          return (
                            <section key="gallery" className="landing-template-strip landing-template-strip-gallery">
                              <div className="landing-template-gallery-text">
                                <div className="landing-template-gallery-text-col">
                                  <p>
                                    {getContentByField(templateMapping.galleryCol1) ||
                                      'Gebruik dit blok om de sfeer en mogelijkheden te tonen. Beschrijf hoe jullie samen een concept uitwerken, van eerste schets tot de laatste afwerking.'}
                                  </p>
                                </div>
                                <div className="landing-template-gallery-text-col">
                                  <p>
                                    {getContentByField(templateMapping.galleryCol2) ||
                                      'We denken graag met je mee over de inrichting, styling en materialen. Zo creëren we samen een unieke setting die perfect past bij jouw evenement.'}
                                  </p>
                                </div>
                              </div>
                              <div className="landing-template-gallery-images">
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <div key={num} className="landing-template-gallery-image">
                                    Afbeelding {num}
              </div>
            ))}
          </div>
                            </section>
                          );
                        case 'products':
                          return (
                            <section key="products" className="landing-template-strip landing-template-strip-products">
                              <div className="landing-template-products-header">
                                <h2>{getContentByField(templateMapping.productsTitle) || 'Populair voor dit thema.'}</h2>
                                {internalLinks && internalLinks.length > 0 && (
                                  <button className="landing-preview-cta landing-template-cta-secondary">
                                    {internalLinks[0].anchor || 'Bekijk alle producten'}
                                  </button>
                                )}
                              </div>
                              <p className="landing-template-products-text">
                                {getContentByField(templateMapping.productsText) ||
                                  'Laat hier een selectie zien van populaire producten voor dit thema, zodat bezoekers direct kunnen doorklikken naar je assortiment.'}
                              </p>
                              <div className="landing-template-products-grid">
                                {(internalLinks && internalLinks.length > 0
                                  ? internalLinks.slice(0, 5).map((link) => ({
                                      title: link.anchor,
                                      url: link.url,
                                    }))
                                  : [
                                      { title: 'Statafel met hoes', url: '#' },
                                      { title: 'Witte wijnglazen', url: '#' },
                                      { title: 'Servies set 6 personen', url: '#' },
                                      { title: 'Lichtslang / prikkabel', url: '#' },
                                      { title: 'Champagneflutes', url: '#' },
                                    ]
                                ).map((item, index) => (
                                  <article key={index} className="landing-template-product-card">
                                    <div className="landing-template-product-image" />
                                    <h3 className="landing-template-product-title">{item.title}</h3>
                                    <p className="landing-template-product-meta">Productvoorbeeld</p>
                                    <button className="landing-template-product-button">Bekijk</button>
                                  </article>
                                ))}
                              </div>
                            </section>
                          );
                        case 'section4':
                          return (
                            <section key="section4" className="landing-template-strip landing-template-strip-split">
                              <div className="landing-template-col landing-template-col-text">
                                <h2>
                                  {getContentByField(templateMapping.section4Title) || 'Zo dek je de tafel tijdens de feestdagen.'}
                                </h2>
                                <p>
                                  {getContentByField(templateMapping.section4Content) ||
                                    'Gebruik dit blok voor praktische uitleg hoe je de tafel dekt, welke materialen je kiest en in welke volgorde je alles neerzet.'}
                                </p>
                              </div>
                              <div className="landing-template-col landing-template-col-image">
                                <div className="landing-template-image-placeholder">
                                  Afbeelding (bijv. etiquette / tafelopbouw)
                                </div>
                              </div>
                            </section>
                          );
                        case 'quote':
                          return (
                            <section key="quote" className="landing-template-strip landing-template-quote">
                              <div className="landing-template-quote-image" />
                              <div className="landing-template-quote-text">
                                <span>
                                  {getContentByField(templateMapping.quoteText) ||
                                    content.localBlock?.text ||
                                    'Gebruik dit blok voor een korte quote of dienstbelofte, zoals de bloembinderij, styling of extra service die Broers biedt.'}
                                </span>
                              </div>
                            </section>
                          );
                        case 'faq':
                          return faq?.items?.length > 0 ? (
                            <section key="faq" className="landing-template-strip landing-preview-faq landing-template-faq">
                              <h2>{faq.faqTitle || 'Veelgestelde vragen.'}</h2>
                              <div className="landing-preview-faq-list">
                                {faq.items.map((item, index) => (
                                  <details key={index} className="landing-preview-faq-item">
                                    <summary>{item.question}</summary>
                                    <p>{item.answer}</p>
                                  </details>
                                ))}
                              </div>
                            </section>
                          ) : null;
                        default:
                          return null;
                      }
                    })}
                </div>
              ) : (
                <div className="landing-preview-page">
                  {/* Google SERP snippet */}
                  <div className="landing-preview-serp">
                    <div className="landing-preview-serp-url">
                      broersverhuur.nl › {seo.urlSlug || '...'}
                    </div>
                    <div className="landing-preview-serp-title">
                      {seo.seoTitle || 'Pagina titel'}
                    </div>
                    <div className="landing-preview-serp-description">
                      {seo.metaDescription || 'Meta description voor deze pagina.'}
                    </div>
                    <div className="landing-preview-serp-metrics">
                      <span
                        className={
                          'serp-length serp-length-' +
                          getLengthStatus(seo.seoTitle.length, 30, 60)
                        }
                      >
                        Title: {seo.seoTitle.length} tekens
                      </span>
                      <span
                        className={
                          'serp-length serp-length-' +
                          getLengthStatus(seo.metaDescription.length, 80, 160)
                        }
                      >
                        Description: {seo.metaDescription.length} tekens
                      </span>
                    </div>
                  </div>

                  <header className="landing-preview-hero">
                    <div className="landing-preview-hero-content">
                      <p className="landing-preview-hero-label">Broers Verhuur</p>
                      <h1 className="landing-preview-h1">
                        {visibleOrderedBlocks.find((b) => b.id === 'h1') ? content.h1 : ''}
                      </h1>
                      {visibleOrderedBlocks.find((b) => b.id === 'intro') && (
                        <p className="landing-preview-intro">{content.intro}</p>
                      )}
                      {visibleOrderedBlocks.find((b) => b.id === 'cta') && (
                        <button className="landing-preview-cta">
                          {cta.ctaTitle || 'Vraag direct een offerte aan'}
                        </button>
                      )}
                    </div>
                  </header>

                  <main className="landing-preview-main">
                    {visibleOrderedBlocks.map((block) => {
                  switch (block.id) {
                    case 'benefits':
                      return (
                        <section key={block.id} className="landing-preview-section">
                          <h2>{content.benefitsTitle || 'Waarom Broers Verhuur?'}</h2>
                          <ul className="landing-preview-list">
                            {(Array.isArray(content.benefits)
                              ? content.benefits
                              : content.benefits
                              ? [String(content.benefits)]
                              : []
                            ).map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </section>
                      );
                    case 'ideal':
                      return (
                        <section key={block.id} className="landing-preview-section">
                          <h2>{content.idealTitle || 'Ideaal voor'}</h2>
                          <ul className="landing-preview-list">
                            {(Array.isArray(content.idealFor)
                              ? content.idealFor
                              : content.idealFor
                              ? [String(content.idealFor)]
                              : []
                            ).map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </section>
                      );
                    case 'completeSetup':
                      return (
                        <section key={block.id} className="landing-preview-section">
                          <h2>{content.completeSetupTitle || 'Complete opstelling'}</h2>
                          <p>{content.completeSetupText}</p>
                        </section>
                      );
                    case 'subcategories':
                      return (
                        <section key={block.id} className="landing-preview-section">
                          <h2>{content.subcategoriesTitle || 'Ontdek onze subcategorieën'}</h2>
                          {content.subcategoriesIntro && (
                            <p className="landing-preview-section-intro">
                              {content.subcategoriesIntro}
                            </p>
                          )}
                          <div className="landing-preview-subcategories">
                            {(content.subcategories || []).map((sub, index) => (
                              <article key={index} className="landing-preview-subcategory-card">
                                <h3>{sub.name}</h3>
                                <p>{sub.description}</p>
                              </article>
                            ))}
        </div>
                        </section>
                      );
                    case 'inspiration':
                      return (
                        <section key={block.id} className="landing-preview-section">
                          <h2>{content.inspirationTitle || 'Inspiratie voor jouw event'}</h2>
                          <p>{content.inspirationText}</p>
                        </section>
                      );
                    case 'situations':
                      return (
                        <section key={block.id} className="landing-preview-section">
                          <h2>{content.situationsTitle || 'Perfect voor deze situaties'}</h2>
                          <ul className="landing-preview-list">
                            {(Array.isArray(content.situations)
                              ? content.situations
                              : content.situations
                              ? [String(content.situations)]
                              : []
                            ).map((item, index) => (
                              <li key={index}>{item}</li>
                ))}
              </ul>
                        </section>
                      );
                    case 'detailedScenario':
                      return (
                        <section key={block.id} className="landing-preview-section">
                          <h2>{content.detailedScenarioTitle || 'Zo ziet jouw dag eruit'}</h2>
                          <p>{content.detailedScenario}</p>
                        </section>
                      );
                    case 'storytelling':
                      return (
                        <section key={block.id} className="landing-preview-section">
                          <h2>{content.storytellingSceneTitle || 'Stel je voor'}</h2>
                          <p>{content.storytellingScene}</p>
                        </section>
                      );
                    case 'stylingTips':
                      return (
                        <section key={block.id} className="landing-preview-section">
                          <h2>{content.stylingTipsTitle || 'Styling tips'}</h2>
                          <p>{content.stylingTipsText}</p>
                        </section>
                      );
                    case 'personalAdvice':
                      return (
                        <section key={block.id} className="landing-preview-section">
                          <h2>{content.personalAdviceTitle || 'Persoonlijk advies'}</h2>
                          <p>{content.personalAdviceText}</p>
                        </section>
                      );
                    case 'advice':
                      return (
                        <section key={block.id} className="landing-preview-section">
                          <h2>{content.adviceTitle || 'Praktisch advies'}</h2>
                          <p>{content.adviceText}</p>
                        </section>
                      );
                    case 'local':
                      if (!content.localBlock) return null;
                      return (
                        <section key={block.id} className="landing-preview-section">
                          <h2>{content.localBlock.title}</h2>
                          <p>{content.localBlock.text}</p>
                        </section>
                      );
                    case 'faq':
                      if (!faq.items?.length) return null;
                      return (
                        <section key={block.id} className="landing-preview-section landing-preview-faq">
                          <h2>{faq.faqTitle || 'Veelgestelde vragen'}</h2>
                          <div className="landing-preview-faq-list">
                            {faq.items.map((item, index) => (
                              <details key={index} className="landing-preview-faq-item">
                                <summary>{item.question}</summary>
                                <p>{item.answer}</p>
                              </details>
                            ))}
            </div>
                        </section>
                      );
                    case 'cta':
                      return (
                        <section key={block.id} className="landing-preview-section landing-preview-cta-section">
                          <div className="landing-preview-cta-card">
                            <h2>{cta.ctaTitle || 'Klaar om je event te plannen?'}</h2>
                            <p>{cta.ctaText}</p>
                            <button className="landing-preview-cta">
                              {cta.ctaTitle || 'Vraag direct een offerte aan'}
                            </button>
          </div>
                        </section>
                      );
                    case 'nextSteps':
                      if (!cta.nextSteps?.length) return null;
                      return (
                        <section key={block.id} className="landing-preview-section">
                          <h2>Volgende stappen</h2>
                          <ol className="landing-preview-steps">
                            {cta.nextSteps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        </section>
                      );
                    default:
                      return null;
                  }
                })}

                    {/* SEO extra blokken onderaan preview */}
                    {imageSEO.length > 0 && (
                      <section className="landing-preview-section landing-preview-meta">
                        <h2>Image SEO</h2>
                        <ul className="landing-preview-list">
                          {imageSEO.map((img, index) => (
                            <li key={index}>
                              <strong>Alt:</strong> {img.alt} &mdash; <strong>Title:</strong>{' '}
                              {img.title}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

        {internalLinks.length > 0 && (
                      <section className="landing-preview-section landing-preview-meta">
                        <h2>Interne links</h2>
                        <ul className="landing-preview-list">
                {internalLinks.map((link, index) => (
                  <li key={index}>
                              <strong>{link.anchor}</strong> – <code>{link.url}</code>
                  </li>
                ))}
              </ul>
                      </section>
        )}

        {externalLinks.length > 0 && (
                      <section className="landing-preview-section landing-preview-meta">
                        <h2>Externe link-suggesties</h2>
                        <ul className="landing-preview-list">
                {externalLinks.map((link, index) => (
                  <li key={index}>
                              <strong>{link.anchor}</strong> ({link.suggestedType}) –{' '}
                              {link.reason}
                  </li>
                ))}
              </ul>
                      </section>
        )}

        {clusters.length > 0 && (
                      <section className="landing-preview-section landing-preview-meta">
                        <h2>Content cluster ideeën</h2>
                        <ul className="landing-preview-list">
                {clusters.map((idea, index) => (
                  <li key={index}>{idea}</li>
                ))}
              </ul>
                      </section>
                    )}
                  </main>
          </div>
        )}
            </div>
          </div>
            </div>

        {/* Template Library Modal */}
        {showTemplateLibrary && (
          <div className="template-modal-overlay" onClick={() => setShowTemplateLibrary(false)}>
            <div className="template-modal" onClick={(e) => e.stopPropagation()}>
                <div className="template-modal-header">
                  <h3>Template Library</h3>
                  <button
                    type="button"
                    className="template-modal-close"
                    onClick={() => setShowTemplateLibrary(false)}
                  >
                    ×
                  </button>
          </div>
                <div className="template-modal-content">
                  {savedTemplates.length === 0 ? (
                    <div className="template-empty">
                      <p>Nog geen templates opgeslagen.</p>
                      <p>Maak een template aan en sla deze op om te beginnen.</p>
                    </div>
                  ) : (
                    <div className="template-list">
                      <div className="template-filter-bar">
                        <label>
                          Filter op klant / merk:
                          <select
                            value={libraryOrganizationFilter}
                            onChange={(e) => setLibraryOrganizationFilter(e.target.value)}
                          >
                            <option value="all">Alle klanten</option>
                            {Array.from(
                              new Set(
                                savedTemplates
                                  .map((t) => t.organizationId)
                                  .filter((orgId): orgId is string => !!orgId?.trim())
                              )
                            ).map((orgId) => (
                              <option key={orgId} value={orgId}>
                                {orgId}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      {savedTemplates
                        .filter((template) =>
                          libraryOrganizationFilter === 'all'
                            ? true
                            : (template.organizationId || '') === libraryOrganizationFilter
                        )
                        .map((template) => (
                        <div key={template.id} className="template-item">
                          <div className="template-item-header">
                            <h4>{template.name}</h4>
                            {template.description && (
                              <p className="template-item-description">{template.description}</p>
                            )}
                            <div className="template-item-meta">
                              {template.organizationId && (
                                <span>Klant: {template.organizationId}</span>
                              )}
                              <span>Gemaakt: {new Date(template.createdAt).toLocaleDateString('nl-NL')}</span>
                              {template.updatedAt !== template.createdAt && (
                                <span>Bijgewerkt: {new Date(template.updatedAt).toLocaleDateString('nl-NL')}</span>
                              )}
                            </div>
                          </div>
                          <div className="template-item-actions">
                            <button
                              type="button"
                              className="template-action-button template-action-button-primary"
                              onClick={() => loadTemplate(template.id)}
                            >
                              Laden
                            </button>
                            <button
                              type="button"
                              className="template-action-button"
                              onClick={() => duplicateTemplate(template.id)}
                            >
                              Dupliceren
                            </button>
                            <button
                              type="button"
                              className="template-action-button template-action-button-danger"
                              onClick={() => deleteTemplate(template.id)}
                            >
                              Verwijderen
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Template Editor Modal */}
          {showTemplateEditor && (
            <div className="template-modal-overlay" onClick={() => setShowTemplateEditor(false)}>
              <div className="template-modal template-modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="template-modal-header">
                  <h3>{currentTemplateId ? 'Template bewerken' : 'Nieuwe template opslaan'}</h3>
                  <button
                    type="button"
                    className="template-modal-close"
                    onClick={() => setShowTemplateEditor(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="template-modal-content">
                  <div className="template-editor-form">
                    <div className="template-editor-field">
                      <label>Template naam *</label>
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Bijv. Broers Verhuur Standaard"
                        className="template-editor-input"
                      />
                    </div>
                    <div className="template-editor-field">
                      <label>Beschrijving (optioneel)</label>
                      <textarea
                        value={templateDescription}
                        onChange={(e) => setTemplateDescription(e.target.value)}
                        placeholder="Korte beschrijving van deze template..."
                        className="template-editor-textarea"
                        rows={2}
                      />
                    </div>
                    <div className="template-editor-field">
                      <label>Custom CSS (optioneel)</label>
                      <textarea
                        value={customCSS}
                        onChange={(e) => setCustomCSS(e.target.value)}
                        placeholder="Voeg hier custom CSS toe voor deze template..."
                        className="template-editor-textarea template-editor-css"
                        rows={10}
                      />
                      <p className="template-editor-hint">
                        Custom CSS wordt toegepast op de preview. Gebruik selectors zoals <code>.landing-template-hero</code> om specifieke secties te stylen.
                      </p>
                    </div>
                    <div className="template-editor-actions">
                      <button
                        type="button"
                        className="template-action-button template-action-button-secondary"
                        onClick={() => setShowTemplateEditor(false)}
                      >
                        Annuleren
                      </button>
                      <button
                        type="button"
                        className="template-action-button template-action-button-primary"
                        onClick={saveTemplate}
                      >
                        {currentTemplateId ? 'Bijwerken' : 'Opslaan'}
                      </button>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        )}
      </div>
    ));
  }

  // Blog
  if (type === 'blog') {
    const blog = editedResult as BlogResult;
    const blocks = blogBlocks || [];
    const visibleBlocks = blocks.filter((b) => b.visible);

    const handleBlogVisibilityToggle = (id: BlogBlockKind) => {
      setBlogBlocks((prev) => {
        const current = prev || blocks;
        return current.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b));
      });
    };

    const handleBlogDragStart = (id: BlogBlockKind, event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', id);
    };

    const handleBlogDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    };

    const handleBlogDrop = (targetId: BlogBlockKind, event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const draggedId = event.dataTransfer.getData('text/plain') as BlogBlockKind;
      if (!draggedId || draggedId === targetId) return;
      setBlogBlocks((prev) => {
        const current = prev || blocks;
        const fromIndex = current.findIndex((b) => b.id === draggedId);
        const toIndex = current.findIndex((b) => b.id === targetId);
        if (fromIndex === -1 || toIndex === -1) return current;
        const updated = [...current];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      });
    };

    const handleBlogTextChange = (id: BlogBlockKind, value: string) => {
      setEditedResult((prev) => {
        const prevBlog = prev as BlogResult;
        const updated: BlogResult = { ...prevBlog };

        switch (id) {
          case 'h1':
            updated.h1 = value;
            break;
          case 'intro':
            updated.intro = value;
            break;
          case 'practicalAdvice':
            updated.practicalAdvice = value;
            break;
          case 'cta':
            updated.ctaText = value;
            break;
          default:
            break;
        }

        return updated as ContentResult;
      });
    };

    const handleBlogBulletsChange = (id: BlogBlockKind, value: string) => {
      const items = value
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean);

      setEditedResult((prev) => {
        const prevBlog = prev as BlogResult;
        const updated: BlogResult = { ...prevBlog };

        switch (id) {
          case 'steps':
            updated.steps = items;
            break;
          case 'materials':
            updated.materialsList = items;
            break;
          default:
            break;
        }

        return updated as ContentResult;
      });
    };

    const getBlogBlockValue = (block: BlogBlock) => {
      switch (block.id) {
        case 'h1':
          return blog.h1 || '';
        case 'intro':
          return blog.intro || '';
        case 'sections':
          return (blog.sections || [])
            .map((s) => `${s.title}\n${s.text}`)
            .join('\n\n');
        case 'steps':
          return (blog.steps || []).join('\n');
        case 'mistakes':
          return (blog.mistakes || [])
            .map((m) => `Fout: ${m.mistake}\nOplossing: ${m.solution}`)
            .join('\n\n');
        case 'scenarioBlocks':
          return (blog.scenarioBlocks || [])
            .map((b) => `${b.scenario}\n${b.text}`)
            .join('\n\n');
        case 'practicalAdvice':
          return blog.practicalAdvice || '';
        case 'materials':
          return (blog.materialsList || []).join('\n');
        case 'cta':
          return blog.ctaText || '';
        default:
          return '';
      }
    };

    return renderWrapper(
      <div className="landing-builder">
        {onRefine && (
          <div className="refine-section">
            <button
              onClick={onRefine}
              disabled={isRefining}
              className="button refine-button"
            >
              {isRefining ? 'Verbeteren...' : 'Verbeter deze tekst'}
            </button>
          </div>
        )}

        <div className="result-section seo-section">
          <h3>SEO Metadata</h3>
          <div className="result-content">
            <div style={{ marginBottom: '1rem' }}>
              <strong>Page Title:</strong> {blog.seoTitle}{' '}
              <CopyButton text={blog.seoTitle} />
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                {blog.seoTitle.length} / 60 karakters
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Meta Description:</strong> {blog.metaDescription}{' '}
              <CopyButton text={blog.metaDescription} />
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                {blog.metaDescription.length} / 155 karakters
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Focus Keyword:</strong> {blog.keyword}{' '}
              <CopyButton text={blog.keyword} />
            </div>
          </div>
        </div>

        <div className="landing-builder-columns">
          {/* Blog blok-editor links */}
          <div className="landing-block-editor">
            <h3 className="landing-block-editor-title">Blog blokken</h3>
            <p className="landing-block-editor-subtitle">
              Versleep blokken om de structuur te bepalen en pas belangrijke teksten aan.
            </p>
            <div className="landing-block-list">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className={
                    'landing-block' + (block.visible ? '' : ' landing-block-hidden')
                  }
                  draggable
                  onDragStart={(e) => handleBlogDragStart(block.id, e)}
                  onDragOver={handleBlogDragOver}
                  onDrop={(e) => handleBlogDrop(block.id, e)}
                >
                  <div className="landing-block-header">
                    <span className="landing-block-drag-handle">⋮⋮</span>
                    <div className="landing-block-labels">
                      <span className="landing-block-label">{block.label}</span>
                      <span className="landing-block-type">
                        {block.type === 'bullets' && 'Bullets'}
                        {block.type === 'text' && 'Kop'}
                        {block.type === 'textarea' && 'Paragraaf / blok'}
                      </span>
                    </div>
                    <label className="landing-block-toggle">
                      <input
                        type="checkbox"
                        checked={block.visible}
                        onChange={() => handleBlogVisibilityToggle(block.id)}
                      />
                      <span>{block.visible ? 'Zichtbaar' : 'Verborgen'}</span>
                    </label>
                  </div>
                  <div className="landing-block-body">
                    {block.type === 'text' && (
                      <input
                        className="landing-block-input"
                        value={getBlogBlockValue(block)}
                        onChange={(e) => handleBlogTextChange(block.id, e.target.value)}
                      />
                    )}
                    {block.type !== 'text' && (
                      <textarea
                        className="landing-block-textarea"
                        value={getBlogBlockValue(block)}
                        onChange={(e) => {
                          if (block.type === 'bullets') {
                            handleBlogBulletsChange(block.id, e.target.value);
                          } else {
                            // voor samengestelde velden (sections/mistakes/scenarios) laten we voorlopig alleen de tekst aanpassen,
                            // zonder de onderliggende structuur te veranderen
                            handleBlogTextChange(block.id, e.target.value);
                          }
                        }}
                      />
                    )}
                    {block.type === 'bullets' && (
                      <div className="landing-block-hint">
                        Eén item per regel. Lege regels worden genegeerd.
                      </div>
                    )}
                  </div>
            </div>
          ))}
        </div>
          </div>

          {/* Blog preview rechts */}
          <div className={isPreviewModalOpen ? 'landing-preview-shell landing-preview-shell-overlay' : 'landing-preview-shell'}>
            <div className="landing-preview">
              <div className="landing-preview-header">
                <div>
                  <h3>Live blog preview</h3>
                  <p>Zo leest dit artikel ongeveer op de site.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="landing-preview-fullscreen-button"
                    onClick={() => setIsPreviewModalOpen((prev) => !prev)}
                  >
                    {isPreviewModalOpen ? 'Sluit fullscreen' : 'Open fullscreen'}
                  </button>
                  <div className="landing-preview-device-toggle">
                <button
                  type="button"
                  className={
                    'landing-preview-device-button' +
                    (deviceMode === 'desktop' ? ' landing-preview-device-button-active' : '')
                  }
                  onClick={() => setDeviceMode('desktop')}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  className={
                    'landing-preview-device-button' +
                    (deviceMode === 'tablet' ? ' landing-preview-device-button-active' : '')
                  }
                  onClick={() => setDeviceMode('tablet')}
                >
                  Tablet
                </button>
                <button
                  type="button"
                  className={
                    'landing-preview-device-button' +
                    (deviceMode === 'mobile' ? ' landing-preview-device-button-active' : '')
                  }
                  onClick={() => setDeviceMode('mobile')}
                >
                  Mobile
                </button>
              </div>
            </div>

            <div
              className={
                'landing-preview-viewport ' +
                (deviceMode === 'desktop'
                  ? 'landing-preview-viewport-desktop'
                  : deviceMode === 'tablet'
                  ? 'landing-preview-viewport-tablet'
                  : 'landing-preview-viewport-mobile')
              }
            >
              <div className="landing-preview-page">
                {/* SERP snippet */}
                <div className="landing-preview-serp">
                  <div className="landing-preview-serp-url">
                    broersverhuur.nl › blog
                  </div>
                  <div className="landing-preview-serp-title">
                    {blog.seoTitle || 'Blog titel'}
                  </div>
                  <div className="landing-preview-serp-description">
                    {blog.metaDescription || 'Meta description voor dit blogartikel.'}
                  </div>
                  <div className="landing-preview-serp-metrics">
                    <span
                      className={
                        'serp-length serp-length-' +
                        getLengthStatus(blog.seoTitle.length, 30, 60)
                      }
                    >
                      Title: {blog.seoTitle.length} tekens
                    </span>
                    <span
                      className={
                        'serp-length serp-length-' +
                        getLengthStatus(blog.metaDescription.length, 80, 160)
                      }
                    >
                      Description: {blog.metaDescription.length} tekens
                    </span>
                  </div>
                </div>

                <header className="landing-preview-hero">
                  <div className="landing-preview-hero-content">
                    <p className="landing-preview-hero-label">
                      Broers Verhuur · Blog
                    </p>
                    <h1 className="landing-preview-h1">
                      {visibleBlocks.find((b) => b.id === 'h1') ? blog.h1 : ''}
                    </h1>
                    {visibleBlocks.find((b) => b.id === 'intro') && (
                      <p className="landing-preview-intro">{blog.intro}</p>
                    )}
                  </div>
                </header>

                <main className="landing-preview-main">
                  {visibleBlocks.find((b) => b.id === 'sections') && blog.sections?.length > 0 && (
                    <section className="landing-preview-section">
                      <h2>Hoofdsecties</h2>
                      {(blog.sections || []).map((section, index) => (
                        <article
                          key={index}
                          className="landing-preview-section"
                          style={{ marginBottom: '1rem' }}
                        >
                          <h3>{section.title}</h3>
                          <p>{section.text}</p>
                        </article>
                      ))}
                    </section>
                  )}

                  {visibleBlocks.find((b) => b.id === 'steps') && blog.steps?.length > 0 && (
                    <section className="landing-preview-section">
                      <h2>{blog.stepsTitle || 'Stap voor stap'}</h2>
                      <ol className="landing-preview-steps">
                {blog.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                ))}
              </ol>
                    </section>
                  )}

                  {visibleBlocks.find((b) => b.id === 'mistakes') &&
                    blog.mistakes?.length > 0 && (
                      <section className="landing-preview-section">
                        <h2>{blog.mistakesTitle || 'Veelgemaakte fouten'}</h2>
                        {(blog.mistakes || []).map((item, index) => (
                          <article key={index} style={{ marginBottom: '1rem' }}>
                  <strong>Fout:</strong> {item.mistake}
                  <br />
                  <strong>Oplossing:</strong> {item.solution}
                          </article>
                        ))}
                      </section>
                    )}

                  {visibleBlocks.find((b) => b.id === 'scenarioBlocks') &&
                    blog.scenarioBlocks?.length > 0 && (
                      <section className="landing-preview-section">
                        <h2>{blog.scenarioBlocksTitle || 'Scenario’s'}</h2>
                        {(blog.scenarioBlocks || []).map((block, index) => (
                          <article key={index} style={{ marginBottom: '1rem' }}>
                            <h3>{block.scenario}</h3>
                            <p>{block.text}</p>
                          </article>
                        ))}
                      </section>
                    )}

                  {visibleBlocks.find((b) => b.id === 'practicalAdvice') &&
                    blog.practicalAdvice && (
                      <section className="landing-preview-section">
                        <h2>{blog.practicalAdviceTitle || 'Praktisch advies'}</h2>
                        <p>{blog.practicalAdvice}</p>
                      </section>
                    )}

                  {visibleBlocks.find((b) => b.id === 'materials') &&
                    blog.materialsList?.length > 0 && (
                      <section className="landing-preview-section">
                        <h2>{blog.materialsTitle || 'Materialen'}</h2>
                        <ul className="landing-preview-list">
                          {blog.materialsList.map((m, index) => (
                            <li key={index}>{m}</li>
                ))}
              </ul>
                      </section>
                    )}

                  {visibleBlocks.find((b) => b.id === 'cta') && (
                    <section className="landing-preview-section landing-preview-cta-section">
                      <div className="landing-preview-cta-card">
                        <h2>{blog.ctaTitle || 'Klaar om je event te plannen?'}</h2>
                        <p>{blog.ctaText}</p>
            </div>
                    </section>
        )}

        {blog.internalLinks && blog.internalLinks.length > 0 && (
                    <section className="landing-preview-section landing-preview-meta">
                      <h2>Interne links</h2>
                      <ul className="landing-preview-list">
                {blog.internalLinks.map((link, index) => (
                  <li key={index}>
                            <strong>{link.anchor}</strong> – <code>{link.url}</code>
                  </li>
                ))}
              </ul>
                    </section>
                  )}

        {blog.images && blog.images.length > 0 && (
                    <section className="landing-preview-section landing-preview-meta">
                      <h2>Image SEO</h2>
                      <ul className="landing-preview-list">
            {blog.images.map((img, index) => (
                          <li key={index}>
                            <strong>Alt:</strong> {img.alt} &mdash; <strong>Title:</strong>{' '}
                            {img.title}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </main>
              </div>
            </div>
          </div>
          </div>
        </div>

        {blog.schema && (
          <div className="result-section">
            <h3>Schema.org Markup</h3>
            <div className="result-content">
              <pre style={{ fontSize: '0.875rem', overflow: 'auto' }}>
                {JSON.stringify(blog.schema, null, 2)}
              </pre>
              <CopyButton
                text={`<script type="application/ld+json">\n${JSON.stringify(
                  blog.schema,
                  null,
                  2
                )}\n</script>`}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Social
  if (type === 'social') {
    const social = editedResult as Partial<SocialResult>;
    const carousel = social.carousel;
    const reel = social.reel;
    const linkedin = social.linkedin;
    const story = social.story;

    const updateSocial = (patch: Partial<SocialResult>) => {
      setEditedResult((prev) => ({
        ...(prev as SocialResult),
        ...patch
      }) as ContentResult);
    };
    return renderWrapper(
      <div className="landing-builder">
        {onRefine && (
          <div className="refine-section">
            <button
              onClick={onRefine}
              disabled={isRefining}
              className="button refine-button"
            >
              {isRefining ? 'Verbeteren...' : 'Verbeter deze content'}
            </button>
          </div>
        )}

        <div className="result-section">
          <h3>Social campagne instellingen</h3>
          <div className="result-content">
            <p>
              <strong>Topic:</strong> {social.topic}
            </p>
            <p>
              <strong>Regio&apos;s:</strong> Haarlem, {social.region1}, {social.region2}
            </p>
            <p>
              <strong>Content Type:</strong> {social.contentType}
            </p>
          </div>
        </div>

        <div className="landing-preview">
          <div className="landing-preview-header">
            <div>
              <h3>Social preview</h3>
              <p>Bekijk hoe de posts ongeveer tonen op Instagram & LinkedIn.</p>
            </div>
            <div className="landing-preview-device-toggle">
              <button
                type="button"
                className={
                  'landing-preview-device-button' +
                  (deviceMode === 'desktop' ? ' landing-preview-device-button-active' : '')
                }
                onClick={() => setDeviceMode('desktop')}
              >
                Desktop
              </button>
              <button
                type="button"
                className={
                  'landing-preview-device-button' +
                  (deviceMode === 'tablet' ? ' landing-preview-device-button-active' : '')
                }
                onClick={() => setDeviceMode('tablet')}
              >
                Tablet
              </button>
              <button
                type="button"
                className={
                  'landing-preview-device-button' +
                  (deviceMode === 'mobile' ? ' landing-preview-device-button-active' : '')
                }
                onClick={() => setDeviceMode('mobile')}
              >
                Mobile
              </button>
            </div>
          </div>

          <div
            className={
              'landing-preview-viewport ' +
              (deviceMode === 'desktop'
                ? 'landing-preview-viewport-desktop'
                : deviceMode === 'tablet'
                ? 'landing-preview-viewport-tablet'
                : 'landing-preview-viewport-mobile')
            }
          >
            <div className="landing-preview-page social-preview-page">
              <main className="landing-preview-main">
                <section className="landing-preview-section social-preview-grid">
                  {/* Instagram Carousel mock */}
                  <article className="social-preview-card">
                    <div className="social-phone-frame">
                      <div className="social-phone-header">
                        <span className="social-phone-dot" />
                        <span className="social-phone-dot" />
                        <span className="social-phone-dot" />
                      </div>
                      <div className="social-ig-header">
                        <div className="social-ig-avatar" />
                        <div>
                          <div className="social-ig-name">Broers Verhuur</div>
                          <div className="social-ig-meta">Gesponsord · Haarlem</div>
                        </div>
                      </div>
                      <div className="social-ig-body">
                        {social.carouselImageUrl && (
                          <div
                            className="social-ig-image"
                            style={{ backgroundImage: `url(${social.carouselImageUrl})` }}
                          />
                        )}
                        <p className="social-ig-hook">{carousel?.hook || ''}</p>
                        <div className="social-ig-slides">
                          {(carousel?.slides || []).map((slide, index) => (
                            <div key={index} className="social-ig-slide">
                              <span className="social-ig-slide-index">
                                {index + 1}/{carousel?.slides?.length || 0}
                              </span>
                              <p>{slide}</p>
                            </div>
                          ))}
            </div>
                        {carousel?.cta && (
                          <button className="social-cta-button">
                            {carousel.cta || 'Meer bekijken'}
                          </button>
                        )}
          </div>
        </div>
                    <div className="social-preview-meta">
                      <div className="social-preview-title">Instagram Carousel</div>
                      <div className="social-preview-meta-actions">
                        {carousel && (
                          <CopyButton
                            text={`${carousel.hook}\n\n${(carousel.slides || []).join(
                              '\n\n'
                            )}\n\n${carousel.cta || ''}`}
                          />
                        )}
                        <input
                          className="social-image-input"
                          placeholder="Afbeelding URL (optioneel)"
                          value={social.carouselImageUrl || ''}
                          onChange={(e) =>
                            updateSocial({ carouselImageUrl: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </article>

                  {/* Instagram Reel mock */}
                  <article className="social-preview-card">
                    <div className="social-phone-frame">
                      <div className="social-phone-header">
                        <span className="social-phone-dot" />
                        <span className="social-phone-dot" />
                        <span className="social-phone-dot" />
          </div>
                      <div className="social-reel-body">
                        {social.reelImageUrl && (
                          <div
                            className="social-reel-image"
                            style={{ backgroundImage: `url(${social.reelImageUrl})` }}
                          />
                        )}
                        <div className="social-reel-badge">Reel</div>
                        <p className="social-reel-caption">{reel?.caption || ''}</p>
                        <p className="social-reel-hashtags">{reel?.hashtags || ''}</p>
        </div>
                    </div>
                    <div className="social-preview-meta">
                      <div className="social-preview-title">Instagram Reel</div>
                      <div className="social-preview-meta-actions">
                        {reel && (
                          <CopyButton
                            text={`${reel.caption}\n\n${reel.hashtags}`}
                          />
                        )}
                        <input
                          className="social-image-input"
                          placeholder="Afbeelding URL (optioneel)"
                          value={social.reelImageUrl || ''}
                          onChange={(e) =>
                            updateSocial({ reelImageUrl: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </article>

                  {/* LinkedIn mock */}
                  <article className="social-preview-card social-preview-card-wide">
                    <div className="social-linkedin-frame">
                      {social.linkedinImageUrl && (
                        <div
                          className="social-linkedin-image"
                          style={{ backgroundImage: `url(${social.linkedinImageUrl})` }}
                        />
                      )}
                      <div className="social-linkedin-header">
                        <div className="social-linkedin-avatar" />
                        <div>
                          <div className="social-linkedin-name">Broers Verhuur</div>
                          <div className="social-linkedin-meta">
                            Verhuur · Haarlem · 3.241 volgers
            </div>
          </div>
        </div>
                      <div className="social-linkedin-body">
                        <p className="social-linkedin-hook">{linkedin?.hook || ''}</p>
                        <p className="social-linkedin-post">{linkedin?.post || ''}</p>
                        <p className="social-linkedin-extra">
                          {linkedin?.valueBlock || ''}
                        </p>
                        <p className="social-linkedin-extra">
                          Scenario: {linkedin?.scenario || ''}
                        </p>
                        <p className="social-linkedin-extra">
                          Advies: {linkedin?.advice || ''}
                        </p>
                        <p className="social-linkedin-extra">
                          {linkedin?.cta || ''}
                        </p>
                        <p className="social-linkedin-hashtags">
                          {linkedin?.hashtags || ''}
                        </p>
                      </div>
                    </div>
                    <div className="social-preview-meta">
                      <div className="social-preview-title">LinkedIn Post</div>
                      <div className="social-preview-meta-actions">
                        {linkedin && (
                          <CopyButton
                            text={`${linkedin.hook}\n\n${linkedin.post}\n\n${linkedin.valueBlock}\n\nScenario: ${linkedin.scenario}\n\nAdvies: ${linkedin.advice}\n\n${linkedin.cta}\n\n${linkedin.hashtags}`}
                          />
                        )}
                        <input
                          className="social-image-input"
                          placeholder="Afbeelding URL (optioneel)"
                          value={social.linkedinImageUrl || ''}
                          onChange={(e) =>
                            updateSocial({ linkedinImageUrl: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </article>

                  {/* Story mock */}
                  <article className="social-preview-card">
                    <div className="social-phone-frame">
                      <div className="social-phone-header">
                        <span className="social-phone-dot" />
                        <span className="social-phone-dot" />
                        <span className="social-phone-dot" />
        </div>
                      <div className="social-story-body">
                        {social.storyImageUrl && (
                          <div
                            className="social-story-image"
                            style={{ backgroundImage: `url(${social.storyImageUrl})` }}
                          />
                        )}
                        <p className="social-story-text">{story?.text || ''}</p>
      </div>
                    </div>
                    <div className="social-preview-meta">
                      <div className="social-preview-title">Story Teaser</div>
                      <div className="social-preview-meta-actions">
                        {story && <CopyButton text={story.text} />}
                        <input
                          className="social-image-input"
                          placeholder="Afbeelding URL (optioneel)"
                          value={social.storyImageUrl || ''}
                          onChange={(e) =>
                            updateSocial({ storyImageUrl: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </article>
                </section>
              </main>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
