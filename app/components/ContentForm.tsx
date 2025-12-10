'use client';

import { useState, useEffect } from 'react';

type ContentType = 'product' | 'categorie' | 'landing' | 'blog' | 'social';

interface FormData {
  type: ContentType;
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
    region1: '',
    region2: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          </div>
        </>
      )}

      {(formData.type === 'landing' || formData.type === 'categorie') && (
        <>
          <div className="form-group">
            <label htmlFor="region1">Regio 1</label>
            <input
              id="region1"
              name="region1"
              type="text"
              value={formData.region1}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="region2">Regio 2</label>
            <input
              id="region2"
              name="region2"
              type="text"
              value={formData.region2}
              onChange={handleChange}
              required
            />
          </div>
        </>
      )}

      <button type="submit" className="button" disabled={isLoading}>
        {isLoading ? 'Genereren...' : 'Genereren'}
      </button>
    </form>
  );
}

