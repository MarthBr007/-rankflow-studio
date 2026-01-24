'use client';

import React from 'react';
import { Image as ImageIcon, Instagram, Linkedin, FileText } from 'lucide-react';

export type ContentResultProps = {
  type: string;
  editedResult: any;
  onRefine?: () => void;
  isRefining?: boolean;
};

export default function ContentResult({ type, editedResult }: ContentResultProps) {
  if (!editedResult) {
    return (
      <div className="result-container">
        <div className="result-section">
          <p>Geen content beschikbaar</p>
        </div>
      </div>
    );
  }

  // Social Media rendering
  if (type === 'social') {
    const social = editedResult;
    const imageUrl = social.imageUrl || social.selectedImageUrl || null;
    const imageId = social.imageId || social.selectedImageId || null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Topic/Subject */}
        {social.topic && (
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-title">
                <FileText size={20} />
                <h2>Onderwerp</h2>
              </div>
            </div>
            <div className="settings-card-body">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                {social.topic}
              </h3>
            </div>
          </div>
        )}

        {/* Instagram Carousel */}
        {social.carousel && (
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-title">
                <Instagram size={20} />
                <h2>Instagram Carousel</h2>
              </div>
            </div>
            <div className="settings-card-body">
              <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
                {/* Preview */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#6b7280' }}>
                    Preview
                  </h3>
                  <div style={{
                    width: '100%',
                    maxWidth: '470px',
                    background: '#fff',
                    border: '1px solid #dbdbdb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {/* Header */}
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #efefef' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        B
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>Broers Verhuur</div>
                      </div>
                    </div>

                    {/* Image */}
                    <div style={{
                      width: '100%',
                      aspectRatio: '1/1',
                      background: imageUrl ? `url(${imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      position: 'relative'
                    }}>
                      {!imageUrl && (
                        <>
                          <ImageIcon size={48} style={{ opacity: 0.5 }} />
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(0,0,0,0.6)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            Carousel
                          </div>
                        </>
                      )}
                    </div>

                    {/* Caption */}
                    <div style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        <strong>{social.carousel.hook}</strong>
                        {'\n\n'}
                        {social.carousel.slides?.slice(0, 2).map((slide: string, i: number) => (
                          <div key={i} style={{ marginBottom: '8px' }}>• {slide}</div>
                        ))}
                        {social.carousel.slides?.length > 2 && (
                          <div style={{ color: '#8e8e8e', fontSize: '12px' }}>
                            +{social.carousel.slides.length - 2} meer slides
                          </div>
                        )}
                        {'\n\n'}
                        <strong>{social.carousel.cta}</strong>
                        {'\n\n'}
                        <span style={{ color: '#00376b' }}>{social.carousel.hashtags}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#6b7280' }}>
                    Content Details
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {social.carousel.hook && (
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Hook</div>
                        <div style={{ fontSize: '1rem', color: '#111827' }}>{social.carousel.hook}</div>
                      </div>
                    )}
                    {social.carousel.slides && social.carousel.slides.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem' }}>Slides ({social.carousel.slides.length})</div>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {social.carousel.slides.map((slide: string, i: number) => (
                            <li key={i} style={{ fontSize: '0.9375rem', color: '#111827' }}>{slide}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {social.carousel.cta && (
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>CTA</div>
                        <div style={{ fontSize: '1rem', color: '#111827', fontWeight: 500 }}>{social.carousel.cta}</div>
                      </div>
                    )}
                    {social.carousel.hashtags && (
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Hashtags</div>
                        <div style={{ fontSize: '0.9375rem', color: '#00376b' }}>{social.carousel.hashtags}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instagram Reel */}
        {social.reel && (
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-title">
                <Instagram size={20} />
                <h2>Instagram Reel</h2>
              </div>
            </div>
            <div className="settings-card-body">
              <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
                {/* Preview */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#6b7280' }}>
                    Preview
                  </h3>
                  <div style={{
                    width: '100%',
                    maxWidth: '270px',
                    background: '#fff',
                    border: '1px solid #dbdbdb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {/* Header */}
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #efefef' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        B
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>Broers Verhuur</div>
                      </div>
                    </div>

                    {/* Image/Video */}
                    <div style={{
                      width: '100%',
                      aspectRatio: '9/16',
                      background: imageUrl ? `url(${imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      position: 'relative'
                    }}>
                      {!imageUrl && (
                        <>
                          <ImageIcon size={48} style={{ opacity: 0.5 }} />
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(0,0,0,0.6)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            Reel
                          </div>
                        </>
                      )}
                    </div>

                    {/* Caption */}
                    <div style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        {social.reel.caption}
                        {'\n\n'}
                        <span style={{ color: '#8e8e8e' }}>{social.reel.hashtags}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#6b7280' }}>
                    Content Details
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {social.reel.caption && (
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Caption</div>
                        <div style={{ fontSize: '0.9375rem', color: '#111827', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{social.reel.caption}</div>
                      </div>
                    )}
                    {social.reel.hashtags && (
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Hashtags</div>
                        <div style={{ fontSize: '0.9375rem', color: '#00376b' }}>{social.reel.hashtags}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LinkedIn Post */}
        {social.linkedin && (
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-title">
                <Linkedin size={20} />
                <h2>LinkedIn Post</h2>
              </div>
            </div>
            <div className="settings-card-body">
              <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
                {/* Preview */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#6b7280' }}>
                    Preview
                  </h3>
                  <div style={{
                    width: '100%',
                    maxWidth: '552px',
                    background: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {/* Header */}
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e0e0e0' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#0077B5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        B
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>Broers Verhuur</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '12px 16px' }}>
                      {social.linkedin.hook && (
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                          {social.linkedin.hook}
                        </div>
                      )}
                      {social.linkedin.post && (
                        <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#000', whiteSpace: 'pre-wrap', marginBottom: '0.5rem' }}>
                          {social.linkedin.post}
                        </div>
                      )}
                      {social.linkedin.cta && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e0e0e0' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0077B5' }}>
                            {social.linkedin.cta}
                          </div>
                        </div>
                      )}
                      {social.linkedin.hashtags && (
                        <div style={{ marginTop: '0.75rem', fontSize: '14px', color: '#0077B5' }}>
                          {social.linkedin.hashtags}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#6b7280' }}>
                    Content Details
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {social.linkedin.hook && (
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Hook</div>
                        <div style={{ fontSize: '1rem', color: '#111827' }}>{social.linkedin.hook}</div>
                      </div>
                    )}
                    {social.linkedin.post && (
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Post</div>
                        <div style={{ fontSize: '0.9375rem', color: '#111827', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{social.linkedin.post}</div>
                      </div>
                    )}
                    {social.linkedin.cta && (
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>CTA</div>
                        <div style={{ fontSize: '1rem', color: '#111827', fontWeight: 500 }}>{social.linkedin.cta}</div>
                      </div>
                    )}
                    {social.linkedin.hashtags && (
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Hashtags</div>
                        <div style={{ fontSize: '0.9375rem', color: '#0077B5' }}>{social.linkedin.hashtags}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback: show JSON if no specific content */}
        {!social.carousel && !social.reel && !social.linkedin && (
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-title">
                <FileText size={20} />
                <h2>Social Media Content</h2>
              </div>
            </div>
            <div className="settings-card-body">
              <pre style={{ fontSize: '0.9rem', background: '#f8f8f8', padding: '1rem', overflow: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                {JSON.stringify(social, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Blog rendering with preview
  if (type === 'blog') {
    const blog = editedResult;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Preview Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">
              <FileText size={20} />
              <h2>Blog Preview</h2>
            </div>
          </div>
          <div className="settings-card-body">
            <div style={{ 
              maxWidth: '800px', 
              margin: '0 auto',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <article>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: '#111827', lineHeight: 1.2 }}>
                  {blog.h1 || blog.seoTitle || blog.title || 'Blog Titel'}
                </h1>
                {blog.intro && (
                  <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>
                    {blog.intro}
                  </p>
                )}
                {blog.sections && blog.sections.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {blog.sections.map((section: any, index: number) => (
                      <div key={index}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>
                          {section.title}
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                          {section.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {blog.steps && blog.steps.length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>
                      {blog.stepsTitle || 'Stappenplan'}
                    </h2>
                    <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {blog.steps.map((step: string, index: number) => (
                        <li key={index} style={{ fontSize: '1rem', color: '#374151', lineHeight: 1.6 }}>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {blog.ctaText && (
                  <div style={{ 
                    marginTop: '2rem', 
                    padding: '1.5rem', 
                    background: '#f0f8ff', 
                    borderRadius: '8px',
                    border: '1px solid #007bff'
                  }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>
                      {blog.ctaTitle || 'Call to Action'}
                    </h3>
                    <p style={{ fontSize: '1rem', color: '#374151', margin: 0 }}>
                      {blog.ctaText}
                    </p>
                  </div>
                )}
              </article>
            </div>
          </div>
        </div>

        {/* SEO Metadata */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">
              <FileText size={20} />
              <h2>SEO Metadata</h2>
            </div>
          </div>
          <div className="settings-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Title</div>
                <div style={{ fontSize: '1rem', color: '#111827' }}>{blog.seoTitle || blog.title || 'Geen titel'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Meta Description</div>
                <div style={{ fontSize: '1rem', color: '#111827' }}>{blog.metaDescription || 'Geen beschrijving'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Keyword</div>
                <div style={{ fontSize: '1rem', color: '#111827' }}>{blog.keyword || blog.focusKeyword || 'Geen keyword'}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // Landing page rendering with preview
  if (type === 'landing') {
    const landing = editedResult;
    const content = landing.content || landing;
    const seo = landing.seo || landing;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Preview Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">
              <FileText size={20} />
              <h2>Landingspagina Preview</h2>
            </div>
          </div>
          <div className="settings-card-body">
            <div style={{ 
              maxWidth: '900px', 
              margin: '0 auto',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <article>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#111827', lineHeight: 1.2 }}>
                  {content.h1 || seo.seoTitle || 'Landingspagina Titel'}
                </h1>
                {content.intro && (
                  <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>
                    {content.intro}
                  </p>
                )}
                {content.inspirationText && (
                  <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>
                      {content.inspirationTitle || 'Scenario'}
                    </h2>
                    <p style={{ fontSize: '1rem', color: '#374151', lineHeight: 1.6 }}>
                      {content.inspirationText}
                    </p>
                  </div>
                )}
                {content.benefits && content.benefits.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>
                      {content.benefitsTitle || 'Voordelen'}
                    </h2>
                    <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {content.benefits.map((benefit: string, index: number) => (
                        <li key={index} style={{ fontSize: '1rem', color: '#374151', lineHeight: 1.6 }}>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {landing.faq && landing.faq.items && landing.faq.items.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>
                      {landing.faq.faqTitle || 'Veelgestelde vragen'}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {landing.faq.items.map((item: any, index: number) => (
                        <div key={index} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>
                            {item.question}
                          </h3>
                          <p style={{ fontSize: '1rem', color: '#374151', margin: 0 }}>
                            {item.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {landing.cta && landing.cta.ctaText && (
                  <div style={{ 
                    marginTop: '2rem', 
                    padding: '2rem', 
                    background: 'linear-gradient(135deg, #005BBB 0%, #0A6BE5 100%)', 
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#fff'
                  }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                      {landing.cta.ctaTitle || 'Call to Action'}
                    </h3>
                    <p style={{ fontSize: '1.125rem', margin: 0, opacity: 0.95 }}>
                      {landing.cta.ctaText}
                    </p>
                  </div>
                )}
              </article>
            </div>
          </div>
        </div>

        {/* SEO Metadata */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">
              <FileText size={20} />
              <h2>SEO Metadata</h2>
            </div>
          </div>
          <div className="settings-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>SEO Title</div>
                <div style={{ fontSize: '1rem', color: '#111827' }}>{seo.seoTitle || 'Geen titel'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Meta Description</div>
                <div style={{ fontSize: '1rem', color: '#111827' }}>{seo.metaDescription || 'Geen beschrijving'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Focus Keyword</div>
                <div style={{ fontSize: '1rem', color: '#111827' }}>{seo.focusKeyword || 'Geen keyword'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>URL Slug</div>
                <div style={{ fontSize: '1rem', color: '#111827' }}>{seo.urlSlug || 'Geen slug'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Product page rendering with preview
  if (type === 'product') {
    const product = editedResult;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Preview Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">
              <FileText size={20} />
              <h2>Productpagina Preview</h2>
            </div>
          </div>
          <div className="settings-card-body">
            <div style={{ 
              maxWidth: '900px', 
              margin: '0 auto',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <article>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#111827', lineHeight: 1.2 }}>
                  {product.title || product.h1 || product.seoTitle || 'Product Titel'}
                </h1>
                {product.intro && (
                  <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>
                    {product.intro}
                  </p>
                )}
                {product.benefits && product.benefits.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>
                      {product.benefitsTitle || 'Voordelen'}
                    </h2>
                    <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {product.benefits.map((benefit: string, index: number) => (
                        <li key={index} style={{ fontSize: '1rem', color: '#374151', lineHeight: 1.6 }}>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {product.idealFor && product.idealFor.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>
                      {product.idealTitle || 'Ideaal voor'}
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {product.idealFor.map((item: string, index: number) => (
                        <span key={index} style={{ 
                          padding: '0.5rem 1rem', 
                          background: '#f0f8ff', 
                          borderRadius: '6px',
                          fontSize: '0.9375rem',
                          color: '#005BBB',
                          fontWeight: 500
                        }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.ctaText && (
                  <div style={{ 
                    marginTop: '2rem', 
                    padding: '2rem', 
                    background: 'linear-gradient(135deg, #005BBB 0%, #0A6BE5 100%)', 
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#fff'
                  }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                      {product.ctaTitle || 'Call to Action'}
                    </h3>
                    <p style={{ fontSize: '1.125rem', margin: 0, opacity: 0.95 }}>
                      {product.ctaText}
                    </p>
                  </div>
                )}
              </article>
            </div>
          </div>
        </div>

        {/* SEO Metadata */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">
              <FileText size={20} />
              <h2>SEO Metadata</h2>
            </div>
          </div>
          <div className="settings-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>SEO Title</div>
                <div style={{ fontSize: '1rem', color: '#111827' }}>{product.seoTitle || 'Geen titel'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Meta Description</div>
                <div style={{ fontSize: '1rem', color: '#111827' }}>{product.metaDescription || 'Geen beschrijving'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Focus Keyword</div>
                <div style={{ fontSize: '1rem', color: '#111827' }}>{product.focusKeyword || 'Geen keyword'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: show JSON for other types
  return (
    <div className="settings-card">
      <div className="settings-card-header">
        <div className="settings-card-title">
          <FileText size={20} />
          <h2>{type ? `${type} resultaat` : 'Resultaat'}</h2>
        </div>
      </div>
      <div className="settings-card-body">
        <pre style={{ fontSize: '0.9rem', background: '#f8f8f8', padding: '1rem', overflow: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          {JSON.stringify(editedResult, null, 2)}
        </pre>
      </div>
    </div>
  );
}
