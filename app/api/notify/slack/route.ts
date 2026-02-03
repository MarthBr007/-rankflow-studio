'use server';

import { NextRequest, NextResponse } from 'next/server';

type SlackPayload = {
  status: 'success' | 'error';
  message: string;
  contentType?: string;
  meta?: Record<string, any>;
  content?: any; // Volledige content data
};

// Format content voor Slack display
function formatContentForSlack(content: any, contentType: string): string {
  if (!content) return 'Geen content beschikbaar';

  let formatted = '';

  // Landingspagina
  if (contentType === 'landing') {
    formatted += `*H1:* ${content.h1 || content.seo?.h1 || 'N/A'}\n\n`;
    formatted += `*Intro:*\n${content.intro || content.seo?.intro || 'N/A'}\n\n`;
    
    if (content.benefits) {
      formatted += `*Voordelen:*\n${Array.isArray(content.benefits) ? content.benefits.join('\n') : content.benefits}\n\n`;
    }
    
    if (content.idealFor) {
      formatted += `*Ideaal voor:*\n${Array.isArray(content.idealFor) ? content.idealFor.join('\n') : content.idealFor}\n\n`;
    }
    
    if (content.faq && Array.isArray(content.faq) && content.faq.length > 0) {
      formatted += `*FAQ:*\n`;
      content.faq.slice(0, 3).forEach((faq: any, i: number) => {
        formatted += `${i + 1}. *${faq.question || faq.q || 'Vraag'}*\n   ${faq.answer || faq.a || 'Antwoord'}\n\n`;
      });
    }
    
    if (content.cta || content.ctaText) {
      formatted += `*CTA:* ${content.cta || content.ctaText || 'N/A'}\n\n`;
    }
  }
  
  // Blog
  else if (contentType === 'blog') {
    formatted += `*Titel:* ${content.h1 || content.title || 'N/A'}\n\n`;
    formatted += `*Intro:*\n${content.intro || 'N/A'}\n\n`;
    
    if (content.sections && Array.isArray(content.sections)) {
      formatted += `*Secties:*\n`;
      content.sections.slice(0, 3).forEach((section: any, i: number) => {
        formatted += `${i + 1}. *${section.title || section.heading || 'Sectie'}*\n   ${(section.content || section.text || '').substring(0, 200)}...\n\n`;
      });
    }
  }
  
  // Product
  else if (contentType === 'product') {
    formatted += `*Product:* ${content.title || content.productName || 'N/A'}\n\n`;
    formatted += `*Intro:*\n${content.intro || 'N/A'}\n\n`;
    
    if (content.benefits) {
      formatted += `*Voordelen:*\n${Array.isArray(content.benefits) ? content.benefits.join('\n') : content.benefits}\n\n`;
    }
    
    if (content.useCases) {
      formatted += `*Gebruik:*\n${Array.isArray(content.useCases) ? content.useCases.join('\n') : content.useCases}\n\n`;
    }
  }
  
  // Social Media
  else if (contentType === 'social') {
    if (content.carousel) {
      formatted += `*Instagram Carousel:*\n`;
      formatted += `*Hook:* ${content.carousel.hook || 'N/A'}\n\n`;
      if (content.carousel.slides && Array.isArray(content.carousel.slides)) {
        formatted += `*Slides:*\n${content.carousel.slides.slice(0, 3).map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}\n\n`;
      }
      formatted += `*CTA:* ${content.carousel.cta || 'N/A'}\n\n`;
    }
    
    if (content.linkedin) {
      formatted += `*LinkedIn Post:*\n`;
      formatted += `*Hook:* ${content.linkedin.hook || 'N/A'}\n\n`;
      formatted += `*Post:*\n${(content.linkedin.post || '').substring(0, 500)}${content.linkedin.post?.length > 500 ? '...' : ''}\n\n`;
      formatted += `*CTA:* ${content.linkedin.cta || 'N/A'}\n\n`;
    }
    
    if (content.reel) {
      formatted += `*Instagram Reel:*\n`;
      formatted += `*Caption:*\n${content.reel.caption || 'N/A'}\n\n`;
    }
  }
  
  // Categorie
  else if (contentType === 'categorie') {
    formatted += `*Categorie:* ${content.title || content.categoryName || 'N/A'}\n\n`;
    formatted += `*Intro:*\n${content.intro || 'N/A'}\n\n`;
    
    if (content.benefits) {
      formatted += `*Voordelen:*\n${Array.isArray(content.benefits) ? content.benefits.join('\n') : content.benefits}\n\n`;
    }
  }
  
  // Fallback: toon belangrijke velden
  else {
    if (content.h1) formatted += `*H1:* ${content.h1}\n\n`;
    if (content.title) formatted += `*Titel:* ${content.title}\n\n`;
    if (content.intro) formatted += `*Intro:*\n${content.intro}\n\n`;
    if (content.seo?.metaDescription) formatted += `*Meta Description:* ${content.seo.metaDescription}\n\n`;
  }

  // SEO info toevoegen
  if (content.seo) {
    formatted += `\n---\n*SEO Info:*\n`;
    if (content.seo.focusKeyword) formatted += `• Focus Keyword: ${content.seo.focusKeyword}\n`;
    if (content.seo.seoTitle) formatted += `• SEO Title: ${content.seo.seoTitle}\n`;
    if (content.seo.urlSlug) formatted += `• URL Slug: ${content.seo.urlSlug}\n`;
  }

  return formatted || JSON.stringify(content, null, 2).substring(0, 2000);
}

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    // Niet geconfigureerd: 200 met skipped, zodat de app niet breekt
    return NextResponse.json({ ok: false, skipped: true, reason: 'SLACK_WEBHOOK_URL niet geconfigureerd' }, { status: 200 });
  }

  let body: SlackPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { status, message, contentType, meta, content } = body;
  if (!status || !message) {
    return NextResponse.json({ error: 'status en message zijn verplicht' }, { status: 400 });
  }

  // Build Slack message with blocks for better formatting
  const blocks: any[] = [];
  
  // Header block
  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: status === 'success' ? '✅ Nieuwe Content Gegenereerd' : '❌ Fout bij Genereren',
      emoji: true,
    },
  });

  // Summary block
  const metaLines = [];
  if (contentType) metaLines.push(`*Type:* ${contentType}`);
  if (meta?.productName) metaLines.push(`*Product:* ${meta.productName}`);
  if (meta?.topic) metaLines.push(`*Onderwerp:* ${meta.topic}`);
  if (meta?.subject) metaLines.push(`*Titel:* ${meta.subject}`);
  if (meta?.category) metaLines.push(`*Categorie:* ${meta.category}`);

  if (metaLines.length > 0) {
    blocks.push({
      type: 'section',
      fields: metaLines.map((line) => ({
        type: 'mrkdwn',
        text: line,
      })),
    });
  }

  // Message block
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${message}*`,
    },
  });

  // Content block (als content beschikbaar is)
  if (content && status === 'success') {
    const formattedContent = formatContentForSlack(content, contentType || '');
    
    blocks.push({
      type: 'divider',
    });

    // Split content in chunks (Slack has 3000 char limit per block)
    const maxLength = 2800; // Leave some margin
    if (formattedContent.length <= maxLength) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*📄 Volledige Content:*\n\`\`\`${formattedContent}\`\`\``,
        },
      });
    } else {
      // Split in multiple blocks
      const chunks = [];
      let currentChunk = '';
      const lines = formattedContent.split('\n');
      
      for (const line of lines) {
        if ((currentChunk + line + '\n').length > maxLength && currentChunk) {
          chunks.push(currentChunk);
          currentChunk = line + '\n';
        } else {
          currentChunk += line + '\n';
        }
      }
      if (currentChunk) chunks.push(currentChunk);

      chunks.forEach((chunk, index) => {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*📄 Content ${chunks.length > 1 ? `(deel ${index + 1}/${chunks.length})` : ''}:*\n\`\`\`${chunk}\`\`\``,
          },
        });
      });
    }

    // Add link to view full content
    if (meta?.resultUrl) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🔗 <${meta.resultUrl}|Bekijk volledige content in RankFlow Studio>`,
        },
      });
    }
  }

  // Error details (als error)
  if (status === 'error' && meta?.error) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Fout Details:*\n\`\`\`${meta.error}\`\`\``,
      },
    });
  }

  // Footer
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `RankFlow Studio • ${new Date().toLocaleString('nl-NL')}`,
      },
    ],
  });

  // Build Slack payload
  const slackPayload = {
    text: status === 'success' ? 'Nieuwe content gegenereerd' : 'Fout bij genereren',
    blocks,
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Slack webhook error', errText);
      return NextResponse.json({ error: 'Slack webhook failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Slack webhook error', error);
    return NextResponse.json({ error: 'Slack webhook exception' }, { status: 500 });
  }
}

