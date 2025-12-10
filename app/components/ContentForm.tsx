'use client';

import { useState, useEffect } from 'react';

type ContentType = 'product' | 'categorie' | 'landing' | 'blog' | 'social';

interface FormData {
  type: ContentType;
  language?: 'nl' | 'en' | 'de' | 'fr';
  // Product fields
  productName?: string;
  category?: string;
  useCase?: string;
  // Categorie fields
  description?: string;
  // Landing fields
  topic?: string;
  goal?: string;
  // Blog fields
  subject?: string;
  targetAudience?: string;
  // Social fields
  platform?: 'Instagram' | 'LinkedIn';
  // Common fields
  region1: string;
  region2: string;
}

interface ContentFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  defaultType?: ContentType;
}

export default function ContentForm({ onSubmit, isLoading, defaultType = 'landing' }: ContentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    type: defaultType,
    region1: 'Haarlem',
    region2: '',
    language: 'nl',
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
            <label htmlFor="topic">Onderwerp (bijv. tafelgerei, meubilair, glaswerk)</label>
            <input
              id="topic"
              name="topic"
              type="text"
              value={formData.topic || ''}
              onChange={handleChange}
              required
            />
            {validationErrors.topic && (
              <div style={{ color: '#E53935', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {validationErrors.topic}
              </div>
            )}
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
              Minimaal 400 woorden, maximaal 600 woorden voor landingspagina's
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="goal">Doel (wat de bezoeker wil bereiken)</label>
            <textarea
              id="goal"
              name="goal"
              value={formData.goal || ''}
              onChange={handleChange}
              required
            />
          </div>
        </>
      )}

      {formData.type === 'blog' && (
        <>
          <div className="form-group">
            <label htmlFor="subject">Titel/Onderwerp</label>
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
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
              Blog posts: minimaal 800 woorden, maximaal 2000 woorden
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="targetAudience">Doelgroep</label>
            <input
              id="targetAudience"
              name="targetAudience"
              type="text"
              value={formData.targetAudience || ''}
              onChange={handleChange}
              required
            />
          </div>
        </>
      )}

      {formData.type === 'social' && (
        <>
          <div className="form-group">
            <label htmlFor="subject">Onderwerp</label>
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

      {(formData.type === 'landing' || formData.type === 'categorie' || formData.type === 'social') && (
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

      <button type="submit" className="button" disabled={isLoading}>
        {isLoading ? 'Genereren...' : 'Genereren'}
      </button>
    </form>
  );
}

