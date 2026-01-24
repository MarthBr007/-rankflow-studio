'use client';

import { useState, useEffect } from 'react';
import ImageGallery from './ImageGallery';

type ContentType = 'product' | 'categorie' | 'landing' | 'blog' | 'social';

interface FormData {
  type: ContentType;
  language?: 'nl' | 'en' | 'de' | 'fr';
  goal?: string;
  targetAudience?: string;
  toneOfVoice?: string;
  persona?: string;
  cta?: string;
  usps?: string;
  keywords?: string;
  internalLinks?: string;
  // Product fields
  productName?: string;
  category?: string;
  useCase?: string;
  // Categorie fields
  description?: string;
  // Landing fields
  topic?: string;
  // Blog fields
  subject?: string;
  // Social fields
  platform?: 'Instagram' | 'LinkedIn';
  // Common fields
  region1: string;
  region2: string;
  // Image selection
  selectedImageId?: string | null;
  selectedImageUrl?: string | null;
  // Performance
  fastMode?: boolean;
}

interface ContentFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  defaultType?: ContentType;
  organizationId?: string | null;
}

export default function ContentForm({ onSubmit, isLoading, defaultType = 'landing', organizationId }: ContentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    type: defaultType,
    region1: 'Haarlem',
    region2: '',
    language: 'nl',
    goal: '',
    targetAudience: '',
    toneOfVoice: '',
    persona: '',
    cta: '',
    usps: '',
    keywords: '',
    internalLinks: '',
  });
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update type when defaultType changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, type: defaultType }));
  }, [defaultType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Inline validation per content type
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (formData.type === 'landing' && formData.topic) {
      const topicWords = formData.topic.trim().split(/\s+/).length;
      if (topicWords > 5) {
        errors.topic = 'Onderwerp moet kort zijn (max 5 woorden)';
      }
    }
    
    if (formData.type === 'blog' && formData.subject) {
      const subjectWords = formData.subject.trim().split(/\s+/).length;
      if (subjectWords > 10) {
        errors.subject = 'Titel moet kort zijn (max 10 woorden)';
      }
    }
    
    if (formData.type === 'social' && formData.subject) {
      const subjectLength = formData.subject.length;
      if (formData.platform === 'Instagram' && subjectLength > 2200) {
        errors.subject = 'Instagram posts zijn maximaal 2200 karakters';
      } else if (formData.platform === 'LinkedIn' && subjectLength > 3000) {
        errors.subject = 'LinkedIn posts zijn maximaal 3000 karakters';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <input type="hidden" name="type" value={formData.type} />

      {/* Algemene velden - alleen voor product en categorie */}
      {formData.type === 'product' || formData.type === 'categorie' ? (
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="goal">Doel</label>
            <input
              id="goal"
              name="goal"
              type="text"
              placeholder="Wat wil je bereiken?"
              value={formData.goal || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="targetAudience">Doelgroep</label>
            <input
              id="targetAudience"
              name="targetAudience"
              type="text"
              placeholder="Wie wil je bereiken?"
              value={formData.targetAudience || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="toneOfVoice">Tone of Voice</label>
            <input
              id="toneOfVoice"
              name="toneOfVoice"
              type="text"
              placeholder="Bijv. vriendelijk, direct, informeel"
              value={formData.toneOfVoice || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="persona">Persona</label>
            <input
              id="persona"
              name="persona"
              type="text"
              placeholder="Bijv. Marketing manager horeca"
              value={formData.persona || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cta">CTA</label>
            <input
              id="cta"
              name="cta"
              type="text"
              placeholder="Bijv. Vraag een offerte aan"
              value={formData.cta || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="usps">USP's</label>
            <textarea
              id="usps"
              name="usps"
              placeholder="Zet USP's onder elkaar"
              value={formData.usps || ''}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label htmlFor="keywords">Keywords</label>
            <input
              id="keywords"
              name="keywords"
              type="text"
              placeholder="Komma-gescheiden: keyword1, keyword2"
              value={formData.keywords || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="internalLinks">Interne links</label>
            <textarea
              id="internalLinks"
              name="internalLinks"
              placeholder="Eén per regel: anchor - url"
              value={formData.internalLinks || ''}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </div>
      ) : null}

      {formData.type === 'product' && (
        <>
          <div className="form-group">
            <label htmlFor="productName">Product Naam</label>
            <input
              id="productName"
              name="productName"
              type="text"
              value={formData.productName || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Categorie</label>
            <input
              id="category"
              name="category"
              type="text"
              value={formData.category || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="useCase">Gebruik (bijv. 21 diner, bedrijfsfeest)</label>
            <input
              id="useCase"
              name="useCase"
              type="text"
              value={formData.useCase || ''}
              onChange={handleChange}
              required
            />
          </div>
        </>
      )}

      {formData.type === 'categorie' && (
        <>
          <div className="form-group">
            <label htmlFor="category">Categorie</label>
            <input
              id="category"
              name="category"
              type="text"
              value={formData.category || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="useCase">Beschrijving/Gebruik</label>
            <textarea
              id="useCase"
              name="useCase"
              value={formData.useCase || ''}
              onChange={handleChange}
              required
            />
          </div>
        </>
      )}

      {formData.type === 'landing' && (
        <>
          <div className="form-group">
            <label htmlFor="topic">Onderwerp / scenario *</label>
            <input
              id="topic"
              name="topic"
              type="text"
              value={formData.topic || ''}
              onChange={handleChange}
              placeholder="bijv. tafelgerei, meubilair, glaswerk"
              required
            />
            {validationErrors.topic && (
              <div style={{ color: '#E53935', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {validationErrors.topic}
              </div>
            )}
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
              De AI genereert automatisch: keywords, CTA's, USP's, interne links, tone of voice en meer
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="goal">Doel (optioneel)</label>
            <textarea
              id="goal"
              name="goal"
              value={formData.goal || ''}
              onChange={handleChange}
              placeholder="Wat wil de bezoeker bereiken? (optioneel - AI kan dit ook afleiden)"
              rows={2}
            />
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
              Optioneel: helpt de AI om de content beter af te stemmen op de zoekintentie
            </div>
          </div>
        </>
      )}

      {formData.type === 'blog' && (
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="subject">Titel/Onderwerp *</label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject || ''}
              onChange={handleChange}
              required
              placeholder="Bijv. RFID implementatie bij Broers Verhuur"
            />
            {validationErrors.subject && (
              <div style={{ color: '#E53935', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {validationErrors.subject}
              </div>
            )}
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
              Blog posts: minimaal 1500 woorden, maximaal 2200 woorden
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="targetAudience">Doelgroep *</label>
            <input
              id="targetAudience"
              name="targetAudience"
              type="text"
              value={formData.targetAudience || ''}
              onChange={handleChange}
              required
              placeholder="Bijv. Event organisatoren, horeca ondernemers"
            />
          </div>
        </div>
      )}

      {formData.type === 'social' && (
        <>
          <div className="form-group">
            <label htmlFor="subject">Onderwerp / scenario</label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject || ''}
              onChange={handleChange}
              required
            />
            {validationErrors.subject && (
              <div style={{ color: '#E53935', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {validationErrors.subject}
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="goal">Doel (optioneel)</label>
            <input
              id="goal"
              name="goal"
              type="text"
              placeholder="Wat wil je bereiken? (optioneel)"
              value={formData.goal || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="platform">Platform</label>
            <select
              id="platform"
              name="platform"
              value={formData.platform || ''}
              onChange={handleChange}
              required
            >
              <option value="">Selecteer platform</option>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
            </select>
            {formData.platform && (
              <div style={{ 
                marginTop: '0.5rem', 
                padding: '0.75rem', 
                background: '#f0f9ff', 
                borderRadius: '4px',
                fontSize: '0.875rem',
                color: '#2e3a44'
              }}>
                {formData.platform === 'Instagram' ? (
                  <>
                    <strong>Instagram hints:</strong>
                    <ul style={{ marginTop: '0.25rem', marginLeft: '1.25rem' }}>
                      <li>Max 2200 karakters per post</li>
                      <li>Gebruik 1-3 emoji's voor engagement</li>
                      <li>Hashtags: 5-10 relevante tags</li>
                      <li>Call-to-action aan het einde</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <strong>LinkedIn hints:</strong>
                    <ul style={{ marginTop: '0.25rem', marginLeft: '1.25rem' }}>
                      <li>Max 3000 karakters per post</li>
                      <li>Professionele toon, minder emoji's</li>
                      <li>Hashtags: 3-5 relevante tags</li>
                      <li>Focus op waarde en expertise</li>
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Afbeelding selecteren (optioneel)</label>
            <div style={{ marginTop: '0.5rem' }}>
              <ImageGallery
                organizationId={organizationId}
                onSelect={(image) => {
                  setFormData(prev => ({ ...prev, selectedImageId: image.id }));
                }}
                selectedImageId={formData.selectedImageId}
                showUploader={true}
              />
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
              Upload of selecteer een afbeelding (optioneel). De AI bepaalt caption, hashtags, contenttype en timing.
            </div>
          </div>
        </>
      )}

      {/* Language selector */}
      <div className="form-group">
        <label htmlFor="language">Taal</label>
        <select
          id="language"
          name="language"
          value={formData.language || 'nl'}
          onChange={handleChange}
        >
          <option value="nl">Nederlands</option>
          <option value="en">Engels</option>
          <option value="de">Duits</option>
          <option value="fr">Frans</option>
        </select>
      </div>

      {(formData.type === 'landing' || formData.type === 'categorie' || formData.type === 'blog') && (
        <>
          <div className="form-group">
            <label htmlFor="region1">Regio 1 (optioneel)</label>
            <input
              id="region1"
              name="region1"
              type="text"
              value={formData.region1}
              onChange={handleChange}
              placeholder="Haarlem (default)"
            />
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
              Haarlem is standaard ingevuld. Wijzig indien nodig.
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="region2">Regio 2 (optioneel)</label>
            <input
              id="region2"
              name="region2"
              type="text"
              value={formData.region2}
              onChange={handleChange}
              placeholder="bijv. Amsterdam, Hoofddorp"
            />
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
              Toegestane regio's: Amsterdam, Hoofddorp, Zandvoort, Bloemendaal, etc.
            </div>
          </div>
        </>
      )}

      <div className="form-group" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'normal' }}>
          <input
            type="checkbox"
            checked={formData.fastMode || false}
            onChange={(e) => setFormData(prev => ({ ...prev, fastMode: e.target.checked }))}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <div>
            <strong>Snelle modus</strong>
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
              Gebruikt snellere modellen en optimalisaties voor snellere generatie (2-3x sneller). Kwaliteit blijft hoog.
            </div>
          </div>
        </label>
      </div>

      <button type="submit" className="button" disabled={isLoading}>
        {isLoading ? 'Genereren...' : 'Genereren'}
      </button>
    </form>
  );
}

