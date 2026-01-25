'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onUploadComplete: (image: { id: string; url: string; originalName: string; width?: number; height?: number }) => void;
  organizationId?: string | null;
  multiple?: boolean;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export default function ImageUploader({
  onUploadComplete,
  organizationId,
  multiple = false,
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!acceptedTypes.includes(file.type)) {
      setError(`Bestandstype niet ondersteund. Toegestaan: ${acceptedTypes.join(', ')}`);
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      setError(`Bestand is te groot (max ${maxSize}MB)`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (organizationId) {
        formData.append('organizationId', organizationId);
      }

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload mislukt');
      }

      const data = await response.json();
      onUploadComplete(data.image);
    } catch (err: any) {
      setError(err.message || 'Fout bij uploaden');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (multiple) {
      Array.from(files).forEach(file => handleFile(file));
    } else {
      handleFile(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-xl)',
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          background: dragActive ? 'var(--color-info-bg)' : 'var(--color-bg-light)',
          transition: 'all var(--transition-base)',
          opacity: isUploading ? 0.6 : 1,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
          disabled={isUploading}
        />
        {isUploading ? (
          <>
            <Loader2 size={48} style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
            <p>Uploaden...</p>
          </>
        ) : (
          <>
            <Upload size={48} style={{ margin: '0 auto 1rem', color: '#666' }} />
            <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
              Klik om te uploaden of sleep bestanden hierheen
            </p>
            <p style={{ fontSize: '0.875rem', color: '#666' }}>
              {acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} • Max {maxSize}MB
            </p>
          </>
        )}
      </div>
      {error && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.75rem',
          background: 'var(--color-error-bg)',
          border: '1px solid var(--color-error)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-error)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <X size={16} />
          {error}
        </div>
      )}
    </div>
  );
}

