import { NextRequest, NextResponse } from 'next/server';

// Export functionaliteit voor gegenereerde content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, format, contentType } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is verplicht' },
        { status: 400 }
      );
    }

    const formatType = format || 'json';

    switch (formatType) {
      case 'json':
        return NextResponse.json(content, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="content-${Date.now()}.json"`,
          },
        });

      case 'csv':
        // Converteer JSON naar CSV
        const csv = convertToCSV(content, contentType);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="content-${Date.now()}.csv"`,
          },
        });

      case 'wordpress':
        // Genereer WordPress-ready HTML
        const wordpress = convertToWordPress(content, contentType);
        return new NextResponse(wordpress, {
          headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `attachment; filename="content-${Date.now()}.html"`,
          },
        });

      case 'markdown':
        // Converteer naar Markdown
        const markdown = convertToMarkdown(content, contentType);
        return new NextResponse(markdown, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="content-${Date.now()}.md"`,
          },
        });

      default:
        return NextResponse.json(
          { error: 'Ongeldig export format. Gebruik: json, csv, wordpress, of markdown' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error in export:', error);
    return NextResponse.json(
      { error: 'Fout bij het exporteren van content', details: error.message },
      { status: 500 }
    );
  }
}

// Converteer content naar CSV
function convertToCSV(content: any, contentType: string): string {
  const rows: string[] = [];
  
  // Header
  rows.push('Veld,Waarde');
  
  // Flatten content object
  function flatten(obj: any, prefix = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value === null || value === undefined) {
        continue;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        flatten(value as any, newKey);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            flatten(item, `${newKey}[${index}]`);
          } else {
            rows.push(`"${newKey}[${index}]","${String(item).replace(/"/g, '""')}"`);
          }
        });
      } else {
        rows.push(`"${newKey}","${String(value).replace(/"/g, '""')}"`);
      }
    }
  }
  
  flatten(content);
  return rows.join('\n');
}

// Converteer naar WordPress-ready HTML
function convertToWordPress(content: any, contentType: string): string {
  const seo = content.seo || content;
  const contentData = content.content || content;
  const faq = content.faq || { items: content.faq || [] };
  const cta = content.cta || content;
  
  let html = `<!-- WordPress Content Export -->
<!-- SEO Title: ${seo.seoTitle || ''} -->
<!-- Meta Description: ${seo.metaDescription || ''} -->
<!-- Focus Keyword: ${seo.focusKeyword || ''} -->
<!-- URL Slug: ${seo.urlSlug || ''} -->

<h1>${contentData.h1 || content.h1 || ''}</h1>

${contentData.intro || content.intro || ''}

`;

  // Benefits
  if (contentData.benefitsTitle && contentData.benefits) {
    html += `<h2>${contentData.benefitsTitle}</h2>\n<ul>\n`;
    contentData.benefits.forEach((benefit: string) => {
      html += `  <li>${benefit}</li>\n`;
    });
    html += `</ul>\n\n`;
  }

  // Ideal For
  if (contentData.idealTitle && contentData.idealFor) {
    html += `<h2>${contentData.idealTitle}</h2>\n<ul>\n`;
    contentData.idealFor.forEach((item: string) => {
      html += `  <li>${item}</li>\n`;
    });
    html += `</ul>\n\n`;
  }

  // Complete Setup
  if (contentData.completeSetupTitle && contentData.completeSetupText) {
    html += `<h2>${contentData.completeSetupTitle}</h2>\n<p>${contentData.completeSetupText}</p>\n\n`;
  }

  // FAQ
  if (faq.items && faq.items.length > 0) {
    html += `<h2>${faq.faqTitle || 'Veelgestelde vragen'}</h2>\n`;
    faq.items.forEach((item: any) => {
      html += `<h3>${item.question}</h3>\n<p>${item.answer}</p>\n\n`;
    });
  }

  // CTA
  if (cta.ctaTitle && cta.ctaText) {
    html += `<h2>${cta.ctaTitle}</h2>\n<p>${cta.ctaText}</p>\n\n`;
  }

  // Schema markup
  if (content.schema) {
    html += `<!-- Schema.org JSON-LD -->\n<script type="application/ld+json">\n${JSON.stringify(content.schema, null, 2)}\n</script>\n`;
  }

  return html;
}

// Converteer naar Markdown
function convertToMarkdown(content: any, contentType: string): string {
  const seo = content.seo || content;
  const contentData = content.content || content;
  const faq = content.faq || { items: content.faq || [] };
  const cta = content.cta || content;
  
  let md = `# ${contentData.h1 || content.h1 || ''}\n\n`;
  md += `${contentData.intro || content.intro || ''}\n\n`;

  // Benefits
  if (contentData.benefitsTitle && contentData.benefits) {
    md += `## ${contentData.benefitsTitle}\n\n`;
    contentData.benefits.forEach((benefit: string) => {
      md += `- ${benefit}\n`;
    });
    md += `\n`;
  }

  // Ideal For
  if (contentData.idealTitle && contentData.idealFor) {
    md += `## ${contentData.idealTitle}\n\n`;
    contentData.idealFor.forEach((item: string) => {
      md += `- ${item}\n`;
    });
    md += `\n`;
  }

  // Complete Setup
  if (contentData.completeSetupTitle && contentData.completeSetupText) {
    md += `## ${contentData.completeSetupTitle}\n\n${contentData.completeSetupText}\n\n`;
  }

  // FAQ
  if (faq.items && faq.items.length > 0) {
    md += `## ${faq.faqTitle || 'Veelgestelde vragen'}\n\n`;
    faq.items.forEach((item: any) => {
      md += `### ${item.question}\n\n${item.answer}\n\n`;
    });
  }

  // CTA
  if (cta.ctaTitle && cta.ctaText) {
    md += `## ${cta.ctaTitle}\n\n${cta.ctaText}\n\n`;
  }

  // SEO metadata
  md += `\n---\n\n`;
  md += `**SEO Title:** ${seo.seoTitle || ''}\n\n`;
  md += `**Meta Description:** ${seo.metaDescription || ''}\n\n`;
  md += `**Focus Keyword:** ${seo.focusKeyword || ''}\n\n`;
  md += `**URL Slug:** ${seo.urlSlug || ''}\n\n`;

  return md;
}

