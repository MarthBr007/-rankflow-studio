'use client';

import React from 'react';
import Sidebar from '../components/Sidebar';
import CopyButton from '../components/CopyButton';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
      return next;
    });
  };

  React.useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) setIsSidebarCollapsed(JSON.parse(saved));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar
        activeType="templates"
        onTypeChange={() => {}}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="header">
          <h1>Templates Library</h1>
          <p>Vooraf gedefinieerde contenttemplates per type. Kopieer of download JSON.</p>
        </div>

        <div className="settings-container" style={{ gap: '1.5rem' }}>
          {templates.map((tpl) => (
            <div key={tpl.id} className="prompt-viewer">
              <div className="prompt-header">
                <div>
                  <h2>{tpl.name}</h2>
                  <p style={{ color: '#666', marginTop: '0.2rem' }}>
                    {tpl.description} • Type: {tpl.type}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <CopyButton text={JSON.stringify(tpl.data, null, 2)} />
                  <button
                    className="button"
                    onClick={() => downloadJson(tpl.data, `${tpl.id}.json`)}
                  >
                    Download JSON
                  </button>
                </div>
              </div>
              <div className="prompt-content" style={{ maxHeight: '420px', overflow: 'auto' }}>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontSize: '0.92rem' }}>
                  {JSON.stringify(tpl.data, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

