'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, X, Search, Tag, Trash2 } from 'lucide-react';
import ImageUploader from './ImageUploader';

interface Image {
  id: string;
  url: string;
  originalName: string;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  tags?: string[];
  createdAt: string;
}

interface ImageGalleryProps {
  organizationId?: string | null;
  onSelect?: (image: Image) => void;
  selectedImageId?: string | null;
  showUploader?: boolean;
}

export default function ImageGallery({
  organizationId,
  onSelect,
  selectedImageId,
  showUploader = true,
}: ImageGalleryProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, [organizationId, selectedTag]);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (organizationId) params.append('organizationId', organizationId);
      if (selectedTag) params.append('tags', selectedTag);

      const response = await fetch(`/api/images?${params.toString()}`);
      if (!response.ok) throw new Error('Fout bij laden afbeeldingen');
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = (image: any) => {
    loadImages();
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/images?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Fout bij verwijderen');
      loadImages();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Get all unique tags
  const allTags = Array.from(new Set(images.flatMap(img => img.tags || [])));

  // Filter images by search term
  const filteredImages = images.filter(img => {
    const matchesSearch = !searchTerm || 
      img.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.alt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div>
      {showUploader && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ImageUploader
            onUploadComplete={handleUploadComplete}
            organizationId={organizationId}
            multiple={true}
          />
        </div>
      )}

      {/* Filters */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input
            type="text"
            placeholder="Zoek afbeeldingen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.5rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
          />
        </div>
        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedTag(null)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: selectedTag === null ? '#007bff' : '#fff',
                color: selectedTag === null ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Alle
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  background: selectedTag === tag ? '#007bff' : '#fff',
                  color: selectedTag === tag ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Tag size={14} />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Image Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner" />
          <p style={{ marginTop: '1rem', color: '#666' }}>Afbeeldingen laden...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <ImageIcon size={48} style={{ margin: '0 auto 1rem', color: '#999' }} />
          <p style={{ color: '#666' }}>Geen afbeeldingen gevonden</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {filteredImages.map((image) => (
            <div
              key={image.id}
              onClick={() => onSelect?.(image)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                border: selectedImageId === image.id ? '3px solid #007bff' : '1px solid #ddd',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: onSelect ? 'pointer' : 'default',
                background: '#f8f9fa',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <img
                src={image.url}
                alt={image.alt || image.originalName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              {selectedImageId === image.id && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: '#007bff',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                padding: '0.5rem',
                color: '#fff',
                fontSize: '0.75rem'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  {image.originalName.length > 20 
                    ? image.originalName.substring(0, 20) + '...' 
                    : image.originalName}
                </div>
                {image.width && image.height && (
                  <div style={{ opacity: 0.8 }}>
                    {image.width} × {image.height}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(image.id);
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  background: 'rgba(220, 53, 69, 0.9)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: 0,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '1.5rem',
              maxWidth: '400px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Afbeelding verwijderen?</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Weet je zeker dat je deze afbeelding wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="button button-secondary"
              >
                Annuleren
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="button"
                style={{ background: '#dc3545' }}
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

